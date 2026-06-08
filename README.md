# $HAD — Have A Dream

Official project for **Have A Dream** ($HAD) on Solana.

- **Site:** https://www.haveadream.xyz
- **App:** https://app.haveadream.xyz
- **Contract:** `HAdrC2f52GTnDN15baCBC372QRxsftNL36HUSxveLEKe` (Solana mainnet)

## Folders

| Path | Purpose |
|------|---------|
| `public/` | Main marketing site (static) |
| `app/` | Solana wallet app (Cloudflare Pages) |
| `serve.ps1` | Local preview server (optional) |

## Deploy

- **Main site:** upload contents of `public/` to web host root
  - `index.html` — full landing page (homepage)
  - `comingsoon.html` — optional splash / teaser page
- **App:** see `app/DEPLOY-APP.md` for Cloudflare Pages

## GitHub

```bash
git remote add origin https://github.com/favoranu/haveadream.git
git push -u origin main
```

## Token

Fixed supply 10B. Official mint authority revoked. Legacy mint deprecated — see site for details.