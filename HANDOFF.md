# Lead sites: handoff

Read only this file at the start. Open README.md only when a task needs file or setup details.
Do not load any other repository. Work on a branch, open a draft pull request, Jereen merges.

## Working with Jereen
- Reads on a phone, dictates by voice (expect transcription slips). Short plain sentences, answer first.
- End every reply with a "Links" section, one full link per line. Say "you" or "Jereen", never guess pronouns.
- Ask before spending money, changing Cloudflare, Twilio or Resend settings, buying a domain, merging,
  or contacting any business.

## The project
"Website landlord" model (Koerner Office #296). One plain site per trade per city, ranks on Google, calls and
bookings go to one local partner who pays a rent. Jereen does not do the work. First target: tree removal in
Macon, GA (chosen by Claude, not confirmed). Rules are in CLAUDE.md.

## Status (2026-11-22)
- Built and tested (12 tests): site pages, booking form, phone-line code, recording emails. Nothing deployed.
- Not done: no Cloudflare project, domain, Resend or Twilio. Phone and domain blank in `sites/macon-tree.json`.
- Not done: partner agreement, Georgia call-recording check, name check for "Macon Tree Removal",
  12-month deletion promised on the privacy page (nothing deletes yet), repo is still public.

## Decisions (Jereen, 2026-11-22)
- Prove demand first, spend later.
- Domain and Twilio line: on hold until demand shows. Cost now: $0.
- $300 Google Ads test: only if partner calls go well. Ask again before starting any ad.
- Pay model: flat monthly or per booked job. Open, settle with the first partner.
- Note: Resend only sends from a verified domain, so the form cannot email leads until a domain is bought.

## Next steps
1. Free keyword check: search demand for tree removal in Macon and nearby towns. Claude reports back.
2. Partner calls this week: Jereen calls Macon tree companies, offers a free week of calls. Claude drafts the script.
3. Review. If weak, change city or trade.
4. If good: Jereen approves the $300 test, then buy domain, set up Resend and Twilio, go live (steps in README).
5. Test a call with `CONTRACTOR_PHONE` set to Jereen's phone, then switch to the partner.

## Open questions
Nearby towns, business name and registration, any Macon tree companies Jereen knows, call recording on or off
(Georgia rules), keep or drop the 12-month deletion promise, make the repo private.

## Links
- Repository: https://github.com/jereengeorge-spec/leadsites
