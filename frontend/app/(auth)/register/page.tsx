'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import Button from '@/components/Button';
import Input from '@/components/Input';

export default function RegisterPage() {
  const router = useRouter();
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { business_name: businessName } },
      });

      if (error) throw error;

      if (data.user) {
        // Go to onboarding to set up their business
        router.push('/onboard');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create account');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Brand Panel */}
      <div className="hidden lg:flex lg:w-[52%] bg-sand-900 flex-col justify-between p-14 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-earth-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-earth-500/8 rounded-full translate-y-1/3 -translate-x-1/3" />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-earth-500/20 rounded-2xl flex items-center justify-center">
              <WhatsAppIcon />
            </div>
            <span className="font-display font-bold text-xl text-white">WhatsNaija AI</span>
          </div>
        </div>

        {/* Steps preview */}
        <div className="relative z-10 space-y-5">
          <p className="text-sand-400 text-sm font-semibold uppercase tracking-wider">
            Getting started takes 3 minutes
          </p>
          {[
            { num: '01', title: 'Create your account', done: false, active: true },
            { num: '02', title: 'Connect your WhatsApp Business', done: false, active: false },
            { num: '03', title: 'Add your products & FAQs', done: false, active: false },
          ].map((step) => (
            <div key={step.num} className="flex items-start gap-4">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${
                step.active
                  ? 'bg-earth-500 text-white'
                  : 'bg-sand-800 text-sand-500'
              }`}>
                {step.num}
              </div>
              <div>
                <p className={`font-semibold ${step.active ? 'text-white' : 'text-sand-500'}`}>
                  {step.title}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="relative z-10">
          <div className="h-px bg-sand-800 mb-5" />
          <p className="text-sand-500 text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-earth-400 font-semibold hover:text-earth-300">
              Sign in
            </Link>
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
            <h2 className="font-display font-bold text-3xl text-sand-900 mb-2">Start for free</h2>
            <p className="text-sand-500 text-sm">
              Set up your AI sales assistant in minutes. No credit card needed.
            </p>
          </div>

          {error && (
            <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <Input
              label="Business name"
              type="text"
              placeholder="e.g. Amara's Boutique"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              required
            />
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
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              disabled={loading}
            >
              {loading ? 'Creating account…' : 'Create free account →'}
            </Button>
          </form>

          <p className="text-center text-sm text-sand-500 mt-6">
            Have an account?{' '}
            <Link href="/login" className="text-earth-600 font-semibold hover:text-earth-700">
              Sign in
            </Link>
          </p>

          <p className="text-center text-xs text-sand-400 mt-4">
            By signing up, you agree to our Terms of Service and Privacy Policy.
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
