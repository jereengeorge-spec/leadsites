import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { validTwilioSignature } from "../lib/twilio.js";
import { onRequestPost as book } from "../functions/api/book.js";
import { onRequestPost as voice } from "../functions/api/voice.js";
import { onRequestPost as recording } from "../functions/api/recording.js";

const TOKEN = "secret-token";
const env = { TWILIO_AUTH_TOKEN: TOKEN, TWILIO_ACCOUNT_SID: "AC1", RESEND_API_KEY: "re_x", LEAD_EMAIL_FROM: "Leads <l@example.com>", LEAD_EMAIL_TO: "pro@example.com, jereen@example.com", BRAND: "Macon Tree Removal" };
let sent;
beforeEach(() => {
  sent = [];
  globalThis.fetch = async (url, init = {}) => {
    if (String(url).startsWith("https://api.resend.com")) { sent.push(JSON.parse(init.body)); return new Response("{}", { status: 200 }); }
    if (String(url).includes("/Calls/")) return Response.json({ from: "+14785550100" });
    if (String(url).endsWith(".mp3")) return new Response(new Uint8Array([1, 2, 3]));
    throw new Error("unexpected fetch " + url);
  };
});

async function sign(url, params, token = TOKEN) {
  const data = url + Object.keys(params).sort().map((k) => k + params[k]).join("");
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(token), { name: "HMAC", hash: "SHA-1" }, false, ["sign"]);
  return btoa(String.fromCharCode(...new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data)))));
}
async function twilioReq(url, params, token) {
  return new Request(url, { method: "POST", body: new URLSearchParams(params), headers: { "X-Twilio-Signature": await sign(url, params, token) } });
}
const ctx = (request, e = env) => { const waits = []; return { request, env: e, waits, waitUntil(p) { waits.push(p); } }; };

test("signature matches an independent (Python) computation of Twilio's algorithm", async () => {
  const params = { CallSid: "CA123", From: "+14785550100", To: "+14785550199", AccountSid: "AC1" };
  assert.equal(await validTwilioSignature(TOKEN, "https://example.com/api/voice?step=start", params, "QU2tORwgGjq9oz18CTeBbLA1j+s="), true);
  assert.equal(await validTwilioSignature(TOKEN, "https://example.com/api/voice?step=start", { ...params, From: "+1999" }, "QU2tORwgGjq9oz18CTeBbLA1j+s="), false);
  assert.equal(await validTwilioSignature("", "https://x", {}, "abc"), false);
});

test("voice: rejects requests that are not signed by Twilio", async () => {
  const req = await twilioReq("https://example.com/api/voice", { From: "+14785550100" }, "wrong-token");
  assert.equal((await voice(ctx(req))).status, 403);
});

test("voice: with a partner, rings them with a whisper and records", async () => {
  const req = await twilioReq("https://example.com/api/voice", { From: "+14785550100", CallSid: "CA1" });
  const body = await (await voice(ctx(req, { ...env, CONTRACTOR_PHONE: "+14785550142" }))).text();
  assert.match(body, /<Dial [^>]*record="record-from-answer-dual"/);
  assert.match(body, /<Number url="\/api\/voice\?step=whisper">\+14785550142<\/Number>/);
  assert.match(body, /may be recorded/);
});

test("voice: with no partner yet, emails Jereen and takes a voicemail", async () => {
  const req = await twilioReq("https://example.com/api/voice", { From: "+14785550100", CallSid: "CA1" });
  const c = ctx(req);
  const body = await (await voice(c)).text();
  await Promise.all(c.waits);
  assert.match(body, /<Record /);
  assert.equal(sent.length, 1);
  assert.match(sent[0].subject, /New call from \(478\) 555-0100/);
});

test("voice: a missed partner call becomes an email plus voicemail; an answered one hangs up", async () => {
  const e = { ...env, CONTRACTOR_PHONE: "+14785550142" };
  const missed = ctx(await twilioReq("https://example.com/api/voice?step=dialdone", { From: "+14785550100", DialCallStatus: "no-answer" }), e);
  assert.match(await (await voice(missed)).text(), /<Record /);
  await Promise.all(missed.waits);
  assert.match(sent[0].subject, /Missed call/);
  const done = ctx(await twilioReq("https://example.com/api/voice?step=dialdone", { From: "+14785550100", DialCallStatus: "completed" }), e);
  assert.match(await (await voice(done)).text(), /<Hangup\/>/);
});

test("recording: emails the MP3 with the caller's number", async () => {
  const req = await twilioReq("https://example.com/api/recording?kind=voicemail", { RecordingStatus: "completed", RecordingUrl: "https://api.twilio.com/rec/RE1", RecordingSid: "RE1", RecordingDuration: "14", CallSid: "CA1" });
  assert.equal((await recording(ctx(req))).status, 204);
  assert.equal(sent[0].subject, "Voicemail from (478) 555-0100 (14 sec)");
  assert.equal(sent[0].attachments.length, 1);
});

function form(fields, photos = []) {
  const f = new FormData();
  for (const [k, v] of Object.entries(fields)) f.append(k, v);
  for (const p of photos) f.append("photos", p);
  return new Request("https://example.com/api/book", { method: "POST", body: f });
}
const good = { site: "macon-tree", name: "Pat Lee", phone: "478-555-0100", address: "12 Oak St", zip: "31201", service: "Tree removal", urgency: "This week", details: "Big pine near the garage" };

test("book: a complete booking is emailed with photos and goes to /thanks/", async () => {
  const res = await book(ctx(form(good, [new File([new Uint8Array(10)], "pine.jpg", { type: "image/jpeg" }), new File(["x"], "notes.txt", { type: "text/plain" })])));
  assert.equal(res.status, 303);
  assert.equal(res.headers.get("Location"), "https://example.com/thanks/");
  assert.deepEqual(sent[0].to, ["pro@example.com", "jereen@example.com"]);
  assert.match(sent[0].text, /Phone: \(478\) 555-0100/);
  assert.equal(sent[0].attachments.length, 1, "only image files are attached");
});

test("book: missing fields go to /oops/ and send nothing", async () => {
  const res = await book(ctx(form({ ...good, zip: "312" })));
  assert.equal(res.headers.get("Location"), "https://example.com/oops/");
  assert.equal(sent.length, 0);
});

test("book: the hidden bot box is silently dropped", async () => {
  const res = await book(ctx(form({ ...good, website: "spam.example" })));
  assert.equal(res.headers.get("Location"), "https://example.com/thanks/");
  assert.equal(sent.length, 0);
});

test("book: when email is not set up, the customer sees /oops/ instead of a false thank-you", async () => {
  const res = await book(ctx(form(good), { BRAND: "x" }));
  assert.equal(res.headers.get("Location"), "https://example.com/oops/");
});
