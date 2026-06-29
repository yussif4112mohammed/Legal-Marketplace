import Head from 'next/head';
import { AlertTriangle } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

export default function PrivacyPage() {
  return (
    <>
      <Head><title>Privacy Policy | LexBridge</title></Head>
      <Navbar />
      <main className="min-h-screen bg-gray-50 pt-28 pb-16">
        <div className="container-lg max-w-3xl">
          <h1 className="text-4xl font-bold text-navy-950 mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
            Privacy Policy
          </h1>
          <p className="text-gray-400 text-sm mb-8">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 mb-8">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">
              This is a starter template, not a finished legal document. Before this site
              handles real client data, have an actual lawyer review and finalize this
              policy for compliance with applicable law (e.g. Ghana's Data Protection Act,
              or other jurisdictions you operate in).
            </p>
          </div>

          <div className="card p-8 space-y-6 text-gray-700 text-sm leading-relaxed">
            <section>
              <h2 className="text-lg font-semibold text-navy-950 mb-2">1. Information We Collect</h2>
              <p>
                When you create an account, we collect your name, email address, phone number,
                and (for attorneys) professional licensing details. When you use the platform,
                we may also collect booking history, messages exchanged through the platform,
                and reviews you submit.
              </p>
            </section>
            <section>
              <h2 className="text-lg font-semibold text-navy-950 mb-2">2. How We Use Your Information</h2>
              <p>
                We use your information to operate the platform: matching clients with
                attorneys, processing bookings, verifying attorney credentials, and
                communicating with you about your account. We do not sell your personal
                information to third parties.
              </p>
            </section>
            <section>
              <h2 className="text-lg font-semibold text-navy-950 mb-2">3. Data Storage & Security</h2>
              <p>
                Your data is stored on secured, access-controlled servers. Passwords are
                never stored in plain text. While we take reasonable steps to protect your
                information, no system is completely secure, and we cannot guarantee
                absolute security.
              </p>
            </section>
            <section>
              <h2 className="text-lg font-semibold text-navy-950 mb-2">4. Your Rights</h2>
              <p>
                You may request access to, correction of, or deletion of your personal data
                at any time by contacting us at support@lexbridge.app. You may also close
                your account from your profile settings.
              </p>
            </section>
            <section>
              <h2 className="text-lg font-semibold text-navy-950 mb-2">5. Changes to This Policy</h2>
              <p>
                We may update this policy from time to time. We'll note the "last updated"
                date above whenever changes are made.
              </p>
            </section>
            <section>
              <h2 className="text-lg font-semibold text-navy-950 mb-2">6. Contact</h2>
              <p>
                Questions about this policy? Reach us at support@lexbridge.app.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
