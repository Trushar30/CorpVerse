# Free-Tier API & Infrastructure Playbook

> **Goal:** Run the entire CorpVerse platform at production quality for $0/month.
> **Rule:** If it costs money, we don't use it.

---

## LLM Provider: Groq Cloud (Free Tier)

### Why Groq
- **Llama 3.1 70B** — genuinely powerful, not a toy model
- **Blazing fast** — 300+ tokens/sec (faster than GPT-4o)
- **Generous free limits** — more than enough for an SGP demo
- **OpenAI-compatible API** — drop-in replacement, same format

### Free Tier Limits

| Metric | Limit | Our Usage Estimate |
|--------|-------|--------------------|
| Requests/minute | 30 RPM | ~5 RPM at peak demo |
| Requests/day | 14,400 | ~100-200/day during dev |
| Tokens/minute | 500,000 TPM | ~5,000 TPM at peak |

### Setup Steps

1. Visit [console.groq.com](https://console.groq.com)
2. Sign up with Google/GitHub (free, no credit card)
3. Go to **API Keys** → Create new key
4. Add to `backend/.env`:
   ```
   GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

### API Call Pattern

```javascript
const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'llama-3.1-70b-versatile',
    messages: [
      { role: 'system', content: 'System prompt here' },
      { role: 'user', content: 'User message here' },
    ],
    max_tokens: 500,
    temperature: 0.7,
  }),
});
```

### Available Models on Free Tier

| Model | Best For | Context Window |
|-------|---------|---------------|
| `llama-3.1-70b-versatile` | Screening feedback, interview questions | 128K |
| `llama-3.1-8b-instant` | Quick classifications, scoring | 128K |
| `mixtral-8x7b-32768` | Fallback, good for simple tasks | 32K |

**Recommendation:** Use `llama-3.1-70b-versatile` for interviews and screening. Use `llama-3.1-8b-instant` for quick scoring if you need to save quota.

---

## Fallback: HuggingFace Inference API (Free)

If Groq is down or rate-limited, use HuggingFace as secondary fallback.

### Setup

1. Visit [huggingface.co](https://huggingface.co) → Sign up free
2. Go to Settings → Access Tokens → Create
3. Add to `backend/.env`:
   ```
   HF_API_KEY=hf_xxxxxxxxxxxxxxxxxx
   ```

### API Call Pattern

```javascript
const response = await fetch(
  'https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3.1-8B-Instruct',
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.HF_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: `<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\n${systemPrompt}<|eot_id|><|start_header_id|>user<|end_header_id|>\n\n${userPrompt}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n`,
      parameters: { max_new_tokens: 500, temperature: 0.7 },
    }),
  }
);
```

---

## Database: MongoDB Atlas M0 (Free Forever)

Already configured in `backend/.env` as `MONGODB_URI`.

### Free Tier Limits
- **512 MB storage** (plenty for demo data)
- **Shared cluster** (adequate performance)
- **100 max connections** (fine for dev/demo)

### Optimization Tips
- Resume binary buffers (stored in `Resume.fileBuffer`) are the biggest storage consumers
- Limit resume size to 5MB (already enforced in config)
- Use `.lean()` on all read queries for performance
- Index all frequently queried fields (already done in models)

---

## Email: Gmail SMTP via Nodemailer

Already configured for OTP delivery.

### Free Limits
- **500 emails/day** with Gmail SMTP
- More than enough for OTP verification during demos

### `.env` Config
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-gmail@gmail.com
SMTP_PASS=app-password-from-google
```

**Note:** Use a Google App Password, not your regular Gmail password. Enable 2FA first, then generate an App Password at [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords).

---

## Hosting: Render Free Tier

Already configured in `render.yaml` at project root.

### Services

| Service | Type | URL Pattern |
|---------|------|-------------|
| Backend API | Web Service | `corpverse-api.onrender.com` |
| Frontend | Static Site | `corpverse.onrender.com` |
| AI Microservice | Web Service | `corpverse-ai.onrender.com` |

### Free Tier Caveats
- **Spins down after 15 min idle** — first request takes ~30s to cold-start
- **750 hours/month** per service — enough for 24/7 single service
- **Limited RAM** — keep memory usage lean

### Cold Start Mitigation
Add a health-check ping from the frontend to keep the backend warm during demo:

```javascript
// In AuthContext.jsx or App.jsx — ping backend every 10 min
useEffect(() => {
  const keepAlive = setInterval(() => {
    fetch(import.meta.env.VITE_API_URL + '/api/health').catch(() => {});
  }, 10 * 60 * 1000);
  return () => clearInterval(keepAlive);
}, []);
```

---

## Python AI Microservice

Already written in `ai_service/main.py` (FastAPI). Deployed as a separate Render service.

### Local Development
```bash
cd ai_service
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Note on Architecture
The Node.js backend already has **built-in fallback responses** when the Python service is offline. This means:

1. If Python service is **running** → Uses real LLM pipeline execution
2. If Python service is **offline** → Uses embedded sandbox response
3. Either way, the user experience is smooth

For the new screening and interview features (Modules 2-3), the LLM calls go **directly from Node.js to Groq** — no need to route through Python. The Python service is only used for the existing Bot Workshop "test run" and "pipeline execution" features in the Founder/AI Manager dashboards.

---

## Environment Variables Master List

```env
# ─── Server ───────────────────────────────────
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# ─── MongoDB ──────────────────────────────────
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/corpverse

# ─── JWT Auth ─────────────────────────────────
JWT_SECRET=your-strong-secret-here
JWT_EXPIRES_IN=7d

# ─── Email (Gmail SMTP) ──────────────────────
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# ─── AI / LLM (FREE) ─────────────────────────
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxx
HF_API_KEY=hf_xxxxxxxxxxxxxxxxxx

# ─── AI Python Microservice ──────────────────
AI_SERVICE_URL=http://localhost:8000

# ─── Encryption (for AI Provider API keys) ───
ENCRYPTION_KEY=32-char-hex-string-here
```

---

## Cost Summary

| Item | Provider | Monthly Cost |
|------|----------|-------------|
| Database | MongoDB Atlas M0 | **$0** |
| LLM API | Groq Cloud Free | **$0** |
| LLM Fallback | HuggingFace Free | **$0** |
| Email OTP | Gmail SMTP | **$0** |
| Backend Hosting | Render Free | **$0** |
| Frontend Hosting | Render/Vercel Free | **$0** |
| AI Microservice | Render Free | **$0** |
| Domain (optional) | — | Not needed for demo |
| **TOTAL** | | **$0/month** |
