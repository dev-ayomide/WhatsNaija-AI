'use client';

import { useEffect, useState } from 'react';
import { supabase, Business, KnowledgeBase } from '@/lib/supabase';
import { Plus, Trash2, Save, Package, HelpCircle, FileText, MessageSquare, CheckCircle, AlertCircle, Phone } from 'lucide-react';
import Button from '@/components/Button';
import Input from '@/components/Input';

type KnowledgeItem = KnowledgeBase & { _isNew?: boolean };

export default function SettingsPage() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [products, setProducts] = useState<KnowledgeItem[]>([]);
  const [faqs, setFaqs] = useState<KnowledgeItem[]>([]);
  const [policies, setPolicies] = useState<KnowledgeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [saveError, setSaveError] = useState('');
  const [validationErrors, setValidationErrors] = useState<Set<string>>(new Set());

  useEffect(() => { loadSettings(); }, []);

  async function loadSettings() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: businessData } = await supabase
        .from('businesses').select('*').eq('owner_id', user.id).single();

      if (!businessData) return;
      setBusiness(businessData);

      const { data: knowledgeData } = await supabase
        .from('knowledge_base').select('*')
        .eq('business_id', businessData.id).eq('is_active', true);

      const items = knowledgeData || [];
      setProducts(items.filter((i) => i.type === 'product'));
      setFaqs(items.filter((i) => i.type === 'faq'));
      setPolicies(items.filter((i) => i.type === 'policy'));
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  }

  async function saveSettings() {
    if (!business) return;

    // Validate: new products need a name and description
    const errors = new Set<string>();
    products.forEach((p) => {
      if (p._isNew && !p.product_name?.trim()) errors.add(`product-name-${p.id}`);
      if (p._isNew && !p.answer?.trim()) errors.add(`product-desc-${p.id}`);
    });
    faqs.forEach((f) => {
      if (f._isNew && !f.answer?.trim()) errors.add(`faq-answer-${f.id}`);
    });

    if (errors.size > 0) {
      setValidationErrors(errors);
      setSaveError('Please fill in all required fields before saving.');
      setSaveStatus('error');
      setTimeout(() => { setSaveStatus('idle'); setSaveError(''); }, 4000);
      return;
    }
    setValidationErrors(new Set());

    setSaving(true);
    try {
      // Update business settings
      await supabase.from('businesses').update({
        name: business.name,
        whatsapp_number: business.whatsapp_number || null,
        whatsapp_access_token: business.whatsapp_access_token || null,
        tone_preference: business.tone_preference,
      }).eq('id', business.id);

      // Save knowledge base items
      const allItems = [...products, ...faqs, ...policies];

      for (const item of allItems) {
        if (item._isNew) {
          // Strip temp id and _isNew flag — let Supabase generate a real UUID
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { _isNew, id, ...insertData } = item;
          await supabase.from('knowledge_base').insert({
            ...insertData,
            business_id: business.id,
          });
        } else {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { _isNew, ...itemData } = item;
          await supabase.from('knowledge_base').update(itemData).eq('id', item.id);
        }
      }

      setSaveStatus('success');
      loadSettings();
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveError('Failed to save. Please try again.');
      setSaveStatus('error');
      setTimeout(() => { setSaveStatus('idle'); setSaveError(''); }, 4000);
    } finally {
      setSaving(false);
    }
  }

  function addProduct() {
    setProducts([...products, {
      id: `temp_${crypto.randomUUID()}`,
      business_id: business!.id,
      type: 'product',
      product_name: '',
      price: 0,
      answer: '',
      question: null,
      is_active: true,
      created_at: new Date().toISOString(),
      _isNew: true,
    }]);
  }

  function addFaq() {
    setFaqs([...faqs, {
      id: `temp_${crypto.randomUUID()}`,
      business_id: business!.id,
      type: 'faq',
      question: '',
      answer: '',
      product_name: null,
      price: null,
      is_active: true,
      created_at: new Date().toISOString(),
      _isNew: true,
    }]);
  }

  function addPolicy() {
    setPolicies([...policies, {
      id: `temp_${crypto.randomUUID()}`,
      business_id: business!.id,
      type: 'policy',
      answer: '',
      question: null,
      product_name: null,
      price: null,
      is_active: true,
      created_at: new Date().toISOString(),
      _isNew: true,
    }]);
  }

  async function deleteItem(id: string, type: 'product' | 'faq' | 'policy') {
    if (!id.startsWith('temp_')) {
      await supabase.from('knowledge_base').delete().eq('id', id);
    }
    if (type === 'product') setProducts(products.filter((p) => p.id !== id));
    else if (type === 'faq') setFaqs(faqs.filter((f) => f.id !== id));
    else setPolicies(policies.filter((p) => p.id !== id));
  }

  if (loading || !business) {
    return (
      <div className="p-8 animate-pulse space-y-6">
        <div className="h-8 bg-sand-200 rounded-xl w-32" />
        <div className="h-48 bg-sand-200 rounded-2xl" />
        <div className="h-64 bg-sand-200 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand-50 p-8 space-y-7 max-w-5xl">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display font-bold text-3xl text-sand-900 mb-1">Settings</h1>
          <p className="text-sand-400 text-sm">Configure your business and knowledge base</p>
        </div>
        <Button onClick={saveSettings} variant="primary" disabled={saving}>
          <Save className="w-4 h-4" />
          {saving ? 'Saving…' : 'Save Changes'}
        </Button>
      </div>

      {/* Save status banner */}
      {saveStatus === 'success' && (
        <div className="flex items-center gap-3 px-5 py-3 bg-forest-50 border border-forest-200 rounded-xl text-forest-800">
          <CheckCircle className="w-5 h-5 text-forest-600 flex-shrink-0" />
          <span className="font-semibold text-sm">Settings saved successfully!</span>
        </div>
      )}
      {saveStatus === 'error' && (
        <div className="flex items-center gap-3 px-5 py-3 bg-red-50 border border-red-200 rounded-xl text-red-800">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span className="font-semibold text-sm">{saveError || 'Failed to save settings.'}</span>
        </div>
      )}

      {/* Business Settings */}
      <div className="bg-white rounded-2xl border border-sand-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <MessageSquare className="w-5 h-5 text-earth-500" />
          <h2 className="font-display font-bold text-xl text-sand-900">Business Information</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Business Name"
            value={business.name}
            onChange={(e) => setBusiness({ ...business, name: e.target.value })}
          />

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-sand-700">Bot Tone</label>
            <select
              value={business.tone_preference}
              onChange={(e) => setBusiness({ ...business, tone_preference: e.target.value as Business['tone_preference'] })}
              className="w-full px-4 py-3 bg-white border border-sand-200 rounded-xl text-sand-900 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-earth-500/20 focus:border-earth-400 transition-all"
            >
              <option value="formal">Formal — Professional & polished</option>
              <option value="casual">Casual — Friendly & relaxed</option>
              <option value="pidgin">Pidgin — Local & relatable</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <Input
              label="WhatsApp Business Number"
              placeholder="+2348012345678"
              value={business.whatsapp_number || ''}
              onChange={(e) => setBusiness({ ...business, whatsapp_number: e.target.value || null })}
              hint="The number customers message you on. Include country code (+234…)"
            />
          </div>
        </div>
      </div>

      {/* WhatsApp Connection Info */}
      <div className="bg-white border border-sand-200 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Phone className="w-5 h-5 text-earth-500" />
          <h2 className="font-display font-bold text-xl text-sand-900">WhatsApp API Credentials</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-sand-50 rounded-xl p-3">
            <p className="text-sand-400 text-xs font-semibold uppercase tracking-wider mb-1">Phone Number ID</p>
            <p className="font-mono text-sand-800 font-semibold">{business.phone_number_id || '—'}</p>
          </div>
          <div className="bg-sand-50 rounded-xl p-3">
            <p className="text-sand-400 text-xs font-semibold uppercase tracking-wider mb-1">WABA ID</p>
            <p className="font-mono text-sand-800 font-semibold">{business.waba_id || '—'}</p>
          </div>
        </div>
        <div>
          <Input
            label="WhatsApp Access Token"
            placeholder="EAALXGpyTu5IBP… (your Meta access token)"
            value={business.whatsapp_access_token || ''}
            onChange={(e) => setBusiness({ ...business, whatsapp_access_token: e.target.value || null })}
            hint="Update this when your token expires. Get a permanent token from Meta → System Users."
          />
        </div>
        <p className="text-xs text-sand-400">
          Phone Number ID and WABA ID are set during onboarding. To change them, contact support.
        </p>
      </div>

      {/* Products */}
      <div className="bg-white rounded-2xl border border-sand-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-earth-500" />
            <h2 className="font-display font-bold text-xl text-sand-900">Products & Services</h2>
          </div>
          <Button onClick={addProduct} variant="secondary" size="sm">
            <Plus className="w-4 h-4" />
            Add Product
          </Button>
        </div>

        {products.length === 0 ? (
          <p className="text-sm text-sand-400 py-4 text-center">
            No products yet. Add your first product so the bot can tell customers about it.
          </p>
        ) : (
          <div className="space-y-4">
            {products.map((product, index) => (
              <div key={product.id} className="p-4 bg-sand-50 rounded-xl space-y-3">
                <div className="flex gap-3">
                  <Input
                    placeholder="Product name *"
                    value={product.product_name || ''}
                    onChange={(e) => {
                      const updated = [...products];
                      updated[index].product_name = e.target.value;
                      setProducts(updated);
                    }}
                    className={`flex-1 ${validationErrors.has(`product-name-${product.id}`) ? 'border-red-400' : ''}`}
                  />
                  <Input
                    type="number"
                    placeholder="Price (NGN)"
                    value={product.price || ''}
                    onChange={(e) => {
                      const updated = [...products];
                      updated[index].price = parseFloat(e.target.value) || 0;
                      setProducts(updated);
                    }}
                    className="w-36"
                  />
                  <button
                    onClick={() => deleteItem(product.id, 'product')}
                    className="p-2.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <Input
                  placeholder="Description — colours, sizes, materials, what makes it special *"
                  value={product.answer}
                  onChange={(e) => {
                    const updated = [...products];
                    updated[index].answer = e.target.value;
                    setProducts(updated);
                  }}
                  error={validationErrors.has(`product-desc-${product.id}`) ? 'Description is required' : undefined}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FAQs */}
      <div className="bg-white rounded-2xl border border-sand-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-earth-500" />
            <h2 className="font-display font-bold text-xl text-sand-900">Frequently Asked Questions</h2>
          </div>
          <Button onClick={addFaq} variant="secondary" size="sm">
            <Plus className="w-4 h-4" />
            Add FAQ
          </Button>
        </div>

        {faqs.length === 0 ? (
          <p className="text-sm text-sand-400 py-4 text-center">
            No FAQs yet. Add common questions so the bot answers them instantly.
          </p>
        ) : (
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={faq.id} className="p-4 bg-sand-50 rounded-xl space-y-3">
                <div className="flex gap-3">
                  <Input
                    placeholder="Question (e.g. Do you do delivery?)"
                    value={faq.question || ''}
                    onChange={(e) => {
                      const updated = [...faqs];
                      updated[index].question = e.target.value;
                      setFaqs(updated);
                    }}
                    className="flex-1"
                  />
                  <button
                    onClick={() => deleteItem(faq.id, 'faq')}
                    className="p-2.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <Input
                  placeholder="Answer *"
                  value={faq.answer}
                  onChange={(e) => {
                    const updated = [...faqs];
                    updated[index].answer = e.target.value;
                    setFaqs(updated);
                  }}
                  error={validationErrors.has(`faq-answer-${faq.id}`) ? 'Answer is required' : undefined}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Policies */}
      <div className="bg-white rounded-2xl border border-sand-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-earth-500" />
            <h2 className="font-display font-bold text-xl text-sand-900">Policies</h2>
          </div>
          <Button onClick={addPolicy} variant="secondary" size="sm">
            <Plus className="w-4 h-4" />
            Add Policy
          </Button>
        </div>

        {policies.length === 0 ? (
          <p className="text-sm text-sand-400 py-4 text-center">
            No policies yet. Add your return policy, shipping info, payment terms, etc.
          </p>
        ) : (
          <div className="space-y-3">
            {policies.map((policy, index) => (
              <div key={policy.id} className="flex gap-3">
                <Input
                  placeholder="e.g. We offer free delivery within Lagos for orders above ₦10,000"
                  value={policy.answer}
                  onChange={(e) => {
                    const updated = [...policies];
                    updated[index].answer = e.target.value;
                    setPolicies(updated);
                  }}
                  className="flex-1"
                />
                <button
                  onClick={() => deleteItem(policy.id, 'policy')}
                  className="p-2.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
