/**
 * Stripe payment integration — Production-ready
 * 
 * ⚠️ IRON RULE (v1.32.13+):
 * - Production (NODE_ENV=production) MUST use sk_live_ keys
 * - Any sk_test_ key detected in production triggers a fatal warning
 * - Webhook signature MUST be verified before processing any event
 */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const StripeSDK = require('stripe');

const rawSecretKey = process.env.STRIPE_SECRET_KEY || '';
const nodeEnv = process.env.NODE_ENV || 'development';

// ── Production key safety check ─────────────────────────────────────
if (nodeEnv === 'production' && rawSecretKey) {
  if (!rawSecretKey.startsWith('sk_live_')) {
    console.error(
      '🚨 STRIPE CRITICAL: Production environment detected but STRIPE_SECRET_KEY ' +
      `does NOT start with "sk_live_" (starts with "${rawSecretKey.slice(0, 12)}..."). ` +
      'This will process REAL payments with test keys — ABORTING Stripe initialization.'
    );
    throw new Error(
      '[Stripe] Production requires sk_live_ key. Do NOT deploy with sk_test_ in production.'
    );
  }
}

// ── Initialize Stripe client ────────────────────────────────────────
export const stripeClient = rawSecretKey
  ? new StripeSDK(rawSecretKey, {
      apiVersion: '2026-04-22.dahlia',
    })
  : null;

export const stripe = {
  /**
   * Create checkout session via Stripe API
   */
  async createCheckoutSession(params: {
    priceId: string;
    successUrl: string;
    cancelUrl: string;
    customerEmail?: string;
    metadata?: Record<string, string>;
  }) {
    if (!stripeClient) {
      throw new Error('[Stripe] STRIPE_SECRET_KEY is not configured');
    }

    const session = await stripeClient.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: params.priceId, quantity: 1 }],
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      customer_email: params.customerEmail,
      metadata: params.metadata,
      automatic_tax: { enabled: false },
    });

    return {
      id: session.id,
      url: session.url,
      amount_total: session.amount_total ?? 0,
      currency: session.currency ?? 'usd',
      status: session.status as 'open' | 'complete' | 'expired',
      customer_email: session.customer_email ?? undefined,
    };
  },

  /**
   * Create billing portal session
   */
  async createBillingPortalSession(customerId: string, returnUrl: string) {
    if (!stripeClient) {
      throw new Error('[Stripe] STRIPE_SECRET_KEY is not configured');
    }

    const portalSession = await stripeClient.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return {
      id: portalSession.id,
      url: portalSession.url,
    };
  },

  /**
   * Verify webhook signature and return parsed event
   */
  verifyWebhook(payload: string, signature: string) {
    if (!stripeClient) {
      throw new Error('[Stripe] STRIPE_SECRET_KEY is not configured');
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error('[Stripe] STRIPE_WEBHOOK_SECRET is not configured');
    }

    return stripeClient.webhooks.constructEvent(payload, signature, webhookSecret);
  },

  /**
   * Retrieve subscription by ID
   */
  async getSubscription(subscriptionId: string) {
    if (!stripeClient) {
      throw new Error('[Stripe] STRIPE_SECRET_KEY is not configured');
    }
    return stripeClient.subscriptions.retrieve(subscriptionId);
  },

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId: string) {
    if (!stripeClient) {
      throw new Error('[Stripe] STRIPE_SECRET_KEY is not configured');
    }
    return stripeClient.subscriptions.cancel(subscriptionId);
  },

  /**
   * Get product info (cached, no API call)
   */
  getProduct(priceId: string) {
    return undefined;
  },

  /**
   * List all products
   */
  listProducts() {
    return [];
  },
};

export default stripe;
