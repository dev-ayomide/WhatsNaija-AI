# WhatsNaija AI — Project Context & Technical Spec
Ayo@TAIWO-AYOMIDE MINGW64 ~/WhatsNaija AI
$  cd backend
  python auto_responder.py 


Ayo@TAIWO-AYOMIDE MINGW64 ~/WhatsNaija AI/backend
$ python -m uvicorn main:app --reload --port 8000


> An autonomous AI agent that turns any Nigerian small business's WhatsApp number into a 24/7 sales and support team.

---

## What We're Building

WhatsNaija AI is a multi-tenant SaaS platform that lets Nigerian small business owners (SMBs) connect their WhatsApp Business number to an AI agent. The agent handles customer conversations autonomously — answering FAQs, qualifying leads, sending Paystack payment links, and booking appointments — in natural Nigerian English and Pidgin.

The owner gets a simple dashboard where they see all conversations, captured leads, and payments initiated. They can step in and take over any conversation manually at any time.

**The core loop:**
```
Customer sends WhatsApp message
  → Meta webhook fires to our backend
  → Python agent loads this business's knowledge base
  → LLM generates a contextually appropriate reply
  → Reply sent back via WhatsApp Cloud API
  → Conversation + lead data logged to Supabase
  → Owner sees everything on their dashboard
```

---

## Problem Being Solved

Nigerian SMB owners — fashion vendors, caterers, event planners, beauty brands — run their entire sales funnel through WhatsApp DMs. A typical owner spends 3–6 hours daily just replying customer chats. They lose leads overnight when they're asleep. They miss sales because they're busy with something else.

There's no affordable, WhatsApp-native, culturally-tuned tool for this market. Generic chatbot tools don't understand Nigerian English or Pidgin, are too expensive, or require too much technical setup.

**Target user:** Nigerian SMB owner, revenue ₦300k–₦5M/month, non-technical, WhatsApp is their primary sales channel.

---

## Features

### MVP Features (Build These First)

#### 1. FAQ Auto-Responder
- Owner fills a setup form: product list, prices, FAQs, policies, tone preference
- Bot answers customer questions from this knowledge base
- Responds in Pidgin, casual Nigerian English, or formal English — matching the customer's tone
- If a question can't be answered from the knowledge base, the bot acknowledges and flags for human handoff

#### 2. Lead Qualification
- When a new conversation starts, the bot collects: what the customer wants, budget range, timeline, and name
- Logs this as a structured lead record in the database
- Owner sees a clean list of qualified leads in the dashboard

#### 3. Paystack Payment Link Generation
- When a customer signals intent to buy ("I want to order", "how do I pay"), the bot generates a Paystack payment link for the correct amount
- Link is sent directly in the WhatsApp chat
- Payment is tracked in the dashboard
- Payment links are always generated server-side using the business's stored Paystack secret key — never from user input (security)

#### 4. Appointment Booking
- Business owner sets available time slots in the dashboard
- Bot checks availability and confirms bookings in chat
- Bookings logged to a simple calendar view in dashboard

#### 5. Owner Dashboard
- View all active conversations
- See leads captured today, this week, all time
- See payment links sent and their status (clicked / paid)
- Manually take over any conversation (human handoff)
- Edit business knowledge base (products, FAQs, tone)

#### 6. Human Handoff
- If customer asks to "speak to a person", bot flags conversation and notifies owner
- If bot is uncertain (confidence below threshold), it acknowledges and escalates
- Owner gets notified via email or dashboard alert
- Owner can reply directly; bot pauses for that conversation until re-enabled

### Post-MVP Features (Don't Build Yet)
- Multi-language support (Yoruba, Igbo, Hausa)
- Voice message transcription + reply
- Image recognition (customer sends photo of product, bot identifies it)
- Analytics and reporting charts
- Instagram DM and Telegram support
- Inventory management
- White-label / agency dashboard
- Broadcast messaging (send promotions to all past customers)

---

## Technical Architecture

### Stack

| Layer | Technology | Why |
|---|---|---|
| Backend / Agent | Python (FastAPI) | Agent orchestration, webhook handling, LLM calls |
| LLM | Claude Haiku (primary) | Cost-efficient, fast, handles Nigerian English well |
| WhatsApp | Meta WhatsApp Cloud API | Official API, free tier available |
| Frontend / Dashboard | Next.js 14 + TypeScript | Familiar stack, fast to build |
| Styling | Tailwind CSS | Consistent with existing projects |
| Database | Supabase (PostgreSQL) | Auth, storage, real-time updates |
| Payments | Paystack API | Nigerian payment standard |
| Backend hosting | Railway | Simple Python deployment |
| Frontend hosting | Vercel | Free, instant deploys |

### Repository Structure

