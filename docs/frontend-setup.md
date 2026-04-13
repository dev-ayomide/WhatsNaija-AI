# WhatsNaija AI Frontend - Complete Setup Guide

This guide will walk you through setting up the frontend dashboard from scratch.

## Prerequisites

- Node.js 20+ installed
- npm or yarn
- A Supabase account (free tier works)
- The backend is set up and running (see `../backend/README.md`)

---

## Step 1: Install Dependencies (2 minutes)

```bash
cd frontend
npm install
```

This installs:
- Next.js 16 (React framework)
- Tailwind CSS 4 (styling)
- Supabase client (database & auth)
- Lucide React (icons)
- date-fns (date formatting)

---

## Step 2: Configure Environment Variables (3 minutes)

### Create `.env.local` file

```bash
cp .env.local.example .env.local
```

### Get Supabase Credentials

1. Go to your Supabase project dashboard
2. Click "Project Settings" → "API"
3. Copy these values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Anon/Public Key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Configure Backend URL

If your backend is running locally:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

If deployed to Railway:
```env
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
```

Your `.env.local` should look like:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Step 3: Run Development Server (1 minute)

```bash
npm run dev
```

The dashboard will be available at **http://localhost:3000**

You should see the login page with the WhatsNaija AI branding.

---

## Step 4: Test Authentication (2 minutes)

### Option A: Use Existing Test User

If you ran the database seed script (`database/seed.sql`), you can login with the test user you created.

### Option B: Create New Account

1. Click "Sign up" on the login page
2. Fill in:
   - Business name (e.g., "Amara's Boutique")
   - Email
   - Password
3. Click "Create account"

You'll be redirected to the dashboard automatically.

---

## Step 5: Verify Dashboard Features

Once logged in, you should see:

### ✅ Dashboard Overview (`/dashboard`)
- Stats cards showing conversations, leads, and payments
- Recent activity feed
- Bot status indicator

### ✅ Conversations (`/dashboard/conversations`)
- List of all WhatsApp conversations
- Click any conversation to view message history
- Send manual replies (human takeover)
- Status badges (bot/human/closed)

### ✅ Leads (`/dashboard/leads`)
- Table of captured leads
- Filter by status (new/contacted/converted/lost)
- Update lead status with dropdown

### ✅ Bookings (`/dashboard/bookings`)
- Grid view of appointments
- Confirm or cancel bookings
- Customer details for each booking

### ✅ Settings (`/dashboard/settings`)
- Edit business name and tone preference
- Add/edit products with prices
- Add/edit FAQs
- Add/edit policies
- Save button persists changes to database

---

## Troubleshooting

### "Failed to fetch" errors

**Problem**: Dashboard can't connect to Supabase

**Solution**:
1. Check `.env.local` has correct Supabase URL and key
2. Verify Supabase project is active (not paused)
3. Check browser console for detailed error messages

### No data showing in dashboard

**Problem**: Dashboard loads but shows empty states

**Solution**:
1. Make sure you ran `database/seed.sql` in Supabase
2. Verify the `businesses` table has a record with your user's `owner_id`
3. Check Supabase → Table Editor to confirm data exists

### Authentication not working

**Problem**: Can't login or register

**Solution**:
1. Check Supabase → Authentication → Settings
2. Ensure email confirmations are disabled for development
3. Check if user was created in Authentication → Users table
4. Look at browser console for auth errors

### Styles not loading

**Problem**: Dashboard looks broken, no colors

**Solution**:
1. Make sure Tailwind CSS installed: `npm install`
2. Check `globals.css` imports Tailwind correctly
3. Restart dev server: Stop (Ctrl+C) and `npm run dev` again

### Hot reload not working

**Problem**: Changes don't appear without manual refresh

**Solution**:
1. Restart the dev server
2. Clear browser cache (Ctrl+Shift+R)
3. Check terminal for compilation errors

---

## File Structure

