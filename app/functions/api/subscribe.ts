import { corsHeaders } from '../_shared/security';

interface Env {
  TURNSTILE_SECRET_KEY?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

  const ip = context.request.headers.get('CF-Connecting-IP') ?? '';
  const verified = await verifyTurnstile(secret, turnstileToken, ip);

  if (!verified) {
    return jsonResponse(context.request, 403, { error: 'Verification failed. Please try again.' });
  }

  return jsonResponse(context.request, 200, { ok: true, email });
};