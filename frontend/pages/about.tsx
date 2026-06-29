import Head from 'next/head';
import { Scale, ShieldCheck, Users, Target } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

export default function AboutPage() {
  return (
    <>
      <Head><title>About Us | LexBridge</title></Head>
      <Navbar />
      <main className="min-h-screen bg-gray-50 pt-28 pb-16">
        <div className="container-lg max-w-3xl">
          <h1 className="text-4xl font-bold text-navy-950 mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            About LexBridge
          </h1>
          <p className="text-gray-500 text-lg mb-10">
            We make it simple to find the right attorney, with confidence.
          </p>

          <div className="card p-8 mb-8">
            <p className="text-gray-700 leading-relaxed mb-4">
              LexBridge is a legal marketplace built to close the gap between people who need
              legal help and licensed attorneys who can provide it. Finding a lawyer shouldn't
              feel like a gamble — so every attorney on our platform has their credentials
              verified before they can accept a single client.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Whether you're dealing with a property dispute, an immigration matter, a business
              question, or a family law issue, LexBridge helps you find someone qualified,
              reviewed by past clients, and ready to help — without the guesswork.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
            {[
              { icon: ShieldCheck, title: 'Verified Credentials', desc: 'Every attorney is checked for valid licensure before approval.' },
              { icon: Users,       title: 'Real Client Reviews',  desc: 'Honest feedback from people who\u2019ve actually used the service.' },
              { icon: Target,      title: 'Built for Clarity',    desc: 'No hidden fees, no confusing legal jargon — just clear next steps.' },
            ].map(item => (
              <div key={item.title} className="card p-6">
                <item.icon className="w-6 h-6 text-navy-700 mb-3" />
                <h3 className="font-semibold text-navy-950 mb-1.5">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="card p-8 bg-navy-950 text-white">
            <Scale className="w-7 h-7 text-gold-400 mb-3" />
            <h2 className="text-xl font-semibold mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
              An important note
            </h2>
            <p className="text-gray-300 text-sm leading-relaxed">
              LexBridge is not a law firm and does not provide legal advice. We verify attorney
              licensure status only — we don't guarantee outcomes, and using our platform does
              not create an attorney-client relationship until you've separately engaged a
              lawyer directly.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
