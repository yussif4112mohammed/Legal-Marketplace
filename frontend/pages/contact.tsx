import { useState } from 'react';
import Head from 'next/head';
import { Mail, MapPin, Send, Loader2 } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    // No email-sending service is connected yet — this opens the user's own
    // mail app pre-filled, as a working fallback until one is set up.
    const subject = encodeURIComponent(`LexBridge contact form — ${form.name}`);
    const body = encodeURIComponent(`From: ${form.name} (${form.email})\n\n${form.message}`);
    window.location.href = `mailto:support@lexbridge.app?subject=${subject}&body=${body}`;
    setTimeout(() => { setSending(false); setSent(true); }, 600);
  };

  return (
    <>
      <Head><title>Contact Us | LexBridge</title></Head>
      <Navbar />
      <main className="min-h-screen bg-gray-50 pt-28 pb-16">
        <div className="container-lg max-w-2xl">
          <h1 className="text-4xl font-bold text-navy-950 mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Get in Touch
          </h1>
          <p className="text-gray-500 text-lg mb-10">
            Questions, feedback, or need help with your account? We're listening.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
            <div className="card p-6 flex items-start gap-3">
              <Mail className="w-5 h-5 text-navy-700 mt-0.5" />
              <div>
                <div className="font-medium text-navy-950 text-sm">Email</div>
                <div className="text-sm text-gray-500">support@lexbridge.app</div>
              </div>
            </div>
            <div className="card p-6 flex items-start gap-3">
              <MapPin className="w-5 h-5 text-navy-700 mt-0.5" />
              <div>
                <div className="font-medium text-navy-950 text-sm">Based in</div>
                <div className="text-sm text-gray-500">Accra, Ghana</div>
              </div>
            </div>
          </div>

          {sent ? (
            <div className="card p-8 text-center">
              <Send className="w-10 h-10 text-green-600 mx-auto mb-3" />
              <p className="text-navy-950 font-medium">Your email app should have opened with your message ready to send.</p>
              <p className="text-sm text-gray-500 mt-1">Didn't open? Email us directly at support@lexbridge.app</p>
            </div>
          ) : (
            <form onSubmit={submit} className="card p-8">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Name</label>
                <input type="text" required className="input" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Email</label>
                <input type="email" required className="input" value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Message</label>
                <textarea required rows={5} className="input" value={form.message}
                  onChange={e => setForm({ ...form, message: e.target.value })} />
              </div>
              <button type="submit" disabled={sending} className="btn-primary">
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Send Message
              </button>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
