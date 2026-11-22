// Renders the Facebook Marketplace test images (1080 x 1080, saved at 2x as JPEG).
// Every variant shares one design. Only the words and the small icon change,
// so a test compares the offer, not the design.
// Run: node marketing/marketplace-test/render.cjs
// Needs Playwright with Chromium. Icons: Lucide (ISC). Headline font: Anton (SIL OFL, see fonts/).

const path = require('node:path');
const fs = require('node:fs');
const { chromium } = require('playwright');

const HERE = __dirname;

// Lucide icon paths (24 x 24 grid).
const ICONS = {
  tree: '<path d="M8 19a4 4 0 0 1-2.24-7.32A3.5 3.5 0 0 1 9 6.03V6a3 3 0 1 1 6 0v.04a3.5 3.5 0 0 1 3.24 5.65A4 4 0 0 1 16 19Z"/><path d="M12 19v3"/>',
  storm: '<path d="M6 16.326A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 .5 8.973"/><path d="m13 12-3 5h4l-3 5"/>',
  pin: '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
  message: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
  arrow: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
};
const icon = (name, cls = '') =>
  `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]}</svg>`;

// Week 1: offers test. Add week 2 and week 3 variants here later.
const VARIANTS = [
  {
    file: 'listing-a-free-estimate.jpg',
    top: 'Tree removal',
    big: 'Free',
    bigIcon: 'tree',
    bottom: 'Estimates',
    sub: 'Get a quote from a local tree pro.',
  },
  {
    file: 'listing-b-storm-damage.jpg',
    top: 'Tree down?',
    big: 'Storm',
    bigIcon: 'storm',
    bottom: 'Damage help',
    sub: 'Get connected with a local tree pro.',
  },
];

const SHARED = {
  area: 'Cobb County, GA',
  towns: 'Marietta · Smyrna · Kennesaw · Acworth',
  cta: 'Message us today',
  foot: 'Free referral service · We connect you with one local tree pro',
};

const page = (v) => `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: 'Anton'; src: url('fonts/anton-latin-400-normal.woff2') format('woff2'); }
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { width: 1080px; height: 1080px; }
body { position: relative; overflow: hidden; color: #fff;
  font-family: 'Inter', 'DejaVu Sans', sans-serif;
  background: radial-gradient(120% 95% at 88% 8%, #2f7a4e 0%, #18452d 46%, #0b2216 100%); }
.water { position: absolute; right: -170px; bottom: -40px; width: 780px; height: 780px;
  color: rgba(255,255,255,0.055); stroke-width: 1.6; }
.wrap { position: absolute; inset: 70px 72px 60px; display: flex; flex-direction: column; }
.chip { align-self: flex-start; display: inline-flex; align-items: center; gap: 14px;
  padding: 14px 28px 14px 20px; border-radius: 999px; background: rgba(255,210,63,0.13);
  border: 2px solid rgba(255,210,63,0.6); color: #FFD23F; font-weight: 800; font-size: 30px;
  letter-spacing: 0.08em; text-transform: uppercase; }
.chip svg { width: 34px; height: 34px; stroke-width: 2.4; }
.head { margin-top: 40px; font-family: 'Anton', 'Inter Display', sans-serif; text-transform: uppercase; }
.top { font-size: 128px; line-height: 1.02; color: #fff; }
.big { display: flex; align-items: center; gap: 26px; font-size: 250px; line-height: 0.98; color: #FFD23F; }
.big svg { width: 160px; height: 160px; stroke-width: 2.1; flex: none; }
.bottom { font-size: 128px; line-height: 1.02; color: #FFD23F; }
.sub { margin-top: 28px; font-size: 42px; font-weight: 600; color: rgba(255,255,255,0.94); }
.towns { margin-top: 12px; font-size: 34px; font-weight: 500; color: #C3E6CD; }
.spacer { flex: 1; }
.cta { display: flex; align-items: center; justify-content: space-between; background: #FFD23F;
  color: #0f2619; border-radius: 28px; padding: 28px 40px; font-weight: 900; font-size: 48px;
  letter-spacing: 0.03em; text-transform: uppercase; box-shadow: 0 18px 40px rgba(0,0,0,0.35); }
.cta .l { display: flex; align-items: center; gap: 22px; }
.cta svg { width: 56px; height: 56px; stroke-width: 2.6; }
.foot { margin-top: 20px; font-size: 26px; color: rgba(255,255,255,0.74); text-align: center; }
</style></head><body>
${icon('tree', 'water')}
<div class="wrap">
  <div class="chip">${icon('pin')}${SHARED.area}</div>
  <div class="head">
    <div class="top">${v.top}</div>
    <div class="big">${v.big}${icon(v.bigIcon)}</div>
    <div class="bottom">${v.bottom}</div>
  </div>
  <div class="sub">${v.sub}</div>
  <div class="towns">${SHARED.towns}</div>
  <div class="spacer"></div>
  <div class="cta"><span class="l">${icon('message')}${SHARED.cta}</span>${icon('arrow')}</div>
  <div class="foot">${SHARED.foot}</div>
</div></body></html>`;

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1080, height: 1080 }, deviceScaleFactor: 2 });
  for (const v of VARIANTS) {
    const html = path.join(HERE, `.render-${v.file}.html`);
    fs.writeFileSync(html, page(v));
    const p = await ctx.newPage();
    await p.goto('file://' + html);
    await p.evaluate(() => document.fonts.ready);
    // Fail loudly if any text spills off the image.
    const overflow = await p.evaluate(() =>
      [...document.querySelectorAll('.wrap *')].some((el) => el.getBoundingClientRect().right > 1080 - 60 || el.getBoundingClientRect().bottom > 1080));
    if (overflow) throw new Error(`Text runs off the image in ${v.file}`);
    await p.screenshot({ path: path.join(HERE, v.file), type: 'jpeg', quality: 90 });
    await p.close();
    fs.unlinkSync(html);
    console.log('wrote', v.file);
  }
  await browser.close();
})();
