export const onRequestGet: PagesFunction = async () => {
  return new Response(
    JSON.stringify({ ok: true, service: 'had-rpc-proxy' }),
    { headers: { 'Content-Type': 'application/json' } },
  );
};