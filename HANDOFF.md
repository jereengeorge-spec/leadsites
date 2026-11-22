# Lead sites: handoff

**Start here.** If you are a new chat, read this whole file, then CLAUDE.md and README.md.
Then ask Jereen the open questions at the end before building anything new.

## How to continue in a new chat
1. Paste this: "Continue the lead-sites project. Read HANDOFF.md in jereengeorge-spec/leadsites first."
2. If Claude cannot see the repository, ask it to attach `jereengeorge-spec/leadsites` with push access.
3. Work on a branch and open a draft pull request. Jereen merges on GitHub.

## Jereen: how to work with her
- Reads on a phone and often dictates by voice, so expect transcription slips.
- Short plain sentences. Lead with the answer. Explain technical words in a few words.
- End every reply with a "Links" section, one full link per line.
- Write "you" or "Jereen". Do not guess pronouns.
- Ask before spending money, changing Cloudflare, Twilio or Resend settings or keys, buying a domain,
  merging, or contacting any business.

## What the business is
A "website landlord" (The Koerner Office, episode #296, Kyle). Build one plain website per trade per city.
It ranks on Google. Its phone number forwards calls to one local partner company, which pays a flat monthly
fee. Jereen does not do the work.

First target: **tree removal in Macon, GA** (Macon-Bibb County). Claude chose Macon. Jereen has not confirmed it.

Rules for this business (from CLAUDE.md):
- Every page says it is a free referral service.
- Never claim licenses, insurance or reviews we do not have.
- No fake Google Business Profiles, addresses or reviews. One partner company per site.
- Callers hear that calls may be recorded. The booking form says one local pro may call or text them.

## Repository
- Repository: https://github.com/jereengeorge-spec/leadsites (currently public, see open questions)
- Main branch, last commit: `f424b74` "First lead site: tree removal in Macon, GA, with booking form and phone line"
- Tests: `npm test` runs 12 tests, all passing on 2026-11-21 (Node 20 or newer)
- Build: `node build.mjs macon-tree` writes `dist/macon-tree/`

### Files
| File | What it does |
|---|---|
| `sites/macon-tree.json` | Everything about the Macon site: brand, trade, city, towns, services, FAQ, phone, domain. Phone and domain are still blank. |
| `build.mjs` | Builds the pages into `dist/<slug>/`: home, thank-you, not-sent, privacy, robots.txt, favicon, _headers. Adds sitemap only when a domain is set. |
| `functions/api/book.js` | POST `/api/book`: the booking form. Emails the partner and Jereen, with up to 3 photos. Hidden spam field. Redirects to `/thanks/` or `/oops/`. |
| `functions/api/voice.js` | POST `/api/voice`: Twilio voice webhook. Rings the partner with a "New customer call" message, records both sides. Missed call: email plus voicemail. No partner set: voicemail plus email. |
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

## Status (2026-11-21)
**Built:** site pages, booking form, phone-line code, recording emails, missed-call and voicemail emails, tests, README, CLAUDE.md.

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

## Decisions so far
- Trade: tree removal (storm and emergency work, high-value jobs).
- City: Macon, GA. Chosen by Claude, not confirmed.
- Pay model: flat monthly fee, following Kyle. Not confirmed.
- Partner: one company per site. None found yet.
- Booking fields: name, mobile, address, ZIP, service, size, how soon, best day and time, details, photos.
- Calls: the partner hears "New customer call from <brand>" first. Both sides are recorded.

## Costs (estimates, check the live prices)
- Cloudflare Pages: free. Domain: about $11 a year.
- Resend: free up to 3,000 emails a month (per README).
- Twilio: about $1.15 a month per local number, plus about 2 to 3 cents a minute.

## Open questions for Jereen (none answered yet)
1. Confirm Macon and the nearby towns.
2. Approve a $100 to $200 Google Ads test? It is the fastest route to calls.
3. Give 2 or 3 domain names to check.
4. Is "Macon Tree Removal" okay? Is there a business registration?
5. Does Jereen know any Macon tree companies? Should we draft a partner agreement?
6. How should the partner pay: flat monthly, or per booking?
7. Keep call recording on, or off until the Georgia rules are checked?
8. Privacy: build the 12-month deletion, or change the wording?
9. Make the repository private?
10. Approve the sign-ups (Cloudflare, Resend, Twilio) and about $15 to start?

## Next steps, in order
1. Jereen signs up for Cloudflare, creates the Pages project and shares the preview link.
2. Jereen answers the open questions.
3. Jereen signs up for Resend and Twilio. Claude guides the variable setup. Test one booking end to end.
4. Buy the domain, verify it in Resend, set the number's Voice webhook.
5. Test a call: set `CONTRACTOR_PHONE` to Jereen's own phone as a stand-in partner. Check the recording email.
6. Find the first partner: Jereen calls tree companies and offers a free week of calls.
7. Decide on the ads test.

## Standing rules for this repository
- Work on a branch, open a draft pull request, and let Jereen merge.
- No model names in commits or pull requests.
- No spending, domain purchase or service-setting changes without Jereen's OK.
- Never invent prices, reviews, licenses, towns or partner names.

## Related work (the Clearout app, repo `jereengeorge-spec/clearout`)
- Separate project. Do not mix its code with this repository.
- Live app: https://clearout-eta.vercel.app
- December money plan: `docs/DECEMBER-PLAN.md`. Pull request #15 is merged. Prices were approved and set on Nov 20. Price drops happen every 7 days.
- Post checklist: pull request #13. Conflicts are resolved and the preview is ready. It is still a draft.
- Night helper: a nightly task at 3:41 AM New York time. It writes listing text and questions in the app. It never posts or buys.
- Flip-check: a buy-or-pass checklist for eBay listings. Its instructions were sent to Jereen as a file and are not stored in any repository.

## Links
- Live app: https://clearout-eta.vercel.app
- Lead sites repository: https://github.com/jereengeorge-spec/leadsites
- Cloudflare sign-up: https://dash.cloudflare.com/sign-up
- Resend sign-up: https://resend.com/signup
- Twilio sign-up: https://www.twilio.com/try-twilio
