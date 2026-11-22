# Lead sites: handoff (lead-site project only)

**Start here.** This file covers only the lead-site project. Read all of it, then CLAUDE.md and README.md.
Do not load any other repository in this chat. Then ask Jereen the open questions at the end before building anything new.

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
It ranks on Google. Its phone number forwards calls to one local partner company, which pays a flat monthly fee.
Jereen does not do the work. The partner does.

First target: **tree removal in Macon, GA** (Macon-Bibb County). Claude chose Macon. Jereen has not confirmed it.

Rules (from CLAUDE.md):
- Every page says it is a free referral service.
- Never claim licenses, insurance or reviews we do not have.
- No fake Google Business Profiles, addresses or reviews. One partner company per site.
- Callers hear that calls may be recorded. The booking form says one local pro may call or text them.

## Timeline (lead-site work only)
- Nov 20: Jereen chose this business. Claude picked tree removal and Macon.
- Nov 21: built the first site, booking form, phone-line code, recording emails and 12 tests. Pushed to main
  (commit `f424b74`). Added this handoff file (merged as `30fa490`).
- Nothing deployed yet. Nothing is live.

## Repository
- Repository: https://github.com/jereengeorge-spec/leadsites (currently public, see open questions)
- Main branch, latest commit: `30fa490` (merge of the handoff pull request)
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
- No price is set. Kyle's $300 to $600 a month is only a reference point.
- Nothing is bought yet. Domain and phone line are on hold by choice (see Decisions).

## Decisions so far
Jereen answered on 2026-11-22. New order: prove demand first, spend later.
- Trade: tree removal (storm and emergency work, higher-value jobs).
- City: Macon, GA. Chosen by Claude. The free keyword check tests it. If search demand is weak, pick another city or trade.
- Step 1 (this week, free): check Google keyword demand for tree removal in Macon, and call tree companies to find a partner. No domain, no phone line, no ads yet.
- Step 2 (only if partner calls go well): a $300 Google Ads test. Jereen approved the amount, but only after step 1 looks good. Claude asks again before any ad is started.
- Domain and Twilio phone line: on hold until demand shows. Do not buy or sign up before then. Cloudflare Pages is free and can stay for previews.
- Pay model: partner pays a flat monthly fee or a fee per booked job. Jereen named both, so it is open. Settle it with the first partner. Flat monthly is the reference point (Kyle).
- Partner: one company per site. None found yet.
- Booking fields: name, mobile, address, ZIP, service, size, how soon, best day and time, details, photos.
- Calls: the partner hears "New customer call from <brand>" first. Both sides are recorded.
- Note: Resend only sends from a verified domain, so the booking form cannot email leads until a domain is bought. That is fine while on hold.

## Costs (estimates, check live prices)
- Now: $0. Cloudflare Pages is free.
- When demand shows: domain about $11 a year. Twilio about $1.15 a month per local number, plus about 2 to 3 cents a minute. Resend free up to 3,000 emails a month (per README).
- Ads test: $300, only after step 1 goes well.

## Open questions for Jereen
Answered: ads test ($300, conditional), pay model (open, decide with partner), domain and phone line (on hold).
Still open:
1. Confirm the nearby towns list (the keyword check may change it).
2. Is "Macon Tree Removal" okay? Is there a business registration? Needed before the domain.
3. Does Jereen know any Macon tree companies? Should we draft a partner agreement?
4. Keep call recording on, or off until the Georgia rules are checked?
5. Privacy: build the 12-month deletion, or change the wording?
6. Make the repository private?
7. Later, with the domain: 2 or 3 domain names to check, and approve the Resend and Twilio sign-ups.

## Next steps, in order
1. Free keyword check: Claude looks up search demand and competition for tree removal in Macon and nearby towns, and reports back. Free tools only, no spending.
2. Partner calls this week: Jereen calls Macon tree companies and offers a free week of calls. Claude drafts the call script and a short pitch.
3. Review: do calls go well (partner interested, demand looks real)? If not, change city or trade.
4. If yes: Jereen approves the $300 ads test. Then buy the domain, sign up for Resend and Twilio, set the Voice webhook, and put the site live on Cloudflare.
5. Test a call: set `CONTRACTOR_PHONE` to Jereen's own phone first. Check the recording email.
6. Switch `CONTRACTOR_PHONE` to the partner, run the ads, and track leads by email.

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
