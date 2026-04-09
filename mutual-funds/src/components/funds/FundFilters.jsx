import { Search, SlidersHorizontal } from 'lucide-react';

export default function FundFilters({ filters, setFilters }) {
  return (
    <div className="filters-bar">
      {/* Search */}
      <div className="search-wrap">
        <Search size={16} />
        <input
          type="text"
          className="search-input"
          placeholder="Search by fund name or AMC..."
          value={filters.search || ''}
          onChange={e => setFilters({ ...filters, search: e.target.value })}
        />
      </div>

      {/* Category */}
      <select
        className="form-input"
        style={{ minWidth: 160, flex: 'none' }}
        value={filters.category || ''}
        onChange={e => setFilters({ ...filters, category: e.target.value })}
      >
        <option value="">All Categories</option>
        <option value="Equity">Equity</option>
        <option value="Debt">Debt</option>
        <option value="Hybrid">Hybrid</option>
        <option value="Index">Index</option>
      </select>

      {/* Risk */}
      <select
        className="form-input"
        style={{ minWidth: 140, flex: 'none' }}
        value={filters.risk || ''}
        onChange={e => setFilters({ ...filters, risk: e.target.value })}
      >
        <option value="">All Risk Levels</option>
        <option value="Low">Low</option>
        <option value="Moderate">Moderate</option>
        <option value="High">High</option>
        <option value="Very High">Very High</option>
      </select>

      {/* Clear */}
      {(filters.search || filters.category || filters.risk) && (
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => setFilters({ search: '', category: '', risk: '' })}
          style={{ color: 'var(--red-500)', flexShrink: 0 }}
        >
          Clear
        </button>
      )}
    </div>
  );
}
