import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { specializationsAPI } from '../../lib/api';

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY','DC',
];

const STATE_NAMES: Record<string, string> = {
  AL:'Alabama', AK:'Alaska', AZ:'Arizona', AR:'Arkansas', CA:'California',
  CO:'Colorado', CT:'Connecticut', DE:'Delaware', FL:'Florida', GA:'Georgia',
  HI:'Hawaii', ID:'Idaho', IL:'Illinois', IN:'Indiana', IA:'Iowa', KS:'Kansas',
  KY:'Kentucky', LA:'Louisiana', ME:'Maine', MD:'Maryland', MA:'Massachusetts',
  MI:'Michigan', MN:'Minnesota', MS:'Mississippi', MO:'Missouri', MT:'Montana',
  NE:'Nebraska', NV:'Nevada', NH:'New Hampshire', NJ:'New Jersey', NM:'New Mexico',
  NY:'New York', NC:'North Carolina', ND:'North Dakota', OH:'Ohio', OK:'Oklahoma',
  OR:'Oregon', PA:'Pennsylvania', RI:'Rhode Island', SC:'South Carolina',
  SD:'South Dakota', TN:'Tennessee', TX:'Texas', UT:'Utah', VT:'Vermont',
  VA:'Virginia', WA:'Washington', WV:'West Virginia', WI:'Wisconsin', WY:'Wyoming',
  DC:'District of Columbia',
};

export default function SearchBar() {
  const router = useRouter();
  const [q,      setQ]      = useState((router.query.q as string) || '');
  const [state,  setState]  = useState((router.query.state as string) || '');
  const [spec,   setSpec]   = useState((router.query.spec as string) || '');
  const [min,    setMin]    = useState((router.query.minPrice as string) || '');
  const [max,    setMax]    = useState((router.query.maxPrice as string) || '');
  const [rating, setRating] = useState((router.query.minRating as string) || '');
  const [showAdv, setShowAdv] = useState(false);
  const [specs,  setSpecs]  = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    specializationsAPI.getAll()
      .then(r => setSpecs(r.data.specializations))
      .catch(() => {});
  }, []);

  const buildQuery = () => {
    const p: Record<string, string> = {};
    if (q)      p.q          = q;
    if (state)  p.state      = state;
    if (spec)   p.spec       = spec;
    if (min)    p.minPrice   = min;
    if (max)    p.maxPrice   = max;
    if (rating) p.minRating  = rating;
    return p;
  };

  const search = () => router.push({ pathname: '/lawyers', query: buildQuery() });
  const clear  = () => {
    setQ(''); setState(''); setSpec(''); setMin(''); setMax(''); setRating('');
    router.push('/lawyers');
  };

  const hasFilters = state || spec || min || max || rating;

  return (
    <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-5">
      {/* Primary row */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={q}
            onChange={e => setQ(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search()}
            placeholder="Name, firm, or keyword…"
            className="input pl-10"
          />
        </div>
        <button
          onClick={() => setShowAdv(!showAdv)}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
            showAdv || hasFilters
              ? 'bg-navy-900 text-white border-navy-900'
              : 'border-gray-200 text-gray-600 hover:border-navy-900'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="hidden sm:inline">Filters</span>
          {hasFilters && <span className="w-2 h-2 rounded-full bg-gold-400 ml-1" />}
        </button>
        <button onClick={search} className="btn-primary">Search</button>
      </div>

      {/* Advanced filters */}
      {showAdv && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="label">State</label>
              <select value={state} onChange={e => setState(e.target.value)} className="input">
                <option value="">All States</option>
                {US_STATES.map(s => (
                  <option key={s} value={s}>{STATE_NAMES[s] || s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Practice Area</label>
              <select value={spec} onChange={e => setSpec(e.target.value)} className="input">
                <option value="">All Areas</option>
                {specs.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Min. Rating</label>
              <select value={rating} onChange={e => setRating(e.target.value)} className="input">
                <option value="">Any Rating</option>
                <option value="4">4+ Stars</option>
                <option value="3">3+ Stars</option>
                <option value="2">2+ Stars</option>
              </select>
            </div>

            <div>
              <label className="label">Min Price ($/hr)</label>
              <input type="number" value={min} onChange={e => setMin(e.target.value)}
                className="input" placeholder="e.g. 100" min="0" />
            </div>

            <div>
              <label className="label">Max Price ($/hr)</label>
              <input type="number" value={max} onChange={e => setMax(e.target.value)}
                className="input" placeholder="e.g. 500" min="0" />
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button onClick={search} className="btn-primary text-sm py-2">Apply</button>
            {hasFilters && (
              <button onClick={clear}
                className="flex items-center gap-1 text-sm text-gray-400 hover:text-red-600 transition-colors">
                <X className="w-4 h-4" /> Clear
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
