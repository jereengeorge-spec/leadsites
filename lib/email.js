// Sends lead emails through Resend (https://resend.com). Settings come from the Pages project's environment:
// RESEND_API_KEY, LEAD_EMAIL_FROM (e.g. "Macon Tree Removal <leads@macontreeremoval.com>"),
// LEAD_EMAIL_TO (comma-separated: the partner company's email, then Jereen's).

export function bufToBase64(buf) {
  const b = new Uint8Array(buf);
  let s = "";
  for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode(...b.subarray(i, i + 0x8000));
  return btoa(s);
}

export async function sendLeadEmail(env, { subject, text, attachments = [] }) {
  const to = String(env.LEAD_EMAIL_TO || "").split(",").map((x) => x.trim()).filter(Boolean);
  if (!env.RESEND_API_KEY || !env.LEAD_EMAIL_FROM || !to.length) throw new Error("Email is not set up (RESEND_API_KEY, LEAD_EMAIL_FROM, LEAD_EMAIL_TO)");
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: env.LEAD_EMAIL_FROM, to, subject, text, attachments }),
  });
  if (!res.ok) throw new Error(`Resend said ${res.status}: ${(await res.text()).slice(0, 300)}`);
}
