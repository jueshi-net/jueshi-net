import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { priceId, successUrl, cancelUrl, customerEmail } = body;

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID is required' },
        { status: 400 }
      );
    }

    const product = stripe.getProduct(priceId);
    if (!product) {
      return NextResponse.json(
        { error: 'Invalid price ID' },
        { status: 400 }
      );
    }

    // Free tier - skip checkout
    if (product.price === 0) {
      return NextResponse.json({
        id: 'free',
        url: successUrl || '/',
        amount_total: 0,
        currency: 'usd',
        status: 'complete'
      });
    }

    // Create checkout session
    const session = await stripe.createCheckoutSession({
      priceId,
      successUrl: successUrl || `${req.headers.get('origin')}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: cancelUrl || `${req.headers.get('origin')}/pricing`,
      customerEmail,
      metadata: {
        userId: body.userId || 'anonymous',
        plan: product.name
      }
    });

    return NextResponse.json(session);
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
