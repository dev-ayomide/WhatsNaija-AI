'use client';

import { useEffect, useState } from 'react';
import { supabase, Booking } from '@/lib/supabase';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Clock, User, Phone, CheckCircle, XCircle } from 'lucide-react';

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, []);

  async function loadBookings() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: business } = await supabase
        .from('businesses')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (!business) return;

      const { data } = await supabase
        .from('bookings')
        .select('*')
        .eq('business_id', business.id)
        .order('scheduled_at', { ascending: true });

      setBookings(data || []);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  }

  async function updateBookingStatus(bookingId: string, newStatus: string) {
    try {
      await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId);

      setBookings(
        bookings.map((booking) =>
          booking.id === bookingId ? { ...booking, status: newStatus as Booking['status'] } : booking
        )
      );
    } catch (error) {
      console.error('Error updating booking:', error);
    }
  }

  const filteredBookings =
    filter === 'all' ? bookings : bookings.filter((booking) => booking.status === filter);

  const statusCounts = {
    all: bookings.length,
    pending: bookings.filter((b) => b.status === 'pending').length,
    confirmed: bookings.filter((b) => b.status === 'confirmed').length,
    cancelled: bookings.filter((b) => b.status === 'cancelled').length,
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-sand-200 rounded w-1/4"></div>
          <div className="h-96 bg-sand-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand-50">
      {/* Header */}
      <div className="px-8 py-6 bg-white border-b border-sand-200">
        <h1 className="font-display font-bold text-3xl text-sand-900">Bookings</h1>
        <p className="text-sand-400 text-sm mt-1">Manage customer appointments and schedules</p>
      </div>

      <div className="p-8 space-y-6">
      {/* Filters */}
      <div className="flex gap-3">
        {[
          { key: 'all', label: 'All Bookings', count: statusCounts.all },
          { key: 'pending', label: 'Pending', count: statusCounts.pending },
          { key: 'confirmed', label: 'Confirmed', count: statusCounts.confirmed },
          { key: 'cancelled', label: 'Cancelled', count: statusCounts.cancelled },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              filter === tab.key
                ? 'bg-earth-500 text-white'
                : 'bg-white text-sand-700 hover:bg-sand-100 border border-sand-200'
            }`}
          >
            {tab.label}
            <span
              className={`ml-2 px-2 py-0.5 rounded-lg text-xs ${
                filter === tab.key ? 'bg-white/20' : 'bg-sand-100'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Bookings Grid */}
      {filteredBookings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-sand-200 p-12 text-center">
          <CalendarIcon className="w-12 h-12 text-sand-300 mx-auto mb-3" />
          <p className="text-sand-600 font-semibold text-sm">No bookings found</p>
          <p className="text-xs text-sand-400 mt-1">
            Customer appointments will appear here when booked through the bot
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-2xl border border-sand-200 p-6 hover:border-sand-300 transition-all"
            >
              {/* Status Badge */}
              <div className="flex items-center justify-between mb-4">
                <StatusBadge status={booking.status} />
                <div className="flex gap-2">
                  {booking.status === 'pending' && (
                    <>
                      <button
                        onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                        className="p-1.5 text-forest-600 hover:bg-forest-50 rounded-lg transition-colors"
                        title="Confirm"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Cancel"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Date & Time */}
              <div className="mb-4">
                <div className="flex items-center gap-2 text-earth-600 mb-1">
                  <CalendarIcon className="w-5 h-5" />
                  <span className="font-semibold text-lg">
                    {format(new Date(booking.scheduled_at), 'MMM d, yyyy')}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sand-600">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">{format(new Date(booking.scheduled_at), 'h:mm a')}</span>
                </div>
              </div>

              {/* Service */}
              {booking.service && (
                <div className="mb-4 px-3 py-2 bg-amber-50 rounded-xl">
                  <p className="text-sm font-medium text-amber-900">{booking.service}</p>
                </div>
              )}

              {/* Customer Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sand-700">
                  <User className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {booking.customer_name || 'Unknown'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sand-600">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm">{booking.customer_phone}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig = {
    pending: { color: 'bg-amber-100 text-amber-700', label: 'Pending' },
    confirmed: { color: 'bg-forest-100 text-forest-700', label: 'Confirmed' },
    cancelled: { color: 'bg-sand-200 text-sand-700', label: 'Cancelled' },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium ${config.color}`}
    >
      {config.label}
    </span>
  );
}
