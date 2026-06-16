# Coyne Finance — Website

A fast, fully static website for **Coyne Finance Pty Ltd** (Asset & Commercial Finance · Australia).
Built to the approved Brand Guidelines (v1.0) and the approved Website Copy (KATANA, v1.0, June 2026).

- **Zero build step. Zero dependencies.** Plain HTML/CSS/JS — host it anywhere.
- Navy `#0B1F3A` + Gold `#C9A227` brand system, drawn directly from the brand guide.
- Responsive, accessible (skip link, focus states, reduced-motion support), SEO meta on every page.
- Interactive: scroll animations, mobile nav, an **educational repayment estimator**, an **FAQ accordion**, and a validated enquiry form.

---

## Pages

| File | Purpose |
|------|---------|
| `index.html` | Home — hero, services, process, **interactive calculator**, educational FAQ |
| `solutions.html` | Capabilities — all finance categories |
| `about.html` | About / Founder |
| `contact.html` | Discuss Finance — enquiry form |
| `privacy.html` | Privacy Policy (template — review before launch) |
| `credit-guide.html` | Credit Guide (template — review before launch) |
| `complaints.html` | Complaints & Dispute Resolution (template — review before launch) |
| `404.html` | Not-found page |
| `assets/css/styles.css` | All styles (design tokens at top) |
| `assets/js/main.js` | All interactions |

---

## Deploy (pick one)

**Netlify (drag & drop — easiest)**
1. Go to https://app.netlify.com/drop
2. Drag the `coyne-finance` folder onto the page. Live in ~20 seconds.
3. Add your custom domain in Site settings → Domain management.

**Vercel / Cloudflare Pages / GitHub Pages**
- Upload the folder (or push to a repo). No build command, output directory = project root.

**Any traditional host (cPanel / FTP)**
- Upload the entire folder contents to your `public_html` (or web root).

**Preview locally**
```bash
cd ~/Sites/coyne-finance
python3 -m http.server 8080
# open http://localhost:8080
```

---

## Wire up the enquiry form → GoHighLevel (one step)

The enquiry form is **already wired to GoHighLevel**. It validates input, POSTs a clean JSON
payload to your GHL inbound webhook, shows a loading state, and handles success/errors.
You only need to paste your webhook URL:

1. In GHL: **Automation → Workflows → Create Workflow → Add Trigger → "Inbound Webhook"**.
2. Copy the webhook URL it generates.
3. Open `assets/js/main.js`, find `GHL_WEBHOOK_URL` near the top, and paste the URL between the quotes:
   ```js
   var GHL_WEBHOOK_URL = "https://services.leadconnectorhq.com/hooks/XXXX/webhook-trigger/XXXX";
   ```
4. In the workflow, map the incoming fields to your contact and add your pipeline/automation steps.

**Payload fields sent to GHL:** `first_name`, `full_name`, `phone`, `email`, `asset_type`,
`amount`, `employment`, `message`, `source`, `page`, `submitted_at`.

> If `GHL_WEBHOOK_URL` is left empty, the form stays in safe **demo mode** (validates + confirms,
> sends nothing) so the site never looks broken before you're ready.

**Alternatives** (if you ever move off GHL): set `action`/`method` on the `<form>` for Formspree,
or add `data-netlify="true"` + a hidden `form-name` input for Netlify Forms.

---

## ⚠️ Pre-launch checklist (do not publish until done)

Bracketed `[…]` values and `<!-- TODO -->` comments mark everything that must be confirmed.

**Licensing disclosure (resolved):** the footer + legal pages now name the correct entity —
**Coyne Financial Pty Ltd ATF The Coyne Capital Trust (ACN 688 064 691), trading as Coyne Finance** —
as a Credit Representative of **AFAS Group Pty Ltd, Australian Credit Licence 414426** (the licensee
behind the Optimise Aggregation model). Only the credit-rep *number* remains a placeholder.

- [ ] **Credit Representative Number** — replace `[XXXXXX]` (issued by AFAS/Optimise) in the footer of every page + the Privacy Policy and Credit Guide.
- [ ] **Confirm disclosure wording with Optimise/AFAS compliance** — some aggregators require exact phrasing (e.g. whether to name Optimise Finance Pty Ltd as well as AFAS Group Pty Ltd ACL 414426).
- [ ] **Contact details** — email, phone, postal address in `contact.html`, `privacy.html`, `credit-guide.html`, `complaints.html`.
- [ ] **Legal pages** — have the Privacy Policy, Credit Guide and Complaints pages reviewed/approved. Fill fee, commission and lender-panel disclosures (per AFAS/Optimise).
- [ ] **AFCA membership number** — confirm the number that applies via AFAS Group Pty Ltd (`complaints.html`).
- [ ] **Founder name** — confirm "Chase Coyne" in `about.html` is the correct public/credit name (legal name on file: Chase Harry Coyne).
- [ ] **No final figures published as placeholders** — per the copy brief, do not publish `[$XXM]`-style stats. (None are currently shown on the public pages — the trust section uses qualitative, verifiable markers only.)
- [ ] **Calculator disclaimer** — the indicative-only notice is in place under the estimator; keep it.
- [ ] **Domain** — update the domain in `robots.txt` and `sitemap.xml`.
- [ ] **Form** — paste your GHL webhook into `GHL_WEBHOOK_URL` in `assets/js/main.js` and send a test enquiry.
- [ ] **Email deliverability / privacy consent** — confirm the consent line under the form meets your obligations.

---

*Brand: navy `#0B1F3A`, gold `#C9A227`, ink `#1F2937`, cream `#F5F3EE`. Type: Inter (sans) + serif logomark.*
