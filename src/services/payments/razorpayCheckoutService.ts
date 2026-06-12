import { eventTracker } from '@/analytics/EventTracker';
import {
  getPlanPriceLabel,
  getCheckoutAmountPaise,
} from '@/config/pricingConfig';
import {
  getRazorpayKeyId,
  type RazorpayCheckoutPlan,
} from '@/config/razorpayConfig';
import { getSupabaseClient } from '@/services/supabase/client';
import { parseFunctionInvokeError } from '@/services/supabase/parseFunctionInvokeError';
import { getUserFacingError, sanitizeUserFacingError } from '@/utils/userFacingErrors';
import { PLAN_LABELS } from '@/subscription/entitlements';
import type { BillingInterval } from '@/types/subscription';

type CreateOrderResponse = {
  orderId: string;
  amount: number;
  currency: string;
  razorpayKey: string;
  plan: RazorpayCheckoutPlan;
  interval?: BillingInterval;
  foundingDiscount?: boolean;
};

type CheckoutPrefill = {
  email: string;
  name: string;
};

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof Razorpay !== 'undefined') {
      resolve();
      return;
    }

    const existing = document.querySelector('script[data-razorpay-checkout]');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Failed to load Razorpay checkout')));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.dataset.razorpayCheckout = 'true';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay checkout'));
    document.body.appendChild(script);
  });
}

async function createOrder(
  plan: RazorpayCheckoutPlan,
  interval: BillingInterval,
): Promise<CreateOrderResponse> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.functions.invoke('create-razorpay-order', {
    body: { plan, interval },
  });

  if (error) throw new Error(await parseFunctionInvokeError(error, 'Checkout failed', 'payment'));
  if (data?.error) throw new Error(sanitizeUserFacingError(String(data.error), 'payment'));

  const response = data as CreateOrderResponse;
  if (!response.orderId || !response.razorpayKey) {
    throw new Error(sanitizeUserFacingError('Checkout order response was incomplete', 'payment'));
  }

  return response;
}

async function verifyPayment(
  response: RazorpaySuccessResponse,
  plan: RazorpayCheckoutPlan,
  interval: BillingInterval,
): Promise<void> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.functions.invoke('verify-razorpay-payment', {
    body: {
      razorpay_order_id: response.razorpay_order_id,
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_signature: response.razorpay_signature,
      plan,
      interval,
    },
  });

  if (error) {
    throw new Error(await parseFunctionInvokeError(error, 'Payment verification failed', 'payment'));
  }
  if (data?.error) throw new Error(sanitizeUserFacingError(String(data.error), 'payment'));
  if (!data?.success) throw new Error(sanitizeUserFacingError('Payment verification failed', 'payment'));
}

export const razorpayCheckoutService = {
  async startCheckout(input: {
    userId: string;
    plan: RazorpayCheckoutPlan;
    interval?: BillingInterval;
    prefill: CheckoutPrefill;
    onSuccess?: () => void;
    onDismiss?: () => void;
  }): Promise<void> {
    const interval = input.interval ?? 'monthly';
    const amountInr = getCheckoutAmountPaise(input.plan, interval) / 100;

    eventTracker.track('premium_checkout_started', {
      plan: input.plan,
      interval,
      amount: amountInr,
      user_id: input.userId,
    });

    await loadRazorpayScript();
    const order = await createOrder(input.plan, interval);
    const checkoutKey = order.razorpayKey || getRazorpayKeyId();
    if (!checkoutKey) {
      throw new Error('Razorpay is not configured. Missing checkout key from server or VITE_RAZORPAY_KEY_ID.');
    }

    const priceDisplay = getPlanPriceLabel(input.plan, interval, order.foundingDiscount);
    const periodLabel = interval === 'yearly' ? '/year' : '/month';

    return new Promise((resolve, reject) => {
      const checkout = new Razorpay({
        key: checkoutKey,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: 'PetClues',
        description: `PetClues ${PLAN_LABELS[input.plan]} - ${priceDisplay}${periodLabel}`,
        image: '/logo.png',
        prefill: {
          email: input.prefill.email,
          name: input.prefill.name,
        },
        theme: { color: '#1a1a1a' },
        handler: async (response) => {
          try {
            await verifyPayment(response, input.plan, interval);
            eventTracker.track('premium_payment_success', {
              plan: input.plan,
              interval,
              amount: amountInr,
              user_id: input.userId,
            });
            eventTracker.track('premium_subscription_activated', {
              plan: input.plan,
              interval,
              amount: amountInr,
              user_id: input.userId,
            });
            input.onSuccess?.();
            resolve();
          } catch (err) {
            const message = getUserFacingError(err, 'payment', 'Payment verification failed');
            eventTracker.track('premium_payment_failed', {
              plan: input.plan,
              interval,
              amount: amountInr,
              user_id: input.userId,
              reason: message,
            });
            reject(new Error(message));
          }
        },
        modal: {
          ondismiss: () => {
            eventTracker.track('premium_payment_failed', {
              plan: input.plan,
              interval,
              amount: amountInr,
              user_id: input.userId,
              reason: 'checkout_dismissed',
            });
            input.onDismiss?.();
            reject(new Error('Checkout canceled'));
          },
        },
      });

      checkout.on('payment.failed', () => {
        eventTracker.track('premium_payment_failed', {
          plan: input.plan,
          interval,
          amount: amountInr,
          user_id: input.userId,
          reason: 'payment_failed',
        });
      });

      checkout.open();
    });
  },

  /** @deprecated Use startCheckout({ plan: 'pro', ... }) */
  async startProCheckout(input: {
    userId: string;
    prefill: CheckoutPrefill;
    onSuccess?: () => void;
    onDismiss?: () => void;
  }): Promise<void> {
    return this.startCheckout({ ...input, plan: 'pro' });
  },
};
