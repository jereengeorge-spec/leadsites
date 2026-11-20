// Builds one static website per file in sites/. Usage: node build.mjs [slug ...]   (no slug = every site)
// Output: dist/<slug>/ (index, thanks, privacy, robots.txt, sitemap.xml, _headers, favicon.svg).
// The booking form and the phone line are handled by the Cloudflare Pages Functions in functions/api/.
import { readFileSync, readdirSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";

export const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

/** "+14785550123" -> "(478) 555-0123" */
export function prettyPhone(e164) {
  const d = String(e164 || "").replace(/\D/g, "").replace(/^1(?=\d{10}$)/, "");
  return d.length === 10 ? `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}` : String(e164 || "");
}

export function loadSite(slug) {
  const s = JSON.parse(readFileSync(new URL(`./sites/${slug}.json`, import.meta.url), "utf8"));
  for (const k of ["slug", "brand", "trade", "tradeTitle", "pro", "city", "state", "region", "headline", "subhead", "services", "faq", "nearby"])
    if (s[k] === undefined || s[k] === "") throw new Error(`${slug}: "${k}" is missing`);
  if (s.slug !== slug) throw new Error(`${slug}: slug inside the file is "${s.slug}"`);
  if (s.phone && !/^\+1\d{10}$/.test(s.phone)) throw new Error(`${slug}: phone must look like +14785550123`);
  return s;
}

const css = (accent) => `
:root{--a:${accent};--a2:color-mix(in srgb,var(--a) 82%,black);--bg:#f7f7f5;--card:#fff;--ink:#1d1f1e;--mut:#5b615e;--line:#dfe2df}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}
body{margin:0;font:17px/1.55 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:var(--ink);background:var(--bg)}
a{color:var(--a2)}.wrap{max-width:960px;margin:0 auto;padding:0 16px}
header.top{background:var(--card);border-bottom:1px solid var(--line)}
header.top .wrap{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:60px}
.logo{font-weight:800;color:var(--ink);text-decoration:none;font-size:1.05rem}
.hero{background:linear-gradient(160deg,var(--a),var(--a2));color:#fff;padding:40px 0 44px}
.hero h1{font-size:clamp(1.9rem,6vw,2.8rem);line-height:1.15;margin:0 0 12px}
.hero p{font-size:1.1rem;margin:0 0 22px;max-width:40em;opacity:.95}
.btn{display:inline-flex;align-items:center;justify-content:center;min-height:52px;padding:0 22px;border-radius:12px;font-weight:800;text-decoration:none;border:0;font-size:1.05rem;cursor:pointer}
.btn.light{background:#fff;color:var(--a2)}.btn.ghost{background:transparent;color:#fff;border:2px solid #fff}
.btn.main{background:var(--a);color:#fff;width:100%}
.ctas{display:flex;flex-wrap:wrap;gap:10px}
.trust{display:flex;flex-wrap:wrap;gap:8px 18px;margin-top:20px;font-size:.95rem;opacity:.95;padding:0;list-style:none}
.trust li::before{content:"✓ ";font-weight:800}
section{padding:36px 0}h2{font-size:1.6rem;line-height:1.2;margin:0 0 16px}
.grid{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(240px,1fr))}
.card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:16px}
.card h3{margin:0 0 6px;font-size:1.08rem}.card p{margin:0;color:var(--mut)}
ol.steps{padding-left:1.2em;margin:0}ol.steps li{margin:0 0 8px}
form.book{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:18px;display:grid;gap:14px}
label{display:block;font-weight:700;font-size:.95rem}
input,select,textarea{display:block;width:100%;margin-top:6px;font:inherit;padding:12px;border:1px solid #b9beba;border-radius:10px;background:#fff;color:var(--ink)}
textarea{min-height:96px}.row2{display:grid;gap:14px;grid-template-columns:repeat(auto-fit,minmax(200px,1fr))}
fieldset{border:0;padding:0;margin:0}legend{font-weight:700;font-size:.95rem;margin-bottom:6px}
.chips{display:flex;flex-wrap:wrap;gap:8px}.chips label{font-weight:600;border:1px solid #b9beba;border-radius:999px;padding:8px 14px;background:#fff}
.chips input{display:inline;width:auto;margin:0 6px 0 0}
.hint{color:var(--mut);font-size:.88rem;font-weight:400}.hp{position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden}
details{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:12px 16px;margin-bottom:10px}
summary{font-weight:700;cursor:pointer}details p{margin:10px 0 0;color:var(--mut)}
.areas{columns:2;padding-left:1.1em;margin:0}
footer{background:#1d1f1e;color:#c9cdca;font-size:.9rem;padding:28px 0 96px}footer a{color:#fff}
.bar{position:fixed;left:0;right:0;bottom:0;display:flex;gap:8px;padding:10px 12px calc(10px + env(safe-area-inset-bottom));background:rgba(255,255,255,.96);border-top:1px solid var(--line);z-index:5}
.bar .btn{flex:1;min-height:48px;font-size:1rem}.bar .call{background:#fff;color:var(--a2);border:2px solid var(--a)}
@media (min-width:800px){.bar{display:none}footer{padding-bottom:28px}}
`;

const favicon = (accent) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="${accent}"/><path d="M32 10 16 34h10l-8 12h11v8h6v-8h11l-8-12h10z" fill="#fff"/></svg>`;

function page(s, { title, description, path, body, jsonld = [], noindex = false }) {
  const url = s.domain ? `https://${s.domain}${path}` : "";
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title><meta name="description" content="${esc(description)}">
${url ? `<link rel="canonical" href="${esc(url)}"><meta property="og:url" content="${esc(url)}">` : ""}
${noindex ? `<meta name="robots" content="noindex">` : ""}
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:type" content="website">
<meta name="theme-color" content="${esc(s.accent)}"><link rel="icon" href="/favicon.svg" type="image/svg+xml">
<style>${css(s.accent)}</style>
${jsonld.map((j) => `<script type="application/ld+json">${JSON.stringify(j).replace(/</g, "\\u003c")}</script>`).join("")}
</head><body>
<header class="top"><div class="wrap"><a class="logo" href="/">${esc(s.brand)}</a>${s.phone ? `<a href="tel:${esc(s.phone)}"><b>${esc(prettyPhone(s.phone))}</b></a>` : ""}</div></header>
${body}
<footer><div class="wrap">
<p><b>${esc(s.brand)}</b> is a free referral service for ${esc(s.city)}, ${esc(s.state)} and nearby towns. We do not do ${esc(s.trade)} ourselves: we pass your request to one independent local ${esc(s.pro)}, who quotes and does the work. Calls to this number may be recorded for quality.</p>
<p><a href="/privacy/">Privacy</a> · <a href="/#book">Book a free quote</a></p>
</div></footer>
<nav class="bar" aria-label="Quick actions">${s.phone ? `<a class="btn call" href="tel:${esc(s.phone)}">Call</a>` : ""}<a class="btn main" href="/#book">Book free quote</a></nav>
</body></html>`;
}

function home(s) {
  const phone = s.phone ? prettyPhone(s.phone) : "";
  const services = s.services.map((x) => `<div class="card"><h3>${esc(x.name)}</h3><p>${esc(x.text)}</p></div>`).join("");
  const opts = (arr) => arr.map((x) => `<option>${esc(x)}</option>`).join("");
  const faq = s.faq.map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join("");
  const areas = [s.city, ...s.nearby].map((a) => `<li>${esc(a)}</li>`).join("");
  const body = `
<section class="hero"><div class="wrap">
<h1>${esc(s.headline)}</h1>
<p>${esc(s.subhead)}</p>
<div class="ctas"><a class="btn light" href="#book">Book a free quote</a>${phone ? `<a class="btn ghost" href="tel:${esc(s.phone)}">Call ${esc(phone)}</a>` : ""}</div>
<ul class="trust"><li>Free quotes</li><li>Local ${esc(s.region)} pros</li><li>Storm help</li><li>You never pay us</li></ul>
</div></section>

<section><div class="wrap">
<h2>${esc(s.tradeTitle)} services in ${esc(s.city)}</h2>
<div class="grid">${services}</div>
</div></section>

<section style="padding-top:0"><div class="wrap">
<h2>How it works</h2>
<ol class="steps">
<li><b>Book in two minutes.</b> Tell us what you need, add a photo if you can, and pick a day and time.</li>
<li><b>A local ${esc(s.pro)} calls you.</b> Usually the same day, to confirm a time to look at the job.</li>
<li><b>Get a free quote.</b> The price is agreed before any work starts. No obligation.</li>
</ol>
</div></section>

<section id="book" style="padding-top:0"><div class="wrap">
<h2>Book a free quote</h2>
<form class="book" method="post" action="/api/book" enctype="multipart/form-data">
<input type="hidden" name="site" value="${esc(s.slug)}">
<div class="hp" aria-hidden="true"><label>Leave this empty <input name="website" tabindex="-1" autocomplete="off"></label></div>
<div class="row2">
<label>Your name<input name="name" required autocomplete="name" maxlength="80"></label>
<label>Mobile phone<input name="phone" type="tel" required autocomplete="tel" inputmode="tel" maxlength="20" placeholder="(478) 555-0100"></label>
</div>
<div class="row2">
<label>Street address<input name="address" required autocomplete="street-address" maxlength="120"></label>
<label>ZIP code<input name="zip" required inputmode="numeric" pattern="[0-9]{5}" maxlength="5" autocomplete="postal-code"></label>
</div>
<div class="row2">
<label>What do you need?<select name="service" required><option value="">Choose one</option>${opts(s.services.map((x) => x.name))}<option>Something else</option></select></label>
${s.sizes ? `<label>About how big?<select name="size"><option value="">Choose one</option>${opts(s.sizes)}</select></label>` : ""}
</div>
<fieldset><legend>How soon?</legend><div class="chips">
${["Emergency: today", "This week", "Within a month", "Just pricing it out"].map((u, i) => `<label><input type="radio" name="urgency" value="${esc(u)}"${i === 1 ? " checked" : ""}>${esc(u)}</label>`).join("")}
</div></fieldset>
<div class="row2">
<label>Best day for the visit <span class="hint">(optional)</span><input name="day" type="date"></label>
<label>Best time<select name="time"><option>Any time</option><option>Morning (8 to 12)</option><option>Afternoon (12 to 4)</option><option>Evening (4 to 7)</option></select></label>
</div>
<label>Anything else? <span class="hint">(near the house, power lines, gate code…)</span><textarea name="details" maxlength="1500"></textarea></label>
<label>Photos <span class="hint">(optional, up to 3)</span><input name="photos" type="file" accept="image/*" multiple></label>
<p class="hint">By booking, you agree that one local ${esc(s.pro)} may call or text you about this request. We never sell your details to a list of companies.</p>
<button class="btn main" type="submit">Book my free quote</button>
${phone ? `<p class="hint" style="text-align:center;margin:0">Rather talk? Call <a href="tel:${esc(s.phone)}">${esc(phone)}</a></p>` : ""}
</form>
</div></section>

<section style="padding-top:0"><div class="wrap">
<h2>Questions</h2>${faq}
</div></section>

<section style="padding-top:0"><div class="wrap">
<h2>Areas we cover</h2>
<p>${esc(s.city)}${s.county ? `, ${esc(s.county)}` : ""} and nearby towns in ${esc(s.region)}:</p>
<ul class="areas">${areas}</ul>
</div></section>`;
  const jsonld = [
    { "@context": "https://schema.org", "@type": "Service", serviceType: s.tradeTitle, name: `${s.tradeTitle} in ${s.city}, ${s.state}`,
      areaServed: [s.city, ...s.nearby].map((n) => ({ "@type": "City", name: `${n}, ${s.state}` })),
      provider: { "@type": "Organization", name: s.brand, ...(s.phone ? { telephone: s.phone } : {}), ...(s.domain ? { url: `https://${s.domain}/` } : {}) } },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: s.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
  ];
  return page(s, {
    title: `${s.tradeTitle} ${s.city}, ${s.state} | Free Quotes`,
    description: `${s.tradeTitle} in ${s.city}, ${s.state} and ${s.region}. Book a free quote online in two minutes; a local ${s.pro} calls you back, usually the same day.`,
    path: "/", body, jsonld,
  });
}

