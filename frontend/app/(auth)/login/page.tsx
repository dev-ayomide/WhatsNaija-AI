'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import Button from '@/components/Button';
import Input from '@/components/Input';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      if (data.user) {
        // Check if they've completed onboarding (have a business)
        const { data: business } = await supabase
          .from('businesses')
          .select('id')
          .eq('owner_id', data.user.id)
          .single();

        router.push(business ? '/dashboard' : '/onboard');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Brand Panel */}
      <div className="hidden lg:flex lg:w-[52%] bg-earth-500 flex-col justify-between p-14 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-earth-400/30" />
        <div className="absolute -bottom-32 -left-16 w-80 h-80 rounded-full bg-earth-600/40" />
        <div className="absolute top-1/2 right-8 w-48 h-48 rounded-full bg-earth-400/20" />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/15 rounded-2xl flex items-center justify-center">
              <WhatsAppIcon />
            </div>
            <span className="font-display font-bold text-xl text-white">WhatsNaija AI</span>
          </div>
        </div>

        {/* Main copy */}
        <div className="relative z-10 space-y-6">
          <h1 className="font-display font-bold text-5xl text-white leading-[1.05] text-balance">
            Your shop never sleeps.
          </h1>
          <p className="text-earth-100 text-lg leading-relaxed max-w-sm">
            AI that replies your WhatsApp customers 24/7 — in Yoruba, Igbo, Hausa, Pidgin or English.
          </p>

          {/* Social proof */}
          <div className="flex items-center gap-4 pt-2">
            <div className="flex -space-x-2">
              {['#F5D0BA', '#E8A882', '#D4845A'].map((color, i) => (
                <div
                  key={i}
                  className="w-9 h-9 rounded-full border-2 border-earth-500"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <p className="text-earth-100 text-sm">
              <span className="text-white font-semibold">340+ businesses</span> on WhatsNaija AI
            </p>
          </div>
        </div>

        {/* Quote */}
        <div className="relative z-10 bg-white/10 rounded-2xl p-5">
          <p className="text-white text-sm leading-relaxed italic">
            "Before WhatsNaija AI, I was missing sales at night. Now my bot handles everything — even closes deals while I sleep."
          </p>
          <p className="text-earth-200 text-xs mt-3 font-semibold">
            Chioma A. — Lagos Clothing Boutique
          </p>
        </div>
      </div>

      {/* Form Panel */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-16 bg-sand-50">
        <div className="w-full max-w-md mx-auto animate-in">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-10">
            <div className="w-9 h-9 bg-earth-500 rounded-xl flex items-center justify-center">
              <WhatsAppIcon className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-lg text-sand-900">WhatsNaija AI</span>
          </div>

          <div className="mb-8">
            <h2 className="font-display font-bold text-3xl text-sand-900 mb-2">Welcome back</h2>
            <p className="text-sand-500 text-sm">Sign in to manage your WhatsApp AI assistant</p>
          </div>

          {error && (
            <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              placeholder="you@yourbusiness.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              disabled={loading}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>

          <p className="text-center text-sm text-sand-500 mt-6">
            No account?{' '}
            <Link href="/register" className="text-earth-600 font-semibold hover:text-earth-700">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function WhatsAppIcon({ className = 'w-6 h-6 text-white' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
