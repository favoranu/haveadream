interface Env {
  TURNSTILE_SECRET_KEY?: string;
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

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

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { status: 204, headers: CORS });
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  let payload: { email?: string; turnstileToken?: string };

  try {
    payload = await context.request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body.' }), {
      status: 400,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  const email = payload.email?.trim().toLowerCase();
  const turnstileToken = payload.turnstileToken?.trim();

  if (!email || !EMAIL_RE.test(email)) {
    return new Response(JSON.stringify({ error: 'Please enter a valid email address.' }), {
      status: 400,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  if (!turnstileToken) {
    return new Response(JSON.stringify({ error: 'Please complete the verification check.' }), {
      status: 400,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  const secret = context.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    return new Response(JSON.stringify({ error: 'Newsletter signup is not configured yet.' }), {
      status: 503,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  const ip = context.request.headers.get('CF-Connecting-IP') ?? '';
  const verified = await verifyTurnstile(secret, turnstileToken, ip);

  if (!verified) {
    return new Response(JSON.stringify({ error: 'Verification failed. Please try again.' }), {
      status: 403,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ ok: true, email }), {
    status: 200,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
};