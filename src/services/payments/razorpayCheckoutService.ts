import { eventTracker } from '@/analytics/EventTracker';
import { getRazorpayKeyId, PRO_MONTHLY_PRICE_DISPLAY } from '@/config/razorpayConfig';
import { getSupabaseClient } from '@/services/supabase/client';

type CreateOrderResponse = {
  orderId: string;
  amount: number;
  currency: string;
  razorpayKey: string;
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

async function createOrder(): Promise<CreateOrderResponse> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.functions.invoke('create-razorpay-order', {
    body: { plan: 'pro' },
  });

  if (error) throw new Error(error.message);
  if (data?.error) throw new Error(String(data.error));

  const response = data as CreateOrderResponse;
  if (!response.orderId || !response.razorpayKey) {
    throw new Error('Checkout order response was incomplete');
  }

  return response;
}

async function verifyPayment(response: RazorpaySuccessResponse): Promise<void> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.functions.invoke('verify-razorpay-payment', {
    body: {
      razorpay_order_id: response.razorpay_order_id,
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_signature: response.razorpay_signature,
    },
  });

  if (error) throw new Error(error.message);
  if (data?.error) throw new Error(String(data.error));
  if (!data?.success) throw new Error('Payment verification failed');
}

export const razorpayCheckoutService = {
  async startProCheckout(input: {
    userId: string;
    prefill: CheckoutPrefill;
    onSuccess?: () => void;
    onDismiss?: () => void;
  }): Promise<void> {
    eventTracker.track('premium_checkout_started', {
      plan: 'pro',
      amount: 299,
      user_id: input.userId,
    });

    await loadRazorpayScript();
    const order = await createOrder();
    const checkoutKey = order.razorpayKey || getRazorpayKeyId();
    if (!checkoutKey) {
      throw new Error('Razorpay is not configured. Missing checkout key from server or VITE_RAZORPAY_KEY_ID.');
    }

    return new Promise((resolve, reject) => {
      const checkout = new Razorpay({
        key: checkoutKey,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: 'PetClues',
        description: `PetClues Pro - ${PRO_MONTHLY_PRICE_DISPLAY}/month`,
        image: '/logo.png',
        prefill: {
          email: input.prefill.email,
          name: input.prefill.name,
        },
        theme: { color: '#2C3E35' },
        handler: async (response) => {
          try {
            await verifyPayment(response);
            eventTracker.track('premium_payment_success', {
              plan: 'pro',
              amount: 299,
              user_id: input.userId,
            });
            eventTracker.track('premium_subscription_activated', {
              plan: 'pro',
              amount: 299,
              user_id: input.userId,
            });
            input.onSuccess?.();
            resolve();
          } catch (err) {
            const message = err instanceof Error ? err.message : 'Payment verification failed';
            eventTracker.track('premium_payment_failed', {
              plan: 'pro',
              amount: 299,
              user_id: input.userId,
              reason: message,
            });
            reject(new Error(message));
          }
        },
        modal: {
          ondismiss: () => {
            eventTracker.track('premium_payment_failed', {
              plan: 'pro',
              amount: 299,
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
          plan: 'pro',
          amount: 299,
          user_id: input.userId,
          reason: 'payment_failed',
        });
      });

      checkout.open();
    });
  },
};
