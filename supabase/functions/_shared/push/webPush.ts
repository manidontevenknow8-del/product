import webpush from 'npm:web-push@3.6.7';

export type PushSubscriptionKeys = {
  endpoint: string;
  p256dh: string;
  auth: string;
};

export type StreakRiskPushPayload = {
  title: string;
  body: string;
  url: string;
  tag?: string;
};

let vapidConfigured = false;

function ensureVapid(): void {
  if (vapidConfigured) return;
  const publicKey = Deno.env.get('VAPID_PUBLIC_KEY');
  const privateKey = Deno.env.get('VAPID_PRIVATE_KEY');
  const subject = Deno.env.get('VAPID_SUBJECT') ?? 'mailto:hello@petclues.com';
  if (!publicKey || !privateKey) {
    throw new Error('VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY must be configured');
  }
  webpush.setVapidDetails(subject, publicKey, privateKey);
  vapidConfigured = true;
}

export async function sendStreakRiskPush(
  subscription: PushSubscriptionKeys,
  payload: StreakRiskPushPayload,
): Promise<{ ok: true } | { ok: false; expired: boolean; message: string }> {
  ensureVapid();

  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh,
          auth: subscription.auth,
        },
      },
      JSON.stringify({
        title: payload.title,
        body: payload.body,
        url: payload.url,
        tag: payload.tag ?? 'streak-risk',
      }),
      { TTL: 60 * 60 * 4 },
    );
    return { ok: true };
  } catch (err) {
    const status = (err as { statusCode?: number }).statusCode;
    const message = err instanceof Error ? err.message : 'Push send failed';
    const expired = status === 404 || status === 410;
    return { ok: false, expired, message };
  }
}
