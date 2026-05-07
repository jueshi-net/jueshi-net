/**
 * Stripe payment integration
 * Note: STRIPE_SECRET_KEY must be set in environment
 */

// Mock Stripe implementation for demo
// Replace with actual Stripe SDK in production: npm install stripe

interface StripeProduct {
  id: string;
  name: string;
  price: number; // In cents
  interval?: 'month' | 'year';
  features: string[];
}

interface StripeCheckoutSession {
  id: string;
  url: string;
  amount_total: number;
  currency: string;
  status: 'open' | 'complete' | 'expired';
  customer_email?: string;
}

interface StripeWebhookEvent {
  id: string;
  type: string;
  data: {
    object: Record<string, any>;
  };
}

const PRICES: Record<string, StripeProduct> = {
  'price_free': {
    id: 'price_free',
    name: 'Free',
    price: 0,
    features: ['基础导航', '5个工具', '基础统计']
  },
  'price_pro_month': {
    id: 'price_pro_month',
    name: 'Pro (Monthly)',
    price: 2900, // $29/month
    interval: 'month',
    features: ['全部导航', '无限工具', '高级统计', 'API 访问', '优先支持']
  },
  'price_pro_year': {
    id: 'price_pro_year',
    name: 'Pro (Yearly)',
    price: 29000, // $290/year (save ~17%)
    interval: 'year',
    features: ['全部导航', '无限工具', '高级统计', 'API 访问', '优先支持', '2个月免费']
  },
  'price_enterprise': {
    id: 'price_enterprise',
    name: 'Enterprise',
    price: 9900, // $99/month
    interval: 'month',
    features: ['Pro 全部功能', '团队协作', 'SSO 登录', '自定义域名', '专属客服', 'SLA 保障']
  }
};

export const stripe = {
  /**
   * Create checkout session
   */
  async createCheckoutSession(params: {
    priceId: string;
    successUrl: string;
    cancelUrl: string;
    customerEmail?: string;
    metadata?: Record<string, string>;
  }): Promise<StripeCheckoutSession> {
    const product = PRICES[params.priceId];
    if (!product) {
      throw new Error(`Invalid price ID: ${params.priceId}`);
    }

    // In production, this would call Stripe API
    // const session = await stripe.checkout.sessions.create({...})
    
    return {
      id: `cs_test_${Date.now()}`,
      url: params.successUrl, // Redirect immediately for demo
      amount_total: product.price,
      currency: 'usd',
      status: 'open',
      customer_email: params.customerEmail
    };
  },

  /**
   * Create billing portal session
   */
  async createBillingPortalSession(customerId: string, returnUrl: string) {
    return {
      id: `bps_test_${Date.now()}`,
      url: returnUrl
    };
  },

  /**
   * Verify webhook signature and process event
   */
  async handleWebhook(payload: string, signature: string): Promise<StripeWebhookEvent> {
    // In production, verify signature with Stripe webhook secret
    // const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    
    return JSON.parse(payload);
  },

  /**
   * Get product info
   */
  getProduct(priceId: string): StripeProduct | undefined {
    return PRICES[priceId];
  },

  /**
   * List all products
   */
  listProducts(): StripeProduct[] {
    return Object.values(PRICES);
  }
};

export type { StripeProduct, StripeCheckoutSession, StripeWebhookEvent };
export default stripe;
