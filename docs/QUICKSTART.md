# WhatsNaija AI - Complete Quickstart Guide

Get your WhatsApp AI bot up and running in 30 minutes.

## 🎯 What You'll Build

A complete WhatsApp AI assistant that:
- Answers customer questions 24/7
- Qualifies leads automatically
- Manages conversations in Nigerian English/Pidgin
- Has a beautiful dashboard to monitor everything

---

## ✅ Prerequisites Checklist

Before you start, make sure you have:

- [ ] **Node.js 20+** installed ([download](https://nodejs.org/))
- [ ] **Python 3.11+** installed ([download](https://python.org/))
- [ ] **Git** installed ([download](https://git-scm.com/))
- [ ] A **Supabase account** (free tier: [supabase.com](https://supabase.com))
- [ ] A **Meta Developer account** ([developers.facebook.com](https://developers.facebook.com/))
- [ ] An **Anthropic API key** ([console.anthropic.com](https://console.anthropic.com/))

---

## 🚀 Setup Steps

### Part 1: Database (10 minutes)

1. **Create Supabase Project**
   - Go to [supabase.com/dashboard](https://supabase.com/dashboard)
   - Click "New Project"
   - Name: "WhatsNaija AI"
   - Set a database password (save it!)
   - Choose region closest to Nigeria
   - Wait for provisioning (2-3 minutes)

2. **Run Database Schema**
   - Open Supabase → SQL Editor
   - Click "New Query"
   - Copy contents of `database/schema.sql`
   - Paste and click "Run"
   - Should see: "✅ Schema installed successfully"

3. **Create Test User**
   - Go to Authentication → Users
   - Click "Add user"
   - Email: `test@example.com`
   - Password: `testpassword123`
   - **Copy the User UUID** (you'll need it next)

4. **Seed Test Data**
   - Go back to SQL Editor
   - Open `database/seed.sql`
   - Replace `'YOUR_USER_ID_HERE'` on line 28 with your User UUID
   - Run the script
   - Should see: "✅ Seed data installed"

5. **Get Supabase Credentials**
   - Go to Project Settings → API
   - Copy:
     - **Project URL**
     - **Service Role Key** (secret one)

---

### Part 2: WhatsApp Setup (15 minutes)

1. **Create Meta App**
   - Go to [developers.facebook.com](https://developers.facebook.com/)
   - My Apps → Create App
   - Use case: "Other"
   - Type: "Business"
   - Name: "WhatsNaija AI Test"
   - Create App

2. **Add WhatsApp Product**
   - Find "WhatsApp" in products list
   - Click "Set up"

3. **Get Test Number**
   - WhatsApp → Getting Started
   - Meta provides a free test number
   - Add your personal WhatsApp number as recipient
   - Verify with code sent to your WhatsApp

4. **Collect Credentials**
   You need 4 values:

   **Phone Number ID**:
   - Under test number in "Getting Started"
   - Copy the "Phone number ID"

   **Temporary Access Token**:
   - Copy "Temporary access token"
   - (We'll replace this with permanent one later)

   **WABA ID**:
   - Copy "WhatsApp Business Account ID"

   **Verify Token**:
   - Create your own secure string
   - Example: `whatsnaijaai_verify_2024`
   - You'll use this in webhook setup

5. **Create Permanent Token**
   - WhatsApp → Configuration → System Users
   - Add System Users
   - Name: "WhatsNaija Bot", Role: "Admin"
   - Generate New Token
   - Select app name
   - Permissions: Check "whatsapp_business_messaging" and "whatsapp_business_management"
   - **Save this token immediately!**

---

### Part 3: Anthropic API (2 minutes)

1. Go to [console.anthropic.com](https://console.anthropic.com/)
2. Sign up (get $5 free credit)
3. API Keys → Create Key
4. Name: "WhatsNaija AI"
5. Copy the key (starts with `sk-ant-...`)

---

### Part 4: Backend (5 minutes)

1. **Navigate to Backend**
   ```bash
   cd backend
   ```

2. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Create `.env` File**
   ```bash
   cp .env.example .env
   ```

4. **Edit `.env`**
   Open `.env` and fill in all your credentials:

   ```env
   # WhatsApp
   WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
   WHATSAPP_ACCESS_TOKEN=your_permanent_token
   WHATSAPP_VERIFY_TOKEN=whatsnaijaai_verify_2024
   WABA_ID=your_waba_id

   # Claude
   ANTHROPIC_API_KEY=sk-ant-xxxxx

   # Supabase
   SUPABASE_URL=https://xxx.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=xxxxx

   # App
   APP_ENV=development
   BASE_URL=http://localhost:8000
   ```

5. **Start Backend**
   ```bash
   uvicorn main:app --reload --port 8000
   ```

   You should see:
   ```
   ✅ All required environment variables present
   🚀 Backend is ready!
   ```

---

### Part 5: Frontend (5 minutes)

**Open a new terminal** (keep backend running!)

1. **Navigate to Frontend**
   ```bash
   cd frontend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Create `.env.local`**
   ```bash
   cp .env.local.example .env.local
   ```

4. **Edit `.env.local`**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

5. **Start Frontend**
   ```bash
   npm run dev
   ```

6. **Open Dashboard**
   - Go to [http://localhost:3000](http://localhost:3000)
   - Login with test user: `test@example.com` / `testpassword123`
   - You should see the dashboard!

---

### Part 6: Connect Webhook (5 minutes)

**Open a third terminal** (keep backend and frontend running!)

1. **Install ngrok**
   - Download from [ngrok.com/download](https://ngrok.com/download)
   - Sign up for free account
   - Run: `ngrok config add-authtoken YOUR_TOKEN`

2. **Expose Backend**
   ```bash
   ngrok http 8000
   ```

   Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)

3. **Configure Webhook in Meta**
   - Go to Meta Developer Console → WhatsApp → Configuration
   - Click "Edit" on Webhook
   - Callback URL: `https://abc123.ngrok.io/webhook`
   - Verify Token: `whatsnaijaai_verify_2024` (your verify token)
   - Click "Verify and Save"
   - Should see: ✅ "Webhook verified"

4. **Subscribe to Messages**
   - Under "Webhook fields"
   - Check "messages"
   - Click "Subscribe"

---

## 🎉 Test It Out!

Everything should now be connected. Let's test:

1. **Send WhatsApp Message**
   - Open WhatsApp on your phone
   - Send message to Meta's test number (e.g., `+1 555-0100`)
   - Message: `"Hi, do you have ankara dresses?"`

2. **Check Backend Logs**
   In your backend terminal, you should see:
   ```
   Received webhook payload: {...}
   Processing message from +234...
   Generating response...
   Response sent successfully
   ```

3. **Check WhatsApp**
   You should receive a reply like:
   ```
   Hello! Welcome to Amara's Boutique! 👗
   Yes, we have beautiful ankara maxi dresses in
   blue, wine, and olive green. Each is ₦15,000.
   Which color catches your eye?
   ```

4. **Check Dashboard**
   - Refresh [http://localhost:3000/dashboard/conversations](http://localhost:3000/dashboard/conversations)
   - You should see your conversation!
   - Click it to view message history

5. **Continue Conversation**
   - Reply: `"How much is the blue one?"`
   - Bot responds with price
   - All messages appear in dashboard in real-time

---

## ✅ Success Checklist

If everything works, you should have:

- [x] Backend running on :8000
- [x] Frontend running on :3000
- [x] ngrok exposing webhook
- [x] WhatsApp messages → Backend → Claude AI → Response
- [x] Conversations visible in dashboard
- [x] Can send manual replies from dashboard
- [x] Messages logged to Supabase

---

## 🎯 What's Next?

Now that everything works:

### Customize Your Bot

1. **Update Business Info**
   - Dashboard → Settings
   - Change business name, products, FAQs
   - Adjust tone preference (formal/casual/pidgin)
   - Click "Save Changes"

2. **Test Knowledge Base**
   - Add products with prices
   - Add FAQs
   - Send WhatsApp messages asking about them
   - Bot should use your new data!

### Deploy to Production

1. **Backend**: Deploy to Railway (see `backend/README.md`)
2. **Frontend**: Deploy to Vercel (see `frontend/README.md`)
3. **Update Webhook**: Point Meta webhook to Railway URL
4. **Get Real WhatsApp Number**: Partner with Nigerian BSP

### Add More Features

- Paystack integration for payments
- Booking system
- Lead analytics
- Multiple language support

---

## 🐛 Troubleshooting

### Backend won't start
- Check `.env` has all required variables
- Run `pip install -r requirements.txt` again

### Webhook verification fails
- Verify token in `.env` matches Meta exactly
- Make sure ngrok is running
- Check backend logs for errors

### No response from bot
- Check backend logs for errors
- Verify Claude API key is valid
- Check Supabase has business and knowledge_base data
- Make sure webhook is subscribed to "messages"

### Dashboard empty
- Verify Supabase credentials in `.env.local`
- Check you ran seed.sql with correct owner_id
- Open browser console for errors

---

## 📚 Documentation

- **Full Project Spec**: `WHATSNAIJA_AI.md`
- **Setup Guide**: `SETUP_GUIDE.md`
- **Backend Docs**: `backend/README.md`
- **Frontend Docs**: `frontend/README.md` & `frontend/SETUP.md`

---

## 🆘 Need Help?

1. Check error messages in terminal
2. Review the troubleshooting sections
3. Verify all credentials are correct
4. Make sure all services are running

---

**🎊 Congratulations!** You now have a working WhatsApp AI bot for Nigerian small businesses!

**Built with ❤️ in Nigeria**
