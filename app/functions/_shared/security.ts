const ALLOWED_ORIGINS = new Set([
  'https://app.haveadream.xyz',
  'https://haveadream.pages.dev',
  'https://www.haveadream.xyz',
  'https://haveadream.xyz',
  'http://localhost:5173',
  'http://localhost:8788',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:8788',
]);

export function corsHeaders(request: Request, methods = 'POST, OPTIONS') {
  const origin = request.headers.get('Origin');
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': methods,
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin',
  };

  if (origin && ALLOWED_ORIGINS.has(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
  }

  return headers;
}

export const ALLOWED_RPC_METHODS = new Set([
  'getAccountInfo',
  'getParsedAccountInfo',
  'getTokenAccountsByOwner',
  'getBalance',
  'getLatestBlockhash',
  'getSlot',
  'getVersion',
  'getMinimumBalanceForRentExemption',
  'getMultipleAccounts',
  'getEpochInfo',
  'getGenesisHash',
  'isBlockhashValid',
]);

export const MAX_RPC_BODY_BYTES = 32_768;