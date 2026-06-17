import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';
import crypto from 'crypto';

// Lazy initialize Resend to avoid build-time errors
let resend: Resend | null = null;
function getResend(): Resend {
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

// Rate limiting: track requests per IP and email
const requestCounts = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(key: string, limit: number = 3, windowMs: number = 15 * 60 * 1000): boolean {
  const now = Date.now();
  const record = requestCounts.get(key);

  if (!record || now > record.resetTime) {
    requestCounts.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count++;
  return true;
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validate email
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, message: '请提供有效的邮箱地址' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: '请提供有效的邮箱地址' },
        { status: 400 }
      );
    }

    // Rate limiting by IP
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    if (!checkRateLimit(`ip:${ip}`, 5, 15 * 60 * 1000)) {
      return NextResponse.json(
        { success: false, message: '请求过于频繁，请稍后再试' },
        { status: 429 }
      );
    }

    // Rate limiting by email
    if (!checkRateLimit(`email:${email}`, 3, 60 * 60 * 1000)) {
      return NextResponse.json(
        { success: false, message: '该邮箱请求过于频繁，请稍后再试' },
        { status: 429 }
      );
    }

    // Always return the same message to prevent email enumeration
    const successMessage = '如果该邮箱已注册，我们会发送密码重置邮件。';

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      // User doesn't exist, but return success to prevent enumeration
      return NextResponse.json({ success: true, message: successMessage });
    }

    // Invalidate any existing unused tokens for this user
    await prisma.passwordResetToken.updateMany({
      where: {
        userId: user.id,
        usedAt: null,
        expiresAt: { gt: new Date() }
      },
      data: {
        usedAt: new Date()
      }
    });

    // Generate secure token
    const token = generateSecureToken();
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    // Store token hash
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
        requestIp: ip,
        userAgent: request.headers.get('user-agent') || null
      }
    });

    // Send reset email
    const resetUrl = `https://jueshi.net/reset-password?token=${token}`;

    try {
      await getResend().emails.send({
        from: `${process.env.MAIL_FROM_NAME || '绝世百宝箱'} <${process.env.MAIL_FROM || 'hello@jueshi.net'}>`,
        to: user.email,
        subject: '重置你的绝世百宝箱密码',
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333; margin-bottom: 20px;">重置你的密码</h2>
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              你好，我们收到了重置你的绝世百宝箱密码的请求。
            </p>
            <p style="color: #666; line-height: 1.6; margin-bottom: 30px;">
              点击下方按钮重置密码，链接将在 30 分钟后失效：
            </p>
            <a href="${resetUrl}" style="display: inline-block; background-color: #0070f3; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: 500; margin-bottom: 30px;">
              重置密码
            </a>
            <p style="color: #999; font-size: 14px; line-height: 1.6; margin-top: 30px;">
              如果按钮无法点击，请复制以下链接到浏览器地址栏：
            </p>
            <p style="color: #666; font-size: 13px; word-break: break-all; background-color: #f5f5f5; padding: 10px; border-radius: 3px;">
              ${resetUrl}
            </p>
            <p style="color: #999; font-size: 14px; line-height: 1.6; margin-top: 30px;">
              如果你没有请求重置密码，请忽略此邮件。你的密码将保持不变。
            </p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #999; font-size: 12px;">
              此邮件由绝世百宝箱自动发送
            </p>
          </div>
        `
      });

      // Log success (without token)
      console.log(`[forgot-password] Reset email sent to ${email}, token hash: ${tokenHash.substring(0, 8)}...`);
    } catch (emailError) {
      console.error('[forgot-password] Failed to send email:', emailError);
      // Still return success to prevent enumeration
    }

    return NextResponse.json({ success: true, message: successMessage });
  } catch (error) {
    console.error('[forgot-password] Error:', error);
    return NextResponse.json(
      { success: false, message: '服务器错误，请稍后再试' },
      { status: 500 }
    );
  }
}
