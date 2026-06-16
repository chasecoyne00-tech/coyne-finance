# Go-Live Runbook — coynefinance.com.au

The site is built, deployed and live as a **staging preview**:
**https://chasecoyne00-tech.github.io/coyne-finance/**

It auto-updates the RBA cash rate (scheduled GitHub Action → `data/rates.json`).
Everything below is what only **you** can supply to take it to the public
`coynefinance.com.au` domain. Do **not** point DNS until Step 1 is done —
it's a credit-licensed site and these are regulatory facts, not copy.

---

## Step 1 — Fill the compliance placeholders (REQUIRED before public launch)

Search the repo for `[XXXXXX]`, `[Email]`, `[Phone]`, `[Postal address]` and
`<!-- TODO`. Exact locations:

| What | Where |
|---|---|
| **Credit Representative Number** (from AFAS/Optimise) | `index.html:293`, `solutions.html:88`, `privacy.html:42` & `:89`, `credit-guide.html:44` & `:76`, `contact.html:134`, `complaints.html:75` |
| **Public phone / email / postal address** | `contact.html:45–52`, `privacy.html:75`, `credit-guide.html:62`, `complaints.html:43–45` |
| **AFCA membership number** (via AFAS Group) | `complaints.html:59` |
| **Lender-panel + fee/commission disclosure** text | `credit-guide.html:50` & `:56` |
| **Credit reporting bodies** used | `privacy.html:60` |
| **Confirm disclosure wording** with Optimise/AFAS compliance | footer of every page |

> Already done: entity/licensee details, legal-page effective dates (June 2026),
> founder name, calculator disclaimer.

**Confirm the lender panel before launch.** The "Lender panel" section on
`index.html` and `solutions.html` lists 16 lenders modelled on Savvy's panel
(same AFAS/ACL 414426 licensee). Verify this list matches **your actual
AFOS/Optimise accreditations** and remove any you can't currently place deals
with — advertising lenders you aren't accredited for is a misleading-conduct
risk. The list is plain text in both files (`<ul class="lender-grid">`); add or
delete `<li>` items to match.

## Step 2 — Wire the enquiry form to GoHighLevel (2 minutes)

1. GHL → **Automation → Workflows → new workflow → trigger "Inbound Webhook"** → copy the URL.
2. Open `assets/js/main.js`, line ~13, paste it: `var GHL_WEBHOOK_URL = "https://services.leadconnectorhq.com/hooks/.../webhook-trigger/...";`
3. Commit + push. Send a test enquiry, confirm the contact lands in GHL.

(Left empty, the form stays in safe demo mode — validates + confirms, sends nothing.)

## Step 3 — Point your domain at GitHub Pages

Keeping the site on GitHub Pages means the **live cash-rate Action keeps working**.
The domain's DNS is managed at **Squarespace** (registrar only — the site is NOT
hosted on Squarespace). Do these in order; the order matters so the staging
preview doesn't break.

**a) Add the records at Squarespace.**
Squarespace dashboard → **Domains** → `coynefinance.com.au` → **DNS** /
**DNS Settings** → **Add record**. Remove any existing default `@` A-records or
`www` CNAME that Squarespace preloaded (they'll conflict), then add:

```
# Apex (coynefinance.com.au) — four A records to GitHub Pages:
Host  @    Type A      Value 185.199.108.153
Host  @    Type A      Value 185.199.109.153
Host  @    Type A      Value 185.199.110.153
Host  @    Type A      Value 185.199.111.153

# www = the canonical host (sitemap.xml + robots.txt already use www):
Host  www  Type CNAME  Value chasecoyne00-tech.github.io
```
(Squarespace shows the apex host as `@`; some screens label it blank/“root”.)

**b) Tell GitHub the custom domain — ONLY after step (a) is saved.**
GitHub repo → **Settings → Pages → Custom domain** = `www.coynefinance.com.au`
→ Save. This writes a `CNAME` file to the repo. (Do NOT set this before the DNS
records exist — GitHub will 301-redirect the working github.io staging URL to a
domain that doesn't resolve yet, taking the preview offline.)

**c)** Wait for the cert, then tick **Enforce HTTPS**.
DNS propagation can take 15 min–24 h; the GitHub cert a few minutes after that.

> Squarespace Domains has no convenient DNS API for this, so steps (a) is a
> manual dashboard task — but it's ~6 records and ~5 minutes. Claude can't reach
> your Squarespace account; you (or I, if you paste the screen) drive the dashboard.

## Step 4 — Flip on indexing (currently fine, just verify)

- `robots.txt` and `sitemap.xml` already reference `https://www.coynefinance.com.au/`. ✅
- Once live + compliant, submit the sitemap in Google Search Console.

---

## How the live rate stays current

- `data/rates.json` holds the cash rate the site displays.
- `.github/workflows/update-rates.yml` runs weekday afternoons (and on demand:
  Actions tab → "Update RBA cash rate" → Run workflow). It reads the official
  RBA cash-rate page, and if the target changed, commits the new value — which
  redeploys Pages automatically.
- If the RBA source is ever unreachable or unparseable, the job changes nothing
  (no stale/guessed figure is ever shown), and the band simply hides if the data
  can't be fetched.
- Manual fallback: edit `cash_rate` + `effective` in `data/rates.json` and push.
