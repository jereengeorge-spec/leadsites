// POST /api/recording: Twilio calls this when a call recording or voicemail is ready. Emails it as an MP3
// to the partner company and Jereen, with the caller's number.
import { readTwilio, basicAuth, prettyPhone } from "../../lib/twilio.js";
import { sendLeadEmail, bufToBase64 } from "../../lib/email.js";

export async function onRequestPost({ request, env }) {
  const p = await readTwilio(request, env);
  if (!p) return new Response("Forbidden", { status: 403 });
  if (p.RecordingStatus && p.RecordingStatus !== "completed") return new Response(null, { status: 204 });
  const kind = new URL(request.url).searchParams.get("kind") === "voicemail" ? "Voicemail" : "Call recording";
  const brand = env.BRAND || "our service";

  let from = "unknown number";
  try {
    const r = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Calls/${encodeURIComponent(p.CallSid)}.json`, { headers: { Authorization: basicAuth(env) } });
    if (r.ok) from = prettyPhone((await r.json()).from);
  } catch (e) { console.error("call lookup failed", e); }

  const attachments = [];
  try {
    const r = await fetch(`${p.RecordingUrl}.mp3`, { headers: { Authorization: basicAuth(env) } });
    const buf = r.ok ? await r.arrayBuffer() : null;
    if (buf && buf.byteLength <= 8 * 1024 * 1024) attachments.push({ filename: `${kind === "Voicemail" ? "voicemail" : "call"}-${p.RecordingSid}.mp3`, content: bufToBase64(buf) });
  } catch (e) { console.error("recording download failed", e); }

  const secs = Number(p.RecordingDuration || 0);
  await sendLeadEmail(env, {
    subject: `${kind} from ${from} (${secs} sec)`,
    text: `${kind} from ${from} to ${brand}, ${secs} seconds.\n${attachments.length ? "The recording is attached." : "The recording could not be attached; open it in the Twilio console under Monitor, Call logs."}`,
    attachments,
  });
  return new Response(null, { status: 204 });
}
