# Deploy $HAD App → app.haveadream.xyz

## What you built locally
`C:\Users\nomad\had-token\app\` — React + Solana wallet + RPC proxy (Cloudflare Pages Functions).

---

## YOUR checklist (do these in order)

### 1. Get a Solana RPC API key (recommended)
Free tier is fine to start.

- **Helius:** https://helius.dev → create project → copy API key
- Or **QuickNode / Alchemy** — set full URL as `SOLANA_RPC_URL` instead

### 2. Remove the wrong Web3 gateway
Cloudflare Dashboard → **haveadream.xyz** → **Web3**

- Delete gateway **`app.haveadream.xyz`** (Ethereum gateway — wrong for Solana)

### 3. Push code to GitHub (if not already)
Create a repo and include the `had-token` project (or just the `app/` folder in its own repo).

### 4. Create Cloudflare Pages project
Dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**

| Setting | Value |
|---------|-------|
| Project name | `had-app` (or any name) |
| Production branch | `main` |
| **Root directory** | `app` |
| **Build command** | `npm run build` |
| **Build output** | `dist` |
| Framework preset | None (or Vite if offered) |

Click **Save and Deploy** (first build may fail until env vars are set — that's OK).

### 5. Add environment variables (Pages → Settings → Environment variables)

| Name | Type | Value |
|------|------|-------|
| `HELIUS_API_KEY` | Secret | your Helius key |

**Or** instead of Helius:

| Name | Type | Value |
|------|------|-------|
| `SOLANA_RPC_URL` | Secret | `https://your-provider-url` |

Redeploy after adding secrets.

### 6. Attach custom domain `app.haveadream.xyz`
Pages project → **Custom domains** → **Set up a domain** → `app.haveadream.xyz`

Cloudflare will create DNS (CNAME to `had-app.pages.dev` or similar). Ensure **Proxied** (orange cloud).

### 7. Verify
- https://app.haveadream.xyz — app UI loads (not Cloudflare Ethereum docs)
- https://app.haveadream.xyz/api/health — `{"ok":true,...}`
- Connect Phantom → balance loads (or 0 if no $HAD in wallet)

---

## Optional: link from main site
On **www.haveadream.xyz**, add a button: **Open App** → `https://app.haveadream.xyz`

---

## Local dev (when Node is installed)
```bash
cd app
npm install
npm run dev
```
Uses public Solana RPC in dev. For proxy testing:
```bash
npm run build
npx wrangler pages dev dist --compatibility-date=2024-09-23
```

---

## Scaling path
- **Now:** wallet connect + balance + contract display
- **Next:** governance votes, dream submissions (Workers + D1 or KV)
- **RPC:** Helius paid tier as traffic grows; rate-limit in `functions/api/rpc.ts` if needed