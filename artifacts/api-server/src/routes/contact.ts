import { Router, type Request, type Response } from "express";
import { createRateLimit } from "../middlewares/rateLimit";
import { getUncachableResendClient } from "../lib/resend";

const router = Router();

const TO_EMAIL = "admin@moolab.app";
const MAX_NAME = 200;
const MAX_EMAIL = 320;
const MAX_MESSAGE = 5000;

const contactLimiter = createRateLimit({ windowMs: 60_000, max: 5, label: "contact" });

const escapeHtml = (s: string): string =>
  s.replace(/[&<>"']/g, (c) =>
    c === "&" ? "&amp;" : c === "<" ? "&lt;" : c === ">" ? "&gt;" : c === '"' ? "&quot;" : "&#39;",
  );

const isValidEmail = (e: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

router.post("/contact", contactLimiter, async (req: Request, res: Response) => {
  try {
    const { name, email, message, lang } = (req.body || {}) as {
      name?: unknown;
      email?: unknown;
      message?: unknown;
      lang?: unknown;
    };

    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ error: "Name is required" });
    }
    if (typeof email !== "string" || !isValidEmail(email.trim())) {
      return res.status(400).json({ error: "Valid email is required" });
    }
    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }
    if (name.length > MAX_NAME || email.length > MAX_EMAIL || message.length > MAX_MESSAGE) {
      return res.status(400).json({ error: "One or more fields exceed length limits" });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const cleanMessage = message.trim();
    const langLabel = lang === "es" ? "Spanish (LandingPageES)" : "English (LandingPage)";

    const { client, fromEmail } = await getUncachableResendClient();

    const subject = `New Moolab contact form message from ${cleanName}`;
    const text = `New contact form submission

Name:    ${cleanName}
Email:   ${cleanEmail}
Source:  ${langLabel}

Message:
${cleanMessage}
`;
    const html = `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#0c2d48;">
        <h2 style="margin:0 0 16px;color:#145374;">New contact form message</h2>
        <p style="margin:0 0 8px;"><strong>Name:</strong> ${escapeHtml(cleanName)}</p>
        <p style="margin:0 0 8px;"><strong>Email:</strong> <a href="mailto:${escapeHtml(cleanEmail)}">${escapeHtml(cleanEmail)}</a></p>
        <p style="margin:0 0 16px;"><strong>Source:</strong> ${escapeHtml(langLabel)}</p>
        <div style="border-top:1px solid #e0eef5;padding-top:16px;white-space:pre-wrap;line-height:1.5;">${escapeHtml(cleanMessage)}</div>
        <p style="margin-top:24px;font-size:12px;color:#6b7d8a;">Reply directly to this email to respond to ${escapeHtml(cleanName)}.</p>
      </div>
    `;

    const result = await client.emails.send({
      from: fromEmail,
      to: TO_EMAIL,
      replyTo: cleanEmail,
      subject,
      text,
      html,
    });

    if (result.error) {
      req.log?.error({ err: result.error }, "[Contact] Resend rejected email");
      return res.status(502).json({ error: "Could not send message right now. Please try again." });
    }

    return res.json({ ok: true });
  } catch (err: any) {
    req.log?.error({ err }, "[Contact] Send failed");
    const msg = String(err?.message || "");
    if (msg.includes("Resend not connected")) {
      return res.status(503).json({ error: "Email service not configured" });
    }
    return res.status(500).json({ error: "Could not send message right now. Please try again." });
  }
});

export default router;
