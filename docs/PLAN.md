# WhatsNaija AI — Pre-Deployment Fix Plan

## The WhatsApp Question (Read This First)

**Can businesses use their existing WhatsApp Business number?**
Yes — but they still need to go through Meta. Here's why and the options:

The regular **WhatsApp Business App** (green icon on phone) has zero API access. 
To receive/send messages programmatically, the number must be on **Meta's Cloud API**.

### Option A — Migrate existing number to Cloud API ✅ Recommended
- Their current WA Business number can be migrated to Cloud API
- The number stays the same, customers see no change
- They lose the WA Business App for that number (it moves to API-only)
- Cost: Free. Official. ToS-compliant.
- Setup time: ~45 minutes first time

### Option B — Use a BSP (360dialog, Twilio, WATI)
- Business signs up with a BSP, connects their number there
- They get a simple API key instead of navigating Meta console
- Cost: ~$5-10/month per number extra
- Setup time: ~10 minutes
- Good for non-technical users

### Option C — New dedicated number
- Buy a new SIM, register fresh on Meta Cloud API
- Easiest setup (no migration), but customers have to learn a new number

### ❌ Do NOT offer: Unofficial automation (Baileys/whatsapp-web.js)
- Scans QR code to emulate WhatsApp Web
- Meta permanently bans numbers caught doing this
- Catastrophic risk for business owners

**What to build:** Improve onboarding Step 2 to clearly explain Options A and B
with a much more guided setup process.

---

## Fixes — Priority Order

### 🔴 CRITICAL (blocks onboarding from working at all)

#### Fix 1: `whatsapp_number` schema — NOT NULL causes insert failure
- **File:** Supabase SQL Editor
- **Problem:** `whatsapp_number TEXT UNIQUE NOT NULL` but onboard form sends `null`
- **Fix SQL:**
```sql
ALTER TABLE businesses ALTER COLUMN whatsapp_number DROP NOT NULL;
DROP INDEX IF EXISTS idx_businesses_whatsapp_number;
CREATE UNIQUE INDEX idx_businesses_whatsapp_number 
  ON businesses(whatsapp_number) WHERE whatsapp_number IS NOT NULL;
```
- **Also:** `lib/supabase.ts` line 19: `whatsapp_number: string | null;`

#### Fix 2: Settings page inserts temp UUID as primary key → DB error
- **File:** `frontend/app/dashboard/settings/page.tsx` line 74
- **Problem:** `itemData` contains `id: "temp_1234..."` which fails UUID constraint
- **Fix:** Strip `id` and `_isNew` before insert:
```typescript
const { _isNew, id, ...insertData } = item;
await supabase.from('knowledge_base').insert({ ...insertData, business_id: business.id });
```

#### Fix 3: Duplicate `phone_number_id` check missing in onboard
- **File:** `frontend/app/onboard/page.tsx` in `handleStep2()`
- **Problem:** Two businesses can register same `phone_number_id` → wrong message routing
- **Fix:** Query before insert + add DB constraint:
```sql
ALTER TABLE businesses ADD CONSTRAINT businesses_phone_number_id_key UNIQUE (phone_number_id);
```
Frontend: check existing record before insert, show clear error if found.

#### Fix 4: Verify RLS is active
- **Run in Supabase SQL Editor:**
```sql
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public';
```
- Every table should show `rowsecurity = true` and have policies.

---

### 🟠 SECURITY (before any real user data flows)

#### Fix 5: Backend API endpoints have no auth — anyone can send messages
- **File:** `backend/api.py` + `backend/config.py` + `frontend/lib/api.ts`
- **Problem:** POST /api/send-message accepts any request with no authentication
- **Backend fix:** Add JWT verification dependency to all routes using `SUPABASE_JWT_SECRET`
  (found in Supabase → Project Settings → API → JWT Secret)
- **Frontend fix:** Add helper to `lib/api.ts`:
```typescript
async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  return {
    'Content-Type': 'application/json',
    ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {})
  };
}
```
Replace all `headers: { 'Content-Type': ... }` in api.ts + conversations/page.tsx with `headers: await getAuthHeaders()`

#### Fix 6: Next.js middleware does nothing — no server-side auth guard
- **File:** `frontend/middleware.ts`
- **Install:** `npm install @supabase/ssr`
- **Fix:** Replace with SSR Supabase middleware that checks session cookie and redirects
  unauthenticated users server-side to `/login`

---

### 🟡 IMPORTANT (UX/functionality gaps)

#### Fix 7: Onboarding Step 2 — much better WhatsApp setup guide
- **File:** `frontend/app/onboard/page.tsx`
- Show Option A (migrate) vs Option B (BSP) clearly
- Expanded numbered steps with real links
- Honest callout: "Your WA Business App number will migrate to Cloud API"
- Copy button for webhook URL
- "Skip for now" link (allowed once schema is nullable)
- Format validation on phone_number_id (15-16 digit number)

#### Fix 8: Settings page — add `whatsapp_number` field
- Business information section currently only shows name + tone
- Add WhatsApp number input so owners can add/update it after onboarding

#### Fix 9: Bookings page — align to new design system
- Replace `border-sand-100` → `border-sand-200` on cards
- Replace `bg-earth-600` → `bg-earth-500` on active tab
- Add `font-display` to h1
- Add `min-h-screen bg-sand-50` to wrapper div

#### Fix 10: Conversations — error state + polling stability
- Add `finally { setLoading(false); }` to `loadConversations`
- Add error state: show "Failed to load" + retry button when fetch fails
- Fix polling: extract business fetch to one-time `useEffect`, use `useRef` for
  stable businessId so `loadConversations` has empty dep array

#### Fix 11: Settings page — validate answer field before save
- `answer` is NOT NULL in DB; empty description will save but AI has nothing to say
- Check `products.filter(p => p._isNew && !p.answer.trim())` before saving
- Show field-level error: red border + "Description is required"

---

## Implementation Order

```
Day 1 — Schema & data (run SQL, update types)
  ✓ Fix 1: whatsapp_number nullable
  ✓ Fix 3: phone_number_id unique constraint  
  ✓ Fix 2: settings temp-UUID bug
  ✓ Fix 4: verify RLS

Day 2 — Security
  ✓ Fix 5: backend JWT auth + frontend auth headers
  ✓ Fix 6: middleware SSR auth guard

Day 3 — UX polish
  ✓ Fix 7: onboarding WhatsApp guide
  ✓ Fix 8: settings whatsapp_number field
  ✓ Fix 9: bookings page styling
  ✓ Fix 10: conversations error/polling
  ✓ Fix 11: settings validation
```

## After all fixes → Deploy
- Railway (backend) — permanent webhook URL
- Vercel (frontend) — production URL
- Update `main.py` CORS `allow_origins` to add production frontend URL
- Set Railway backend URL in Meta webhook console permanently
