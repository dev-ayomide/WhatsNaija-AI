# WhatsNaija AI - Setup Guide

Complete step-by-step guide to get your WhatsApp AI bot running.

---

## 📋 What We've Built So Far

✅ **Database Schema** - Complete PostgreSQL schema with all tables
✅ **Backend API** - FastAPI server with WhatsApp webhook and Claude AI agent
⬜ **Frontend Dashboard** - Next.js dashboard (coming next)

---

## 🚀 Setup Instructions

### Step 1: Set Up Supabase Database (10 minutes)

1. **Create Supabase Account**
   - Go to https://supabase.com
   - Sign up (free tier is fine for development)

2. **Create New Project**
   - Click "New Project"
   - Name: "WhatsNaija AI"
   - Database Password: (create a strong password - save it!)
   - Region: Choose closest to Nigeria (e.g., Frankfurt or Mumbai)
   - Wait 2-3 minutes for project to provision

3. **Run Database Schema**
   - In Supabase Dashboard, go to "SQL Editor"
   - Click "New Query"
   - Copy entire contents of `database/schema.sql`
   - Paste and click "Run"
   - You should see: "WhatsNaija AI database schema installed successfully!"

4. **Create a Test User**
   - Go to "Authentication" → "Users"
   - Click "Add user"
   - Email: your-email@example.com
   - Password: (create a test password)
   - Click "Create user"
   - **Copy the User UUID** (you'll need this next)

5. **Run Seed Data**
   - Go back to "SQL Editor"
   - Open `database/seed.sql`
   - **Find line 28**: `owner_id,` and replace `'YOUR_USER_ID_HERE'` with your User UUID from step 4
   - Run the script
   - You should see: "✅ Seed data installed successfully!"

6. **Get Supabase Credentials**
   - Go to "Project Settings" → "API"
   - Copy these values:
     - **Project URL** (e.g., https://xxx.supabase.co)
     - **Service Role Key** (the secret one, not anon)
   - Save these for Step 3

---

### Step 2: Set Up WhatsApp Cloud API (20 minutes)

1. **Create Meta Developer Account**
   - Go to https://developers.facebook.com/
   - Sign in with Facebook or create account

2. **Create an App**
   - Click "My Apps" → "Create App"
   - Use case: "Other"
   - App type: "Business"
   - App name: "WhatsNaija AI Test"
   - Click "Create App"

3. **Add WhatsApp Product**
   - In app dashboard, find "WhatsApp" product
   - Click "Set up"

4. **Get Test Phone Number**
   - Meta provides a free test number
   - In WhatsApp → "Getting Started"
   - You'll see a test number like `+1 555-0100`
   - **Add your personal WhatsApp number** as a recipient (click "Add phone number")
   - Verify your number with the code sent to your WhatsApp

5. **Get Credentials**
   You need 4 things:

   **a) Phone Number ID**
   - In WhatsApp → "Getting Started"
   - Look for "Phone number ID" under the test number
   - Copy this value (e.g., `123456789012345`)

   **b) Access Token (Temporary)**
   - On same page, copy the "Temporary access token"
   - ⚠️ This expires in 24 hours - we'll create a permanent one later

   **c) WABA ID**
   - In WhatsApp → "Getting Started"
   - Look for "WhatsApp Business Account ID"
   - Copy this value

   **d) Verify Token**
   - This is a string YOU create (random, secure)
   - Example: `whatsnaijaai_secure_verify_token_2024`
   - Save this - you'll use it in both your .env AND when configuring webhook

6. **Create Permanent Access Token** (Important!)
   - Go to WhatsApp → "Configuration" → "System Users"
   - Click "Add System Users"
   - Name: "WhatsNaija Bot", Role: "Admin"
   - Click "Generate New Token"
   - Select your app name
   - Permissions: Check "whatsapp_business_messaging" and "whatsapp_business_management"
   - Generate token
   - **Save this token immediately** - you can't see it again!
   - Replace the temporary token with this permanent one in your .env

---

### Step 3: Set Up Anthropic Claude API (5 minutes)

