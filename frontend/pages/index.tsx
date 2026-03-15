import Head from 'next/head';
import Link from 'next/link';
import { GetServerSideProps } from 'next';
import { Scale, Shield, Star, Clock, ArrowRight, CheckCircle2, Users, Briefcase } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import LawyerCard from '../components/lawyer/LawyerCard';
import axios from 'axios';

const PRACTICE_AREAS = [
  { id: 1, icon: '🏠', name: 'Real Estate Law' },
  { id: 2, icon: '⚖️', name: 'Property Disputes' },
  { id: 3, icon: '🌍', name: 'Immigration Law' },
  { id: 4, icon: '💼', name: 'Business Law' },
  { id: 5, icon: '👨‍👩‍👧', name: 'Family Law' },
  { id: 6, icon: '🛡️', name: 'Criminal Defense' },
  { id: 7, icon: '🏥', name: 'Personal Injury' },
  { id: 8, icon: '📋', name: 'Employment Law' },
];

export default function HomePage({ featuredLawyers }: { featuredLawyers: any[] }) {
  const stats = [
    { value: '10,000+', label: 'Licensed Attorneys' },
    { value: '50',      label: 'States Covered' },
    { value: '98%',     label: 'Client Satisfaction' },
    { value: '24hr',    label: 'Avg. Response Time' },
  ];

  const steps = [
    { n: '01', title: 'Search Attorneys', desc: 'Filter by state, practice area, price, and rating.' },
    { n: '02', title: 'Review Profiles',  desc: 'Verify bar credentials, experience, and client reviews.' },
    { n: '03', title: 'Book a Consult',   desc: 'Schedule a time that works for you in 2 minutes.' },
    { n: '04', title: 'Get Legal Help',   desc: 'Receive expert legal guidance for your specific case.' },
  ];

  const features = [
    { icon: Shield, title: 'Bar Verified',    desc: 'Every attorney is vetted against state bar records.' },
    { icon: Star,   title: 'Real Reviews',    desc: 'Honest ratings from verified consultation clients.' },
    { icon: Clock,  title: 'Fast Booking',    desc: 'Request a consultation in under 2 minutes.' },
    { icon: Users,  title: 'All Areas',       desc: 'Specialists for every legal situation nationwide.' },
  ];

  return (
    <>
      <Head>
        <title>LexBridge — Find Licensed Attorneys Across the US</title>
        <meta name="description" content="Connect with verified, licensed attorneys for real estate, immigration, business, and family law across all 50 states." />
      </Head>

      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center bg-navy-950 overflow-hidden">
        {/* Grid background */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '36px 36px' }}
        />
        <div className="absolute -bottom-32 -left-32 w-[600px] h-[600px] bg-navy-800/40 rounded-full blur-3xl" />
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-gold-500/5 rounded-full blur-3xl" />

        <div className="container-lg relative pt-28 pb-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-gold-500/10 border border-gold-500/20 rounded-full px-4 py-1.5 mb-8">
              <span className="w-2 h-2 rounded-full bg-gold-400 animate-pulse" />
              <span className="text-gold-400 text-sm font-medium">Trusted by 50,000+ clients nationwide</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-6"
              style={{ fontFamily: 'Playfair Display, serif' }}>
              Find the Right{' '}
              <span className="text-gold-400">Attorney</span>{' '}
              for Your Case
            </h1>

            <p className="text-xl text-gray-300 mb-10 leading-relaxed max-w-2xl">
              Connect with verified, licensed lawyers across all 50 states. Real estate, immigration, business, family law — expert legal help is one search away.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/lawyers" className="btn-gold text-base px-8 py-4">
                Find a Lawyer <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/auth/register?role=lawyer"
                className="btn text-base px-8 py-4 border-2 border-white/30 text-white hover:bg-white hover:text-navy-950">
                Join as Attorney
              </Link>
            </div>

            <div className="flex flex-wrap gap-6 mt-10">
              {['No signup to browse', 'Verified bar licenses', 'Free to search'].map(f => (
                <div key={f} className="flex items-center gap-2 text-sm text-gray-400">
                  <CheckCircle2 className="w-4 h-4 text-gold-400 flex-shrink-0" />
                  {f}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ──────────────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100 py-12">
        <div className="container-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map(s => (
              <div key={s.label}>
                <div className="text-4xl font-bold text-navy-900 mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>
                  {s.value}
                </div>
                <div className="text-sm text-gray-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Practice Areas ─────────────────────────────────────── */}
      <section className="section bg-gray-50">
        <div className="container-lg">
          <div className="text-center mb-12">
            <h2 className="section-title mb-3">Browse by Practice Area</h2>
            <p className="text-gray-500 text-lg">Find specialists for any legal matter</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {PRACTICE_AREAS.map(area => (
              <Link key={area.id} href={`/lawyers?spec=${area.id}`}
                className="card p-5 text-center group hover:border-navy-900 border-2 border-transparent">
                <div className="text-3xl mb-3">{area.icon}</div>
                <div className="text-sm font-medium text-navy-900 group-hover:text-navy-700">{area.name}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Lawyers ───────────────────────────────────── */}
      {featuredLawyers?.length > 0 && (
        <section className="section bg-white">
          <div className="container-lg">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="section-title mb-2">Top-Rated Attorneys</h2>
                <p className="text-gray-500">Highly reviewed lawyers across all practice areas</p>
              </div>
              <Link href="/lawyers" className="btn-outline hidden md:flex">View All</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredLawyers.map(l => <LawyerCard key={l.id} lawyer={l} />)}
            </div>
            <div className="text-center mt-8 md:hidden">
              <Link href="/lawyers" className="btn-primary">View All Lawyers</Link>
            </div>
          </div>
        </section>
      )}

      {/* ── How It Works ───────────────────────────────────────── */}
      <section id="how-it-works" className="section bg-gray-50">
        <div className="container-lg">
          <div className="text-center mb-14">
            <h2 className="section-title mb-3">How LexBridge Works</h2>
            <p className="text-gray-500 text-lg">Getting legal help has never been simpler</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((s, i) => (
              <div key={s.n} className="relative">
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-px bg-gray-200 z-0" />
                )}
                <div className="relative z-10 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-navy-950 text-gold-400 flex items-center justify-center text-2xl font-bold mx-auto mb-4"
                    style={{ fontFamily: 'Playfair Display, serif' }}>{s.n}</div>
                  <h3 className="font-semibold text-navy-950 text-lg mb-2">{s.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────── */}
      <section className="section bg-navy-950">
        <div className="container-lg">
          <div className="text-center mb-14">
            <h2 className="section-title text-white mb-3">Why Clients Choose LexBridge</h2>
            <p className="text-gray-400 text-lg">Built for trust and transparency</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map(f => (
              <div key={f.title} className="text-center">
                <div className="w-14 h-14 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center mx-auto mb-4">
                  <f.icon className="w-6 h-6 text-gold-400" />
                </div>
                <h3 className="font-semibold text-white text-lg mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────── */}
      <section className="py-20 bg-gold-500">
        <div className="container-lg text-center">
          <h2 className="text-4xl font-bold text-navy-950 mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Ready to Find Your Attorney?
          </h2>
          <p className="text-navy-800 text-lg mb-8 max-w-xl mx-auto">
            Join thousands of clients who found the legal help they needed through LexBridge.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/lawyers"
              className="inline-flex items-center gap-2 bg-navy-950 text-white px-8 py-4 rounded-xl font-semibold hover:bg-navy-900 transition-colors">
              Search Lawyers <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/auth/register"
              className="inline-flex items-center gap-2 bg-white text-navy-950 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
              Create Free Account
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const { data } = await axios.get(`${API}/api/lawyers?limit=6`);
    return { props: { featuredLawyers: data.data || [] } };
  } catch {
    return { props: { featuredLawyers: [] } };
  }
};
