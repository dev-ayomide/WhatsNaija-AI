'use client';

import { useEffect, useState, ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, MessageCircle, Users,
  Calendar, Settings, LogOut, ChevronRight,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

const navigation = [
  { name: 'Overview',       href: '/dashboard',               icon: LayoutDashboard },
  { name: 'Conversations',  href: '/dashboard/conversations',  icon: MessageCircle },
  { name: 'Leads',          href: '/dashboard/leads',          icon: Users },
  { name: 'Bookings',       href: '/dashboard/bookings',       icon: Calendar },
  { name: 'Settings',       href: '/dashboard/settings',       icon: Settings },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [businessName, setBusinessName] = useState('');
  const [botActive, setBotActive] = useState(true);

  useEffect(() => {
    async function loadBusiness() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const { data: biz } = await supabase
        .from('businesses')
        .select('name, is_active')
        .eq('owner_id', user.id)
        .single();

      if (!biz) { router.push('/onboard'); return; }

      setBusinessName(biz.name);
      setBotActive(biz.is_active);
    }
    loadBusiness();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  return (
    <div className="min-h-screen bg-sand-50 flex">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-60 bg-white border-r border-sand-200 flex flex-col z-20">
        {/* Logo */}
        <div className="px-6 py-6 border-b border-sand-100">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-earth-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="font-display font-bold text-sand-900 text-sm leading-tight truncate">WhatsNaija AI</p>
              {businessName && (
                <p className="text-xs text-sand-400 truncate font-medium">{businessName}</p>
              )}
            </div>
          </Link>
        </div>

        {/* Bot status pill */}
        <div className="px-4 py-3">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${botActive ? 'bg-forest-50' : 'bg-sand-100'}`}>
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${botActive ? 'bg-forest-500 animate-pulse' : 'bg-sand-400'}`} />
            <span className={`text-xs font-semibold ${botActive ? 'text-forest-700' : 'text-sand-500'}`}>
              {botActive ? 'Bot is active' : 'Bot is paused'}
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group ${
                  isActive
                    ? 'bg-earth-500 text-white'
                    : 'text-sand-600 hover:bg-sand-100 hover:text-sand-900'
                }`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-sand-400 group-hover:text-sand-700'}`} />
                <span className="flex-1">{item.name}</span>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/60" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-sand-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-sand-500 hover:bg-sand-100 hover:text-sand-900 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="ml-60 flex-1 min-h-screen">
        {children}
      </main>
    </div>
  );
}
