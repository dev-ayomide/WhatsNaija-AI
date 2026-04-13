# 🔗 Webhook Setup Guide - Fix the Verification Error

Your backend is running perfectly! The issue is that Meta needs to reach it via the internet.

## ✅ What's Working:
- Backend server: ✅ Running on `http://localhost:8000`
- Health check: ✅ Working
- Webhook verification: ✅ Works locally
- All credentials: ✅ Filled in `.env`

## 🚀 Quick Fix - Choose ONE Option:

---

## Option 1: ngrok (Recommended - Most Reliable)

### Step 1: Download & Install ngrok
1. Go to: https://ngrok.com/download
2. Download for Windows
3. Extract the `ngrok.exe` file

### Step 2: (Optional) Sign up for free account
1. Go to: https://dashboard.ngrok.com/signup
2. Sign up (free tier is perfect)
3. Copy your auth token from: https://dashboard.ngrok.com/get-started/your-authtoken
4. Run in terminal: `ngrok config add-authtoken YOUR_TOKEN`

### Step 3: Start ngrok
```bash
ngrok http 8000
```

### Step 4: Copy the URL
You'll see output like this:
```
Session Status                online
Account                       Your Name (Plan: Free)
Version                       3.x.x
Region                        United States (us)
Latency                       -
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123xyz.ngrok-free.app -> http://localhost:8000

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

**Copy the HTTPS URL**: `https://abc123xyz.ngrok-free.app`

---

## Option 2: localtunnel (Quick, No Sign-up Needed)

```bash
# In a new terminal
npx localtunnel --port 8000
```

You'll see:
```
your url is: https://funny-koala-12.loca.lt
```

**Copy that URL!**

⚠️ **Note**: First time you visit a localtunnel URL, you need to click "Continue" on the landing page.

---

## Option 3: Cloudflare Tunnel (Advanced)

```bash
# Install cloudflared
# Then run:
cloudflared tunnel --url http://localhost:8000
```

---

## 📝 Configure Meta Webhook

Once you have your public URL from ANY option above:

### In Meta Developer Console:

1. Go to: https://developers.facebook.com/apps/
2. Select your app
3. Go to: **WhatsApp** → **Configuration** → **Webhook**
4. Click **"Edit"**

5. **Enter these values:**

   **Callback URL**:
   ```
   https://YOUR-TUNNEL-URL/webhook
   ```

   Examples:
   - ngrok: `https://abc123xyz.ngrok-free.app/webhook`
   - localtunnel: `https://funny-koala-12.loca.lt/webhook`

   ⚠️ **Important**: Don't forget the `/webhook` at the end!

   **Verify Token**:
   ```
   whatsnaijaai_secure_verify_token_2024
   ```

6. Click **"Verify and Save"**

7. You should see: ✅ **"Success! Your webhook is now subscribed to the app."**

8. Under **"Webhook fields"**, check: ☑️ **messages**

9. Click **"Subscribe"**

---

## 🧪 Test It!

### Test 1: Send a test message
Send a WhatsApp message to your Meta test number.

### Test 2: Check backend logs
You should see in your terminal:
```
INFO:     Received webhook payload: {...}
INFO:     Processing message from +234...
INFO:     Generating response with Groq...
INFO:     Response sent successfully!
```

### Test 3: Get a reply
Your WhatsApp should receive an AI-generated response!

---

## 🐛 Still Getting Errors?

### Error: "The callback URL or verify token couldn't be validated"

**Checklist:**
- [ ] Backend server is running (`http://localhost:8000/health` works?)
- [ ] Tunnel is running (ngrok/localtunnel/cloudflare)
- [ ] Callback URL includes `/webhook` at the end
- [ ] Callback URL uses HTTPS (not HTTP)
- [ ] Verify token matches exactly: `whatsnaijaai_secure_verify_token_2024`
- [ ] No extra spaces in the verify token

### Test your webhook URL manually:

Open this in your browser (replace with YOUR tunnel URL):
```
https://YOUR-TUNNEL-URL/webhook?hub.mode=subscribe&hub.challenge=test123&hub.verify_token=whatsnaijaai_secure_verify_token_2024
```

**Expected result**: You should see `test123` displayed in the browser.

If you see `test123`, your webhook is working! Try again in Meta.

### Still not working?

1. **Check backend logs** - Look for any error messages
2. **Restart everything**:
   ```bash
   # Stop backend (Ctrl+C)
   # Stop tunnel (Ctrl+C)
   # Start backend again:
   cd backend
   uvicorn main:app --reload --port 8000
   # Start tunnel again in new terminal
   ngrok http 8000
   ```

3. **Try a different tunnel service** - If ngrok doesn't work, try localtunnel or vice versa

---

## 💡 Pro Tips

1. **ngrok URLs change on free tier**: Every time you restart ngrok, you get a new URL. You'll need to update Meta's webhook config.

2. **Use a paid tunnel for production**: For production, deploy to Railway, Render, or Heroku for a permanent URL.

3. **Keep terminals open**:
   - Terminal 1: Backend server
   - Terminal 2: Tunnel (ngrok/localtunnel)

4. **Test locally first**: Always test `http://localhost:8000/webhook?hub.mode=subscribe&hub.challenge=test&hub.verify_token=whatsnaijaai_secure_verify_token_2024` before trying with Meta.

---

## ✅ Success Checklist

- [ ] Backend running on :8000
- [ ] Tunnel running (ngrok/localtunnel)
- [ ] Webhook URL in Meta includes `/webhook`
- [ ] Verify token matches exactly
- [ ] Meta shows "Webhook verified successfully"
- [ ] "messages" field is subscribed
- [ ] Test message sent and received response

---

## 🎉 You're Done!

Once the webhook is verified and subscribed, your WhatsApp AI bot is LIVE! 🚀

Send a message to your test number and watch the magic happen!
