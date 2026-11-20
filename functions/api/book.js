// POST /api/book: the booking form. Emails the booking (with photos) to the partner company and Jereen,
// then sends the customer to /thanks/ (or /oops/ when something is missing or the email fails).
import { sendLeadEmail, bufToBase64 } from "../../lib/email.js";

const MAX_PHOTOS = 3, MAX_PHOTO = 5 * 1024 * 1024, MAX_TOTAL = 12 * 1024 * 1024;
const field = (f, k, max = 200) => String(f.get(k) ?? "").replace(/\s+/g, " ").trim().slice(0, max);
const go = (request, path) => Response.redirect(new URL(path, request.url).toString(), 303);

export async function onRequestPost({ request, env }) {
  let f;
  try { f = await request.formData(); } catch { return go(request, "/oops/"); }
  if (field(f, "website")) return go(request, "/thanks/"); // a bot filled the hidden box: pretend it worked

  const lead = {
    name: field(f, "name", 80), phone: field(f, "phone", 20), address: field(f, "address", 120), zip: field(f, "zip", 5),
    service: field(f, "service", 80), size: field(f, "size", 60), urgency: field(f, "urgency", 40),
    day: field(f, "day", 10), time: field(f, "time", 40), details: String(f.get("details") ?? "").trim().slice(0, 1500),
  };
  const digits = lead.phone.replace(/\D/g, "").replace(/^1(?=\d{10}$)/, "");
  if (!lead.name || digits.length !== 10 || !lead.address || !/^\d{5}$/.test(lead.zip)) return go(request, "/oops/");

  const attachments = [];
  let total = 0;
  for (const p of f.getAll("photos")) {
    if (attachments.length >= MAX_PHOTOS || typeof p === "string" || !p.size || !String(p.type).startsWith("image/") || p.size > MAX_PHOTO || total + p.size > MAX_TOTAL) continue;
    total += p.size;
    attachments.push({ filename: (p.name || `photo-${attachments.length + 1}.jpg`).replace(/[^\w.\-]/g, "_").slice(-60), content: bufToBase64(await p.arrayBuffer()) });
  }

  const brand = env.BRAND || field(f, "site", 40) || "Lead site";
  const phone = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  const text = [
    `New booking from ${brand}`,
    "",
    `Name: ${lead.name}`,
    `Phone: ${phone}`,
    `Address: ${lead.address}, ${lead.zip}`,
    `Needs: ${lead.service || "not chosen"}${lead.size ? ` (${lead.size})` : ""}`,
    `How soon: ${lead.urgency || "not chosen"}`,
    `Best visit: ${lead.day || "any day"}, ${lead.time || "any time"}`,
    `Details: ${lead.details || "none"}`,
    `Photos: ${attachments.length}`,
    "",
    "Please call the customer as soon as you can; they were told to expect a call, usually within a few hours.",
  ].join("\n");

  try {
    await sendLeadEmail(env, { subject: `New booking: ${lead.service || "request"}, ${lead.name}, ${lead.zip} (${lead.urgency || "no rush given"})`, text, attachments });
  } catch (e) {
    console.error("booking email failed", e);
    return go(request, "/oops/");
  }
  return go(request, "/thanks/");
}

export const onRequestGet = ({ request }) => Response.redirect(new URL("/#book", request.url).toString(), 302);
