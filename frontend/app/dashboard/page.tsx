'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase, Conversation, Lead } from '@/lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import { ArrowRight, MessageCircle, Users, Bot } from 'lucide-react';

type Stats = {
  totalConversations: number;
  activeConversations: number;
  totalLeads: number;
  convertedLeads: number;
  botConversations: number;
};

type Activity = {
  id: string;
  type: 'conversation' | 'lead';
  title: string;
  subtitle: string;
  time: string;
  status?: string;
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalConversations: 0,
    activeConversations: 0,
    totalLeads: 0,
    convertedLeads: 0,
    botConversations: 0,
  });
  const [activity, setActivity] = useState<Activity[]>([]);
  const [businessName, setBusinessName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: biz } = await supabase
        .from('businesses')
        .select('id, name')
        .eq('owner_id', user.id)
        .single();

      if (!biz) return;
      setBusinessName(biz.name);

      const [{ data: convos }, { data: leads }] = await Promise.all([
        supabase.from('conversations').select('*').eq('business_id', biz.id),
        supabase.from('leads').select('*').eq('business_id', biz.id),
      ]);

      const c = convos || [];
      const l = leads || [];

      setStats({
        totalConversations: c.length,
        activeConversations: c.filter((x: Conversation) => x.status !== 'closed').length,
        totalLeads: l.length,
        convertedLeads: l.filter((x: Lead) => x.status === 'converted').length,
        botConversations: c.filter((x: Conversation) => x.status === 'bot').length,
      });

      const acts: Activity[] = [
        ...c.slice(0, 4).map((x: Conversation) => ({
          id: x.id,
          type: 'conversation' as const,
          title: x.customer_name || x.customer_phone,
          subtitle: 'Started a conversation',
          time: x.last_message_at,
          status: x.status,
        })),
        ...l.slice(0, 3).map((x: Lead) => ({
          id: x.id,
          type: 'lead' as const,
          title: x.customer_name || x.customer_phone,
          subtitle: x.product_interest ? `Interested in ${x.product_interest}` : 'Lead captured',
          time: x.captured_at,
          status: x.status,
        })),
      ];

      acts.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
      setActivity(acts.slice(0, 6));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  if (loading) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="h-9 bg-sand-200 rounded-xl w-64" />
        <div className="h-px bg-sand-200" />
        <div className="grid grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-sand-200 rounded-2xl" />
          ))}
        </div>
        <div className="h-72 bg-sand-200 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand-50">
      {/* Page header */}
      <div className="px-8 pt-8 pb-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sand-400 text-sm font-semibold mb-1">{greeting}</p>
            <h1 className="font-display font-bold text-3xl text-sand-900">{businessName}</h1>
          </div>
          <Link
            href="/dashboard/conversations"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-earth-500 text-white text-sm font-semibold rounded-xl hover:bg-earth-600 transition-colors"
          >
            Open inbox
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Stats strip */}
      <div className="mx-8 bg-white rounded-2xl border border-sand-200 overflow-hidden mb-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-sand-100">
          {[
            {
              label: 'Total conversations',
              value: stats.totalConversations,
              sub: `${stats.activeConversations} active`,
              href: '/dashboard/conversations',
            },
            {
              label: 'Bot handling',
              value: stats.botConversations,
              sub: 'right now',
              href: '/dashboard/conversations',
            },
            {
              label: 'Leads captured',
              value: stats.totalLeads,
              sub: `${stats.convertedLeads} converted`,
              href: '/dashboard/leads',
            },
            {
              label: 'Bot response rate',
              value: stats.totalConversations > 0
                ? `${Math.round((stats.botConversations / stats.totalConversations) * 100)}%`
                : '—',
              sub: 'automated',
              href: '/dashboard/conversations',
            },
          ].map((stat) => (
            <Link
              key={stat.label}
              href={stat.href}
              className="group px-6 py-6 hover:bg-sand-50 transition-colors"
            >
              <p className="text-xs font-semibold text-sand-400 uppercase tracking-wider mb-2">
                {stat.label}
              </p>
              <p className="font-display font-bold text-4xl text-sand-900 leading-none mb-1.5">
                {stat.value}
              </p>
              <p className="text-sm text-sand-400">{stat.sub}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Activity + Quick actions */}
      <div className="px-8 grid grid-cols-1 lg:grid-cols-3 gap-6 pb-10">
        {/* Recent activity */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-lg text-sand-900">Recent activity</h2>
            <Link
              href="/dashboard/conversations"
              className="text-sm font-semibold text-earth-500 hover:text-earth-600 transition-colors"
            >
              View all →
            </Link>
          </div>

          {activity.length === 0 ? (
            <div className="bg-white border border-sand-200 rounded-2xl px-6 py-16 text-center">
              <div className="w-12 h-12 bg-sand-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <MessageCircle className="w-6 h-6 text-sand-400" />
              </div>
              <p className="font-semibold text-sand-700 mb-1">No activity yet</p>
              <p className="text-sm text-sand-400 max-w-xs mx-auto">
                When customers message your WhatsApp, conversations will appear here.
              </p>
            </div>
          ) : (
            <div className="bg-white border border-sand-200 rounded-2xl overflow-hidden divide-y divide-sand-100">
              {activity.map((item) => (
                <Link
                  key={item.id}
                  href={item.type === 'conversation' ? '/dashboard/conversations' : '/dashboard/leads'}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-sand-50 transition-colors"
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    item.type === 'conversation' ? 'bg-earth-100' : 'bg-amber-100'
                  }`}>
                    {item.type === 'conversation'
                      ? <MessageCircle className="w-4 h-4 text-earth-600" />
                      : <Users className="w-4 h-4 text-amber-600" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sand-900 text-sm truncate">{item.title}</p>
                    <p className="text-xs text-sand-400 mt-0.5">{item.subtitle}</p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    {item.status && (
                      <StatusDot status={item.status} type={item.type} />
                    )}
                    <p className="text-xs text-sand-400 mt-1">
                      {formatDistanceToNow(new Date(item.time), { addSuffix: true })}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="space-y-4">
          <h2 className="font-display font-bold text-lg text-sand-900">Quick actions</h2>

          <div className="space-y-2.5">
            {[
              {
                icon: MessageCircle,
                label: 'View conversations',
                sub: 'Check all customer chats',
                href: '/dashboard/conversations',
                bg: 'bg-earth-50',
                iconColor: 'text-earth-600',
              },
              {
                icon: Users,
                label: 'Manage leads',
                sub: 'Track and update lead status',
                href: '/dashboard/leads',
                bg: 'bg-amber-50',
                iconColor: 'text-amber-600',
              },
              {
                icon: Bot,
                label: 'Knowledge base',
                sub: 'Add products, FAQs, policies',
                href: '/dashboard/settings',
                bg: 'bg-forest-50',
                iconColor: 'text-forest-600',
              },
            ].map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.label}
                  href={action.href}
                  className="flex items-center gap-3.5 p-4 bg-white border border-sand-200 rounded-xl hover:border-sand-300 hover:shadow-soft transition-all group"
                >
                  <div className={`w-9 h-9 ${action.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-4 h-4 ${action.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-sand-900">{action.label}</p>
                    <p className="text-xs text-sand-400">{action.sub}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-sand-300 group-hover:text-sand-500 transition-colors" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusDot({ status, type }: { status: string; type: string }) {
  if (type === 'conversation') {
    const map: Record<string, string> = {
      bot: 'bg-forest-400',
      human: 'bg-amber-400',
      closed: 'bg-sand-300',
    };
    return (
      <div className={`w-2 h-2 rounded-full ${map[status] || 'bg-sand-300'} ml-auto`} />
    );
  }
  const map: Record<string, string> = {
    new: 'bg-amber-400',
    contacted: 'bg-blue-400',
    converted: 'bg-forest-400',
    lost: 'bg-sand-300',
  };
  return <div className={`w-2 h-2 rounded-full ${map[status] || 'bg-sand-300'} ml-auto`} />;
}
