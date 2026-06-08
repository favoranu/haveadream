interface Env {
  HELIUS_API_KEY?: string;
  SOLANA_RPC_URL?: string;
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function getUpstream(env: Env): string {
  if (env.SOLANA_RPC_URL) return env.SOLANA_RPC_URL;
  if (env.HELIUS_API_KEY) {
    return `https://mainnet.helius-rpc.com/?api-key=${env.HELIUS_API_KEY}`;
  }
  return 'https://api.mainnet-beta.solana.com';
}

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { status: 204, headers: CORS });
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const upstream = getUpstream(context.env);
  const body = await context.request.text();

  try {
    const res = await fetch(upstream, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });

    return new Response(await res.text(), {
      status: res.status,
      headers: {
        ...CORS,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    });
  } catch {
    return new Response(
      JSON.stringify({ error: 'RPC proxy unavailable' }),
      { status: 502, headers: { ...CORS, 'Content-Type': 'application/json' } },
    );
  }
};