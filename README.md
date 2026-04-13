# WhatsNaija AI

AI-powered WhatsApp sales and support agent for Nigerian small businesses.

Your customers message your WhatsApp number. The AI replies instantly — answers product questions, captures leads, books appointments, and hands over to you when it needs to. 24/7, in English, Pidgin, Yoruba or whatever language your customers write in.

---

## What it does

- **Auto-replies** customer WhatsApp messages using your product and service knowledge
- **Captures leads** automatically when a customer shows buying intent
- **Books appointments** and logs them to your dashboard
- **Generates payment links** via Paystack when a customer is ready to pay
- **Hands over** to you with one click when a conversation needs a human touch
- **Multi-tenant** — each business has isolated data, their own WhatsApp number, and their own AI persona

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Backend | FastAPI (Python) |
| AI | Groq API — Llama 3.3 70B |
| Database | Supabase (Postgres + Auth + RLS) |
| WhatsApp | Meta Cloud API |
| Payments | Paystack |

---

## Project structure

```
├── frontend/              # Next.js owner dashboard
├── backend/               # FastAPI server
│   ├── main.py            # App entry point + CORS
│   ├── webhook.py         # Receives WhatsApp messages from Meta
│   ├── agent.py           # AI response logic + action handling
│   ├── api.py             # Dashboard API endpoints
│   ├── database.py        # Supabase data layer
│   ├── auto_responder.py  # Background polling worker
│   └── config.py          # Environment config
└── database/
    ├── schema.sql                          # Full DB schema
    └── migrations/001_pre_launch_fixes.sql # Schema updates
```

---

## Getting started

### Prerequisites

- Python 3.11+, Node.js 18+
- [Supabase](https://supabase.com) project
- [Meta for Developers](https://developers.facebook.com/apps/) app with WhatsApp product added
- [Groq](https://console.groq.com/) API key

### Backend

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Fill in your values
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
# Fill in Supabase URL and anon key
npm run dev
```

### Database

Run `database/schema.sql` in your Supabase SQL Editor, then run `database/migrations/001_pre_launch_fixes.sql`.

### WhatsApp webhook

In your Meta app → WhatsApp → Configuration:

- **Callback URL:** `https://your-backend-url.com/webhook`
- **Verify Token:** set in your `.env` as `WHATSAPP_VERIFY_TOKEN`
- **Subscribe to:** `messages`

---

## Environment variables

### Backend — `backend/.env`

```env
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_VERIFY_TOKEN=
WABA_ID=

GROQ_API_KEY=

SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_JWT_SECRET=

PAYSTACK_SECRET_KEY=     # Optional — enables real payment links
FRONTEND_URL=            # Your deployed frontend URL (CORS)

APP_ENV=development
BASE_URL=http://localhost:8000
```

### Frontend — `frontend/.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Deployment

**Backend → [Railway](https://railway.app)**

1. New project → deploy from GitHub, root directory `backend`
2. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
3. Add a second service (same repo) for the worker: `python auto_responder.py`
4. Add all env vars, set `APP_ENV=production`

**Frontend → [Vercel](https://vercel.com)**

1. Import repo, set root directory to `frontend`
2. Add `NEXT_PUBLIC_*` env vars
3. Set `NEXT_PUBLIC_API_URL` to your Railway backend URL

After deploying, update the webhook URL in your Meta app dashboard to point to your live backend.

---

## License

Private — all rights reserved.
