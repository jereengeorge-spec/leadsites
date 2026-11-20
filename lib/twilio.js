// Twilio helpers for Cloudflare Pages Functions (Web Crypto only, no packages).

/** True when the X-Twilio-Signature header matches: HMAC-SHA1(auth token, full URL + each POST param name+value, sorted by name), base64. */
export async function validTwilioSignature(authToken, url, params, signature) {
  if (!authToken || !signature) return false;
  const data = url + Object.keys(params).sort().map((k) => k + params[k]).join("");
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(authToken), { name: "HMAC", hash: "SHA-1" }, false, ["sign"]);
  const mac = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data)));
  const expected = btoa(String.fromCharCode(...mac));
  if (expected.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  return diff === 0;
}

/** Reads a Twilio webhook (form-encoded POST) and checks its signature. Returns the params, or null when it is not from Twilio. */
export async function readTwilio(request, env) {
  const form = await request.formData();
  const params = {};
  for (const [k, v] of form.entries()) params[k] = String(v);
  const ok = await validTwilioSignature(env.TWILIO_AUTH_TOKEN, request.url, params, request.headers.get("X-Twilio-Signature"));
  return ok ? params : null;
}

export const xml = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[c]);

export const twiml = (inner) =>
  new Response(`<?xml version="1.0" encoding="UTF-8"?><Response>${inner}</Response>`, { headers: { "Content-Type": "text/xml; charset=utf-8" } });

export const basicAuth = (env) => "Basic " + btoa(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`);

/** "+14785550123" -> "(478) 555-0123" */
export function prettyPhone(e164) {
  const d = String(e164 || "").replace(/\D/g, "").replace(/^1(?=\d{10}$)/, "");
  return d.length === 10 ? `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}` : String(e164 || "unknown number");
}