```
frontend/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx         # Login page
│   │   ├── register/page.tsx      # Registration page
│   │   └── layout.tsx             # Auth layout
│   ├── dashboard/
│   │   ├── conversations/         # Conversations & chat
│   │   ├── leads/                 # Leads management
│   │   ├── bookings/              # Appointments
│   │   ├── settings/              # Knowledge base editor
│   │   ├── layout.tsx             # Dashboard layout (sidebar)
│   │   └── page.tsx               # Overview/home
│   ├── globals.css                # Global styles
│   ├── layout.tsx                 # Root layout
│   └── page.tsx                   # Landing page (→ login)
│
├── components/
│   ├── Button.tsx                 # Primary button component
│   ├── Input.tsx                  # Form input component
│   ├── LoadingSpinner.tsx         # Loading indicator
│   ├── EmptyState.tsx             # Empty state component
│   ├── StatCard.tsx               # Dashboard stat card
│   └── index.ts                   # Component exports
│
├── lib/
│   ├── supabase.ts                # Supabase client & types
│   ├── api.ts                     # Backend API client
│   └── utils.ts                   # Helper functions
│
├── .env.local.example             # Environment variables template
├── .env.local                     # Your actual env vars (don't commit!)
├── .gitignore                     # Git ignore file
├── middleware.ts                  # Route protection
├── next.config.ts                 # Next.js configuration
├── tailwind.config.ts             # Tailwind theme
├── package.json                   # Dependencies
└── README.md                      # Documentation
```

---

## Design System

### Colors

The dashboard uses a warm, Nigerian-inspired palette:

- **Earth** (`earth-500`, `earth-600`, etc.) - Primary brand color (terracotta)
- **Amber** (`amber-500`, etc.) - Accent color for energy
- **Forest** (`forest-500`, etc.) - Success states
- **Sand** (`sand-50` to `sand-900`) - Warm neutrals

### Typography

- **Display font**: Outfit (headings, titles)
- **Body font**: Manrope (paragraphs, UI text)
- All font sizes use fluid scaling with `clamp()` for responsiveness

### Components

All UI components follow consistent patterns:
- Rounded corners (`rounded-xl`, `rounded-2xl`)
- Soft shadows (`shadow-soft`, `shadow-medium`)
- Smooth transitions (`transition-all duration-200`)
- Warm, approachable aesthetic

---

## Development Tips

### Fast Imports

Use the component barrel exports:
```tsx
import { Button, Input, LoadingSpinner } from '@/components';
```

### Formatting Phone Numbers

```tsx
import { formatPhoneNumber } from '@/lib/utils';
formatPhoneNumber('+2348012345678'); // "+234 801 234 5678"
```

### Formatting Currency

```tsx
import { formatCurrency } from '@/lib/utils';
formatCurrency(15000); // "₦15,000"
```

### Working with Supabase

```tsx
import { supabase } from '@/lib/supabase';

// Get current user
const { data: { user } } = await supabase.auth.getUser();

// Query data
const { data } = await supabase
  .from('conversations')
  .select('*')
  .eq('business_id', businessId);
```

---

## Next Steps

Once the frontend is working:

1. **Connect to Backend**: Make sure backend webhook is receiving WhatsApp messages
2. **Test End-to-End**: Send a WhatsApp message and see it appear in dashboard
3. **Customize Design**: Modify colors in `tailwind.config.ts` if needed
4. **Add Features**: Build additional pages or components as needed

---

## Deployment (Production)

### Deploy to Vercel

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Complete frontend dashboard"
   git push
   ```

2. **Connect Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository
   - Vercel auto-detects Next.js

3. **Set Environment Variables**:
   - In Vercel dashboard → Settings → Environment Variables
   - Add all variables from `.env.local`
   - **Important**: Use production URLs, not localhost!

4. **Deploy**:
   - Vercel auto-deploys on every git push
   - Get your production URL: `https://yourapp.vercel.app`

---

## Support

If you run into issues:

1. Check the troubleshooting section above
2. Review `README.md` in this directory
3. Check browser console for error messages
4. Review Supabase logs in dashboard
5. Make sure backend is running and accessible

---

**Built with ❤️ for Nigerian small businesses**
