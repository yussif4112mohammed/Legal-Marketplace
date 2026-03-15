import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Calendar, Users, DollarSign, Clock, CheckCircle, Loader2 } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import { useAuth } from '../../hooks/useAuth';
import { bookingsAPI } from '../../lib/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function LawyerDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push('/auth/login'); return; }
    if (user.role !== 'lawyer') { router.push(`/dashboard/${user.role}`); return; }

    bookingsAPI.getAll()
      .then(r => setBookings(r.data.bookings || []))
      .catch(() => toast.error('Failed to load bookings'))
      .finally(() => setLoading(false));
  }, [user, authLoading]);

  const update = async (id: number, status: string) => {
    try {
      await bookingsAPI.update(id, { status });
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
      toast.success('Booking updated');
    } catch {
      toast.error('Update failed');
    }
  };

  const pending   = bookings.filter(b => b.status === 'pending');
  const confirmed = bookings.filter(b => b.status === 'confirmed');
  const completed = bookings.filter(b => b.status === 'completed');
  const revenue   = completed.reduce((sum, b) => sum + Number(b.fee_charged || 0), 0);

  if (authLoading || loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-navy-900" />
    </div>
  );

  return (
    <>
      <Head><title>Lawyer Dashboard | LexBridge</title></Head>
      <Navbar />
      <main className="min-h-screen bg-gray-50 pt-20">
        <div className="container-lg py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-navy-950" style={{ fontFamily: 'Playfair Display, serif' }}>
              Attorney Dashboard
            </h1>
            <p className="text-gray-500 mt-1">Atty. {user?.firstName} {user?.lastName}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {[
              { label: 'Pending',   value: pending.length,   icon: Clock,     cls: 'text-yellow-700 bg-yellow-50' },
              { label: 'Confirmed', value: confirmed.length, icon: Calendar,  cls: 'text-blue-700 bg-blue-50' },
              { label: 'Completed', value: completed.length, icon: CheckCircle, cls: 'text-green-700 bg-green-50' },
              { label: 'Est. Revenue', value: `$${revenue.toFixed(0)}`, icon: DollarSign, cls: 'text-amber-700 bg-amber-50' },
            ].map(s => (
              <div key={s.label} className="card p-5">
                <div className={`inline-flex p-2.5 rounded-xl ${s.cls} mb-3`}><s.icon className="w-5 h-5" /></div>
                <div className="text-2xl font-bold text-navy-950">{s.value}</div>
                <div className="text-sm text-gray-500 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Pending requests */}
          {pending.length > 0 && (
            <div className="card p-6 mb-6">
              <h2 className="text-xl font-semibold text-navy-950 mb-5" style={{ fontFamily: 'Playfair Display, serif' }}>
                New Requests ({pending.length})
              </h2>
              <div className="space-y-4">
                {pending.map(b => (
                  <div key={b.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-yellow-50 border border-yellow-100 rounded-xl">
                    <div className="w-10 h-10 rounded-xl bg-navy-900 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {b.client_first?.[0]}{b.client_last?.[0]}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-navy-950">{b.client_first} {b.client_last}</div>
                      <div className="text-sm text-gray-500">{b.client_email}</div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {format(new Date(b.scheduled_at), 'MMM d, yyyy · h:mm a')} · {b.duration_minutes} min
                      </div>
                      {b.notes && <div className="text-xs text-gray-600 mt-1 italic">"{b.notes}"</div>}
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => update(b.id, 'confirmed')} className="btn-primary text-sm py-1.5 px-4">Accept</button>
                      <button onClick={() => update(b.id, 'cancelled')}
                        className="text-sm px-4 py-1.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Confirmed */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-navy-950 mb-5" style={{ fontFamily: 'Playfair Display, serif' }}>
              Upcoming Consultations
            </h2>
            {confirmed.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p>No upcoming consultations</p>
              </div>
            ) : (
              <div className="space-y-3">
                {confirmed.map(b => (
                  <div key={b.id} className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                    <div className="w-10 h-10 rounded-xl bg-navy-900 text-white flex items-center justify-center font-bold text-sm">
                      {b.client_first?.[0]}{b.client_last?.[0]}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-navy-950">{b.client_first} {b.client_last}</div>
                      <div className="text-xs text-gray-500">{format(new Date(b.scheduled_at), 'MMM d, yyyy · h:mm a')} · {b.duration_minutes} min</div>
                    </div>
                    <button onClick={() => update(b.id, 'completed')}
                      className="text-sm text-green-700 font-medium hover:underline">
                      Mark Complete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
