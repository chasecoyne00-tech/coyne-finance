#!/usr/bin/env node
/* =====================================================================
   update-rates.mjs — keeps data/rates.json current with the RBA cash rate.

   Reads the Reserve Bank of Australia's official cash-rate page and takes
   the most recent row of the "Cash Rate Target Changes" table — i.e. the
   exact current policy target and the date it took effect. (The F1.1 CSV is
   deliberately NOT used: it publishes monthly *averages*, which blend across
   a mid-month change and so misstate the headline target.)

   Resilient by design: if the source can't be fetched or parsed, or the
   value looks implausible, it leaves rates.json untouched and exits 0 so a
   bad source never breaks the site or the build. Run by .github/workflows/
   update-rates.yml on a schedule; safe to run locally too.
   ===================================================================== */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const RATES_PATH = join(__dirname, "..", "data", "rates.json");
const PAGE_URL = "https://www.rba.gov.au/statistics/cash-rate/";

const MONTHS = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 };

function toIsoDate(s) {
  // "6 May 2026" -> "2026-05-06"
  const m = (s || "").trim().match(/^(\d{1,2})\s+([A-Za-z]{3,})\s+(\d{4})$/);
  if (!m) return null;
  const mo = MONTHS[m[2].slice(0, 3).toLowerCase()];
  if (!mo) return null;
  return `${m[3]}-${String(mo).padStart(2, "0")}-${m[1].padStart(2, "0")}`;
}

async function main() {
  let html;
  try {
    const res = await fetch(PAGE_URL, { headers: { "User-Agent": "coyne-finance-rate-updater" } });
    if (!res.ok) throw new Error("HTTP " + res.status);
    html = await res.text();
  } catch (e) {
    console.error("Could not fetch RBA cash-rate page — leaving rates.json unchanged:", e.message);
    return; // exit 0
  }

  // First table row: <th scope="row">DATE</th> <td>CHANGE</td> <td>NEW TARGET</td>
  const m = html.match(
    /<th[^>]*scope="row"[^>]*>\s*([^<]+?)\s*<\/th>\s*<td>[^<]*<\/td>\s*<td>\s*([\d.]+)\s*<\/td>/i
  );
  if (!m) {
    console.error("Could not locate the cash-rate target row — leaving rates.json unchanged.");
    return;
  }

  const effective = toIsoDate(m[1]);
  const value = Number(m[2]);
  if (!effective || !(value > 0 && value < 20)) {
    console.error(`Parsed values implausible (date=${m[1]}, value=${m[2]}) — leaving rates.json unchanged.`);
    return;
  }

  const current = JSON.parse(readFileSync(RATES_PATH, "utf8"));
  const next = {
    ...current,
    cash_rate: value,
    effective,
    source: "Reserve Bank of Australia",
    source_url: PAGE_URL,
    updated: new Date().toISOString().slice(0, 10),
  };

  if (current.cash_rate === next.cash_rate && current.effective === next.effective) {
    console.log(`Cash rate unchanged (${value}% eff ${effective}). No write.`);
    return;
  }

  writeFileSync(RATES_PATH, JSON.stringify(next, null, 2) + "\n");
  console.log(`Updated cash rate -> ${value}% effective ${effective}`);
}

main();