```
whatsnaija-ai/
├── backend/                    # Python FastAPI app
│   ├── main.py                 # FastAPI app entry point
│   ├── webhook.py              # WhatsApp webhook handler
│   ├── agent.py                # Core AI agent logic
│   ├── knowledge.py            # Business knowledge base loader
│   ├── paystack.py             # Paystack payment link generation
│   ├── whatsapp.py             # WhatsApp Cloud API client
│   ├── models.py               # Pydantic data models
│   ├── database.py             # Supabase client + queries
│   └── requirements.txt
│
├── frontend/                   # Next.js dashboard
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── dashboard/
│   │   │   ├── page.tsx        # Overview: leads, payments, activity
│   │   │   ├── conversations/
│   │   │   │   └── page.tsx    # All conversations view
│   │   │   ├── leads/
│   │   │   │   └── page.tsx    # Captured leads list
│   │   │   ├── settings/
│   │   │   │   └── page.tsx    # Business knowledge base editor
│   │   │   └── bookings/
│   │   │       └── page.tsx    # Calendar / appointments
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ConversationList.tsx
│   │   ├── LeadCard.tsx
│   │   ├── ChatWindow.tsx      # For manual human takeover
│   │   └── KnowledgeBaseForm.tsx
│   └── lib/
│       ├── supabase.ts
│       └── api.ts              # Calls to backend
│
└── docs/
    └── WHATSNAIJA_AI.md        # This file
```

---

## Database Schema (Supabase / PostgreSQL)

### `businesses`
```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
owner_id        uuid REFERENCES auth.users(id)
name            text NOT NULL
whatsapp_number text UNIQUE NOT NULL       -- e.g. "+2348012345678"
phone_number_id text NOT NULL              -- from Meta WABA setup
waba_id         text NOT NULL              -- WhatsApp Business Account ID
paystack_secret text                       -- encrypted
business_type   text                       -- "fashion", "food", "beauty", etc.
tone_preference text DEFAULT 'casual'      -- "formal" | "casual" | "pidgin"
is_active       boolean DEFAULT true
created_at      timestamptz DEFAULT now()
```

### `knowledge_base`
```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
business_id     uuid REFERENCES businesses(id)
type            text NOT NULL              -- "product" | "faq" | "policy" | "greeting"
question        text                       -- for FAQs
answer          text NOT NULL
product_name    text                       -- for products
price           numeric                    -- for products
is_active       boolean DEFAULT true
created_at      timestamptz DEFAULT now()
```

### `conversations`
```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
business_id     uuid REFERENCES businesses(id)
customer_phone  text NOT NULL
customer_name   text
status          text DEFAULT 'bot'         -- "bot" | "human" | "closed"
started_at      timestamptz DEFAULT now()
last_message_at timestamptz DEFAULT now()
```

### `messages`
```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
conversation_id uuid REFERENCES conversations(id)
role            text NOT NULL              -- "customer" | "bot" | "owner"
content         text NOT NULL
wa_message_id   text                       -- WhatsApp message ID for deduplication
sent_at         timestamptz DEFAULT now()
```

### `leads`
```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
business_id     uuid REFERENCES businesses(id)
conversation_id uuid REFERENCES conversations(id)
customer_name   text
customer_phone  text NOT NULL
product_interest text
budget_range    text
timeline        text
status          text DEFAULT 'new'         -- "new" | "contacted" | "converted" | "lost"
captured_at     timestamptz DEFAULT now()
```

### `payment_links`
```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
business_id     uuid REFERENCES businesses(id)
conversation_id uuid REFERENCES conversations(id)
paystack_ref    text UNIQUE NOT NULL
amount          numeric NOT NULL
customer_phone  text
status          text DEFAULT 'sent'        -- "sent" | "clicked" | "paid"
created_at      timestamptz DEFAULT now()
```

### `bookings`
```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
business_id     uuid REFERENCES businesses(id)
conversation_id uuid REFERENCES conversations(id)
customer_name   text
customer_phone  text NOT NULL
service         text
scheduled_at    timestamptz NOT NULL
status          text DEFAULT 'pending'     -- "pending" | "confirmed" | "cancelled"
created_at      timestamptz DEFAULT now()
```

---

## WhatsApp Cloud API Setup

### What You Need From Meta
1. Meta Developer account → create an App
2. Add "WhatsApp" product to the app
3. Get a test phone number (Meta provides one free)
4. Get these credentials:
   - `WHATSAPP_PHONE_NUMBER_ID` — the ID of the sending number
   - `WHATSAPP_ACCESS_TOKEN` — permanent system user token
   - `WHATSAPP_VERIFY_TOKEN` — a string you define for webhook verification
   - `WABA_ID` — WhatsApp Business Account ID

