'use client';

import { useEffect, useState } from 'react';
import { supabase, Lead } from '@/lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import { Users, Phone } from 'lucide-react';

type FilterKey = 'all' | 'new' | 'contacted' | 'converted' | 'lost';

const STATUS_CONFIG = {
  new:       { label: 'New',       classes: 'bg-amber-100 text-amber-700' },
  contacted: { label: 'Contacted', classes: 'bg-blue-100 text-blue-700' },
  converted: { label: 'Converted', classes: 'bg-forest-100 text-forest-700' },
  lost:      { label: 'Lost',      classes: 'bg-sand-200 text-sand-600' },
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filter, setFilter] = useState<FilterKey>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadLeads(); }, []);

  async function loadLeads() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: biz } = await supabase
        .from('businesses')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (!biz) return;

      const { data } = await supabase
        .from('leads')
        .select('*')
        .eq('business_id', biz.id)
        .order('captured_at', { ascending: false });

      setLeads(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: string, status: string) {
    await supabase.from('leads').update({ status }).eq('id', id);
    setLeads((prev) => prev.map((l) => l.id === id ? { ...l, status: status as Lead['status'] } : l));
  }

  const counts: Record<FilterKey, number> = {
    all:       leads.length,
    new:       leads.filter((l) => l.status === 'new').length,
    contacted: leads.filter((l) => l.status === 'contacted').length,
    converted: leads.filter((l) => l.status === 'converted').length,
    lost:      leads.filter((l) => l.status === 'lost').length,
  };

  const visible = filter === 'all' ? leads : leads.filter((l) => l.status === filter);

  if (loading) {
    return (
      <div className="p-8 animate-pulse space-y-6">
        <div className="h-8 bg-sand-200 rounded-xl w-32" />
        <div className="h-64 bg-sand-200 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand-50 p-8">
      {/* Header */}
      <div className="mb-7">
        <h1 className="font-display font-bold text-3xl text-sand-900 mb-1">Leads</h1>
        <p className="text-sand-400 text-sm">{leads.length} total leads captured by your bot</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {(['all', 'new', 'contacted', 'converted', 'lost'] as FilterKey[]).map((key) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
              filter === key
                ? 'bg-earth-500 text-white shadow-[0_2px_8px_rgba(196,112,74,0.3)]'
                : 'bg-white border border-sand-200 text-sand-600 hover:border-sand-300 hover:text-sand-900'
            }`}
          >
            <span className="capitalize">{key === 'all' ? 'All leads' : key}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded-md font-bold ${
              filter === key ? 'bg-white/20 text-white' : 'bg-sand-100 text-sand-500'
            }`}>
              {counts[key]}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      {visible.length === 0 ? (
        <div className="bg-white border border-sand-200 rounded-2xl px-6 py-20 text-center">
          <div className="w-12 h-12 bg-sand-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Users className="w-6 h-6 text-sand-400" />
          </div>
          <p className="font-semibold text-sand-700 mb-1">No leads yet</p>
          <p className="text-sm text-sand-400 max-w-xs mx-auto">
            Leads are captured automatically when your bot qualifies a customer.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-sand-200 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-sand-100 bg-sand-50/80">
                <th className="px-5 py-3.5 text-left text-xs font-bold text-sand-500 uppercase tracking-wider">Customer</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-sand-500 uppercase tracking-wider">Interest</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-sand-500 uppercase tracking-wider">Budget</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-sand-500 uppercase tracking-wider">Captured</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-sand-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-sand-500 uppercase tracking-wider">Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-100">
              {visible.map((lead) => {
                const statusCfg = STATUS_CONFIG[lead.status] || STATUS_CONFIG.new;
                return (
                  <tr key={lead.id} className="hover:bg-sand-50/60 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-sand-900 text-sm">{lead.customer_name || 'Unknown'}</p>
                      <div className="flex items-center gap-1 mt-0.5 text-xs text-sand-400">
                        <Phone className="w-3 h-3" />
                        {lead.customer_phone}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-sand-700">{lead.product_interest || '—'}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-sand-700">{lead.budget_range || '—'}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-xs text-sand-400">
                        {formatDistanceToNow(new Date(lead.captured_at), { addSuffix: true })}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${statusCfg.classes}`}>
                        {statusCfg.label}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <select
                        value={lead.status}
                        onChange={(e) => updateStatus(lead.id, e.target.value)}
                        className="px-3 py-1.5 bg-white border border-sand-200 rounded-lg text-xs font-semibold text-sand-700 focus:outline-none focus:ring-2 focus:ring-earth-500/30 focus:border-earth-400 cursor-pointer hover:border-sand-300 transition-colors"
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="converted">Converted</option>
                        <option value="lost">Lost</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
