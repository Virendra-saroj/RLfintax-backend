# RL FinTax — Contact Form Backend
### Sends leads directly to fintaxnow24@gmail.com via Gmail SMTP

---

## 📁 Files in this folder

```
rlfintax-backend/
├── server.js          ← Main backend (Express + Nodemailer)
├── package.json       ← Dependencies list
├── .env.example       ← Environment variables template
└── README.md          ← This file
```

---

## ⚡ Quick Setup (5 Steps)

### Step 1 — Install Node.js
Download from https://nodejs.org (choose LTS version)
Verify: `node --version` should show v18 or higher

---

### Step 2 — Install dependencies
Open terminal in this folder and run:
```bash
npm install
```

---

### Step 3 — Get Gmail App Password

> **Important:** You CANNOT use your regular Gmail password.
> You must create an App Password.

1. Go to https://myaccount.google.com
2. Click **Security** in the left menu
3. Under "How you sign in to Google" → enable **2-Step Verification** (if not already on)
4. Go back to Security → search for **App Passwords**
5. Click **App Passwords**
6. Select app: **Mail** | Device: **Other** → type `RL FinTax`
7. Click **Generate**
8. Copy the **16-character password** shown (example: `abcd efgh ijkl mnop`)

---

### Step 4 — Create your .env file
```bash
# In the rlfintax-backend folder, copy the example file:
cp .env.example .env
```

Then open `.env` in any text editor and fill in:
```env
GMAIL_USER=fintaxnow24@gmail.com
GMAIL_APP_PASSWORD=abcd efgh ijkl mnop   ← paste your App Password here

TO_EMAIL=fintaxnow24@gmail.com
CC_EMAIL=                                ← optional second email

ALLOWED_ORIGIN=https://your-website.com  ← your website domain
SEND_AUTO_REPLY=true
```

---

### Step 5 — Start the server
```bash
# Production
npm start

# Development (auto-restarts on file changes)
npm run dev
```

You should see:
```
╔══════════════════════════════════════╗
║   RL FinTax — Contact Form Backend   ║
║   Running on http://localhost:3000    ║
╚══════════════════════════════════════╝

📬 Sending leads to : fintaxnow24@gmail.com
✅ Gmail SMTP ready — emails will be sent to: fintaxnow24@gmail.com
```

---

## 🌐 Update Website to Point to Your Backend

In `rl-fintax-website.html`, find this line near the bottom:
```javascript
const API_URL = 'http://localhost:3000/send-lead';
```

Change it to your server's URL:
```javascript
// If deployed on Render/Railway:
const API_URL = 'https://rlfintax-backend.onrender.com/send-lead';

// If on a VPS with your domain:
const API_URL = 'https://api.rlfintax.com/send-lead';
```

---

## 📧 What Emails You Will Receive

### 1. Lead Notification (to your Gmail)
- Subject: `🎯 New Lead: GST Registration — Rahul Kapoor (9876543210)`
- Contains: Name, Phone (with WhatsApp button), Email, Service, Message
- Two quick-action buttons: WhatsApp the client, Call now
- Submission time and IP address

### 2. Auto-Reply (to the client)
- Subject: `We received your inquiry — RL FinTax`
- Professional branded HTML email
- What happens next (3 steps)
- Your WhatsApp and phone number
- Sent automatically only if client provides email

---

## 🚀 Free Deployment Options

### Option A — Render.com (Recommended, Free)
1. Create account at https://render.com
2. New → Web Service → Connect your GitHub repo
3. Build command: `npm install`
4. Start command: `npm start`
5. Add all `.env` variables in the Environment section
6. Deploy → get URL like `https://rlfintax.onrender.com`

### Option B — Railway.app (Free tier)
1. Create account at https://railway.app
2. New Project → Deploy from GitHub
3. Add environment variables
4. Deploy → get URL

### Option C — Your own hosting (cPanel/VPS)
1. Upload files via FTP
2. Install Node.js on the server
3. Run `npm install` then `npm start`
4. Use PM2 to keep it running: `pm2 start server.js`

---

## 🔒 Security Features Built In

| Feature | Detail |
|---|---|
| Rate Limiting | Max 5 submissions per IP per 15 min |
| Honeypot | Hidden field catches bots silently |
| Input Validation | Name, phone, email, service all validated |
| HTML Sanitisation | All inputs escaped before going into email |
| CORS | Only your website domain can call the API |
| App Password | Gmail auth — no plain password stored |

---

## 🛠️ API Reference

### `POST /send-lead`

**Request Body (JSON):**
```json
{
  "name":    "Rahul Kapoor",
  "phone":   "+91 9876543210",
  "email":   "rahul@example.com",
  "service": "GST Registration",
  "message": "I need to register my new business.",
  "_honey":  ""
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Thank you! We'll contact you within 30 minutes."
}
```

**Error Response:**
```json
{
  "success": false,
  "errors": ["A valid phone number is required."]
}
```

---

## ❓ Troubleshooting

| Problem | Fix |
|---|---|
| `Gmail connection failed` | Check App Password in `.env` — must be 16 chars |
| `Too many requests` | Rate limit hit — wait 15 minutes |
| Form shows "Unable to connect" | Backend not running, or wrong `API_URL` in HTML |
| Emails going to spam | Add SPF/DKIM to your domain, or mark as Not Spam once |
| CORS error in browser | Set `ALLOWED_ORIGIN` to exactly match your website URL |

---

## 📞 Support

If you need help setting this up, contact your developer.

**RL FinTax**
📞 +91 7666975881
✉️ fintaxnow24@gmail.com
