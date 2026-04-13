# ✅ Migration from Anthropic to Groq - COMPLETE

I've successfully migrated your WhatsNaija AI bot from Anthropic Claude to Groq!

---

## 🎯 What Changed

### 1. **Dependencies** (`backend/requirements.txt`)
- ❌ Removed: `anthropic==0.18.1`
- ✅ Added: `groq==0.4.2`

### 2. **Configuration** (`backend/config.py`)
- ❌ Removed: `ANTHROPIC_API_KEY`
- ✅ Added: `GROQ_API_KEY`

### 3. **AI Agent** (`backend/agent.py`)
- Changed from Claude Haiku 4 to **Llama 3.3 70B Versatile**
- Updated API calls to use Groq's format
- Model: `llama-3.3-70b-versatile` (fast, powerful, and cost-effective)

### 4. **Environment Files**
- Updated `.env.example` with Groq API key placeholder
- Created `.env` with your verify token pre-filled

---

## 📝 What You Need to Do Now

### Step 1: Get Your Groq API Key (2 minutes)

1. **Go to Groq Console**: https://console.groq.com/
2. **Sign up** (it's free with generous limits!)
3. **Create API Key**:
   - Go to "API Keys" section
   - Click "Create API Key"
   - Name it: "WhatsNaija AI"
   - Copy the key (starts with `gsk_...`)
4. **Save it** - you'll need it next

### Step 2: Fill in Your `.env` File

Open `backend/.env` and fill in these values:

```env
# WhatsApp Cloud API (from Meta Developer Console)
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here
WHATSAPP_ACCESS_TOKEN=your_access_token_here
WHATSAPP_VERIFY_TOKEN=whatsnaijaai_secure_verify_token_2024  # ✅ Already filled!
WABA_ID=your_waba_id_here

# Groq API (from console.groq.com)
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxx  # ⬅️ PASTE YOUR GROQ KEY HERE

# Supabase (from Supabase Dashboard)
SUPABASE_URL=https://yourproject.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Step 3: Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### Step 4: Start the Server

```bash
uvicorn main:app --reload --port 8000
```

---

## 🔗 CALLBACK URL - Your Question Answered!

### What is the Callback URL?

The **callback URL** is the public endpoint where Meta (WhatsApp) will send incoming messages to your bot.

### For Local Development (using ngrok):

1. **Start your backend server:**
   ```bash
   cd backend
   uvicorn main:app --reload --port 8000
   ```

2. **Start ngrok in a separate terminal:**
   ```bash
   ngrok http 8000
   ```

3. **ngrok will give you a URL like this:**
   ```
   Forwarding   https://abc123xyz.ngrok.io -> http://localhost:8000
   ```

4. **Your Callback URL is:**
   ```
   https://abc123xyz.ngrok.io/webhook
   ```
   ☝️ Notice the `/webhook` at the end!

### Setting Up the Webhook in Meta:

1. Go to **Meta Developer Console** → Your App
2. Navigate to **WhatsApp** → **Configuration** → **Webhook**
3. Click **"Edit"**

4. **Enter these values:**
   - **Callback URL**: `https://abc123xyz.ngrok.io/webhook`
   - **Verify Token**: `whatsnaijaai_secure_verify_token_2024`

5. Click **"Verify and Save"**
   - If successful: ✅ "Webhook verified successfully"
   - If it fails: Check that your backend server is running and ngrok is forwarding correctly

6. **Subscribe to webhook events:**
   - Check the box for **"messages"**
   - Click **"Subscribe"**

### For Production (using Railway, Render, etc.):

When you deploy to production:

1. **Deploy your backend to a service like Railway**
2. **You'll get a permanent URL like:**
   ```
   https://whatsnaijaai-production.up.railway.app
   ```

3. **Your Callback URL will be:**
   ```
   https://whatsnaijaai-production.up.railway.app/webhook
   ```

4. **Update the webhook in Meta** with this production URL
5. **Update `BASE_URL` in `.env`** to match your production URL

---

## 🚀 Why Groq is Better for You

### 1. **Cost-Effective**
- Groq is FREE for development (generous limits)
- Much cheaper than Anthropic for production

### 2. **Faster**
- Groq is optimized for speed
- Average response time: 0.5-1 second
- Great for real-time WhatsApp conversations

### 3. **Powerful Model**
- Llama 3.3 70B is comparable to Claude Haiku
- Excellent for conversational AI
- Supports Nigerian English and Pidgin well

### 4. **Simple Integration**
- OpenAI-compatible API format
- Easy to switch between models if needed

---

## 🧪 Testing Your Setup

### 1. Test the health endpoint:
```bash
curl http://localhost:8000/health
```

Should return:
```json
{"status":"healthy","environment":"development",...}
```

### 2. Test the webhook verification:
Once ngrok is running, Meta will ping your webhook endpoint to verify it. Check your backend logs for:
```
GET /webhook - Webhook verified successfully
```

### 3. Send a test WhatsApp message:
Send a message to your Meta test number. You should see in logs:
```
Processing message from +234...
Generating response with Groq...
Response sent successfully!
```

---

## 📊 Model Information

**Current Model**: `llama-3.3-70b-versatile`

### Available Groq Models (you can switch anytime):

| Model | Best For | Speed |
|-------|----------|-------|
| `llama-3.3-70b-versatile` | General tasks, conversations | ⚡⚡⚡ Fast |
| `llama-3.1-70b-versatile` | Complex reasoning | ⚡⚡ Moderate |
| `mixtral-8x7b-32768` | Long context (32K tokens) | ⚡⚡ Moderate |
| `gemma2-9b-it` | Very fast, lightweight | ⚡⚡⚡⚡ Super Fast |

To switch models, just change this line in `backend/agent.py`:
```python
model="llama-3.3-70b-versatile",  # Change this to any model above
```

---

## 🐛 Troubleshooting

### "ModuleNotFoundError: No module named 'groq'"
**Fix**: Run `pip install -r requirements.txt`

### "Groq API error: Invalid API Key"
**Fix**: Make sure you copied the full API key from Groq console (starts with `gsk_`)

### Webhook verification fails
**Fix**:
1. Make sure backend server is running on port 8000
2. Make sure ngrok is forwarding to port 8000
3. Verify that `WHATSAPP_VERIFY_TOKEN` in `.env` matches what you entered in Meta
4. Check that ngrok URL hasn't expired (free tier URLs change when you restart)

### Bot responds slowly
**Try**: Switch to `gemma2-9b-it` for faster responses (good quality, much faster)

---

## ✅ Quick Checklist

- [ ] Got Groq API key from console.groq.com
- [ ] Filled in `GROQ_API_KEY` in `backend/.env`
- [ ] Filled in WhatsApp credentials in `.env`
- [ ] Filled in Supabase credentials in `.env`
- [ ] Installed dependencies: `pip install -r requirements.txt`
- [ ] Started backend server: `uvicorn main:app --reload --port 8000`
- [ ] Started ngrok: `ngrok http 8000`
- [ ] Set callback URL in Meta: `https://YOUR-NGROK-URL.ngrok.io/webhook`
- [ ] Set verify token in Meta: `whatsnaijaai_secure_verify_token_2024`
- [ ] Subscribed to "messages" webhook event
- [ ] Sent test WhatsApp message

---

## 🎉 You're All Set!

Your WhatsNaija AI bot is now powered by Groq's fast and cost-effective infrastructure. Enjoy the improved speed and lower costs!

**Next Steps**: Follow the SETUP_GUIDE.md to complete the full setup with WhatsApp, Supabase, and testing.

---

## 📞 Need Help?

Check the main SETUP_GUIDE.md for detailed setup instructions, or refer to:
- Groq Documentation: https://console.groq.com/docs
- WhatsApp Cloud API Docs: https://developers.facebook.com/docs/whatsapp
