/**
 * RL FinTax — Contact Form Backend
 * ─────────────────────────────────
 * Stack : Node.js + Express + Nodemailer (Gmail SMTP)
 * Sends : Branded HTML lead email to fintaxnow24@gmail.com
 *         + Auto-reply thank-you email to the client
 * Guard : Rate limiting, input validation, CORS, honeypot
 */

require("dotenv").config();

const express      = require("express");
const nodemailer   = require("nodemailer");
const cors         = require("cors");
const rateLimit    = require("express-rate-limit");
const validator    = require("validator");

const app  = express();
const PORT = process.env.PORT || 3000;

/* ═══════════════════════════════════════════
   MIDDLEWARE
═══════════════════════════════════════════ */

// Parse JSON & URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS — only allow your website domain
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || "*",
  methods: ["POST", "GET"],
  allowedHeaders: ["Content-Type"],
}));

// Rate limiting — max 5 form submissions per IP per 15 minutes
const limiter = rateLimit({
  windowMs : 15 * 60 * 1000,
  max      : 5,
  message  : {
    success : false,
    message : "Too many requests. Please wait 15 minutes and try again.",
  },
  standardHeaders : true,
  legacyHeaders   : false,
});

/* ═══════════════════════════════════════════
   NODEMAILER — GMAIL TRANSPORTER
═══════════════════════════════════════════ */
const transporter = nodemailer.createTransport({
  service : "gmail",
  auth    : {
    user : process.env.GMAIL_USER,
    pass : process.env.GMAIL_APP_PASSWORD,   // Gmail App Password (16 chars)
  },
});

// Verify transporter connection on startup
transporter.verify((error) => {
  if (error) {
    console.error("❌ Gmail connection failed:", error.message);
    console.error("   → Check GMAIL_USER and GMAIL_APP_PASSWORD in .env");
  } else {
    console.log("✅ Gmail SMTP ready — emails will be sent to:", process.env.TO_EMAIL);
  }
});

/* ═══════════════════════════════════════════
   EMAIL TEMPLATES
═══════════════════════════════════════════ */

/**
 * Lead notification email — sent to RL FinTax inbox
 */
