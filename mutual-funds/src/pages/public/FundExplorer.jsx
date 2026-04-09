import { useState, useEffect } from 'react';
import { useFunds } from '../../contexts/FundContext';
import FundCard from '../../components/funds/FundCard';
import FundFilters from '../../components/funds/FundFilters';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import { Search, LayoutGrid } from 'lucide-react';

export default function FundExplorer() {
  const { funds, filters, setFilters } = useFunds();
  const [filtered, setFiltered] = useState([]);

  useEffect(() => {
    if (!funds || !Array.isArray(funds)) { setFiltered([]); return; }
    let result = [...funds];
    if (filters.category) result = result.filter(f => f.category === filters.category);
    if (filters.risk)     result = result.filter(f => f.risk === filters.risk);
    if (filters.search) {
      const t = filters.search.toLowerCase();
      result = result.filter(f => f.name.toLowerCase().includes(t) || f.amc.toLowerCase().includes(t));
    }
    setFiltered(result);
  }, [filters, funds]);

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="page-content">
        {/* Page Hero */}
        <div className="page-hero">
          <div className="container">
            <h1>Explore Mutual Funds</h1>
            <p>Discover and compare {funds?.length || 0}+ funds across equity, debt, hybrid categories.</p>
          </div>
        </div>

        <div className="container" style={{ padding: '2rem 1.5rem' }}>
          {/* Filters */}
          <FundFilters filters={filters} setFilters={setFilters} />

          {/* Results header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '1.5rem 0 1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <LayoutGrid size={16} style={{ color: 'var(--slate-400)' }} />
              <span style={{ fontSize: '0.875rem', color: 'var(--slate-600)' }}>
                <strong style={{ color: 'var(--slate-800)' }}>{filtered.length}</strong> funds found
              </span>
            </div>
            {(filters.search || filters.category || filters.risk) && (
              <button className="btn btn-ghost btn-sm" onClick={() => setFilters({ search: '', category: '', risk: '' })}
                style={{ color: 'var(--blue-600)', fontSize: '0.8125rem' }}>
                Clear all filters
              </button>
            )}
          </div>

          {/* Fund Grid */}
          {filtered.length === 0 ? (
            <div className="empty-state">
              <Search size={48} />
              <h3>No funds found</h3>
              <p>Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
            <div className="grid-3">
              {filtered.map(fund => (
                <FundCard key={fund.id} fund={fund} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