### Webhook Setup
Meta will send all incoming messages to a URL you provide. Your FastAPI backend must expose:

```
POST /webhook        ← receives all WhatsApp events
GET  /webhook        ← used by Meta to verify your endpoint (one-time setup)
```

For local development, use [ngrok](https://ngrok.com) to expose your local server:
```bash
ngrok http 8000
# Copy the https URL → paste into Meta webhook config
```

### Webhook Verification (GET /webhook)
```python
@app.get("/webhook")
def verify_webhook(
    hub_mode: str = Query(alias="hub.mode"),
    hub_challenge: str = Query(alias="hub.challenge"),
    hub_verify_token: str = Query(alias="hub.verify_token")
):
    if hub_mode == "subscribe" and hub_verify_token == VERIFY_TOKEN:
        return PlainTextResponse(hub_challenge)
    raise HTTPException(status_code=403)
```

---

## Agent Logic

### System Prompt Template
The agent receives a fresh system prompt for each conversation, populated with the business's knowledge base:

```
You are an AI sales and support assistant for {business_name}, a {business_type} business in Nigeria.

TONE: {tone_instruction}
- If customer writes in Pidgin, reply in Pidgin
- If customer writes formally, match their formality
- Never sound robotic. Sound like a helpful, friendly Nigerian person who knows this business well.

PRODUCTS AND SERVICES:
{products_list}

FREQUENTLY ASKED QUESTIONS:
{faqs_list}

POLICIES:
{policies_list}

YOUR GOALS (in order of priority):
1. Answer the customer's question accurately from the knowledge base above
2. If they seem interested in buying, ask what exactly they want and confirm the price
3. If they are ready to pay, say "Let me send you a payment link" and output: [SEND_PAYMENT_LINK: amount={amount}]
4. If they want to book an appointment, say you'll check availability and output: [CHECK_BOOKING: service={service}]
5. If you don't know the answer, say "Let me get {owner_first_name} to help with that" and output: [HUMAN_HANDOFF]
6. If this is a new customer, at a natural point in conversation collect their name

RULES:
- Never make up prices or policies not listed above
- Never promise things not in the knowledge base
- Keep replies short — 1 to 3 sentences max unless explaining something complex
- If customer is rude or abusive, politely disengage: "I'm sorry I can't help with that."
- Do not discuss competitors
```

### Action Parsing
After the LLM responds, the backend parses special action tokens from the reply before sending to WhatsApp:

```python
def parse_actions(response: str) -> tuple[str, list[dict]]:
    actions = []
    clean_response = response

    if "[SEND_PAYMENT_LINK:" in response:
        # extract amount, generate Paystack link, replace token with actual link
        ...

    if "[CHECK_BOOKING:" in response:
        # check available slots, insert booking, confirm
        ...

    if "[HUMAN_HANDOFF]" in response:
        # update conversation status to "human", notify owner
        ...

    return clean_response, actions
```

---

## Paystack Integration

### Generating a Payment Link
```python
import httpx

async def create_payment_link(
    secret_key: str,
    amount_naira: float,
    customer_phone: str,
    reference: str,
    business_name: str
) -> str:
    amount_kobo = int(amount_naira * 100)
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://api.paystack.co/transaction/initialize",
            headers={"Authorization": f"Bearer {secret_key}"},
            json={
                "amount": amount_kobo,
                "currency": "NGN",
                "reference": reference,
                "metadata": {"phone": customer_phone, "source": "whatsnaija"}
            }
        )
    data = response.json()
    return data["data"]["authorization_url"]
```

### Paystack Webhook (Payment Confirmation)
```
POST /paystack/webhook
```
When a payment completes, Paystack sends a webhook. The backend:
1. Verifies the signature using `PAYSTACK_WEBHOOK_SECRET`
2. Finds the matching `payment_links` record by reference
3. Updates status to "paid"
4. Sends a confirmation WhatsApp message to the customer
5. Notifies the business owner via dashboard

---

## Environment Variables

```env
# WhatsApp
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_VERIFY_TOKEN=
WABA_ID=

# Anthropic
ANTHROPIC_API_KEY=

# Supabase
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

# Paystack (global / platform key — businesses add their own keys per account)
PAYSTACK_WEBHOOK_SECRET=

# App
APP_ENV=development
BASE_URL=https://your-railway-url.railway.app
```

---

## Message Flow — Step by Step

```
1. Customer sends "Hi, do you have ankara fabric in size 12?"

2. Meta sends POST to /webhook with message payload

3. backend/webhook.py receives it:
   - Extracts: customer_phone, message_text, wa_message_id
   - Looks up which business owns this phone_number_id
   - Checks if conversation exists for this customer; creates one if not
   - Saves message to `messages` table with role="customer"

4. backend/agent.py is called with:
   - conversation history (last 10 messages)
   - business knowledge base (products, FAQs, policies)
   - system prompt populated with business context

5. LLM returns a response, e.g.:
   "Yes we have ankara in size 12! We have 3 colours available — wine, navy, and olive.
   Each is ₦8,500 per yard. Which colour do you like?"

6. backend/webhook.py parses the response for action tokens (none in this case)

7. backend/whatsapp.py sends the reply back to the customer via Cloud API

8. Response saved to `messages` table with role="bot"

9. Supabase realtime triggers dashboard update — owner sees new message in their dashboard
```

---

## Dashboard Pages

### `/dashboard` — Overview
- Total leads captured (today / this week / all time)
- Total payment links sent and paid
- Active conversations (bot-handled vs needs attention)
- Recent activity feed

### `/dashboard/conversations` — All Conversations
- List of all conversations, sorted by most recent
- Status indicator: 🟢 Bot handling | 🟡 Needs attention | ⚪ Closed
- Click any conversation to open the chat window
- "Take over" button to switch from bot to human mode

### `/dashboard/leads` — Leads
- Table of captured leads: name, phone, product interest, budget, status
- Owner can update status (new → contacted → converted / lost)
- Export to CSV (post-MVP)

### `/dashboard/settings` — Business Config
- Edit products + prices
- Edit FAQs
- Set tone preference
- Add/update Paystack secret key
- Set available booking slots
- Toggle bot on/off

### `/dashboard/bookings` — Appointments
- Calendar view of all bookings
- Confirm or cancel individual bookings
- Manage available time slots

---

## Authentication

- Supabase Auth (email + password for MVP, Google OAuth later)
- Each user owns one business (one-to-one for MVP)
- Row Level Security (RLS) on all Supabase tables — users can only read/write their own business data
- Backend uses `SUPABASE_SERVICE_ROLE_KEY` (bypasses RLS for agent operations)
- Dashboard uses the logged-in user's JWT

---

## Cost Model

| Item | Monthly Cost |
|---|---|
| WhatsApp Cloud API | Free up to 1,000 conversations/business/month. ~$0.06/conversation after. |
| Claude Haiku (LLM) | ~$1–3 per business per month at moderate volume |
| Supabase | Free tier handles first 20–30 businesses |
| Railway (Python backend) | ~$5–10/month total (shared across all businesses) |
| Vercel (Next.js dashboard) | Free |
| **Total per business** | **~$3–8/month** |

### Pricing Tiers
| Plan | Price | Limits |
|---|---|---|
| Starter | ₦5,000/month | 1 number, FAQ only, 500 conversations/month |
| Growth | ₦12,000/month | FAQ + payments + bookings, 2,000 conversations/month |
| Agency | ₦30,000/month | Up to 10 businesses, white-label |

---

## What Makes This Different

1. **Nigerian voice** — Pidgin and Nigerian English support is core, not a feature
2. **WhatsApp-native** — no new app for the owner or customer to install
3. **Paystack-first** — built for Nigerian payments from day one
4. **Non-technical setup** — business owner fills a form, not a config file
5. **Human-in-the-loop** — owner can always take over; bot is an assistant, not a replacement

---

## Current Status

- [ ] Phase 0: Validate with 5 SMB owners (in progress)
- [ ] Phase 1: Single-business prototype (WhatsApp webhook → LLM → reply)
- [ ] Phase 2: Multi-tenant core features (FAQ, leads, Paystack, dashboard)
- [ ] Phase 3: Pilot with 3–5 real businesses (free)
- [ ] Phase 4: First paid customers + billing

---

## Known Risks

| Risk | Severity | Mitigation |
|---|---|---|
| WhatsApp API verification for small businesses | High | Partner with Nigerian BSP (e.g. Termii, Shoutout Africa) |
| Owner trust — handing chats to a bot | High | Frame as assistant, not replacement. Human handoff always visible. |
| LLM cost at high volume | Medium | Haiku as default, rate limits on lower tiers |
| Pidgin tone quality | Medium | Heavy system prompt tuning + real user testing in pilot |
| Paystack link fraud via prompt injection | Low | Links generated server-side only, never from user input |

---

## Glossary

- **WABA** — WhatsApp Business Account
- **BSP** — Business Solution Provider (Meta-approved WhatsApp API partner)
- **Phone Number ID** — Meta's identifier for a WhatsApp sending number (not the actual phone number)
- **Knowledge base** — The business-specific data the agent uses to answer questions (products, FAQs, policies)
- **Human handoff** — When the bot escalates a conversation to the human owner
- **Conversation** — A single WhatsApp thread between one customer and one business
- **Lead** — A qualified customer record captured during a conversation

---

*Document maintained by Taiwo (Ayomide). Last updated: April 2026.*
