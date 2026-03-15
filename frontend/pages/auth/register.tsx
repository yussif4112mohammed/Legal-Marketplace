import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Scale, Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { specializationsAPI } from '../../lib/api';
import toast from 'react-hot-toast';

const US_STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC'];

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [role, setRole] = useState<'client'|'lawyer'>('client');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw]   = useState(false);
  const [specs, setSpecs]     = useState<any[]>([]);
  const [done, setDone]       = useState(false);

  const [form, setForm] = useState({
    firstName:'', lastName:'', email:'', password:'', phone:'',
    barLicenseNumber:'', barState:'', lawFirm:'',
    yearsExperience: 0, bio:'', consultationFee: 0,
    specializations: [] as number[],
    practiceStates:  [] as string[],
  });

  useEffect(() => {
    if (router.query.role === 'lawyer') setRole('lawyer');
    specializationsAPI.getAll().then(r => setSpecs(r.data.specializations)).catch(()=>{});
  }, [router.query.role]);

  const set = (field: string) => (e: React.ChangeEvent<any>) =>
    setForm(p => ({ ...p, [field]: e.target.value }));

  const toggleSpec  = (id: number) => setForm(p => ({
    ...p, specializations: p.specializations.includes(id)
      ? p.specializations.filter(s => s !== id) : [...p.specializations, id]
  }));
  const toggleState = (s: string) => setForm(p => ({
    ...p, practiceStates: p.practiceStates.includes(s)
      ? p.practiceStates.filter(x => x !== s) : [...p.practiceStates, s]
  }));

  const submit = async () => {
    setLoading(true);
    try {
      const payload = {
        ...form,
        role,
        yearsExperience: Number(form.yearsExperience),
        consultationFee: Number(form.consultationFee),
      };
      const data = await register(payload);
      if (role === 'lawyer') { setDone(true); return; }
      toast.success('Account created!');
      router.push('/dashboard/client');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  if (done) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="card p-10 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-navy-950 mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
          Application Submitted!
        </h2>
        <p className="text-gray-600 mb-6">
          Your lawyer profile is under review. We'll notify you within 1–2 business days once approved.
        </p>
        <Link href="/" className="btn-primary w-full">Return Home</Link>
      </div>
    </div>
  );

  return (
    <>
      <Head><title>Create Account | LexBridge</title></Head>
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-5">
              <div className="w-10 h-10 bg-navy-900 rounded-xl flex items-center justify-center">
                <Scale className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-navy-950" style={{ fontFamily: 'Playfair Display, serif' }}>
                Lex<span className="text-gold-500">Bridge</span>
              </span>
            </Link>
            <h1 className="text-2xl font-bold text-navy-950" style={{ fontFamily: 'Playfair Display, serif' }}>Create your account</h1>
          </div>

          {/* Role toggle */}
          <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-xl">
            {(['client','lawyer'] as const).map(r => (
              <button key={r} onClick={() => { setRole(r); setStep(1); }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  role === r ? 'bg-white shadow-sm text-navy-900' : 'text-gray-500'
                }`}>
                {r === 'client' ? '👤 I need legal help' : '⚖️ I am an attorney'}
              </button>
            ))}
          </div>

          {/* Lawyer step indicators */}
          {role === 'lawyer' && (
            <div className="flex items-center gap-2 mb-6">
              {['Account','Bar Info','Practice'].map((label, i) => (
                <div key={label} className="flex items-center gap-2 flex-1">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    step > i+1 ? 'bg-green-500 text-white' : step === i+1 ? 'bg-navy-900 text-white' : 'bg-gray-200 text-gray-400'
                  }`}>{step > i+1 ? '✓' : i+1}</div>
                  <span className={`text-xs font-medium ${step === i+1 ? 'text-navy-900' : 'text-gray-400'}`}>{label}</span>
                  {i < 2 && <div className="flex-1 h-px bg-gray-200 mx-1" />}
                </div>
              ))}
            </div>
          )}

          <div className="card p-8 space-y-4">
            {/* Step 1 — account info (both roles) */}
            {step === 1 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="label">First Name</label>
                    <input type="text" value={form.firstName} onChange={set('firstName')} className="input" placeholder="Jane" required /></div>
                  <div><label className="label">Last Name</label>
                    <input type="text" value={form.lastName} onChange={set('lastName')} className="input" placeholder="Doe" required /></div>
                </div>
                <div><label className="label">Email</label>
                  <input type="email" value={form.email} onChange={set('email')} className="input" placeholder="jane@example.com" required /></div>
                <div><label className="label">Phone (optional)</label>
                  <input type="tel" value={form.phone} onChange={set('phone')} className="input" placeholder="+1 555 000-0000" /></div>
                <div><label className="label">Password</label>
                  <div className="relative">
                    <input type={showPw ? 'text' : 'password'} value={form.password} onChange={set('password')}
                      className="input pr-12" placeholder="Min. 8 characters" required minLength={8} />
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (!form.firstName || !form.email || !form.password) return toast.error('Fill in required fields');
                    if (role === 'client') submit();
                    else setStep(2);
                  }}
                  disabled={loading}
                  className="btn-primary w-full py-3">
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating…</> : role === 'client' ? 'Create Account' : 'Continue →'}
                </button>
              </>
            )}

            {/* Step 2 — bar info (lawyers) */}
            {step === 2 && role === 'lawyer' && (
              <>
                <div><label className="label">Bar License Number</label>
                  <input type="text" value={form.barLicenseNumber} onChange={set('barLicenseNumber')} className="input" placeholder="CA-123456" required /></div>
                <div><label className="label">Bar State (Primary)</label>
                  <select value={form.barState} onChange={set('barState')} className="input" required>
                    <option value="">Select state…</option>
                    {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select></div>
                <div><label className="label">Law Firm (optional)</label>
                  <input type="text" value={form.lawFirm} onChange={set('lawFirm')} className="input" placeholder="Smith & Associates" /></div>
                <div><label className="label">Years of Experience</label>
                  <input type="number" value={form.yearsExperience} onChange={set('yearsExperience')} className="input" min="0" max="70" /></div>
                <div><label className="label">Consultation Fee ($/hr)</label>
                  <input type="number" value={form.consultationFee} onChange={set('consultationFee')} className="input" min="0" placeholder="150" /></div>
                <div><label className="label">Bio</label>
                  <textarea value={form.bio} onChange={set('bio')} rows={4} className="input resize-none"
                    placeholder="Describe your background and expertise…" /></div>
                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="btn-outline flex-1">← Back</button>
                  <button onClick={() => { if (!form.barLicenseNumber || !form.barState) return toast.error('Fill in bar info'); setStep(3); }}
                    className="btn-primary flex-1">Continue →</button>
                </div>
              </>
            )}

            {/* Step 3 — practice areas & states (lawyers) */}
            {step === 3 && role === 'lawyer' && (
              <>
                <div>
                  <label className="label mb-2">Practice Areas</label>
                  <div className="grid grid-cols-2 gap-2">
                    {specs.map(s => (
                      <button key={s.id} type="button" onClick={() => toggleSpec(s.id)}
                        className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs text-left transition-all ${
                          form.specializations.includes(s.id)
                            ? 'border-navy-900 bg-navy-50 text-navy-900 font-medium'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}>
                        <span>{s.icon}</span> {s.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="label mb-2">States You Practice In</label>
                  <div className="grid grid-cols-4 gap-1.5 max-h-40 overflow-y-auto pr-1">
                    {US_STATES.map(s => (
                      <button key={s} type="button" onClick={() => toggleState(s)}
                        className={`px-2 py-1.5 rounded-md text-xs font-medium transition-all ${
                          form.practiceStates.includes(s)
                            ? 'bg-navy-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}>{s}</button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(2)} className="btn-outline flex-1">← Back</button>
                  <button onClick={() => {
                    if (form.specializations.length === 0) return toast.error('Select at least one practice area');
                    if (form.practiceStates.length === 0)  return toast.error('Select at least one state');
                    submit();
                  }} disabled={loading} className="btn-gold flex-1 py-3">
                    {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</> : 'Submit Application'}
                  </button>
                </div>
              </>
            )}
          </div>

          <p className="text-center text-sm text-gray-500 mt-4">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-navy-900 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </>
  );
}
