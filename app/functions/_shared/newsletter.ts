export type SubscriberStatus = 'pending' | 'verified';

export type SubscriberRecord = {
  email: string;
  status: SubscriberStatus;
  subscribedAt: string;
  verifiedAt?: string;
  source: string;
};

export type PendingVerifyRecord = {
  email: string;
  token: string;
  expiresAt: string;
  source: string;
};

export const VERIFY_TTL_MS = 24 * 60 * 60 * 1000;

export function subscriberKey(email: string) {
  return `subscriber:${email}`;
}

export function verifyKey(token: string) {
  return `verify:${token}`;
}

export function parseSubscriber(raw: string): SubscriberRecord {
  const data = JSON.parse(raw) as Partial<SubscriberRecord>;
  return {
    email: data.email ?? '',
    status: data.status ?? 'verified',
    subscribedAt: data.subscribedAt ?? new Date().toISOString(),
    verifiedAt: data.verifiedAt,
    source: data.source ?? 'unknown',
  };
}

export function createVerifyToken() {
  return crypto.randomUUID();
}