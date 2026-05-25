import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

/**
 * Stripe Webhook — Production-safe handler
 * 
 * ⚠️ IRON RULE (v1.32.13+):
 * - ALL events MUST pass signature verification
 * - Member status updates happen here (backend async), NEVER trust frontend
 * - checkout.session.completed → write Stripe IDs to User, unlock VIP
 * - customer.subscription.deleted → revoke VIP privileges
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature') || '';

    // 1. Verify signature — reject if invalid
    let event: any;
    try {
      event = stripe.verifyWebhook(body, signature);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('[Stripe Webhook] Signature verification failed:', message);
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 400 }
      );
    }

    // 2. Route events
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        const stripeCustomerId = session.customer as string;
        const stripeSubscriptionId = session.subscription as string;
        const stripePriceId = session.metadata?.priceId as string;

        if (!userId || userId === 'anonymous') {
          console.warn('[Stripe Webhook] checkout.session.completed: no userId in metadata');
          break;
        }

        // ── Core: Update user with Stripe subscription data ──
        await prisma.user.update({
          where: { id: userId },
          data: {
            stripeCustomerId,
            stripeSubscriptionId,
            stripePriceId,
            stripeCurrentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        });

        console.log(`[Stripe Webhook] ✅ User ${userId} subscribed → stripeSub: ${stripeSubscriptionId}`);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription as string;

        // Extend subscription period on successful renewal
        if (subscriptionId) {
          const periodEnd = new Date((invoice.lines?.data?.[0]?.period?.end ?? 0) * 1000);
          await prisma.user.updateMany({
            where: { stripeSubscriptionId: subscriptionId },
            data: { stripeCurrentPeriodEnd: periodEnd },
          });
          console.log(`[Stripe Webhook] ✅ Renewal extended: ${subscriptionId}`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const stripeSubId = subscription.id;

        // ── Core: Revoke VIP privileges ──
        await prisma.user.updateMany({
          where: { stripeSubscriptionId: stripeSubId },
          data: {
            stripeSubscriptionId: null,
            stripePriceId: null,
            stripeCurrentPeriodEnd: null,
          },
        });
        console.log(`[Stripe Webhook] ❌ VIP revoked: ${stripeSubId}`);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        console.warn(`[Stripe Webhook] ⚠️ Payment failed: ${invoice.id}`);
        break;
      }

      default:
        console.log(`[Stripe Webhook] Unhandled event: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('[Stripe Webhook] Unhandled error:', error.message);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
