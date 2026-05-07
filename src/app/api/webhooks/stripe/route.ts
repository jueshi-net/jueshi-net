import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature') || '';

    // Verify and parse event
    const event = await stripe.handleWebhook(body, signature);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        // Handle successful payment
        console.log('Payment successful:', session.id);
        // Update user subscription in database
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        // Handle recurring payment
        console.log('Recurring payment succeeded:', invoice.id);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        // Handle subscription cancellation
        console.log('Subscription cancelled:', subscription.id);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        // Handle failed payment
        console.log('Payment failed:', invoice.id);
        break;
      }

      default:
        console.log('Unhandled event type:', event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    );
  }
}
