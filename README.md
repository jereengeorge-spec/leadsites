# Lead sites

Jereen's "website landlord" business (idea from The Koerner Office, episode #296). Each site is one plain web page
for one trade in one city, for example **tree removal in Macon, GA**. Customers book a free quote or call the site's
number. Bookings and calls go to one local company that pays a flat monthly rent for them. We never do the work.

## What a site does
- **Booking form:** name, phone, address, what they need, how soon, best day and time, photos. Each booking is
  emailed the moment it is sent to the partner company and to Jereen, photos attached.
- **Phone line (Twilio):** the call rings the partner company, which first hears "New customer call from <brand>".
  Both sides are recorded and the recording is emailed. Missed calls get a missed-call email plus a voicemail.
  With no partner yet, every call goes to voicemail and Jereen gets an email (proof of demand for the sales call).
- **Honest by design:** every page says it is a free referral service. We never claim licenses or insurance, and
  we never create fake Google business listings.

## Files
- `sites/<slug>.json`: everything about one site (brand, trade, city, nearby towns, services, FAQ, phone, domain).
  A new city or trade is a new file.
- `build.mjs`: makes the web pages: `node build.mjs macon-tree` writes `dist/macon-tree/`.
- `functions/api/book.js`, `voice.js`, `recording.js`: the form and phone handlers (Cloudflare Pages Functions).
- `lib/`: Twilio signature check and email sending. `test/`: `npm test`.

## Putting a site online (one-time, about $15 to start)
1. **Cloudflare (free):** Workers & Pages, Create, Pages, Connect to Git, pick `leadsites`.
   Build command `node build.mjs macon-tree`, output folder `dist/macon-tree`. One Pages project per site.
2. **Web address (about $11 a year):** buy it in Cloudflare, Domain Registration. Then add it to the Pages project
   (Custom domains) and put it in the site's JSON as `"domain"`.
3. **Email (Resend, free up to 3,000 a month):** add the domain in Resend, then in the Pages project's
   Settings, Variables, add the secret `RESEND_API_KEY` plus `LEAD_EMAIL_FROM` and `LEAD_EMAIL_TO`.
4. **Phone (Twilio, about $1.15 a month plus about 2 to 3 cents a minute):** buy a local number in the city's
   area code. Set its Voice webhook to `https://<domain>/api/voice` (HTTP POST). Add the variables
   `TWILIO_ACCOUNT_SID` and the secret `TWILIO_AUTH_TOKEN`, then put the number in the site's JSON as `"phone"`.
5. **When a partner company says yes:** add `CONTRACTOR_PHONE` (like `+14785550142`) and add their email to
   `LEAD_EMAIL_TO`. Remove both to stop sending them calls.

| Variable | What it is |
|---|---|
| `BRAND` | The site name callers hear, e.g. `Macon Tree Removal` |
| `RESEND_API_KEY` (secret) | From resend.com, API Keys |
| `LEAD_EMAIL_FROM` | e.g. `Macon Tree Removal <leads@your-domain.com>` |
| `LEAD_EMAIL_TO` | Comma list: partner company's email, then Jereen's |
| `TWILIO_ACCOUNT_SID` | From the Twilio console home page |
| `TWILIO_AUTH_TOKEN` (secret) | From the Twilio console; also proves calls really come from Twilio |
| `CONTRACTOR_PHONE` | The partner's phone, `+1` and 10 digits. Empty = voicemail only |