function buildLeadEmail(data) {
  const { name, phone, email, service, message, submittedAt, ip } = data;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>New Lead — RL FinTax</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 16px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(4,28,74,.12);">

      <!-- Header -->
      <tr>
        <td style="background:linear-gradient(135deg,#041C4A 0%,#0b2f72 100%);padding:32px 36px;text-align:center;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center">
                <div style="display:inline-block;background:#FFC107;border-radius:10px;width:52px;height:52px;line-height:52px;font-family:Georgia,serif;font-size:22px;font-weight:900;color:#041C4A;text-align:center;margin-bottom:14px;">RL</div>
                <h1 style="margin:0;font-family:Georgia,serif;font-size:26px;font-weight:900;color:#ffffff;line-height:1.2;">RL FinTax</h1>
                <p style="margin:4px 0 0;font-size:12px;color:rgba(255,255,255,.55);letter-spacing:1.5px;text-transform:uppercase;">Tax Consultancy — Mumbai</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Alert Banner -->
      <tr>
        <td style="background:#FFC107;padding:14px 36px;text-align:center;">
          <p style="margin:0;font-size:15px;font-weight:700;color:#041C4A;">
            🎯 New Lead Received — Action Required
          </p>
        </td>
      </tr>

      <!-- Body -->
      <tr>
        <td style="padding:36px;">

          <p style="margin:0 0 24px;font-size:15px;color:#334155;line-height:1.6;">
            A new inquiry has been submitted through your website. Here are the full details:
          </p>

          <!-- Lead Details Table -->
          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;margin-bottom:28px;">
            <tr style="background:#f8fafc;">
              <td style="padding:14px 20px;font-size:12px;font-weight:700;color:#041C4A;letter-spacing:1px;text-transform:uppercase;border-bottom:1px solid #e2e8f0;width:38%;">Field</td>
              <td style="padding:14px 20px;font-size:12px;font-weight:700;color:#041C4A;letter-spacing:1px;text-transform:uppercase;border-bottom:1px solid #e2e8f0;">Details</td>
            </tr>
            <tr>
              <td style="padding:14px 20px;font-size:13px;font-weight:600;color:#64748b;border-bottom:1px solid #f1f5f9;">👤 Full Name</td>
              <td style="padding:14px 20px;font-size:15px;font-weight:700;color:#1a2740;border-bottom:1px solid #f1f5f9;">${escHtml(name)}</td>
            </tr>
            <tr style="background:#fafbfc;">
              <td style="padding:14px 20px;font-size:13px;font-weight:600;color:#64748b;border-bottom:1px solid #f1f5f9;">📱 Phone</td>
              <td style="padding:14px 20px;font-size:15px;font-weight:700;color:#1a2740;border-bottom:1px solid #f1f5f9;">
                <a href="tel:${escHtml(phone)}" style="color:#041C4A;text-decoration:none;">${escHtml(phone)}</a>
                &nbsp;
                <a href="https://wa.me/91${escHtml(phone.replace(/\D/g,''))}" style="background:#25D366;color:#fff;font-size:11px;font-weight:700;padding:3px 10px;border-radius:100px;text-decoration:none;">WhatsApp</a>
              </td>
            </tr>
            <tr>
              <td style="padding:14px 20px;font-size:13px;font-weight:600;color:#64748b;border-bottom:1px solid #f1f5f9;">✉️ Email</td>
              <td style="padding:14px 20px;font-size:15px;color:#1a2740;border-bottom:1px solid #f1f5f9;">
                ${email ? `<a href="mailto:${escHtml(email)}" style="color:#041C4A;">${escHtml(email)}</a>` : '<span style="color:#94a3b8;font-style:italic;">Not provided</span>'}
              </td>
            </tr>
            <tr style="background:#fafbfc;">
              <td style="padding:14px 20px;font-size:13px;font-weight:600;color:#64748b;border-bottom:1px solid #f1f5f9;">🗂️ Service</td>
              <td style="padding:14px 20px;border-bottom:1px solid #f1f5f9;">
                <span style="background:#041C4A;color:#FFC107;font-size:12px;font-weight:700;padding:4px 14px;border-radius:100px;">${escHtml(service)}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:14px 20px;font-size:13px;font-weight:600;color:#64748b;vertical-align:top;">💬 Message</td>
              <td style="padding:14px 20px;font-size:14px;color:#334155;line-height:1.65;">
                ${message ? escHtml(message).replace(/\n/g, "<br>") : '<span style="color:#94a3b8;font-style:italic;">No message provided</span>'}
              </td>
            </tr>
          </table>

          <!-- Quick Action Buttons -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
            <tr>
              <td style="padding:0 6px 0 0;">
                <a href="https://wa.me/91${phone.replace(/\D/g,'')}" style="display:block;background:#25D366;color:#fff;text-align:center;padding:14px;border-radius:10px;font-size:14px;font-weight:700;text-decoration:none;">
                  📲 WhatsApp ${escHtml(name.split(' ')[0])}
                </a>
              </td>
              <td style="padding:0 0 0 6px;">
                <a href="tel:${escHtml(phone)}" style="display:block;background:#041C4A;color:#FFC107;text-align:center;padding:14px;border-radius:10px;font-size:14px;font-weight:700;text-decoration:none;">
                  📞 Call Now
                </a>
              </td>
            </tr>
          </table>

          <!-- Meta Info -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:10px;padding:16px 20px;border:1px solid #e2e8f0;">
            <tr>
              <td style="font-size:12px;color:#94a3b8;line-height:1.8;">
                🕐 <strong>Submitted:</strong> ${submittedAt}<br>
                🌐 <strong>Source IP:</strong> ${ip}<br>
                📍 <strong>Source:</strong> RL FinTax Website Contact Form
              </td>
            </tr>
          </table>

        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="background:#f8fafc;padding:20px 36px;border-top:1px solid #e2e8f0;text-align:center;">
          <p style="margin:0;font-size:12px;color:#94a3b8;">
            RL FinTax — Mumbai, Maharashtra, India<br>
            📞 7666975881 &nbsp;|&nbsp; ✉️ fintaxnow24@gmail.com
          </p>
          <p style="margin:8px 0 0;font-size:11px;color:#cbd5e1;font-style:italic;">
            "Your Business, Our Responsibility"
          </p>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body>
</html>
  `.trim();

  const text = `
NEW LEAD — RL FinTax Website
==============================
Name    : ${name}
Phone   : ${phone}
Email   : ${email || "Not provided"}
Service : ${service}
Message : ${message || "Not provided"}
Time    : ${submittedAt}
IP      : ${ip}
==============================
WhatsApp: https://wa.me/91${phone.replace(/\D/g,"")}
  `.trim();

  return { html, text };
}

/**
 * Auto-reply email — sent to the client who submitted the form
 */
function buildAutoReplyEmail(data) {
  const { name, service } = data;
  const firstName = name.split(" ")[0];

  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 16px;">
  <tr><td align="center">
    <table width="580" cellpadding="0" cellspacing="0" style="max-width:580px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(4,28,74,.1);">

      <!-- Header -->
      <tr>
        <td style="background:linear-gradient(135deg,#041C4A 0%,#0b2f72 100%);padding:36px;text-align:center;">
          <div style="background:#FFC107;border-radius:10px;width:52px;height:52px;line-height:52px;font-family:Georgia,serif;font-size:22px;font-weight:900;color:#041C4A;text-align:center;margin:0 auto 14px;">RL</div>
          <h1 style="margin:0;font-family:Georgia,serif;font-size:24px;color:#ffffff;">Thank You, ${escHtml(firstName)}!</h1>
          <p style="margin:8px 0 0;font-size:13px;color:rgba(255,255,255,.6);">We've received your inquiry and will contact you shortly.</p>
        </td>
      </tr>

      <!-- Body -->
      <tr>
        <td style="padding:36px;">
          <p style="margin:0 0 20px;font-size:15px;color:#334155;line-height:1.72;">
            Dear <strong>${escHtml(firstName)}</strong>,
          </p>
          <p style="margin:0 0 20px;font-size:15px;color:#334155;line-height:1.72;">
            Thank you for reaching out to <strong>RL FinTax</strong>. We have received your inquiry for
            <span style="background:#041C4A;color:#FFC107;font-size:12px;font-weight:700;padding:3px 12px;border-radius:100px;">${escHtml(service)}</span>
            and our team will contact you <strong>within 30 minutes</strong> during business hours.
          </p>

          <!-- What to expect -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:12px;padding:24px;border:1px solid #e2e8f0;margin-bottom:28px;">
            <tr><td>
              <p style="margin:0 0 14px;font-size:13px;font-weight:700;color:#041C4A;letter-spacing:1px;text-transform:uppercase;">What Happens Next</p>
              <p style="margin:0 0 10px;font-size:14px;color:#334155;">✅ &nbsp;Our expert will call or WhatsApp you</p>
              <p style="margin:0 0 10px;font-size:14px;color:#334155;">✅ &nbsp;We'll guide you on required documents</p>
              <p style="margin:0 0 10px;font-size:14px;color:#334155;">✅ &nbsp;Complete service delivered efficiently</p>
              <p style="margin:0;font-size:14px;color:#334155;">✅ &nbsp;100% online — no office visit needed</p>
            </td></tr>
          </table>

          <!-- Contact options -->
          <p style="margin:0 0 16px;font-size:14px;color:#64748b;">Need immediate help? Reach us directly:</p>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:0 6px 0 0;">
                <a href="${process.env.FIRM_WHATSAPP || 'https://wa.me/917666975881'}" style="display:block;background:#25D366;color:#fff;text-align:center;padding:13px;border-radius:10px;font-size:14px;font-weight:700;text-decoration:none;">
                  💬 WhatsApp Us
                </a>
              </td>
              <td style="padding:0 0 0 6px;">
                <a href="tel:${process.env.FIRM_PHONE || '+917666975881'}" style="display:block;background:#041C4A;color:#FFC107;text-align:center;padding:13px;border-radius:10px;font-size:14px;font-weight:700;text-decoration:none;">
                  📞 Call Now
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="background:#f8fafc;padding:20px 36px;border-top:1px solid #e2e8f0;text-align:center;">
          <p style="margin:0;font-size:12px;color:#94a3b8;">
            RL FinTax — Mumbai, Maharashtra, India<br>
            📞 ${process.env.FIRM_PHONE || '7666975881'} &nbsp;|&nbsp; ✉️ ${process.env.GMAIL_USER || 'fintaxnow24@gmail.com'}
          </p>
          <p style="margin:8px 0 0;font-size:11px;color:#cbd5e1;font-style:italic;">"Your Business, Our Responsibility"</p>
          <p style="margin:10px 0 0;font-size:11px;color:#e2e8f0;">This is an automated confirmation. Please do not reply to this email.</p>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body>
</html>
  `.trim();

  const text = `
Dear ${firstName},

Thank you for contacting RL FinTax!

We have received your inquiry for: ${service}

Our expert will contact you within 30 minutes during business hours.

For immediate assistance:
WhatsApp : ${process.env.FIRM_WHATSAPP || 'https://wa.me/917666975881'}
Call     : ${process.env.FIRM_PHONE || '+91 7666975881'}
Email    : ${process.env.GMAIL_USER || 'fintaxnow24@gmail.com'}

– RL FinTax Team
"Your Business, Our Responsibility"
  `.trim();

  return { html, text };
}

