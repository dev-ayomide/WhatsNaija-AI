# WhatsNaija AI 🇳🇬

> Transform any Nigerian small business's WhatsApp number into a 24/7 AI-powered sales and support team.

---

## 🎯 What Is This?

WhatsNaija AI is a complete, production-ready SaaS platform that lets Nigerian small business owners connect their WhatsApp Business number to an AI agent. The agent handles customer conversations autonomously — answering FAQs, qualifying leads, and managing bookings — in natural Nigerian English and Pidgin.

**Status**: ✅ MVP Complete & Ready for Pilot Testing

---

## ✨ Key Features

### For Business Owners
- 🤖 **24/7 AI Assistant** - Never miss a customer message again
- 💬 **Nigerian Voice** - Responds in Pidgin, casual, or formal Nigerian English
- 📊 **Beautiful Dashboard** - See all conversations, leads, and metrics
- 🎯 **Lead Qualification** - Automatically captures customer details
- 📅 **Booking Management** - Schedule appointments automatically
- 💰 **Payment Ready** - Paystack integration (coming soon)
- 🔄 **Human Takeover** - Jump in and reply manually anytime

### Technical Highlights
- ⚡ **Fast & Reliable** - Built on Next.js, FastAPI, and Supabase
- 🎨 **Beautiful Design** - Warm, Nigerian-inspired aesthetic
- 🔐 **Secure & Scalable** - Multi-tenant architecture with RLS
- 💸 **Cost-Efficient** - ~₦3,000-5,000 per business per month
- 🚀 **Easy to Deploy** - Railway + Vercel, < 30 minutes setup

---

## 🏗️ Architecture

```
┌─────────────────┐
│   Customer      │
│   WhatsApp      │
└────────┬────────┘
         │ Message
         ▼
┌─────────────────────────┐
│  WhatsApp Cloud API     │
│  (Meta)                 │
└────────┬────────────────┘
         │ Webhook
         ▼
┌─────────────────────────┐      ┌──────────────┐
│  Python Backend         │◄────►│  Claude AI   │
│  (FastAPI)              │      │  (Haiku)     │
└────────┬────────────────┘      └──────────────┘
         │
         ▼
┌─────────────────────────┐
│  Supabase Database      │
│  (PostgreSQL)           │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Next.js Dashboard      │
│  (React)                │
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Business Owner         │
│  (Web Browser)          │
└─────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Python 3.11+
- Supabase account (free)
- Meta Developer account
- Anthropic API key

### Setup (30 minutes)

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/whatsnaija-ai.git
   cd whatsnaija-ai
   ```

2. **Set up database**
   - Create Supabase project
   - Run `database/schema.sql`
   - Run `database/seed.sql`

3. **Configure backend**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your credentials
   pip install -r requirements.txt
   uvicorn main:app --reload --port 8000
   ```

4. **Configure frontend**
   ```bash
   cd frontend
   cp .env.local.example .env.local
   # Edit .env.local with Supabase credentials
   npm install
   npm run dev
   ```

5. **Connect WhatsApp**
   - Use ngrok to expose backend: `ngrok http 8000`
   - Configure webhook in Meta Developer Console
   - Send test message!

**Full guide**: See [QUICKSTART.md](QUICKSTART.md)

---

## 📂 Project Structure

```
whatsnaija-ai/
├── backend/              # Python FastAPI backend
│   ├── main.py           # App entry point
│   ├── agent.py          # AI agent logic (Claude)
│   ├── webhook.py        # WhatsApp webhook handler
│   ├── whatsapp.py       # WhatsApp API client
│   └── ...
│
├── frontend/             # Next.js dashboard
│   ├── app/
│   │   ├── (auth)/       # Login, register
│   │   └── dashboard/    # Main app pages
│   ├── components/       # Reusable UI components
│   └── lib/              # Utilities, API client
│
├── database/
│   ├── schema.sql        # PostgreSQL schema
│   └── seed.sql          # Test data
│
└── docs/
    ├── WHATSNAIJA_AI.md  # Complete specification
    ├── SETUP_GUIDE.md    # Detailed setup guide
    ├── QUICKSTART.md     # 30-minute quickstart
    └── PROJECT_STATUS.md # Current status & roadmap
