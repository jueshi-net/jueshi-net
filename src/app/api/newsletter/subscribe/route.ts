import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { generateNewsletterWelcomeEmail } from "@/lib/email/templates";

/**
 * Send welcome email via Resend (graceful degradation if no API key).
 */
async function sendWelcomeEmail(email: string) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.warn("[newsletter/email] RESEND_API_KEY not configured — email skipped (graceful degradation)");
    return { sent: false, reason: "no-api-key" };
  }

  try {
    // Dynamic import to avoid client-side bundle pollution
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);
    const { subject, html, text } = generateNewsletterWelcomeEmail(email);

    const result = await resend.emails.send({
      from: "海外百宝箱 <hello@jueshi.net>",
      to: [email],
      subject,
      html,
      text,
    });

    if (result.error) {
      console.error("[newsletter/email] Resend API error:", result.error);
      return { sent: false, reason: result.error.message };
    }

    console.log(`[newsletter/email] Welcome email sent to ${email}: ${result.data?.id}`);
    return { sent: true, id: result.data?.id };
  } catch (err: any) {
    console.error("[newsletter/email] Failed to send welcome email:", err.message);
    return { sent: false, reason: err.message };
  }
}

/**
 * POST /api/newsletter/subscribe
 * Accept an email and store it in EmailSubscription table.
 * On success, fire-and-forget a welcome email (never blocks the response).
 * Dedup: if email already exists, return success (idempotent).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = (body.email as string)?.trim().toLowerCase();

    if (!email || !email.includes("@") || email.length > 255) {
      return NextResponse.json(
        { success: false, error: "请输入有效的邮箱地址" },
        { status: 400 }
      );
    }

    // Check if already subscribed
    const existing = await prisma.emailSubscription.findUnique({
      where: { email },
      select: { id: true, isActive: true },
    });

    if (existing) {
      if (existing.isActive) {
        return NextResponse.json({
          success: true,
          message: "您已订阅，无需重复操作 🎉",
        });
      }
      // Reactivate if was unsubscribed
      await prisma.emailSubscription.update({
        where: { id: existing.id },
        data: { isActive: true },
      });
      // Fire-and-forget email
      sendWelcomeEmail(email);
      return NextResponse.json({
        success: true,
        message: "欢迎回来！已重新激活订阅 🎉",
      });
    }

    // Create new subscription
    await prisma.emailSubscription.create({
      data: { email, isActive: true, confirmed: true, confirmedAt: new Date() },
    });

    // Fire-and-forget welcome email (never blocks response)
    sendWelcomeEmail(email);

    return NextResponse.json({
      success: true,
      message: "订阅成功！每周为您推送出海锦囊 🚀",
    });
  } catch (err: any) {
    // Handle unique constraint race condition
    if (err.code === "P2002") {
      return NextResponse.json({
        success: true,
        message: "您已订阅，无需重复操作 🎉",
      });
    }

    console.error("[newsletter/subscribe] Error:", err);
    return NextResponse.json(
      { success: false, error: "系统异常，请稍后重试" },
      { status: 500 }
    );
  }
}
