import { eventTracker } from '@/analytics/EventTracker';
import {
  getAnnualPrice,
  getAnnualPriceParts,
  type BillingCurrency,
  type CheckoutPlan,
} from '@/config/pricingConfig';
import { getRazorpayKeyId } from '@/config/razorpayConfig';
import { buildRazorpayPrefill } from '@/services/payments/checkoutPrefill';
import { getSupabaseClient } from '@/services/supabase/client';
import { parseFunctionInvokeError } from '@/services/supabase/parseFunctionInvokeError';
import { getUserFacingError, sanitizeUserFacingError } from '@/utils/userFacingErrors';
import { PLAN_LABELS } from '@/subscription/entitlements';

type CreateOrderResponse = {
  orderId: string;
  amount: number;
  currency: BillingCurrency;
  razorpayKey: string;
  plan: CheckoutPlan;
  billingCycle: 'annual';
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
  plan: CheckoutPlan,
  currency: BillingCurrency,
): Promise<CreateOrderResponse> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.functions.invoke('create-razorpay-order', {
    body: { plan, currency },
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
  plan: CheckoutPlan,
  currency: BillingCurrency,
  amount: number,
): Promise<void> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.functions.invoke('verify-razorpay-payment', {
    body: {
      razorpay_order_id: response.razorpay_order_id,
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_signature: response.razorpay_signature,
      plan,
      currency,
      amount,
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
    plan: CheckoutPlan;
    currency: BillingCurrency;
    countryCode?: string | null;
    foundingDiscount?: boolean;
    prefill: CheckoutPrefill;
    onSuccess?: () => void;
    onDismiss?: () => void;
  }): Promise<void> {
    const displayAmount = getAnnualPrice(input.plan, input.currency, input.foundingDiscount);
    const checkoutContext = {
      plan: input.plan,
      currency: input.currency,
      country: input.countryCode ?? null,
      amount: displayAmount,
      billing_cycle: 'annual' as const,
    };

    eventTracker.track('checkout_started', checkoutContext);
    eventTracker.track('premium_checkout_started', checkoutContext);

    await loadRazorpayScript();
    const order = await createOrder(input.plan, input.currency);
    const checkoutKey = order.razorpayKey || getRazorpayKeyId();
    if (!checkoutKey) {
      throw new Error('Razorpay is not configured. Missing checkout key from server or VITE_RAZORPAY_KEY_ID.');
    }

    const foundingDiscount = order.foundingDiscount ?? input.foundingDiscount;
    const { amount: priceAmount, period } = getAnnualPriceParts(
      input.plan,
      input.currency,
      foundingDiscount,
    );
    const prefill = buildRazorpayPrefill(input.prefill, order.currency);

    return new Promise((resolve, reject) => {
      const checkout = new Razorpay({
        key: checkoutKey,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: 'PetClues',
        description: `PetClues ${PLAN_LABELS[input.plan]}, ${priceAmount} ${period}`,
        image: '/logo.png',
        prefill,
        notes: {
          user_id: input.userId,
          user_email: prefill.email,
          plan: input.plan,
          billing_cycle: 'annual',
        },
        theme: { color: '#1a1a1a' },
        handler: async (response) => {
          try {
            await verifyPayment(response, input.plan, order.currency, order.amount);
            eventTracker.track('checkout_completed', checkoutContext);
            eventTracker.track('premium_payment_success', checkoutContext);
            eventTracker.track('premium_subscription_activated', checkoutContext);
            input.onSuccess?.();
            resolve();
          } catch (err) {
            const message = getUserFacingError(err, 'payment', 'Payment verification failed');
            eventTracker.track('premium_payment_failed', {
              ...checkoutContext,
              reason: message,
            });
            reject(new Error(message));
          }
        },
        modal: {
          ondismiss: () => {
            eventTracker.track('premium_payment_failed', {
              ...checkoutContext,
              reason: 'checkout_dismissed',
            });
            input.onDismiss?.();
            reject(new Error('Checkout canceled'));
          },
        },
      });

      checkout.on('payment.failed', () => {
        eventTracker.track('premium_payment_failed', {
          ...checkoutContext,
          reason: 'payment_failed',
        });
      });

      checkout.open();
    });
  },
};