function thanks(s) {
  const body = `<section><div class="wrap"><h1>Got it. Thank you!</h1>
<p>Your request is on its way to a local ${esc(s.pro)}. They will call or text you, usually within a few hours during the day, to confirm a time.</p>
<p>Keep your phone handy: the call may come from a number you don't know.</p>
${s.phone ? `<p>Emergency, or something to add? Call <a href="tel:${esc(s.phone)}">${esc(prettyPhone(s.phone))}</a>.</p>` : ""}
<p><a class="btn main" style="width:auto" href="/">Back to the home page</a></p></div></section>`;
  return page(s, { title: `Thank you | ${s.brand}`, description: "Your request was received.", path: "/thanks/", body, noindex: true });
}

function oops(s) {
  const body = `<section><div class="wrap"><h1>Sorry, that didn't send</h1>
<p>Please check your name, phone, address and ZIP, then try again.${s.phone ? ` Or call <a href="tel:${esc(s.phone)}">${esc(prettyPhone(s.phone))}</a>.` : ""}</p>
<p><a class="btn main" style="width:auto" href="/#book">Try again</a></p></div></section>`;
  return page(s, { title: `Not sent | ${s.brand}`, description: "Your request was not sent.", path: "/oops/", body, noindex: true });
}

function privacy(s) {
  const body = `<section><div class="wrap"><h1>Privacy</h1>
<p><b>What we collect:</b> what you type in the booking form (name, phone, address, ZIP, details, photos) and, when you call, your phone number and a recording of the call.</p>
<p><b>Why:</b> only to connect you with one local ${esc(s.pro)} about your request, and to check the quality of the service.</p>
<p><b>Who sees it:</b> the one independent ${esc(s.trade)} company we partner with in your area, and us. We do not sell your details or send them to a list of companies.</p>
<p><b>How long:</b> booking emails and call recordings are kept up to 12 months, then deleted.</p>
<p><b>Your choice:</b> to have your details deleted, reply to the text or email you received, or tell the ${esc(s.pro)} when they call.</p>
</div></section>`;
  return page(s, { title: `Privacy | ${s.brand}`, description: `How ${s.brand} handles your details.`, path: "/privacy/", body });
}

