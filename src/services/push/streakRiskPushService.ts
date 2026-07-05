import { getSupabaseClient } from '@/services/supabase/client';
import { isSupabaseConfigured } from '@/services/supabase/config';

export type StreakRiskPushSupport = {
  supported: boolean;
  reason?: string;
};

function getVapidPublicKey(): string | null {
  const key = import.meta.env.VITE_VAPID_PUBLIC_KEY?.trim();
  return key || null;
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) {
    output[i] = raw.charCodeAt(i);
  }
  return output;
}

export function getStreakRiskPushSupport(): StreakRiskPushSupport {
  if (!isSupabaseConfigured()) {
    return { supported: false, reason: 'Push is available when signed in with a live account.' };
  }
  if (!getVapidPublicKey()) {
    return { supported: false, reason: 'Push is not configured for this environment.' };
  }
  if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
    return { supported: false, reason: 'This browser does not support web push.' };
  }
  return { supported: true };
}

async function ensureServiceWorkerRegistration(): Promise<ServiceWorkerRegistration> {
  const existing = await navigator.serviceWorker.getRegistration('/');
  if (existing) return existing;
  return navigator.serviceWorker.register('/sw.js');
}

function subscriptionKeys(subscription: PushSubscription) {
  const json = subscription.toJSON();
  const keys = json.keys;
  if (!json.endpoint || !keys?.p256dh || !keys.auth) {
    throw new Error('Could not read push subscription keys.');
  }
  return {
    endpoint: json.endpoint,
    keys: { p256dh: keys.p256dh, auth: keys.auth },
  };
}

export async function subscribeStreakRiskPush(activePetId: string | null): Promise<void> {
  const support = getStreakRiskPushSupport();
  if (!support.supported) {
    throw new Error(support.reason ?? 'Web push is not available.');
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error('Notification permission was not granted.');
  }

  const registration = await ensureServiceWorkerRegistration();
  const vapidKey = getVapidPublicKey()!;
  let subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey),
    });
  }

  const payload = subscriptionKeys(subscription);
  const supabase = getSupabaseClient();
  const { error } = await supabase.functions.invoke('register-push-subscription', {
    body: {
      endpoint: payload.endpoint,
      keys: payload.keys,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      activePetId,
    },
  });

  if (error) throw new Error(error.message);
}

export async function syncStreakRiskPushSubscription(activePetId: string | null): Promise<void> {
  const support = getStreakRiskPushSupport();
  if (!support.supported || Notification.permission !== 'granted') return;

  const registration = await navigator.serviceWorker.getRegistration('/');
  const subscription = await registration?.pushManager.getSubscription();
  if (!subscription) return;

  const payload = subscriptionKeys(subscription);
  const supabase = getSupabaseClient();
  const { error } = await supabase.functions.invoke('register-push-subscription', {
    body: {
      endpoint: payload.endpoint,
      keys: payload.keys,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      activePetId,
    },
  });

  if (error) throw new Error(error.message);
}

export async function unsubscribeStreakRiskPush(): Promise<void> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

  const registration = await navigator.serviceWorker.getRegistration('/');
  const subscription = await registration?.pushManager.getSubscription();
  if (!subscription) return;

  const endpoint = subscription.endpoint;

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    await supabase.functions.invoke('unregister-push-subscription', {
      body: { endpoint },
    });
  }

  await subscription.unsubscribe();
}
