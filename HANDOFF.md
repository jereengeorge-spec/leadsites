# Lead sites: handoff (lead-site project only)

**Start here.** This file covers only the lead-site project. Read all of it, then CLAUDE.md and README.md.
Do not load any other repository in this chat. Then check "Still open for Jereen" before building anything new.

## How to start a new chat
1. Attach only `jereengeorge-spec/leadsites`.
2. Paste this: "Continue the lead-sites project. Read HANDOFF.md first."
3. Work on a branch and open a draft pull request. Jereen merges on GitHub.

## Jereen: how to work with her
- Reads on a phone and often dictates by voice, so expect transcription slips.
- Short plain sentences. Lead with the answer. Explain technical words in a few words.
- End every reply with a "Links" section, one full link per line.
- Write "you" or "Jereen". Do not guess pronouns.
- Ask before spending money, changing Cloudflare, Twilio or Resend settings or keys, buying a domain,
  merging, or contacting any business.

## What the project is
A "website landlord" model (The Koerner Office, episode #296, Kyle). Build one plain website per trade per city.
It ranks on Google. Its phone number forwards calls to one local partner company, which pays either a flat monthly fee or a fee per booked job (not chosen yet).
Jereen does not do the work. The partner does.

First target: **tree removal in Cobb County, GA**. Jereen chose Cobb on 2026-11-22 (she works there). Macon was dropped.
Towns chosen by Jereen: **Marietta, Smyrna, Kennesaw, Acworth**. The site file (`sites/macon-tree.json`) still says Macon and must be rebuilt before any use.

Rules (from CLAUDE.md):
- Every page says it is a free referral service.
- Never claim licenses, insurance or reviews we do not have.
- No fake Google Business Profiles, addresses or reviews. One partner company per site.
- Callers hear that calls may be recorded. The booking form says one local pro may call or text them.

## Timeline (lead-site work only)
- Nov 20: Jereen chose this business. Claude picked tree removal and Macon.
- Nov 21: built the first site, booking form, phone-line code, recording emails and 12 tests. Pushed to main
  (commit `f424b74`). Added this handoff file (merged as `30fa490`).
- Nov 22: Jereen set the plan order (see "Plan (set 2026-11-22)"). Demand first, domain and phone line later.
- Nothing deployed yet. Nothing is live.

## Repository
- Repository: https://github.com/jereengeorge-spec/leadsites (currently public, see open questions)
- Main branch, latest commit: `30fa490` (merge of the handoff pull request); handoff update on branch `ccr-baf9ad1b-ldmi82`
- Tests: `npm test` runs 12 tests, all passing on 2026-11-22 (Node 20 or newer)
- Build: `node build.mjs macon-tree` writes `dist/macon-tree/`

### Files
| File | What it does |
|---|---|
| `sites/macon-tree.json` | Everything about the Macon site: brand, trade, city, towns, services, FAQ, phone, domain. Phone and domain are still blank. |
| `build.mjs` | Builds pages into `dist/<slug>/`: home, thank-you, not-sent, privacy, robots.txt, favicon, _headers. Adds a sitemap only when a domain is set. |
| `functions/api/book.js` | POST `/api/book`: booking form. Emails the partner and Jereen, with up to 3 photos. Hidden spam field. Redirects to `/thanks/` or `/oops/`. |
| `functions/api/voice.js` | POST `/api/voice`: Twilio voice webhook. Rings the partner with "New customer call", records both sides. Missed call: email plus voicemail. No partner set: voicemail plus email. |
| `functions/api/recording.js` | POST `/api/recording`: Twilio says a recording is ready. Emails the MP3 with the caller's number. |
| `lib/twilio.js` | Checks Twilio signatures (HMAC-SHA1), builds TwiML, formats phone numbers. |
| `lib/email.js` | Sends email through Resend. |
| `test/*.test.mjs` | 12 tests: page builds, signature check, voice paths, recordings, booking paths. They use fake Twilio, Resend and phone-lookup services. |
| `README.md` | Go-live steps for Cloudflare, domain, Resend and Twilio. |
| `CLAUDE.md` | Rules for working in this repository. |

### Environment variables (Cloudflare Pages, Settings, Variables)
| Name | Type | Notes |
|---|---|---|
| `BRAND` | variable | Name callers hear, e.g. "Macon Tree Removal" |
| `RESEND_API_KEY` | secret | From resend.com |
| `LEAD_EMAIL_FROM` | variable | e.g. `Macon Tree Removal <leads@your-domain.com>`. The domain must be verified in Resend. |
| `LEAD_EMAIL_TO` | variable | Comma list: the partner's email, then Jereen's |
| `TWILIO_ACCOUNT_SID` | variable | From the Twilio console home page |
| `TWILIO_AUTH_TOKEN` | secret | From Twilio. Also used to check that calls really come from Twilio. |
| `CONTRACTOR_PHONE` | variable | Partner's phone, `+1` and 10 digits. Leave empty for voicemail only. |

Twilio: set the number's Voice webhook to `https://<domain>/api/voice` (HTTP POST).

### Cloudflare Pages settings
- Build command: `node build.mjs macon-tree`
- Output directory: `dist/macon-tree`
- The `functions/` folder sits at the repository root.
- If the build fails on the Node version, add a variable `NODE_VERSION` set to `22`.

## Plan (revised 2026-11-22, in this order)
1. **Facebook Marketplace test first (A/B test).** Test whether Cobb homeowners respond to tree removal listings.
   Jereen chooses the test. Not yet designed. Any spend needs Jereen's OK.
   Budget: free listings only. No paid boost without Jereen's approval of the exact amount.
   Jereen chose all three to learn, one at a time: week 1 offers, week 2 prices (best offer), week 3 cities (best offer).
2. **Traction decides the next step.** Traction = 10 or more serious messages, OR 5 booked estimates (either one). Jereen set this on 2026-11-22.
3. **Then build the site and set up the phone line.** Domain (about $11 a year) and phone line (about $1.15 a month) only after traction.
4. **Then call potential buyers (partner companies)** with proof from the test and the site.
5. **Ads test later.** The $300 test comes only after the above.

Keyword count: dropped. Ask Maps and the list were too big to count. It was not needed.

## Status (2026-11-22)
**Built:** site pages, booking form, phone-line code, recording emails, missed-call and voicemail emails, tests, README, CLAUDE.md, this handoff.

**Not done:**
- Not deployed anywhere: no Cloudflare project, no domain, no Resend, no Twilio account.
- Phone number and domain are blank in `sites/macon-tree.json`.
- Never run against real Cloudflare, Twilio or Resend. The tests use fakes.
- The privacy page promises bookings and recordings are deleted after 12 months. Nothing deletes them yet.
- Georgia call-recording rules are not checked.
- No partner agreement is written.
- The nearby-towns list is Claude's choice. Jereen has not confirmed it.
- The name "Macon Tree Removal" is not checked against existing businesses.
- No lead dashboard or analytics. Leads arrive by email only.
- The repository is public.
- No price is set. Pay model open: flat monthly or per booked job.

## Decisions so far
- Trade: tree removal (storm and emergency work, higher-value jobs).
- City: Macon, GA. Chosen by Claude, not confirmed.
- Pay model: flat monthly or per booked job. Both open. Decide with the first partner. Kyle's $300 to $600 a month is only a reference.
- Order: keyword check and partner calls, then the $300 ads test if calls go well. Domain and phone line wait for demand.
- Partner: one company per site. None found yet.
- Booking fields: name, mobile, address, ZIP, service, size, how soon, best day and time, details, photos.
- Calls: the partner hears "New customer call from <brand>" first. Both sides are recorded.

## Costs (estimates, check live prices)
- Cloudflare Pages: free. Domain: about $11 a year.
- Resend: free up to 3,000 emails a month (per README).
- Twilio: about $1.15 a month per local number, plus about 2 to 3 cents a minute.

## Questions: answered 2026-11-22
- City: Cobb County, GA (not Macon). Towns: Marietta, Smyrna, Kennesaw, Acworth.
- Business name: **Cobb Tree Service** (chosen 2026-11-22). Not yet checked against existing businesses.
- Research: free check first. Count tree companies per Cobb city on Google Maps. No paid scraper until Jereen approves the price.
- Ads test: yes, $300, only if the partner calls go well.
- Pay model: flat monthly or per booked job, decide with the partner.
- Domain and phone line: hold until demand shows. This replaces "approve sign-ups and about $15".
- Plan order: as above.

## Still open for Jereen
1. Rebuild the site for Cobb County (site file, brand name, towns). Waits for Jereen's OK.
2. Is "Macon Tree Removal" okay? Is there a business registration? (Only matters once a domain is bought.)
3. Does Jereen know any Macon tree companies? Should we draft a one-page partner agreement for the free week?
4. Keep call recording on, or off until the Georgia rules are checked? (Matters when the phone line is set up.)
5. Privacy: build the 12-month deletion, or change the wording?
6. Make the repository private?

## Next steps, in order
1. Claude: write a short keyword check guide for Jereen (free Google Keyword Planner steps) and a phone script
   for calling tree companies with a free-week offer. Jereen runs both this week.
2. Jereen: free Cloudflare sign-up and Pages project, so partners can see a preview link. No cost.
3. Jereen: call tree companies. Note who says yes and what they would pay.
4. If calls go well: Jereen approves the $300 ads test. Claude plans it first, then Jereen OKs the spend.
5. Only after demand shows: buy the domain, sign up for Resend and Twilio, set the Voice webhook, and test one booking and one call
   (use Jereen's own phone as a stand-in partner via `CONTRACTOR_PHONE`).
6. Before real calls: check Georgia recording rules and settle the privacy wording.

## Standing rules for this repository
- Work on a branch, open a draft pull request, and let Jereen merge.
- No model names in commits or pull requests.
- No spending, domain purchase or service-setting changes without Jereen's OK.
- Never invent prices, reviews, licenses, towns or partner names.

## Links
- Lead sites repository: https://github.com/jereengeorge-spec/leadsites
- Cloudflare sign-up: https://dash.cloudflare.com/sign-up
- Resend sign-up: https://resend.com/signup
- Twilio sign-up: https://www.twilio.com/try-twilio
