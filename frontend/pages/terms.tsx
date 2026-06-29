import Head from 'next/head';
import { AlertTriangle } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

export default function TermsPage() {
  return (
    <>
      <Head><title>Terms of Use | LexBridge</title></Head>
      <Navbar />
      <main className="min-h-screen bg-gray-50 pt-28 pb-16">
        <div className="container-lg max-w-3xl">
          <h1 className="text-4xl font-bold text-navy-950 mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
            Terms of Use
          </h1>
          <p className="text-gray-400 text-sm mb-8">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 mb-8">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">
              This is a starter template, not a finished legal document. Have an actual
              lawyer review and finalize these terms before this platform is used by real
              clients and attorneys.
            </p>
          </div>

          <div className="card p-8 space-y-6 text-gray-700 text-sm leading-relaxed">
            <section>
              <h2 className="text-lg font-semibold text-navy-950 mb-2">1. What LexBridge Is</h2>
              <p>
                LexBridge is a platform that connects clients with independent, licensed
                attorneys. LexBridge is not a law firm, does not employ the attorneys listed
                on the platform, and does not provide legal advice of any kind.
              </p>
            </section>
            <section>
              <h2 className="text-lg font-semibold text-navy-950 mb-2">2. Attorney Verification</h2>
              <p>
                We verify that attorneys on our platform hold a valid license at the time of
                approval. This is not a guarantee of an attorney's competence, conduct, or
                results, and licensing status can change after approval.
              </p>
            </section>
            <section>
              <h2 className="text-lg font-semibold text-navy-950 mb-2">3. Account Responsibilities</h2>
              <p>
                You're responsible for keeping your account credentials secure and for the
                accuracy of information you provide. You agree not to use the platform for
                any unlawful purpose or to misrepresent your identity or qualifications.
              </p>
            </section>
            <section>
              <h2 className="text-lg font-semibold text-navy-950 mb-2">4. Bookings & Fees</h2>
              <p>
                Consultation fees are set by individual attorneys and shown on their profile.
                Any payment arrangement is between the client and the attorney directly,
                unless otherwise stated on the platform.
              </p>
            </section>
            <section>
              <h2 className="text-lg font-semibold text-navy-950 mb-2">5. Limitation of Liability</h2>
              <p>
                LexBridge is provided "as is." We are not liable for the advice, actions, or
                omissions of any attorney or client using the platform, or for any dispute
                arising between them.
              </p>
            </section>
            <section>
              <h2 className="text-lg font-semibold text-navy-950 mb-2">6. Changes to These Terms</h2>
              <p>
                We may update these terms from time to time. Continued use of the platform
                after changes means you accept the updated terms.
              </p>
            </section>
            <section>
              <h2 className="text-lg font-semibold text-navy-950 mb-2">7. Contact</h2>
              <p>Questions about these terms? Reach us at support@lexbridge.app.</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
