'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { CheckCircle, ArrowRight, ExternalLink, Plus, Trash2, Copy, Check } from 'lucide-react';

type Step = 1 | 2 | 3;

type BusinessForm = {
  name: string;
  business_type: string;
  tone_preference: 'formal' | 'casual' | 'pidgin';
};

type WhatsAppForm = {
  whatsapp_number: string;
  phone_number_id: string;
  waba_id: string;
  whatsapp_access_token: string;
};

type Product = {
  name: string;
  price: string;
  description: string;
};

const BUSINESS_TYPES = [
  { value: 'fashion', label: 'Fashion & Clothing' },
  { value: 'food', label: 'Food & Restaurant' },
  { value: 'beauty', label: 'Beauty & Cosmetics' },
  { value: 'electronics', label: 'Electronics & Gadgets' },
  { value: 'services', label: 'Services & Consulting' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'health', label: 'Health & Wellness' },
  { value: 'other', label: 'Other' },
];

export default function OnboardPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [business, setBusiness] = useState<BusinessForm>({
    name: '',
    business_type: '',
    tone_preference: 'casual',
  });

  const [whatsapp, setWhatsapp] = useState<WhatsAppForm>({
    whatsapp_number: '',
    phone_number_id: '',
    waba_id: '',
    whatsapp_access_token: '',
  });

  const [products, setProducts] = useState<Product[]>([
    { name: '', price: '', description: '' },
  ]);

  const [createdBusinessId, setCreatedBusinessId] = useState<string | null>(null);
  const [webhookCopied, setWebhookCopied] = useState(false);

  const WEBHOOK_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/webhook`;
  const VERIFY_TOKEN = 'whatsnaijaai_secure_verify_token_2024';

  function copyWebhookUrl() {
    navigator.clipboard.writeText(WEBHOOK_URL);
    setWebhookCopied(true);
    setTimeout(() => setWebhookCopied(false), 2000);
  }

  async function handleStep1() {
    if (!business.name || !business.business_type) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    setStep(2);
  }

  async function handleStep2() {
    if (!whatsapp.phone_number_id || !whatsapp.waba_id || !whatsapp.whatsapp_access_token) {
      setError('Phone Number ID, WABA ID, and Access Token are required');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Create the business record
      const { data, error } = await supabase
        .from('businesses')
        .insert({
          owner_id: user.id,
          name: business.name,
          business_type: business.business_type,
          tone_preference: business.tone_preference,
          whatsapp_number: whatsapp.whatsapp_number || null,
          phone_number_id: whatsapp.phone_number_id,
          waba_id: whatsapp.waba_id,
          whatsapp_access_token: whatsapp.whatsapp_access_token || null,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;
      setCreatedBusinessId(data.id);
      setStep(3);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save business');
    } finally {
      setLoading(false);
    }
  }

  async function handleStep3() {
    if (!createdBusinessId) return;
    setLoading(true);

    try {
      // Save products that have a name
      const validProducts = products.filter((p) => p.name.trim());

      if (validProducts.length > 0) {
        const inserts = validProducts.map((p) => ({
          business_id: createdBusinessId,
          type: 'product',
          product_name: p.name,
          price: parseFloat(p.price) || 0,
          answer: p.description || p.name,
          is_active: true,
        }));

        await supabase.from('knowledge_base').insert(inserts);
      }

      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save products');
    } finally {
      setLoading(false);
    }
  }

  function addProduct() {
    setProducts([...products, { name: '', price: '', description: '' }]);
  }

  function removeProduct(index: number) {
    setProducts(products.filter((_, i) => i !== index));
  }

  function updateProduct(index: number, field: keyof Product, value: string) {
    const updated = [...products];
    updated[index][field] = value;
    setProducts(updated);
  }

  const steps = [
    { num: 1, label: 'Business info' },
    { num: 2, label: 'WhatsApp setup' },
    { num: 3, label: 'Add products' },
  ];

  return (
    <div className="min-h-screen bg-sand-50 flex flex-col">
      {/* Top bar */}
      <div className="border-b border-sand-200 bg-white">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-earth-500 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </div>
            <span className="font-display font-bold text-sand-900">WhatsNaija AI</span>
          </div>
          <p className="text-sm text-sand-400">Setup wizard</p>
        </div>
      </div>

      {/* Progress */}
      <div className="border-b border-sand-200 bg-white">
        <div className="max-w-2xl mx-auto px-6 py-5">
          <div className="flex items-center gap-3">
            {steps.map((s, i) => (
              <div key={s.num} className="flex items-center gap-3">
                <div className="flex items-center gap-2.5">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    step > s.num
                      ? 'bg-forest-500 text-white'
                      : step === s.num
                      ? 'bg-earth-500 text-white'
                      : 'bg-sand-200 text-sand-500'
                  }`}>
                    {step > s.num ? <CheckCircle className="w-4 h-4" /> : s.num}
                  </div>
                  <span className={`text-sm font-semibold transition-colors ${
                    step === s.num ? 'text-sand-900' : 'text-sand-400'
                  }`}>
                    {s.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-px w-12 transition-colors ${step > s.num ? 'bg-forest-300' : 'bg-sand-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-start justify-center px-6 py-12">
        <div className="w-full max-w-2xl animate-in">
          {error && (
            <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">
              {error}
            </div>
          )}

          {/* Step 1 — Business info */}
          {step === 1 && (
            <div className="space-y-8">
              <div>
                <h1 className="font-display font-bold text-3xl text-sand-900 mb-2">
                  Tell us about your business
                </h1>
                <p className="text-sand-500">
                  This helps the AI introduce itself correctly and match your brand voice.
                </p>
              </div>

              <div className="space-y-5">
                <Input
                  label="Business name"
                  placeholder="e.g. Amara's Boutique"
                  value={business.name}
                  onChange={(e) => setBusiness({ ...business, name: e.target.value })}
                  required
                />

                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-sand-700">
                    Business type
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {BUSINESS_TYPES.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setBusiness({ ...business, business_type: type.value })}
                        className={`px-3 py-2.5 rounded-xl text-sm font-semibold text-left transition-all ${
                          business.business_type === type.value
                            ? 'bg-earth-500 text-white shadow-[0_2px_8px_rgba(196,112,74,0.3)]'
                            : 'bg-white border border-sand-200 text-sand-700 hover:border-earth-300 hover:text-earth-600'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-sand-700">
                    Bot communication style
                  </label>
                  <p className="text-xs text-sand-400 mb-2">The AI adapts to each customer, but this sets the default</p>
                  <div className="flex gap-3">
                    {[
                      { value: 'formal', label: 'Formal', desc: 'Professional & polished' },
                      { value: 'casual', label: 'Casual', desc: 'Friendly & relaxed' },
                      { value: 'pidgin', label: 'Pidgin', desc: 'Local & relatable' },
                    ].map((tone) => (
                      <button
                        key={tone.value}
                        type="button"
                        onClick={() => setBusiness({ ...business, tone_preference: tone.value as BusinessForm['tone_preference'] })}
                        className={`flex-1 p-3.5 rounded-xl text-left transition-all border-2 ${
                          business.tone_preference === tone.value
                            ? 'border-earth-500 bg-earth-50'
                            : 'border-sand-200 bg-white hover:border-sand-300'
                        }`}
                      >
                        <p className={`text-sm font-bold ${business.tone_preference === tone.value ? 'text-earth-700' : 'text-sand-800'}`}>
                          {tone.label}
                        </p>
                        <p className="text-xs text-sand-500 mt-0.5">{tone.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <Button onClick={handleStep1} size="lg" className="w-full">
                Continue <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Step 2 — WhatsApp Setup */}
          {step === 2 && (
            <div className="space-y-8">
              <div>
                <h1 className="font-display font-bold text-3xl text-sand-900 mb-2">
                  Connect your WhatsApp
                </h1>
                <p className="text-sand-500">
                  You need to connect a number via the Meta Cloud API. Your existing WhatsApp Business number can be migrated — it's free and takes about 10 minutes.
                </p>
              </div>

              {/* Option A vs Option B */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-earth-50 border-2 border-earth-200 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-earth-500 text-white flex items-center justify-center text-xs font-bold">A</div>
                    <p className="font-bold text-earth-800 text-sm">Use your existing number</p>
                  </div>
                  <p className="text-xs text-earth-700 leading-relaxed">
                    Migrate your current WhatsApp Business number to Meta Cloud API. <strong>Free.</strong> Your number stays the same. Customers won't notice any change.
                  </p>
                  <p className="text-xs text-earth-600 mt-2 font-semibold">✓ Recommended for most businesses</p>
                </div>
                <div className="bg-sand-50 border-2 border-sand-200 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-sand-500 text-white flex items-center justify-center text-xs font-bold">B</div>
                    <p className="font-bold text-sand-800 text-sm">Get a new number via BSP</p>
                  </div>
                  <p className="text-xs text-sand-600 leading-relaxed">
                    Use a WhatsApp Business Solution Provider like 360dialog or Twilio. Easier setup but costs ~$5–10/month for a dedicated number.
                  </p>
                  <p className="text-xs text-sand-500 mt-2 font-semibold">→ Good if migrating feels complex</p>
                </div>
              </div>

              {/* Step-by-step instructions (Option A) */}
              <div className="bg-white border border-sand-200 rounded-2xl divide-y divide-sand-100 overflow-hidden">
                <div className="px-5 py-4 bg-sand-50 flex items-center justify-between">
                  <p className="text-sm font-bold text-sand-700 uppercase tracking-wider">
                    Setup guide (Option A — recommended)
                  </p>
                  <a
                    href="https://developers.facebook.com/apps"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-earth-600 text-xs font-semibold hover:text-earth-700"
                  >
                    Open Meta <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                {[
                  {
                    num: '1',
                    text: 'Go to Meta for Developers → Create a new app → Choose "Business" type',
                  },
                  {
                    num: '2',
                    text: 'Add the WhatsApp product. Go to WhatsApp → API Setup. Copy your Phone Number ID and WABA ID.',
                  },
                  {
                    num: '3',
                    text: 'Go to WhatsApp → Configuration. Set the Callback URL and Verify Token below:',
                    extra: 'webhook',
                  },
                  {
                    num: '4',
                    text: 'To migrate your existing number: go to WhatsApp → Phone Numbers → Add phone number → follow the migration steps.',
                  },
                ].map((item) => (
                  <div key={item.num} className="px-5 py-4 flex gap-4">
                    <div className="w-6 h-6 rounded-full bg-earth-100 text-earth-700 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      {item.num}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-sand-700">{item.text}</p>
                      {item.extra === 'webhook' && (
                        <div className="mt-2 space-y-2">
                          <div className="flex items-center gap-2 bg-sand-50 rounded-lg px-3 py-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-sand-500 font-semibold uppercase tracking-wider mb-0.5">Callback URL</p>
                              <p className="text-xs font-mono text-sand-800 truncate">{WEBHOOK_URL}</p>
                            </div>
                            <button
                              onClick={copyWebhookUrl}
                              className="flex-shrink-0 p-1.5 text-sand-500 hover:text-earth-600 hover:bg-earth-50 rounded-lg transition-colors"
                              title="Copy webhook URL"
                            >
                              {webhookCopied ? <Check className="w-3.5 h-3.5 text-forest-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                          <div className="flex items-center gap-2 bg-sand-50 rounded-lg px-3 py-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-sand-500 font-semibold uppercase tracking-wider mb-0.5">Verify Token</p>
                              <p className="text-xs font-mono text-sand-800">{VERIFY_TOKEN}</p>
                            </div>
                          </div>
                          <p className="text-xs text-sand-400">Subscribe to: <span className="font-mono">messages</span> webhook field</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <Input
                  label="Phone Number ID"
                  placeholder="e.g. 1019128617959246"
                  value={whatsapp.phone_number_id}
                  onChange={(e) => setWhatsapp({ ...whatsapp, phone_number_id: e.target.value.trim() })}
                  hint="Found in Meta App Dashboard → WhatsApp → API Setup"
                  required
                />
                <Input
                  label="WhatsApp Business Account ID (WABA ID)"
                  placeholder="e.g. 965857209633940"
                  value={whatsapp.waba_id}
                  onChange={(e) => setWhatsapp({ ...whatsapp, waba_id: e.target.value.trim() })}
                  hint="Same page — labelled 'WhatsApp Business Account ID'"
                  required
                />
                <Input
                  label="WhatsApp Access Token"
                  placeholder="EAALXGpyTu5IBP…"
                  value={whatsapp.whatsapp_access_token}
                  onChange={(e) => setWhatsapp({ ...whatsapp, whatsapp_access_token: e.target.value.trim() })}
                  hint="Found in Meta App Dashboard → WhatsApp → API Setup → 'Temporary access token'. Generate a permanent token via System Users for production."
                  required
                />
                <Input
                  label="Your WhatsApp number (optional)"
                  placeholder="+2348012345678"
                  value={whatsapp.whatsapp_number}
                  onChange={(e) => setWhatsapp({ ...whatsapp, whatsapp_number: e.target.value })}
                  hint="The number customers will message. Include country code (+234…). You can add this later."
                />
              </div>

              <div className="flex gap-3">
                <Button onClick={() => setStep(1)} variant="secondary" size="lg" className="flex-1">
                  Back
                </Button>
                <Button onClick={handleStep2} size="lg" className="flex-[2]" disabled={loading}>
                  {loading ? 'Saving…' : 'Continue'} {!loading && <ArrowRight className="w-4 h-4" />}
                </Button>
              </div>

              <p className="text-center text-xs text-sand-400">
                Not ready yet?{' '}
                <button
                  onClick={() => router.push('/dashboard')}
                  className="text-earth-500 font-semibold hover:text-earth-600 underline underline-offset-2"
                >
                  Skip and set up later in Settings
                </button>
              </p>
            </div>
          )}

          {/* Step 3 — Products */}
          {step === 3 && (
            <div className="space-y-8">
              <div>
                <h1 className="font-display font-bold text-3xl text-sand-900 mb-2">
                  Add your products
                </h1>
                <p className="text-sand-500">
                  The AI uses this to answer customer questions. Add at least one product to get started — you can add more later in Settings.
                </p>
              </div>

              <div className="space-y-4">
                {products.map((product, index) => (
                  <div
                    key={index}
                    className="bg-white border border-sand-200 rounded-2xl p-5 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-sand-600">Product {index + 1}</p>
                      {products.length > 1 && (
                        <button
                          onClick={() => removeProduct(index)}
                          className="p-1.5 text-sand-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <Input
                        placeholder="Product name"
                        value={product.name}
                        onChange={(e) => updateProduct(index, 'name', e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        placeholder="Price (NGN)"
                        value={product.price}
                        onChange={(e) => updateProduct(index, 'price', e.target.value)}
                        className="w-36"
                        type="number"
                      />
                    </div>
                    <Input
                      placeholder="Short description (colours, sizes, materials…)"
                      value={product.description}
                      onChange={(e) => updateProduct(index, 'description', e.target.value)}
                    />
                  </div>
                ))}

                <button
                  onClick={addProduct}
                  className="w-full py-3.5 border-2 border-dashed border-sand-300 rounded-2xl text-sand-500 text-sm font-semibold hover:border-earth-400 hover:text-earth-600 hover:bg-earth-50/50 transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add another product
                </button>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="text-sm text-sand-400 hover:text-sand-600 font-medium transition-colors px-4"
                >
                  Skip for now
                </button>
                <Button onClick={handleStep3} size="lg" className="flex-1" disabled={loading}>
                  {loading ? 'Saving…' : 'Go to dashboard →'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