/* ═══════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════ */

/** Escape HTML special chars to prevent injection in email */
function escHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Format date as "6 Jun 2025, 10:30 AM IST" */
function formatIST(date) {
  return date.toLocaleString("en-IN", {
    timeZone   : "Asia/Kolkata",
    day        : "numeric",
    month      : "short",
    year       : "numeric",
    hour       : "2-digit",
    minute     : "2-digit",
    hour12     : true,
  }) + " IST";
}

/* ═══════════════════════════════════════════
   ROUTES
═══════════════════════════════════════════ */

// Health check
app.get("/", (req, res) => {
  res.json({
    status  : "ok",
    service : "RL FinTax Contact Form API",
    version : "1.0.0",
  });
});

/**
 * POST /send-lead
 * Accepts form data, validates, sends emails
 */
app.post("/send-lead", limiter, async (req, res) => {
  try {
    const {
      name,
      phone,
      email   = "",
      service,
      message = "",
      _honey  = "",          // honeypot field — bots fill this, humans don't
    } = req.body;

    /* ── 1. Honeypot check ── */
    if (_honey) {
      // Silently succeed to fool bots
      return res.json({ success: true, message: "Submitted." });
    }

    /* ── 2. Validate required fields ── */
    const errors = [];

    if (!name || name.trim().length < 2) {
      errors.push("Full name must be at least 2 characters.");
    }
    if (name && name.trim().length > 100) {
      errors.push("Name is too long.");
    }

    if (!phone || phone.trim().length < 7) {
      errors.push("A valid phone number is required.");
    }
    const cleanPhone = phone ? phone.replace(/[\s\-().+]/g, "") : "";
    if (cleanPhone && !/^\d{7,15}$/.test(cleanPhone)) {
      errors.push("Phone number contains invalid characters.");
    }

    if (email && !validator.isEmail(email.trim())) {
      errors.push("Email address format is invalid.");
    }

    if (!service || service.trim().length < 2) {
      errors.push("Please select a service.");
    }

    if (message && message.length > 2000) {
      errors.push("Message is too long (max 2000 characters).");
    }

    if (errors.length > 0) {
      return res.status(400).json({ success: false, errors });
    }

    /* ── 3. Sanitise inputs ── */
    const data = {
      name        : name.trim(),
      phone       : phone.trim(),
      email       : email.trim().toLowerCase(),
      service     : service.trim(),
      message     : message.trim(),
      submittedAt : formatIST(new Date()),
      ip          : req.headers["x-forwarded-for"] || req.socket.remoteAddress || "Unknown",
    };

    /* ── 4. Build emails ── */
    const lead      = buildLeadEmail(data);
    const autoReply = buildAutoReplyEmail(data);

    /* ── 5. Send lead notification to RL FinTax ── */
    const toAddresses = [process.env.TO_EMAIL].filter(Boolean);
    if (process.env.CC_EMAIL) toAddresses.push(process.env.CC_EMAIL);

    await transporter.sendMail({
      from    : `"RL FinTax Website" <${process.env.GMAIL_USER}>`,
      to      : toAddresses.join(", "),
      subject : `🎯 New Lead: ${data.service} — ${data.name} (${data.phone})`,
      html    : lead.html,
      text    : lead.text,
      replyTo : data.email || undefined,
    });

    console.log(`✅ Lead email sent — ${data.name} | ${data.service} | ${data.phone}`);

    /* ── 6. Send auto-reply to client (if email provided & enabled) ── */
    if (
      data.email &&
      process.env.SEND_AUTO_REPLY !== "false"
    ) {
      try {
        await transporter.sendMail({
          from    : `"RL FinTax" <${process.env.GMAIL_USER}>`,
          to      : data.email,
          subject : `We received your inquiry — RL FinTax`,
          html    : autoReply.html,
          text    : autoReply.text,
        });
        console.log(`📧 Auto-reply sent to ${data.email}`);
      } catch (replyErr) {
        // Don't fail the whole request if auto-reply fails
        console.warn("⚠️  Auto-reply failed:", replyErr.message);
      }
    }

    /* ── 7. Success ── */
    return res.json({
      success : true,
      message : "Thank you! We'll contact you within 30 minutes.",
    });

  } catch (err) {
    console.error("❌ /send-lead error:", err.message);
    return res.status(500).json({
      success : false,
      message : "Something went wrong on our end. Please call us directly at +91 7666975881.",
    });
  }
});

// 404 catch-all
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found." });
});

/* ═══════════════════════════════════════════
   START SERVER
═══════════════════════════════════════════ */
app.listen(PORT, () => {
  console.log("");
  console.log("╔══════════════════════════════════════╗");
  console.log("║   RL FinTax — Contact Form Backend   ║");
  console.log(`║   Running on http://localhost:${PORT}    ║`);
  console.log("╚══════════════════════════════════════╝");
  console.log("");
  console.log(`📬 Sending leads to : ${process.env.TO_EMAIL}`);
  console.log(`🌐 CORS allowed     : ${process.env.ALLOWED_ORIGIN}`);
  console.log(`🤖 Auto-reply       : ${process.env.SEND_AUTO_REPLY !== "false" ? "ON" : "OFF"}`);
  console.log("");
});
