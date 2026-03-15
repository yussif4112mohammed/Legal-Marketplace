import Head from 'next/head';
import Link from 'next/link';
import { Scale } from 'lucide-react';

export default function Custom404() {
  return (
    <>
      <Head><title>404 — Page Not Found | LexBridge</title></Head>
      <div className="min-h-screen bg-navy-950 flex items-center justify-center text-white px-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-gold-500/10 border border-gold-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Scale className="w-10 h-10 text-gold-400" />
          </div>
          <div className="text-8xl font-bold text-gold-400 mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>404</div>
          <h1 className="text-2xl font-semibold mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>Page Not Found</h1>
          <p className="text-gray-400 mb-8">The page you're looking for doesn't exist.</p>
          <div className="flex gap-4 justify-center">
            <Link href="/" className="btn-gold">Go Home</Link>
            <Link href="/lawyers" className="btn border-2 border-white text-white hover:bg-white hover:text-navy-950">Find a Lawyer</Link>
          </div>
        </div>
      </div>
    </>
  );
}
