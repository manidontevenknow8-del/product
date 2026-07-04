import { eventTracker } from '@/analytics/EventTracker';
import type { BillingCurrency } from '@/config/pricingConfig';
import {
  GENESIS_VAULT_PRODUCT,
  getGenesisVaultPriceDisplay,
} from '@/config/genesisVaultConfig';
import { getRazorpayKeyId } from '@/config/razorpayConfig';
import { getSupabaseClient } from '@/services/supabase/client';
import { parseFunctionInvokeError } from '@/services/supabase/parseFunctionInvokeError';
import { getUserFacingError, sanitizeUserFacingError } from '@/utils/userFacingErrors';

type CreateGenesisOrderResponse = {
  orderId: string;
  amount: number;
  currency: BillingCurrency;
  razorpayKey: string;
  product: typeof GENESIS_VAULT_PRODUCT;
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

async function createGenesisOrder(currency: BillingCurrency): Promise<CreateGenesisOrderResponse> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.functions.invoke('create-genesis-razorpay-order', {
    body: { currency },
  });

  if (error) {
    throw new Error(await parseFunctionInvokeError(error, 'Checkout failed', 'payment'));
  }
  if (data?.error) {
    throw new Error(sanitizeUserFacingError(String(data.error), 'payment'));
  }

  const response = data as CreateGenesisOrderResponse;
  if (!response.orderId || !response.razorpayKey) {
    throw new Error(sanitizeUserFacingError('Checkout order response was incomplete', 'payment'));
  }

  return response;
}

async function verifyGenesisPayment(
  response: RazorpaySuccessResponse,
  currency: BillingCurrency,
  amount: number,
): Promise<void> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.functions.invoke('verify-genesis-razorpay-payment', {
    body: {
      razorpay_order_id: response.razorpay_order_id,
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_signature: response.razorpay_signature,
      currency,
      amount,
    },
  });

  if (error) {
    throw new Error(await parseFunctionInvokeError(error, 'Payment verification failed', 'payment'));
  }
  if (data?.error) throw new Error(sanitizeUserFacingError(String(data.error), 'payment'));
  if (!data?.success) {
    throw new Error(sanitizeUserFacingError('Payment verification failed', 'payment'));
  }
}

export const genesisVaultCheckoutService = {
  async startCheckout(input: {
    currency: BillingCurrency;
    prefill?: { email?: string; name?: string };
    onSuccess?: () => void;
    onDismiss?: () => void;
  }): Promise<void> {
    const displayAmount = getGenesisVaultPriceDisplay(input.currency);
    const checkoutContext = {
      product: GENESIS_VAULT_PRODUCT,
      currency: input.currency,
      amount: displayAmount,
    };

    eventTracker.track('checkout_started', { ...checkoutContext, source: 'genesis_vault' });

    await loadRazorpayScript();
    const order = await createGenesisOrder(input.currency);
    const checkoutKey = order.razorpayKey || getRazorpayKeyId();
    if (!checkoutKey) {
      throw new Error(
        'Razorpay is not configured. Missing checkout key from server or VITE_RAZORPAY_KEY_ID.',
      );
    }

    return new Promise((resolve, reject) => {
      const checkout = new Razorpay({
        key: checkoutKey,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: 'PetClues',
        description: `Genesis Vault — ${displayAmount} lifetime archive`,
        image: '/logo.png',
        prefill: {
          email: input.prefill?.email ?? '',
          name: input.prefill?.name ?? '',
        },
        notes: {
          product: GENESIS_VAULT_PRODUCT,
        },
        theme: { color: '#18181b' },
        handler: async (response) => {
          try {
            await verifyGenesisPayment(response, order.currency, order.amount);
            eventTracker.track('checkout_completed', { ...checkoutContext, source: 'genesis_vault' });
            input.onSuccess?.();
            resolve();
          } catch (err) {
            const message = getUserFacingError(err, 'payment', 'Payment verification failed');
            eventTracker.track('premium_payment_failed', { ...checkoutContext, reason: message, source: 'genesis_vault' });
            reject(new Error(message));
          }
        },
        modal: {
          ondismiss: () => {
            eventTracker.track('premium_payment_failed', { ...checkoutContext, reason: 'checkout_dismissed', source: 'genesis_vault' });
            input.onDismiss?.();
            reject(new Error('Checkout canceled'));
          },
        },
      });

      checkout.on('payment.failed', () => {
        eventTracker.track('premium_payment_failed', {
          ...checkoutContext,
          reason: 'payment_failed',
          source: 'genesis_vault',
        });
      });

      checkout.open();
    });
  },
};
