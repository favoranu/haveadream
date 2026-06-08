# $HAD — Have A Dream · Project Notes
*Saved: June 5, 2026*

## Project location
`C:\Users\nomad\had-token\`

Deployable site: **`public/`** → upload entire contents to **haveadream.xyz** web root.

## Run locally
```powershell
cd C:\Users\nomad\had-token
powershell -ExecutionPolicy Bypass -File .\serve.ps1
# http://localhost:3000
```
Or double-click `start.bat`.

---

## Tokenomics (authoritative)
Total supply: **10,000,000,000 $HAD**

| Allocation | % | Amount |
|---|---|---|
| Team & Founder | 19% | 1,900,000,000 |
| Treasury | **39.51%** | **3,951,000,000** |
| Airdrop | 22.2% | 2,220,000,000 |
| Ecosystem Incentives (MLK Birthday Nod) | **19.29%** | **1,929,000,000** |

Chart colors: Gold `#FFD700`, Sky Blue `#00BFFF`, Hot Pink `#FF69B4`, Lime `#32CD32`

> Earlier mistaken paste (39.12% / 19.68%) was reverted. All surfaces now synced.

---

## Key dates & links
- **Launch:** January 15, 2027
- **Site:** https://haveadream.xyz
- **Domain:** HAD.unstoppable
- **Telegram:** t.me/haveadreamxyz
- **Twitter:** @hadunstoppable

---

## Site files (upload `public/`)

**Required:**
- `index.html`, `styles.css`, `app.js`
- `whitepaper.html`, `whitepaper.css`, `whitepaper.pdf`, `HAD-Whitepaper-v1.1.doc`
- `js/tokenomics-chart.js`
- `images/had-hero-banner.mp4`
- `images/had.unstoppable_1024x1024.PNG`
- `images/IMG_2823.PNG`
- `images/had-tokenomics.png`
- `images/had.unstoppable_qrcode_3072x3072.JPG`
- `images/had.unstoppable_qrcode_2250x4872.JPG`

**Do NOT upload:** `serve.ps1`, `server.js`, `package.json`, `subscribers.json`, `scripts/`

---

## Completed
- Landing page with motion hero, tokenomics pie chart (Chart.js + PNG fallback)
- Whitepaper v1.1 (online, Word .doc, PDF)
- Correct tokenomics across index, chart, whitepaper, print HTML, PDF, .doc
- Newsletter UI (currently localStorage fallback on static host)
- Local PowerShell server with `/api/subscribe` → `subscribers.json` (dev only)
- Navigation/scroll fixes, whitepaper TOC layout fix
- `mkdoc.ps1` hardened (saves to .tmp before replacing .doc)

---

## TODO — Mailchimp (next session)
Newsletter form is in `public/index.html` + `public/app.js`.

**Current behavior:**
- Local server: POST `/api/subscribe` → `subscribers.json`
- Static host: falls back to `localStorage` (no server collection)

**To hook Mailchimp:**
1. Create Mailchimp audience + signup form or API key
2. Replace `fetch("/api/subscribe", …)` in `app.js` with Mailchimp endpoint
   - Option A: Mailchimp embedded form action URL (simplest, no backend)
   - Option B: Mailchimp Marketing API via serverless function (keeps custom UI)
   - Option C: Formspree/other as bridge if preferred
3. Remove localStorage fallback once live endpoint works
4. Add env/config for API key (never commit keys to repo)
5. Test on haveadream.xyz after deploy

---

## Asset regeneration (if tokenomics change again)
```powershell
powershell -ExecutionPolicy Bypass -File .\generate-chart.ps1   # PNG chart
powershell -ExecutionPolicy Bypass -File .\make-pdf.ps1         # PDF from print HTML
```

---

## Conversation context
Built/evolved the $HAD token site to match haveadream.xyz draft: utility focus (no yields promised), MLK tribute, meme culture, governance on haveadream.xyz. Fixed file-lock issues on whitepaper-print.html. Recreated HAD-Whitepaper-v1.1.doc after failed Word COM run.