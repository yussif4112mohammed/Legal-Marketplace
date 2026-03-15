import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Scale, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const router    = useRouter();
  const [email,  setEmail]  = useState('');
  const [pass,   setPass]   = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login({ email, password: pass });
      toast.success(`Welcome back, ${user.firstName}!`);
      const dest = user.role === 'admin'  ? '/dashboard/admin'
                 : user.role === 'lawyer' ? '/dashboard/lawyer'
                 : '/dashboard/client';
      router.push((router.query.redirect as string) || dest);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head><title>Sign In | LexBridge</title></Head>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-5">
              <div className="w-10 h-10 bg-navy-900 rounded-xl flex items-center justify-center">
                <Scale className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-navy-950" style={{ fontFamily: 'Playfair Display, serif' }}>
                Lex<span className="text-gold-500">Bridge</span>
              </span>
            </Link>
            <h1 className="text-2xl font-bold text-navy-950" style={{ fontFamily: 'Playfair Display, serif' }}>
              Welcome back
            </h1>
            <p className="text-gray-500 mt-1 text-sm">Sign in to your account</p>
          </div>

          <div className="card p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="label">Email address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="input" placeholder="you@example.com" required autoComplete="email" />
              </div>
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} value={pass}
                    onChange={e => setPass(e.target.value)}
                    className="input pr-12" placeholder="••••••••" required autoComplete="current-password" />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</> : 'Sign In'}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Don't have an account?{' '}
              <Link href="/auth/register" className="text-navy-900 font-medium hover:underline">Create one</Link>
            </p>
            <p className="text-center text-sm text-gray-500 mt-2">
              Are you an attorney?{' '}
              <Link href="/auth/register?role=lawyer" className="text-gold-600 font-medium hover:underline">
                Join as a lawyer
              </Link>
            </p>
          </div>

          {/* Demo accounts */}
          <div className="mt-5 card p-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Demo Accounts</p>
            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex justify-between"><span>Admin:</span><span className="font-mono">admin@legalmarket.com</span></div>
              <div className="flex justify-between"><span>Client:</span><span className="font-mono">alice@example.com</span></div>
              <div className="flex justify-between"><span>Lawyer:</span><span className="font-mono">james.wilson@lawfirm.com</span></div>
              <div className="flex justify-between mt-1 pt-2 border-t border-gray-100">
                <span>Password (all):</span><span className="font-mono">Password123!</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
