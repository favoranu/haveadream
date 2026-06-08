import { ALLOWED_RPC_METHODS, corsHeaders, MAX_RPC_BODY_BYTES } from '../_shared/security';

interface Env {
  HELIUS_API_KEY?: string;
  SOLANA_RPC_URL?: string;
}

function getUpstream(env: Env): string {
  if (env.SOLANA_RPC_URL) return env.SOLANA_RPC_URL;
  if (env.HELIUS_API_KEY) {
    return `https://mainnet.helius-rpc.com/?api-key=${env.HELIUS_API_KEY}`;
  }
  return 'https://api.mainnet-beta.solana.com';
}

function jsonResponse(request: Request, status: number, payload: unknown) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...corsHeaders(request),
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
}

function parseRpcMethod(body: string): string | null {
  try {
    const parsed = JSON.parse(body) as { method?: string } | { method?: string }[];
    if (Array.isArray(parsed)) {
      return parsed.every((item) => ALLOWED_RPC_METHODS.has(item.method ?? ''))
        ? 'batch-ok'
        : null;
    }
    return typeof parsed.method === 'string' ? parsed.method : null;
  } catch {
    return null;
  }
}

export const onRequestOptions: PagesFunction<Env> = async (context) => {
  return new Response(null, { status: 204, headers: corsHeaders(context.request) });
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const cors = corsHeaders(context.request);
  if (!cors['Access-Control-Allow-Origin']) {
    return jsonResponse(context.request, 403, { error: 'Origin not allowed.' });
  }

  const contentLength = Number(context.request.headers.get('Content-Length') ?? '0');
  if (contentLength > MAX_RPC_BODY_BYTES) {
    return jsonResponse(context.request, 413, { error: 'Request body too large.' });
  }

  const body = await context.request.text();
  if (body.length > MAX_RPC_BODY_BYTES) {
    return jsonResponse(context.request, 413, { error: 'Request body too large.' });
  }

  const method = parseRpcMethod(body);
  if (!method || (method !== 'batch-ok' && !ALLOWED_RPC_METHODS.has(method))) {
    return jsonResponse(context.request, 403, { error: 'RPC method not allowed.' });
  }

  const upstream = getUpstream(context.env);

  try {
    const res = await fetch(upstream, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });

    return new Response(await res.text(), {
      status: res.status,
      headers: {
        ...cors,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    });
  } catch {
    return jsonResponse(context.request, 502, { error: 'RPC proxy unavailable' });
  }
};