export function buildSite(slug, outRoot = "dist") {
  const s = loadSite(slug);
  const out = join(outRoot, slug);
  rmSync(out, { recursive: true, force: true });
  for (const d of ["", "thanks", "oops", "privacy"]) mkdirSync(join(out, d), { recursive: true });
  writeFileSync(join(out, "index.html"), home(s));
  writeFileSync(join(out, "thanks/index.html"), thanks(s));
  writeFileSync(join(out, "oops/index.html"), oops(s));
  writeFileSync(join(out, "privacy/index.html"), privacy(s));
  writeFileSync(join(out, "favicon.svg"), favicon(s.accent));
  writeFileSync(join(out, "robots.txt"), `User-agent: *\nAllow: /\nDisallow: /thanks/\nDisallow: /oops/\n${s.domain ? `Sitemap: https://${s.domain}/sitemap.xml\n` : ""}`);
  if (s.domain)
    writeFileSync(join(out, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${["/", "/privacy/"].map((p) => `<url><loc>https://${s.domain}${p}</loc></url>`).join("")}</urlset>\n`);
  writeFileSync(join(out, "_headers"), "/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  X-Frame-Options: DENY\n");
  return out;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const slugs = process.argv.slice(2).length ? process.argv.slice(2) : readdirSync(new URL("./sites/", import.meta.url)).filter((f) => f.endsWith(".json")).map((f) => f.slice(0, -5));
  for (const slug of slugs) console.log(`built ${buildSite(slug)}`);
}
