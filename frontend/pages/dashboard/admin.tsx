import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Users, Scale, ClipboardCheck, Star, CheckCircle, XCircle, Loader2, BarChart3, AlertCircle, Clock, LogIn, UserPlus, ShieldCheck, ShieldOff, EyeOff, Eye } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import { useAuth } from '../../hooks/useAuth';
import { adminAPI } from '../../lib/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

type Tab = 'overview' | 'pending' | 'users' | 'reviews' | 'activity';

const ACTION_META: Record<string, { label: string; icon: any }> = {
  login:           { label: 'Logged in',          icon: LogIn },
  register:        { label: 'Created account',    icon: UserPlus },
  approve_lawyer:  { label: 'Approved lawyer',     icon: ShieldCheck },
  reject_lawyer:   { label: 'Rejected lawyer',     icon: ShieldOff },
  toggle_user:     { label: 'Changed user status', icon: Users },
  toggle_review:   { label: 'Changed review status', icon: Eye },
};

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [tab,     setTab]     = useState<Tab>('overview');
  const [stats,   setStats]   = useState<any>(null);
  const [pending, setPending] = useState<any[]>([]);
  const [users,   setUsers]   = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [activity,setActivity]= useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push('/auth/login'); return; }
    if (user.role !== 'admin') { router.push('/'); return; }

    Promise.all([
      adminAPI.getStats().then(r => setStats(r.data.stats)),
      adminAPI.getPendingLawyers().then(r => setPending(r.data.lawyers || [])),
      adminAPI.getUsers().then(r => setUsers(r.data.users || [])),
      adminAPI.getReviews().then(r => setReviews(r.data.reviews || [])),
      adminAPI.getLogs().then(r => setActivity(r.data.logs || [])),
    ]).finally(() => setLoading(false));
  }, [user, authLoading]);

  const doAction = async (fn: () => Promise<any>, successMsg: string) => {
    try { await fn(); toast.success(successMsg); } catch { toast.error('Action failed'); }
  };

  const approveLawyer = async (id: number) => {
    await doAction(() => adminAPI.approveLawyer(id), 'Lawyer approved');
    setPending(prev => prev.filter(l => l.id !== id));
  };
  const rejectLawyer = async (id: number) => {
    const reason = prompt('Rejection reason (optional):');
    await doAction(() => adminAPI.rejectLawyer(id, reason || ''), 'Lawyer rejected');
    setPending(prev => prev.filter(l => l.id !== id));
  };
  const toggleUser   = async (id: number) => {
    await doAction(() => adminAPI.toggleUser(id), 'User updated');
    setUsers(prev => prev.map(u => u.id === id ? { ...u, is_active: !u.is_active } : u));
  };
  const toggleReview = async (id: number) => {
    await doAction(() => adminAPI.toggleReview(id), 'Review updated');
    setReviews(prev => prev.map(r => r.id === id ? { ...r, is_visible: !r.is_visible } : r));
  };

  const TABS = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'pending',  label: `Pending (${pending.length})`, icon: AlertCircle },
    { id: 'users',    label: 'Users', icon: Users },
    { id: 'reviews',  label: 'Reviews', icon: Star },
    { id: 'activity', label: 'Activity', icon: Clock },
  ];

  if (authLoading || loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-navy-900" />
    </div>
  );

  return (
    <>
      <Head><title>Admin Dashboard | LexBridge</title></Head>
      <Navbar />
      <main className="min-h-screen bg-gray-50 pt-20">
        <div className="container-lg py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-navy-950" style={{ fontFamily: 'Playfair Display, serif' }}>Admin Dashboard</h1>
            <p className="text-gray-500 mt-1">Manage the LexBridge platform</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit mb-8">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id as Tab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  tab === t.id ? 'bg-white shadow-sm text-navy-900' : 'text-gray-500 hover:text-gray-700'
                }`}>
                <t.icon className="w-4 h-4" /> {t.label}
              </button>
            ))}
          </div>

          {/* Overview */}
          {tab === 'overview' && stats && (
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-5">
              {[
                { label: 'Total Users',     value: stats.totalUsers,     icon: Users },
                { label: 'Active Lawyers',  value: stats.activeLawyers,  icon: Scale },
                { label: 'Pending Review',  value: stats.pendingLawyers, icon: AlertCircle },
                { label: 'Total Bookings',  value: stats.totalBookings,  icon: ClipboardCheck },
                { label: 'Total Reviews',   value: stats.totalReviews,   icon: Star },
              ].map(s => (
                <div key={s.label} className="card p-5">
                  <s.icon className="w-6 h-6 text-navy-700 mb-3" />
                  <div className="text-2xl font-bold text-navy-950">{s.value}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Pending lawyers */}
          {tab === 'pending' && (
            <div className="card">
              {pending.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No pending applications</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {pending.map(l => (
                    <div key={l.id} className="p-6 flex flex-col sm:flex-row sm:items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-navy-900 text-white flex items-center justify-center font-bold flex-shrink-0">
                        {l.first_name[0]}{l.last_name[0]}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-navy-950 text-lg">Atty. {l.first_name} {l.last_name}</div>
                        <div className="text-sm text-gray-500">{l.email}</div>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-1 mt-3 text-sm">
                          <div><span className="text-gray-400">License:</span> <span className="font-medium">{l.bar_license_number}</span></div>
                          <div><span className="text-gray-400">State:</span> <span className="font-medium">{l.bar_state}</span></div>
                          <div><span className="text-gray-400">Firm:</span> <span className="font-medium">{l.law_firm || '—'}</span></div>
                          <div><span className="text-gray-400">Exp:</span> <span className="font-medium">{l.years_experience} yrs</span></div>
                          <div><span className="text-gray-400">Fee:</span> <span className="font-medium">${l.consultation_fee}/hr</span></div>
                          <div><span className="text-gray-400">Applied:</span> <span className="font-medium">{format(new Date(l.created_at), 'MMM d, yyyy')}</span></div>
                        </div>
                        {l.specializations && (
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {l.specializations.split(', ').map((s: string) => (
                              <span key={s} className="badge-gold text-xs">{s}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button onClick={() => approveLawyer(l.id)}
                          className="flex items-center gap-1.5 bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-green-700">
                          <CheckCircle className="w-4 h-4" /> Approve
                        </button>
                        <button onClick={() => rejectLawyer(l.id)}
                          className="flex items-center gap-1.5 bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-red-700">
                          <XCircle className="w-4 h-4" /> Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Users */}
          {tab === 'users' && (
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>{['Name','Email','Role','Joined','Status','Action'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {users.map(u => (
                      <tr key={u.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-navy-950">{u.first_name} {u.last_name}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{u.email}</td>
                        <td className="px-4 py-3">
                          <span className={u.role === 'lawyer' ? 'badge-gold' : u.role === 'admin' ? 'badge bg-purple-100 text-purple-800' : 'badge-gray'}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{format(new Date(u.created_at), 'MMM d, yyyy')}</td>
                        <td className="px-4 py-3">
                          <span className={u.is_active ? 'badge-green' : 'badge-red'}>{u.is_active ? 'Active' : 'Suspended'}</span>
                        </td>
                        <td className="px-4 py-3">
                          {u.role !== 'admin' && (
                            <button onClick={() => toggleUser(u.id)} className="text-xs text-gray-500 hover:text-red-600 underline">
                              {u.is_active ? 'Suspend' : 'Restore'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Reviews */}
          {tab === 'reviews' && (
            <div className="card divide-y divide-gray-100">
              {reviews.map(r => (
                <div key={r.id} className="p-5 flex gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-sm mb-1">
                      <span className="font-medium text-navy-950">{r.client_first} {r.client_last}</span>
                      <span className="text-gray-400">→</span>
                      <span className="text-gray-600">Atty. {r.lawyer_first} {r.lawyer_last}</span>
                      <span className="ml-auto text-gold-400">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                    </div>
                    <p className="text-sm text-gray-600">{r.comment}</p>
                    <p className="text-xs text-gray-400 mt-1">{format(new Date(r.created_at), 'MMM d, yyyy')}</p>
                  </div>
                  <button onClick={() => toggleReview(r.id)}
                    className={`text-xs font-medium px-3 py-1.5 rounded-lg flex-shrink-0 h-fit ${
                      r.is_visible ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-700 hover:bg-green-100'
                    }`}>
                    {r.is_visible ? 'Hide' : 'Show'}
                  </button>
                </div>
              ))}
            </div>
          )}
          {/* Activity */}
          {tab === 'activity' && (
            <div className="card divide-y divide-gray-100">
              {activity.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No activity recorded yet</p>
                </div>
              ) : (
                activity.map((a: any) => {
                  const meta = ACTION_META[a.action] || { label: a.action, icon: Clock };
                  return (
                    <div key={a.id} className="p-4 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-navy-50 text-navy-700 flex items-center justify-center flex-shrink-0">
                        <meta.icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 text-sm">
                        <span className="font-medium text-navy-950">{a.first_name} {a.last_name}</span>
                        <span className="text-gray-500"> — {meta.label}</span>
                      </div>
                      <div className="text-xs text-gray-400 flex-shrink-0">
                        {format(new Date(a.created_at), 'MMM d, h:mm a')}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
