import { sendVerificationEmail } from '../_shared/email';
import {
  createVerifyToken,
  parseSubscriber,
  subscriberKey,
  VERIFY_TTL_MS,
  verifyKey,
  type SubscriberRecord,
} from '../_shared/newsletter';
import { corsHeaders } from '../_shared/security';

interface Env {
  TURNSTILE_SECRET_KEY?: string;
  NEWSLETTER_KV?: KVNamespace;
  RESEND_API_KEY?: string;
  NEWSLETTER_FROM_EMAIL?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VERIFY_BASE = 'https://app.haveadream.xyz/api/verify';

async function verifyTurnstile(secret: string, token: string, ip: string) {
  const body = new URLSearchParams({
    secret,
    response: token,
    remoteip: ip,
  });

  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  const data = (await res.json()) as { success?: boolean };
  return Boolean(data.success);
}

function jsonResponse(request: Request, status: number, payload: unknown) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...corsHeaders(request),
      'Content-Type': 'application/json',
    },
  });
}

export const onRequestOptions: PagesFunction<Env> = async (context) => {
  return new Response(null, { status: 204, headers: corsHeaders(context.request) });
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  if (!corsHeaders(context.request)['Access-Control-Allow-Origin']) {
    return jsonResponse(context.request, 403, { error: 'Origin not allowed.' });
  }

  let payload: { email?: string; turnstileToken?: string };

  try {
    payload = await context.request.json();
  } catch {
    return jsonResponse(context.request, 400, { error: 'Invalid request body.' });
  }

  const email = payload.email?.trim().toLowerCase();
  const turnstileToken = payload.turnstileToken?.trim();

  if (!email || !EMAIL_RE.test(email)) {
    return jsonResponse(context.request, 400, { error: 'Please enter a valid email address.' });
  }

  if (!turnstileToken) {
    return jsonResponse(context.request, 400, { error: 'Please complete the verification check.' });
  }

  const secret = context.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    return jsonResponse(context.request, 503, { error: 'Newsletter signup is not configured yet.' });
  }

  const resendKey = context.env.RESEND_API_KEY;
  const fromEmail = context.env.NEWSLETTER_FROM_EMAIL;
  if (!resendKey || !fromEmail) {
    return jsonResponse(context.request, 503, { error: 'Email verification is not configured yet.' });
  }

  const ip = context.request.headers.get('CF-Connecting-IP') ?? '';
  const turnstileOk = await verifyTurnstile(secret, turnstileToken, ip);

  if (!turnstileOk) {
    return jsonResponse(context.request, 403, { error: 'Verification failed. Please try again.' });
  }

  const kv = context.env.NEWSLETTER_KV;
  if (!kv) {
    return jsonResponse(context.request, 503, { error: 'Newsletter storage is not configured yet.' });
  }

  const key = subscriberKey(email);
  const existingRaw = await kv.get(key);

  if (existingRaw) {
    const existing = parseSubscriber(existingRaw);
    if (existing.status === 'verified') {
      return jsonResponse(context.request, 409, { error: 'This email is already subscribed.' });
    }
  }

  const token = createVerifyToken();
  const now = new Date();
  const origin = context.request.headers.get('Origin') ?? 'unknown';

  const pending: SubscriberRecord = {
    email,
    status: 'pending',
    subscribedAt: now.toISOString(),
    source: origin,
  };

  await kv.put(key, JSON.stringify(pending));
  await kv.put(
    verifyKey(token),
    JSON.stringify({
      email,
      token,
      expiresAt: new Date(now.getTime() + VERIFY_TTL_MS).toISOString(),
      source: origin,
    }),
    { expirationTtl: Math.floor(VERIFY_TTL_MS / 1000) },
  );

  try {
    await sendVerificationEmail({
      apiKey: resendKey,
      from: fromEmail,
      to: email,
      verifyUrl: `${VERIFY_BASE}?token=${encodeURIComponent(token)}`,
    });
  } catch {
    await kv.delete(verifyKey(token));
    await kv.delete(key);
    return jsonResponse(context.request, 502, { error: 'Could not send verification email. Please try again.' });
  }

  return jsonResponse(context.request, 200, {
    ok: true,
    pending: true,
    message: 'Check your inbox and click the verification link to confirm your subscription.',
  });
};