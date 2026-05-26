import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { stripe } from '@/lib/stripe';

/**
 * Stripe Checkout API
 * 
 * - Requires authentication (redirects to /login if not)
 * - Creates real Stripe Checkout Session
 * - Success/Cancel URLs point to jueshi.net (never localhost)
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Auth check
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized', redirectTo: '/login?callbackUrl=/pricing' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { priceId } = body;

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID is required' },
        { status: 400 }
      );
    }

    // 2. Build success/cancel URLs — always use canonical domain
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://jueshi.net';
    const successUrl = `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/pricing?canceled=true`;

    // 3. Create real Stripe Checkout Session
    const checkoutSession = await stripe.createCheckoutSession({
      priceId,
      successUrl,
      cancelUrl,
      customerEmail: session.user.email || undefined,
      metadata: {
        userId: session.user.id,
        priceId,
        plan: priceId.includes('enterprise') ? 'enterprise' : 'pro',
      },
    });

    return NextResponse.json(checkoutSession);
  } catch (error: any) {
    console.error('[Checkout] Error:', error.message);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
