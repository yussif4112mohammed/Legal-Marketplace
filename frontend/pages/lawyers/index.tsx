import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Loader2 } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import LawyerCard from '../../components/lawyer/LawyerCard';
import SearchBar from '../../components/shared/SearchBar';
import { lawyersAPI } from '../../lib/api';

export default function LawyersPage() {
  const router = useRouter();
  const [lawyers,    setLawyers]    = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    if (!router.isReady) return;
    setLoading(true);

    const { q, state, spec, minPrice, maxPrice, minRating, page } = router.query;
    lawyersAPI.search({
      q, state,
      specialization: spec,
      minPrice, maxPrice, minRating,
      page: page || 1,
      limit: 12,
    })
      .then(r => {
        setLawyers(r.data.data || []);
        setPagination(r.data.pagination || null);
      })
      .catch(() => setLawyers([]))
      .finally(() => setLoading(false));
  }, [router.isReady, router.query]);

  const goPage = (p: number) => {
    router.push({ pathname: '/lawyers', query: { ...router.query, page: p } });
  };

  return (
    <>
      <Head>
        <title>Find a Lawyer | LexBridge</title>
      </Head>

      <Navbar />

      <main className="min-h-screen bg-gray-50 pt-20">
        <div className="container-lg py-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-navy-950 mb-1"
              style={{ fontFamily: 'Playfair Display, serif' }}>Find a Lawyer</h1>
            <p className="text-gray-500">Browse verified attorneys across the United States</p>
          </div>

          {/* Search */}
          <div className="mb-8">
            <SearchBar />
          </div>

          {/* Results */}
          {loading ? (
            <div className="flex justify-center py-24">
              <Loader2 className="w-8 h-8 animate-spin text-navy-900" />
            </div>
          ) : lawyers.length === 0 ? (
            <div className="text-center py-24">
              <div className="text-5xl mb-4">⚖️</div>
              <h3 className="text-xl font-semibold text-navy-950 mb-2">No lawyers found</h3>
              <p className="text-gray-500">Try adjusting your filters or search term.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-5">
                <p className="text-sm text-gray-500">
                  <span className="font-semibold text-navy-950">{pagination?.total ?? lawyers.length}</span> attorneys found
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {lawyers.map(l => <LawyerCard key={l.id} lawyer={l} />)}
              </div>

              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <div className="flex justify-center gap-2 mt-10">
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                    <button key={p} onClick={() => goPage(p)}
                      className={`w-10 h-10 rounded-xl text-sm font-medium transition-colors ${
                        p === pagination.page
                          ? 'bg-navy-900 text-white'
                          : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                      }`}>
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
