# WhatsNaija AI - Frontend Dashboard

Beautiful, distinctive Next.js dashboard for managing your WhatsApp AI bot.

## 🎨 Design

Built with a **warm, vibrant aesthetic** that reflects Nigerian entrepreneurial energy:
- **Colors**: Terracotta earth tones + amber accents + forest greens
- **Typography**: Outfit (display) + Manrope (body)
- **Philosophy**: Warm and approachable, NOT cold SaaS

## ✨ Features

✅ **Complete & Ready to Use**
- Authentication (login/register with Supabase)
- Dashboard overview with real-time stats
- Conversations management with chat interface
- Lead tracking and status updates
- Bookings calendar with confirm/cancel
- Settings page for knowledge base editing
- Beautiful, warm design system
- Fully responsive layout

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Set Up Environment Variables

Copy the example file:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Get these from your Supabase Dashboard → Project Settings → API

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
frontend/
├── app/
│   ├── (auth)/
│   │   ├── login/           # Login page
│   │   └── register/        # Registration page
│   ├── dashboard/
│   │   ├── layout.tsx       # Dashboard layout with sidebar
│   │   ├── page.tsx         # Overview dashboard
│   │   ├── conversations/   # View & manage chats
│   │   ├── leads/           # Captured leads
│   │   ├── bookings/        # Appointments
│   │   └── settings/        # Knowledge base editor
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── Button.tsx           # Primary UI button
│   └── Input.tsx            # Form input component
├── lib/
│   └── supabase.ts          # Supabase client & types
└── tailwind.config.ts       # Custom design system
```

## 🌟 Features

### ✅ Built & Ready

1. **Authentication**
   - Login & registration with Supabase Auth
   - Protected dashboard routes

2. **Dashboard Overview**
   - Real-time stats: conversations, leads, payments
   - Recent activity feed
   - Bot status indicator

3. **Conversations**
   - View all WhatsApp conversations
   - Chat interface with message history
   - Manual takeover (send messages as owner)
   - Status indicators (bot/human/closed)

4. **Leads Management**
   - Table view of all captured leads
   - Filter by status (new/contacted/converted/lost)
   - Update lead status
   - Contact information & interests

5. **Bookings**
   - Calendar-style view of appointments
   - Confirm/cancel bookings
   - Customer details

6. **Settings**
   - Edit business info
   - Manage products & prices
   - Add/edit FAQs
   - Configure policies
   - Set tone preference (formal/casual/pidgin)

### Design Features

- **Warm Color Palette**: Earth tones, amber, forest greens
- **Custom Typography**: Google Fonts (Outfit + Manrope)
- **Fluid Sizing**: Responsive font scales with `clamp()`
- **Smooth Animations**: Slide-in, fade-in, scale-in
- **Custom Shadows**: Soft, medium, strong variants
- **Distinctive Cards**: Not the typical SaaS card grid

## 🎨 Design System

### Colors

```js
earth: {  // Primary brand color
  500: '#c97a51',
  600: '#b8623c',
  700: '#9a4d30',
}

amber: {  // Accent/energy
  500: '#f59e0b',
  600: '#d97706',
}

forest: { // Success states
  500: '#22c55e',
  600: '#16a34a',
}

sand: {   // Warm neutrals
  50: '#fafaf9',
  100: '#f5f5f4',
  900: '#1c1917',
}
```

### Typography Scale

```
xs:   0.75rem - 0.875rem
sm:   0.875rem - 1rem
base: 1rem - 1.125rem
lg:   1.125rem - 1.25rem
xl:   1.25rem - 1.5rem
2xl:  1.5rem - 1.875rem
3xl:  1.875rem - 2.25rem
```

All scales use fluid sizing with `clamp()` for responsive design.

## 🔗 Integration

### Supabase

The dashboard connects to your Supabase backend for:
- User authentication
- Business data
- Conversations & messages
- Leads & bookings
- Knowledge base

All queries use Row Level Security (RLS) to ensure users only see their own data.

### Backend API

Communicates with the Python backend at `NEXT_PUBLIC_API_URL` for:
- WhatsApp webhook management
- Payment link generation (future)
- Bot configuration

## 🚢 Deployment

### Deploy to Vercel

1. **Push to GitHub**

```bash
git add .
git commit -m "Add frontend dashboard"
git push
```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your repository
   - Framework: Next.js (auto-detected)

3. **Set Environment Variables**
   - Add all variables from `.env.local`
   - Don't commit `.env.local` to git!

4. **Deploy**
   - Vercel auto-deploys on every push
   - Get your production URL: `https://yourapp.vercel.app`

## 🧪 Testing Locally

### Test with Seed Data

1. Make sure you ran `database/seed.sql` in Supabase
2. Login with the test user credentials
3. You should see:
   - Sample business data
   - Test conversations
   - Example products & FAQs

### Test Without Backend

The dashboard works independently of the Python backend for viewing data. You can:
- View conversations
- See leads
- Edit knowledge base

WhatsApp messaging requires the backend to be running.

## 🐛 Troubleshooting

### "Failed to fetch"

**Problem**: Dashboard can't connect to Supabase

**Fix**:
1. Check `.env.local` has correct Supabase URL and anon key
2. Verify Supabase project is running
3. Check browser console for detailed errors

### No data showing

**Problem**: Dashboard is empty

**Fix**:
1. Make sure you ran `database/seed.sql`
2. Check that the business record has the correct `owner_id` (your Supabase user ID)
3. Query in Supabase: `SELECT * FROM businesses WHERE owner_id = 'your-user-id'`

### Auth not working

**Problem**: Can't login/register

**Fix**:
1. Check Supabase Auth is enabled (Authentication → Settings)
2. Verify email confirmation is disabled for dev (or check spam folder)
3. Check browser console for errors

## 📚 Next Steps

- [ ] Add real-time updates (Supabase Realtime)
- [ ] Payment link display in dashboard
- [ ] Export leads to CSV
- [ ] Analytics charts
- [ ] Dark mode toggle
- [ ] Mobile responsive improvements

## 💡 Tips

- The design intentionally avoids generic "AI slop" aesthetics
- Every component has been crafted to feel warm and human
- Feel free to customize colors in `tailwind.config.ts`
- Typography loads from Google Fonts (no local files needed)

---

**Built with ❤️ for Nigerian small businesses**