```

---

## 🎨 Screenshots

### Dashboard Overview
Beautiful stats and recent activity at a glance.

### Conversations
View all customer chats, with AI and human messages clearly labeled.

### Leads
Track qualified leads with budget, timeline, and status.

### Settings
Edit products, FAQs, and policies — the bot uses this knowledge base.

---

## 🛠️ Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Frontend** | Next.js 16 + TypeScript | Fast, modern React framework |
| **Styling** | Tailwind CSS 4 | Rapid UI development, custom design system |
| **Backend** | Python + FastAPI | Fast, async, perfect for webhooks |
| **AI** | Claude Haiku (Anthropic) | Cost-efficient, handles Nigerian English well |
| **Database** | Supabase (PostgreSQL) | Real-time, auth, RLS built-in |
| **WhatsApp** | Meta Cloud API | Official WhatsApp API |
| **Payments** | Paystack | Nigerian payment standard |
| **Hosting** | Vercel + Railway | Free/cheap, auto-deploy |

---

## 💰 Pricing Model

### Cost per Business (Monthly)
- WhatsApp API: ~₦1,500 (free tier covers 1000 conversations)
- Claude Haiku: ~₦1,200 (moderate usage)
- Infrastructure: ~₦1,000 (shared hosting)
- **Total**: ~₦3,700/month per business

### Suggested Pricing
- **Starter**: ₦5,000/month (FAQ only, 500 conversations)
- **Growth**: ₦12,000/month (FAQ + payments + bookings, 2000 conversations)
- **Agency**: ₦30,000/month (Up to 10 businesses, white-label)

**Profit margin**: ~30-70% depending on tier

---

## 📊 What's Working (MVP Complete)

✅ **WhatsApp Integration**
- Receive and send messages
- Webhook handling
- Message history

✅ **AI Agent**
- Claude-powered responses
- Knowledge base integration
- Tone matching (Pidgin/formal/casual)
- Context awareness

✅ **Dashboard**
- Authentication (login/register)
- Real-time stats
- Conversation management
- Lead tracking
- Booking calendar
- Settings & knowledge base editor

✅ **Database**
- Multi-tenant architecture
- Row-level security
- Real-time updates

✅ **Documentation**
- Complete setup guides
- API documentation
- Deployment instructions

---

## 🚧 Roadmap (Post-MVP)

### Month 2
- [ ] Paystack payment link generation
- [ ] Payment tracking
- [ ] Booking availability system
- [ ] Analytics charts

### Month 3
- [ ] Voice message transcription
- [ ] Multi-language (Yoruba, Igbo, Hausa)
- [ ] Instagram DM support
- [ ] Broadcast messaging

### Month 4+
- [ ] Image recognition
- [ ] Inventory management
- [ ] White-label dashboard
- [ ] Agency features

---

## 🧪 Testing

### Manual Testing
✅ Complete for all features

### Automated Testing
- Backend: Unit tests needed
- Frontend: Component tests needed
- E2E: Playwright tests needed

**Recommended**:
```bash
# Backend
pytest backend/tests/

# Frontend
npm run test
npm run test:e2e
```

---

## 🚀 Deployment

### Backend → Railway
```bash
# Push to GitHub
git push

# In Railway dashboard:
# - Connect GitHub repo
# - Add environment variables
# - Deploy automatically
```

### Frontend → Vercel
```bash
# Push to GitHub
git push

# In Vercel dashboard:
# - Import GitHub repo
# - Add environment variables
# - Deploy automatically
```

**Full guide**: See [SETUP_GUIDE.md](SETUP_GUIDE.md)

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [WHATSNAIJA_AI.md](WHATSNAIJA_AI.md) | Complete technical specification |
| [QUICKSTART.md](QUICKSTART.md) | Get running in 30 minutes |
| [SETUP_GUIDE.md](SETUP_GUIDE.md) | Detailed step-by-step setup |
| [PROJECT_STATUS.md](PROJECT_STATUS.md) | Current status & what's next |
| [backend/README.md](backend/README.md) | Backend documentation |
| [frontend/README.md](frontend/README.md) | Frontend documentation |
| [frontend/SETUP.md](frontend/SETUP.md) | Frontend-specific setup |

---

## 🐛 Troubleshooting

### "No business found for phone_number_id"
- Check `WHATSAPP_PHONE_NUMBER_ID` in `.env` matches Meta's Phone Number ID
- Verify `phone_number_id` in `businesses` table matches

### "Failed to fetch" in dashboard
- Verify Supabase URL and anon key in `.env.local`
- Check Supabase project is active
- Open browser console for detailed errors

### Webhook not receiving messages
- Ensure ngrok is running and URL hasn't changed
- Verify webhook is subscribed to "messages" in Meta
- Check Meta webhook logs for delivery failures

**More troubleshooting**: See [SETUP_GUIDE.md](SETUP_GUIDE.md#troubleshooting)

---

## 🤝 Contributing

This project is currently in pilot phase. Contributions welcome after initial launch.

### Development Setup
```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt

# Frontend
cd frontend
npm install
```

---

## 📜 License

MIT License - see [LICENSE](LICENSE) for details

---

## 👥 Team

Built by Ayomide Taiwo (dev_ayomide) for Nigerian small businesses.

---

## 🙏 Acknowledgments

- **Anthropic** - Claude AI
- **Meta** - WhatsApp Cloud API
- **Supabase** - Database & Auth
- **Vercel** - Frontend hosting
- **Railway** - Backend hosting

---

## 📞 Support & Contact

- **Documentation**: Start with [QUICKSTART.md](QUICKSTART.md)
- **Issues**: Check troubleshooting sections
- **Questions**: Review the complete [WHATSNAIJA_AI.md](WHATSNAIJA_AI.md) spec

---

## 🎉 Success Stories

*Coming soon after pilot phase!*

---

**Built with ❤️ for Nigerian small businesses**

Made in Nigeria 🇳🇬
