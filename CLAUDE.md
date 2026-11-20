# Lead sites: read this first

Jereen's local lead-website business ("website landlord"). See README.md for what it does and how it goes online.
Separate from the Clearout app (repo `jereengeorge-spec/clearout`), whose CLAUDE.md has Jereen's full reply rules.

## How Jereen wants replies (short version)
- Reads on a phone, often dictates by voice. Short, plain sentences; lead with the answer; explain technical words.
- End every reply with a "Links" section, one full link per line. Write "you" or "Jereen", never a guessed pronoun.
- Ask before spending money, changing Cloudflare/Twilio/Resend settings or keys, or merging. Work in small sprints.

## Rules for this business
- Every page says it is a free referral service. Never claim licenses, insurance or reviews we don't have.
- No fake Google Business Profiles, no fake addresses, no fake reviews. One partner company per site.
- Callers hear that calls may be recorded. Booking form says one local pro may call or text them.

## Checks
`npm test` (builds every site and tests the form and phone handlers), `node build.mjs <slug>`.
