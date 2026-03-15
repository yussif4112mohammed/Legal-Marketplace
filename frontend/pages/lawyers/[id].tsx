import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { GetServerSideProps } from 'next';
import { MapPin, Briefcase, Shield, ExternalLink, MessageSquare, Calendar, DollarSign, Loader2 } from 'lucide-react';
import axios from 'axios';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import StarRating from '../../components/shared/StarRating';
import { bookingsAPI } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function LawyerProfilePage({ lawyer }: { lawyer: any }) {
  const { user } = useAuth();
  const router   = useRouter();
  const [date,     setDate]     = useState('');
  const [time,     setTime]     = useState('10:00');
  const [duration, setDuration] = useState(60);
  const [notes,    setNotes]    = useState('');
  const [booking,  setBooking]  = useState(false);

  if (!lawyer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">⚖️</div>
          <h2 className="text-xl font-semibold text-navy-950 mb-2">Lawyer not found</h2>
          <Link href="/lawyers" className="btn-primary mt-4">Back to Directory</Link>
        </div>
      </div>
    );
  }

  const initials   = `${lawyer.first_name?.[0] ?? ''}${lawyer.last_name?.[0] ?? ''}`;
  const location   = [lawyer.city, lawyer.state].filter(Boolean).join(', ');
  const totalFee   = ((lawyer.consultation_fee * duration) / 60).toFixed(2);
  const tomorrow   = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate    = tomorrow.toISOString().split('T')[0];

  const handleBook = async () => {
    if (!user) { toast.error('Please sign in to book'); router.push('/auth/login'); return; }
    if (user.role !== 'client') { toast.error('Only clients can book consultations'); return; }
    if (!date) { toast.error('Please select a date'); return; }

    setBooking(true);
    try {
      const scheduledAt = new Date(`${date}T${time}:00`).toISOString();
      await bookingsAPI.create({ lawyerId: lawyer.id, scheduledAt, durationMinutes: duration, notes });
      toast.success('Consultation request sent! The attorney will confirm shortly.');
      router.push('/dashboard/client');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Booking failed. Please try again.');
    } finally {
      setBooking(false);
    }
  };

  return (
    <>
      <Head>
        <title>{lawyer.first_name} {lawyer.last_name} — Attorney | LexBridge</title>
      </Head>

      <Navbar />

      <main className="min-h-screen bg-gray-50 pt-20">
        {/* Banner */}
        <div className="bg-navy-950 py-12">
          <div className="container-lg">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
              {lawyer.avatar_url ? (
                <img src={lawyer.avatar_url} alt=""
                  className="w-24 h-24 rounded-2xl object-cover border-4 border-white/20 flex-shrink-0" />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-gold-500 text-navy-950 flex items-center justify-center text-3xl font-bold border-4 border-white/20 flex-shrink-0"
                  style={{ fontFamily: 'Playfair Display, serif' }}>{initials}</div>
              )}

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-1">
                  <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                    {lawyer.first_name} {lawyer.last_name}, Esq.
                  </h1>
                  <span className="badge bg-gold-500/20 text-gold-300 border border-gold-500/30">
                    <Shield className="w-3 h-3" /> Verified
                  </span>
                </div>
                {lawyer.law_firm && <p className="text-gray-300 text-lg">{lawyer.law_firm}</p>}
                <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-400">
                  {location && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{location}</span>}
                  <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" />{lawyer.years_experience} yrs exp.</span>
                </div>
                <div className="mt-3">
                  <StarRating rating={Number(lawyer.avg_rating)} size="md" showValue totalReviews={lawyer.total_reviews} />
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <div className="text-3xl font-bold text-gold-400" style={{ fontFamily: 'Playfair Display, serif' }}>
                  ${lawyer.consultation_fee}
                </div>
                <div className="text-gray-400 text-sm">per hour</div>
              </div>
            </div>
          </div>
        </div>

        <div className="container-lg py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main */}
            <div className="lg:col-span-2 space-y-6">
              {lawyer.bio && (
                <div className="card p-6">
                  <h2 className="text-xl font-semibold text-navy-950 mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>About</h2>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-line">{lawyer.bio}</p>
                </div>
              )}

              {lawyer.specializations?.length > 0 && (
                <div className="card p-6">
                  <h2 className="text-xl font-semibold text-navy-950 mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>Practice Areas</h2>
                  <div className="flex flex-wrap gap-2">
                    {lawyer.specializations.map((s: any) => (
                      <span key={s.id} className="badge-gold px-3 py-1.5 text-sm">{s.icon} {s.name}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="card p-6">
                <h2 className="text-xl font-semibold text-navy-950 mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>Bar Credentials</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-xs text-gray-400 mb-1">License Number</div>
                    <div className="font-semibold text-navy-950">{lawyer.bar_license_number}</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-xs text-gray-400 mb-1">Bar State</div>
                    <div className="font-semibold text-navy-950">{lawyer.bar_state}</div>
                  </div>
                </div>
                {lawyer.practiceStates?.length > 0 && (
                  <div className="mt-4">
                    <div className="text-sm text-gray-500 mb-2">Licensed to practice in:</div>
                    <div className="flex flex-wrap gap-1.5">
                      {lawyer.practiceStates.map((s: string) => (
                        <span key={s} className="badge-gray">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Reviews */}
              <div className="card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-navy-950" style={{ fontFamily: 'Playfair Display, serif' }}>Client Reviews</h2>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-bold text-navy-950">{Number(lawyer.avg_rating).toFixed(1)}</span>
                    <div>
                      <StarRating rating={Number(lawyer.avg_rating)} size="sm" />
                      <div className="text-xs text-gray-400">{lawyer.total_reviews} reviews</div>
                    </div>
                  </div>
                </div>

                {lawyer.reviews?.length === 0 ? (
                  <p className="text-center text-gray-400 py-8">No reviews yet.</p>
                ) : (
                  <div className="space-y-5">
                    {lawyer.reviews.map((r: any) => (
                      <div key={r.id} className="border-b border-gray-100 pb-5 last:border-0 last:pb-0">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-9 h-9 rounded-full bg-navy-900 text-white text-xs font-bold flex items-center justify-center">
                            {r.first_name[0]}{r.last_name[0]}
                          </div>
                          <div>
                            <div className="font-medium text-navy-950 text-sm">{r.first_name} {r.last_name}</div>
                            <div className="text-xs text-gray-400">{format(new Date(r.created_at), 'MMMM d, yyyy')}</div>
                          </div>
                          <div className="ml-auto"><StarRating rating={r.rating} size="xs" /></div>
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed">{r.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              {/* Booking card */}
              <div className="card p-6 border-2 border-navy-900">
                <div className="text-center mb-5">
                  <div className="text-2xl font-bold text-navy-950" style={{ fontFamily: 'Playfair Display, serif' }}>
                    ${lawyer.consultation_fee}<span className="text-sm font-normal text-gray-500">/hr</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="label">Date</label>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)}
                      min={minDate} className="input" />
                  </div>
                  <div>
                    <label className="label">Time</label>
                    <select value={time} onChange={e => setTime(e.target.value)} className="input">
                      {Array.from({ length: 20 }, (_, i) => {
                        const h = Math.floor(i / 2) + 8;
                        const m = i % 2 === 0 ? '00' : '30';
                        const v = `${String(h).padStart(2,'0')}:${m}`;
                        const label = `${h > 12 ? h - 12 : h}:${m} ${h >= 12 ? 'PM' : 'AM'}`;
                        return <option key={v} value={v}>{label}</option>;
                      })}
                    </select>
                  </div>
                  <div>
                    <label className="label">Duration</label>
                    <select value={duration} onChange={e => setDuration(Number(e.target.value))} className="input">
                      <option value={30}>30 minutes</option>
                      <option value={60}>1 hour</option>
                      <option value={90}>1.5 hours</option>
                      <option value={120}>2 hours</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Notes (optional)</label>
                    <textarea value={notes} onChange={e => setNotes(e.target.value)}
                      rows={3} className="input resize-none"
                      placeholder="Briefly describe your legal matter…" />
                  </div>

                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">${lawyer.consultation_fee}/hr × {duration} min</span>
                      <span className="font-semibold text-navy-950">${totalFee}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Payment at consultation</p>
                  </div>

                  <button onClick={handleBook} disabled={booking} className="btn-gold w-full py-3">
                    {booking
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Booking…</>
                      : `Book with ${lawyer.first_name}`}
                  </button>
                </div>
              </div>

              {/* Contact */}
              <div className="card p-5 space-y-3">
                <Link href={`/messages?with=${lawyer.id}`}
                  className="flex items-center gap-2 text-sm text-navy-900 hover:text-gold-600 transition-colors">
                  <MessageSquare className="w-4 h-4" /> Send a Message
                </Link>
                {lawyer.website_url && (
                  <a href={lawyer.website_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-navy-900 hover:text-gold-600 transition-colors">
                    <ExternalLink className="w-4 h-4" /> Visit Website
                  </a>
                )}
              </div>

              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-xs text-amber-800 leading-relaxed">
                <Shield className="w-3.5 h-3.5 inline mr-1" />
                LexBridge verifies bar licensure only. Always conduct due diligence before retaining any attorney.
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  try {
    const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const { data } = await axios.get(`${API}/api/lawyers/${params?.id}`);
    return { props: { lawyer: data.lawyer } };
  } catch {
    return { props: { lawyer: null } };
  }
};
