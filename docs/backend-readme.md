# WhatsNaija AI Backend

Python FastAPI backend that powers the WhatsApp AI agent.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Set Up Environment Variables

```bash
# Copy the example file
cp .env.example .env

# Edit .env with your actual credentials
```

Required credentials:
- **WhatsApp Cloud API**: Get from [Meta Developer Console](https://developers.facebook.com/)
- **Anthropic API Key**: Get from [Anthropic Console](https://console.anthropic.com/)
- **Supabase**: Get from your [Supabase Dashboard](https://supabase.com/dashboard)

### 3. Set Up Database

1. Create a Supabase project
2. Run `database/schema.sql` in Supabase SQL Editor
3. Run `database/seed.sql` to create test data
4. Update the `owner_id` in seed.sql with your Supabase user ID

### 4. Run the Server

```bash
# Development mode (with auto-reload)
uvicorn main:app --reload --port 8000

# Production mode
uvicorn main:app --host 0.0.0.0 --port 8000
```

The server will start at `http://localhost:8000`

### 5. Test the Server

```bash
# Check if server is running
curl http://localhost:8000/health

# Should return:
# {"status": "healthy", "environment": "development", ...}
```

## 🔗 Connect WhatsApp Webhook

### For Local Development (using ngrok)

1. **Install ngrok**: https://ngrok.com/download

2. **Start your backend**:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

3. **Expose with ngrok**:
   ```bash
   ngrok http 8000
   ```

4. **Copy the HTTPS URL** (e.g., `https://abc123.ngrok.io`)

5. **Configure in Meta Developer Console**:
   - Go to WhatsApp → Configuration → Webhook
   - Callback URL: `https://abc123.ngrok.io/webhook`
   - Verify Token: (use the value from your .env `WHATSAPP_VERIFY_TOKEN`)
   - Subscribe to: `messages`

6. **Test**: Send a message to your WhatsApp test number and check the logs!

## 📁 Project Structure

```
backend/
├── main.py              # FastAPI app entry point
├── config.py            # Environment configuration
├── models.py            # Pydantic data models
├── database.py          # Supabase client + CRUD operations
├── webhook.py           # WhatsApp webhook handlers
├── whatsapp.py          # WhatsApp Cloud API client
├── knowledge.py         # Knowledge base formatting
├── agent.py             # AI agent core logic (Claude)
├── requirements.txt     # Python dependencies
├── .env.example         # Environment variables template
└── README.md           # This file
```

## 🧪 Testing

### Test the Webhook Verification (GET)

```bash
curl "http://localhost:8000/webhook?hub.mode=subscribe&hub.challenge=test123&hub.verify_token=YOUR_VERIFY_TOKEN"

# Should return: test123
```

### Test Message Flow

1. Send a WhatsApp message to your test number
2. Check backend logs - you should see:
   ```
   Received webhook payload: {...}
   Processing message from +234...
   Generating response for conversation...
   Response sent successfully
   ```
3. Customer receives bot reply on WhatsApp
4. Check Supabase - message should be in `messages` table

## 🐛 Troubleshooting

### "No business found for phone_number_id"

**Problem**: Backend received a message but can't find matching business.

**Solution**:
1. Check that `phone_number_id` in your `.env` matches the one in Meta dashboard
2. Make sure you ran `seed.sql` and updated the `phone_number_id` in businesses table
3. Query Supabase: `SELECT * FROM businesses WHERE phone_number_id = 'YOUR_ID'`

### "Anthropic API error: 401"

**Problem**: Invalid Claude API key.

**Solution**:
1. Get a new API key from https://console.anthropic.com/
2. Update `ANTHROPIC_API_KEY` in `.env`
3. Restart the server

### "Failed to send message"

**Problem**: WhatsApp API call failed.

**Solution**:
1. Check that `WHATSAPP_ACCESS_TOKEN` is valid (not expired)
2. Check that `WHATSAPP_PHONE_NUMBER_ID` is correct
3. Check WhatsApp API logs in Meta Developer Console
4. Verify recipient phone number format: `+2348012345678` (with country code, no spaces)

### Webhook not receiving messages

**Problem**: Meta isn't sending webhooks to your server.

**Solution**:
1. Verify webhook is configured correctly in Meta dashboard
2. If using ngrok, make sure it's still running (ngrok URLs expire after 2 hours on free tier)
3. Check that your server is publicly accessible
4. Look at Meta's webhook logs in Developer Console → WhatsApp → Webhook Fields

## 🚢 Deployment

### Deploy to Railway

1. **Push code to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_GITHUB_REPO
   git push -u origin main
   ```

2. **Create Railway project**:
   - Go to https://railway.app
   - New Project → Deploy from GitHub
   - Select your repository

3. **Set environment variables** in Railway dashboard:
   - Add all variables from `.env`
   - Don't commit `.env` to git!

4. **Deploy**: Railway auto-detects Python and deploys

5. **Update WhatsApp webhook URL**:
   - Copy your Railway URL (e.g., `https://yourapp.railway.app`)
   - Update in Meta Developer Console
   - Callback URL: `https://yourapp.railway.app/webhook`

6. **Test**: Send a WhatsApp message and verify it works!

## 📊 Monitoring

### View Logs

**Local**:
- Logs appear in terminal where you ran `uvicorn`

**Railway**:
- View logs in Railway dashboard → Deployments → Logs

### Check Database

**Supabase Dashboard**:
- Table Editor → View all tables
- SQL Editor → Run queries
- Example: `SELECT * FROM messages ORDER BY sent_at DESC LIMIT 10`

## 🔐 Security Notes

1. **Never commit `.env` to git** - add it to `.gitignore`
2. **Rotate tokens** if accidentally exposed
3. **Use HTTPS** in production (Railway provides this automatically)
4. **Verify webhook signatures** (future enhancement)
5. **Rate limiting** (add in production)

## 📚 Next Steps

- [ ] Test with real Nigerian customers
- [ ] Add Paystack payment link generation
- [ ] Implement booking system
- [ ] Add human handoff notifications
- [ ] Implement conversation analytics
- [ ] Add rate limiting
- [ ] Add webhook signature verification

## 🆘 Need Help?

Check the main project documentation: `../docs/WHATSNAIJA_AI.md`

---

**Built with ❤️ for Nigerian small businesses**
