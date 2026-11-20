// POST /api/voice: Twilio calls this when someone dials the site's number (set it as the number's Voice webhook).
// With a partner (CONTRACTOR_PHONE set): the call rings the partner, who first hears "New customer call from <brand>";
// both sides are recorded. Missed calls, and every call while there is no partner yet, go to voicemail.
// Each call also sends an email right away, so no caller is lost even if they leave no message.
import { readTwilio, twiml, xml, prettyPhone } from "../../lib/twilio.js";
import { sendLeadEmail } from "../../lib/email.js";

const voicemail = () =>
  `<Say>Sorry, no one can pick up right now. After the beep, please say your name, your address, and what you need. A local pro will call you back.</Say>` +
  `<Record maxLength="120" playBeep="true" timeout="5" action="/api/voice?step=vmdone" recordingStatusCallback="/api/recording?kind=voicemail" recordingStatusCallbackEvent="completed"/>`;

const alert = (env, waitUntil, subject, text) => waitUntil(sendLeadEmail(env, { subject, text }).catch((e) => console.error("call email failed", e)));

export async function onRequestPost(context) {
  const { request, env } = context;
  const waitUntil = (pr) => context.waitUntil(pr); // keep the binding: an unbound waitUntil throws in Workers
  const p = await readTwilio(request, env);
  if (!p) return new Response("Forbidden", { status: 403 });
  const step = new URL(request.url).searchParams.get("step") || "start";
  const brand = env.BRAND || "our service";
  const caller = prettyPhone(p.From);

  if (step === "whisper") return twiml(`<Say>New customer call from ${xml(brand)}.</Say>`);
  if (step === "vmdone") return twiml(`<Say>Thank you. Goodbye.</Say><Hangup/>`);
  if (step === "dialdone") {
    if (p.DialCallStatus === "completed") return twiml(`<Hangup/>`);
    alert(env, waitUntil, `Missed call from ${caller}`, `${caller} called ${brand} and the call was not answered (${p.DialCallStatus || "no answer"}).\nPlease call them back. If they leave a voicemail, it follows in a separate email.`);
    return twiml(voicemail());
  }

  // start
  if (!env.CONTRACTOR_PHONE) {
    alert(env, waitUntil, `New call from ${caller} (no partner yet)`, `${caller} called ${brand}. No partner company is set up yet, so the caller was sent to voicemail.`);
    return twiml(voicemail());
  }
  return twiml(
    `<Say>Thanks for calling ${xml(brand)}. This call may be recorded. Connecting you to a local pro now.</Say>` +
    `<Dial answerOnBridge="true" timeout="20" record="record-from-answer-dual" recordingStatusCallback="/api/recording?kind=call" recordingStatusCallbackEvent="completed" action="/api/voice?step=dialdone">` +
    `<Number url="/api/voice?step=whisper">${xml(env.CONTRACTOR_PHONE)}</Number></Dial>`,
  );
}
