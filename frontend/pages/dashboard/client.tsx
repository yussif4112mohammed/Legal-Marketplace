import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Calendar, Search, Clock, CheckCircle, XCircle, Loader2, Star } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import { useAuth } from '../../hooks/useAuth';
import { bookingsAPI } from '../../lib/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  pending:   { label: 'Pending',   cls: 'badge bg-yellow-100 text-yellow-800' },
  confirmed: { label: 'Confirmed', cls: 'badge bg-blue-100 text-blue-800' },
  completed: { label: 'Completed', cls: 'badge bg-green-100 text-green-800' },
  cancelled: { label: 'Cancelled', cls: 'badge bg-red-100 text-red-800' },
  no_show:   { label: 'No Show',   cls: 'badge bg-gray-100 text-gray-700' },
};

export default function ClientDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push('/auth/login'); return; }
    if (user.role !== 'client') { router.push(`/dashboard/${user.role}`); return; }

    bookingsAPI.getAll()
      .then(r => setBookings(r.data.bookings || []))
      .catch(() => toast.error('Failed to load bookings'))
      .finally(() => setLoading(false));
  }, [user, authLoading]);

  const cancelBooking = async (id: number) => {
    if (!confirm('Cancel this booking?')) return;
    try {
      await bookingsAPI.update(id, { status: 'cancelled' });
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
      toast.success('Booking cancelled');
    } catch {
      toast.error('Failed to cancel');
    }
  };

  const upcoming = bookings.filter(b => ['pending','confirmed'].includes(b.status));
  const past     = bookings.filter(b => ['completed','cancelled','no_show'].includes(b.status));

  if (authLoading || loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-navy-900" />
    </div>
  );

  return (
    <>
      <Head><title>My Dashboard | LexBridge</title></Head>
      <Navbar />
      <main className="min-h-screen bg-gray-50 pt-20">
        <div className="container-lg py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-navy-950" style={{ fontFamily: 'Playfair Display, serif' }}>
                Welcome, {user?.firstName}
              </h1>
              <p className="text-gray-500 mt-1">Manage your consultations</p>
            </div>
            <Link href="/lawyers" className="btn-primary">
              <Search className="w-4 h-4" /> Find a Lawyer
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-5 mb-8">
            {[
              { label: 'Total Bookings', value: bookings.length, icon: Calendar, cls: 'text-navy-700' },
              { label: 'Upcoming',       value: upcoming.length, icon: Clock,    cls: 'text-blue-600' },
              { label: 'Completed',      value: past.filter(b=>b.status==='completed').length, icon: CheckCircle, cls: 'text-green-600' },
            ].map(s => (
              <div key={s.label} className="card p-5 flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-gray-100 ${s.cls}`}><s.icon className="w-5 h-5" /></div>
                <div>
                  <div className="text-2xl font-bold text-navy-950">{s.value}</div>
                  <div className="text-sm text-gray-500">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Upcoming */}
          <div className="card p-6 mb-6">
            <h2 className="text-xl font-semibold text-navy-950 mb-5" style={{ fontFamily: 'Playfair Display, serif' }}>
              Upcoming Consultations
            </h2>
            {upcoming.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p>No upcoming consultations</p>
                <Link href="/lawyers" className="text-navy-900 text-sm font-medium hover:underline mt-2 inline-block">Find a lawyer →</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {upcoming.map(b => {
                  const sc = STATUS_CONFIG[b.status];
                  return (
                    <div key={b.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="w-12 h-12 rounded-xl bg-navy-900 text-white flex items-center justify-center font-bold">
                        {b.lawyer_first?.[0]}{b.lawyer_last?.[0]}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-navy-950">Atty. {b.lawyer_first} {b.lawyer_last}</div>
                        <div className="text-sm text-gray-500">{b.law_firm || 'Independent Practice'}</div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          {format(new Date(b.scheduled_at), 'MMM d, yyyy · h:mm a')} · {b.duration_minutes} min
                        </div>
                      </div>
                      <div className="text-right space-y-1.5">
                        <span className={sc.cls}>{sc.label}</span>
                        {b.status === 'pending' && (
                          <button onClick={() => cancelBooking(b.id)} className="block text-xs text-red-500 hover:underline">Cancel</button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Past */}
          {past.length > 0 && (
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-navy-950 mb-5" style={{ fontFamily: 'Playfair Display, serif' }}>
                Past Consultations
              </h2>
              <div className="space-y-3">
                {past.map(b => {
                  const sc = STATUS_CONFIG[b.status];
                  return (
                    <div key={b.id} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100">
                      <div className="w-10 h-10 rounded-xl bg-gray-200 text-gray-600 flex items-center justify-center font-bold text-sm">
                        {b.lawyer_first?.[0]}{b.lawyer_last?.[0]}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-navy-950 text-sm">Atty. {b.lawyer_first} {b.lawyer_last}</div>
                        <div className="text-xs text-gray-400">{format(new Date(b.scheduled_at), 'MMM d, yyyy')}</div>
                      </div>
                      <span className={sc.cls}>{sc.label}</span>
                      {b.status === 'completed' && (
                        <Link href={`/lawyers/${b.lawyer_id}`} className="text-xs text-gold-600 font-medium hover:underline flex items-center gap-1">
                          <Star className="w-3 h-3" /> Review
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
