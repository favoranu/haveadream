import {
  parseSubscriber,
  subscriberKey,
  verifyKey,
  type PendingVerifyRecord,
} from '../_shared/newsletter';

interface Env {
  NEWSLETTER_KV?: KVNamespace;
}

const SITE_URL = 'https://www.haveadream.xyz';

function redirect(path: string) {
  return new Response(null, {
    status: 302,
    headers: { Location: path },
  });
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const token = context.request.url ? new URL(context.request.url).searchParams.get('token')?.trim() : '';

  if (!token) {
    return redirect(`${SITE_URL}/?newsletter=invalid#newsletter`);
  }

  const kv = context.env.NEWSLETTER_KV;
  if (!kv) {
    return redirect(`${SITE_URL}/?newsletter=error#newsletter`);
  }

  const pendingRaw = await kv.get(verifyKey(token));
  if (!pendingRaw) {
    return redirect(`${SITE_URL}/?newsletter=invalid#newsletter`);
  }

  const pending = JSON.parse(pendingRaw) as PendingVerifyRecord;
  const expiresAt = Date.parse(pending.expiresAt);
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) {
    await kv.delete(verifyKey(token));
    return redirect(`${SITE_URL}/?newsletter=expired#newsletter`);
  }

  const email = pending.email.toLowerCase();
  const subKey = subscriberKey(email);
  const existingRaw = await kv.get(subKey);
  const existing = existingRaw ? parseSubscriber(existingRaw) : null;

  if (existing?.status === 'verified') {
    await kv.delete(verifyKey(token));
    return redirect(`${SITE_URL}/?newsletter=verified#newsletter`);
  }

  const verified = {
    email,
    status: 'verified' as const,
    subscribedAt: existing?.subscribedAt ?? new Date().toISOString(),
    verifiedAt: new Date().toISOString(),
    source: existing?.source ?? pending.source,
  };

  await kv.put(subKey, JSON.stringify(verified));
  await kv.delete(verifyKey(token));

  const countRaw = await kv.get('subscriber:count');
  const count = Number.parseInt(countRaw ?? '0', 10);
  await kv.put('subscriber:count', String(Number.isFinite(count) ? count + 1 : 1));

  return redirect(`${SITE_URL}/?newsletter=verified#newsletter`);
};