1. **Create Anthropic Account**
   - Go to https://console.anthropic.com/
   - Sign up (you'll get $5 free credit to start)

2. **Get API Key**
   - Go to "API Keys"
   - Click "Create Key"
   - Name: "WhatsNaija AI"
   - Copy the key (starts with `sk-ant-...`)
   - Save this for your .env

---

### Step 4: Configure Backend (5 minutes)

1. **Navigate to Backend**
   ```bash
   cd "C:/Users/Ayo/WhatsNaija AI/backend"
   ```

2. **Create .env File**
   ```bash
   # Copy the example
   cp .env.example .env
   ```

3. **Edit .env File**
   Open `.env` in your text editor and fill in all values:

   ```env
   # WhatsApp Cloud API
   WHATSAPP_PHONE_NUMBER_ID=123456789012345  # From Step 2.5.a
   WHATSAPP_ACCESS_TOKEN=EAAxxxxxxx          # From Step 2.6 (permanent token)
   WHATSAPP_VERIFY_TOKEN=whatsnaijaai_secure_verify_token_2024  # From Step 2.5.d
   WABA_ID=123456789012345                   # From Step 2.5.c

   # Anthropic Claude API
   ANTHROPIC_API_KEY=sk-ant-xxxxx            # From Step 3.2

   # Supabase
   SUPABASE_URL=https://xxx.supabase.co      # From Step 1.6
   SUPABASE_SERVICE_ROLE_KEY=eyJxxx          # From Step 1.6

   # Application
   APP_ENV=development
   BASE_URL=http://localhost:8000
   ```

4. **Install Python Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

5. **Start the Server**
   ```bash
   uvicorn main:app --reload --port 8000
   ```

   You should see:
   ```
   ============================================================
   WhatsNaija AI Backend Starting...
   ============================================================
   ✅ All required environment variables present
   🚀 Backend is ready!
   ```

6. **Test Health Endpoint**
   Open another terminal:
   ```bash
   curl http://localhost:8000/health
   ```

   Should return:
   ```json
   {"status":"healthy","environment":"development",...}
   ```

---

### Step 5: Connect WhatsApp Webhook (10 minutes)

1. **Install ngrok** (for local testing)
   - Go to https://ngrok.com/download
   - Download and install
   - Sign up for free account
   - Run authentication: `ngrok config add-authtoken YOUR_TOKEN`

2. **Start ngrok**
   ```bash
   ngrok http 8000
   ```

   You'll see output like:
   ```
   Forwarding   https://abc123xyz.ngrok.io -> http://localhost:8000
   ```

   **Copy the HTTPS URL** (e.g., `https://abc123xyz.ngrok.io`)

3. **Configure Webhook in Meta**
   - Go to Meta Developer Console → Your App
   - WhatsApp → Configuration → Webhook
   - Click "Edit"

   **Callback URL**: `https://abc123xyz.ngrok.io/webhook`
   **Verify Token**: `whatsnaijaai_secure_verify_token_2024` (your verify token from .env)

   Click "Verify and Save"

   You should see: ✅ "Webhook verified successfully"

4. **Subscribe to Webhook Events**
   - In same page, under "Webhook fields"
   - Check "messages"
   - Click "Subscribe"

---

### Step 6: Test End-to-End! 🎉

1. **Send a Test Message**
   - Open WhatsApp on your phone
   - Send a message to the Meta test number (e.g., `+1 555-0100`)
   - Message: `"Hi, do you have ankara dresses?"`

2. **Check Backend Logs**
   You should see:
   ```
   Received webhook payload: {...}
   Processing message from +234...
   Message is for business: Amara's Boutique
   Generating response for conversation...
   Response sent successfully to +234...
   ```

3. **Check WhatsApp**
   You should receive a reply from the bot! Something like:
   ```
   Hello! Welcome to Amara's Boutique! 👗 Yes, we have beautiful
   ankara maxi dresses in blue, wine, and olive green. Each is
   ₦15,000. Which color catches your eye?
   ```

4. **Check Supabase**
   - Go to Supabase Dashboard → Table Editor
   - Open "messages" table
   - You should see 2 rows: your message (role: customer) and bot reply (role: bot)

5. **Continue the Conversation**
   - Reply: `"The blue one sounds nice. How much again?"`
   - Bot should respond with price and details
   - All messages logged to database

---

## ✅ Success Checklist

- [x] Supabase project created with schema + test data
- [x] WhatsApp test number configured
- [x] Claude API key obtained
- [x] Backend running locally on :8000
- [x] ngrok exposing webhook publicly
- [x] Meta webhook verified and subscribed
- [x] Test message sent and bot replied
- [x] Messages logged to Supabase

---

## 🎯 What You Have Now

A working WhatsApp AI bot that:
- ✅ Receives WhatsApp messages via webhook
- ✅ Loads business knowledge from database
- ✅ Generates contextual responses using Claude Haiku
- ✅ Responds in Nigerian English/Pidgin (tone matching)
- ✅ Answers FAQs about products, shipping, pricing
- ✅ Logs all conversations to database
- ✅ Multi-tenant (can handle multiple businesses)

---

## 🚧 What's Next

Now that the backend works, we'll build:

1. **Frontend Dashboard** (Next.js)
   - View all conversations
   - See captured leads
   - Edit knowledge base (products, FAQs)
   - Take over conversations (human handoff)

2. **Paystack Integration**
   - Generate payment links
   - Track payments

3. **Booking System**
   - Check availability
   - Confirm appointments

---

## 🐛 Troubleshooting

### Backend won't start
**Error**: `ModuleNotFoundError: No module named 'fastapi'`
**Fix**: Run `pip install -r requirements.txt`

### Webhook verification fails
**Error**: "Verification failed" in Meta dashboard
**Fix**: Make sure `WHATSAPP_VERIFY_TOKEN` in .env matches exactly what you entered in Meta

### No business found for phone_number_id
**Error**: Backend logs show this error
**Fix**:
1. Check that `WHATSAPP_PHONE_NUMBER_ID` in .env matches Meta's Phone Number ID
2. Update seed.sql line with correct phone_number_id
3. Re-run seed.sql in Supabase

### Bot doesn't respond to messages
**Fix**:
1. Check backend logs for errors
2. Verify ngrok is still running (URLs expire after 2 hours on free tier)
3. Check that webhook is subscribed to "messages" in Meta dashboard
4. Verify Claude API key is valid

---

## 📞 Support

If you get stuck:
1. Check backend logs for detailed error messages
2. Review the troubleshooting section in `backend/README.md`
3. Verify all environment variables are correct
4. Make sure all services (Supabase, ngrok, backend) are running

---

## 🎉 You're Ready!

Your WhatsApp AI bot is now live and responding to customer messages. Next, we'll build the dashboard so you can visualize and manage conversations.

**Want to continue building? Just say:** "Build the frontend dashboard"
