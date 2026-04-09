import { useFunds } from '../../contexts/FundContext';
import { Link } from 'react-router-dom';
import { X, TrendingUp, BarChart2, AlertCircle } from 'lucide-react';

export default function Compare() {
  const { compareList, removeFromCompare } = useFunds();

  const rows = [
    { label: 'Category',        get: f => f.category },
    { label: 'Sub-Category',    get: f => f.subCategory },
    { label: 'AMC',             get: f => f.amc },
    { label: 'Risk',            get: f => f.risk },
    { label: 'NAV',             get: f => `₹${f.nav}` },
    { label: 'AUM',             get: f => `₹${f.aum?.toLocaleString()} Cr` },
    { label: '1Y Return',       get: f => `+${f.returns?.['1Y'] ?? 0}%`, green: true },
    { label: '3Y Return',       get: f => `+${f.returns?.['3Y'] ?? 0}%`, green: true },
    { label: '5Y Return',       get: f => `+${f.returns?.['5Y'] ?? 0}%`, green: true },
    { label: 'Since Inception', get: f => `+${f.returns?.sinceInception ?? 0}%`, green: true },
    { label: 'Expense Ratio',   get: f => `${f.expenseRatio?.regular ?? 0}%` },
    { label: 'Min SIP',         get: f => `₹${f.minSIP}` },
    { label: 'Exit Load',       get: f => f.exitLoad ?? '—' },
    { label: 'Inception Date',  get: f => f.inceptionDate ?? '—' },
  ];

  if (compareList.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <h1 style={{ fontSize: '1.375rem', fontWeight: 700 }}>Compare Funds</h1>
        <div className="empty-state card" style={{ padding: '4rem 2rem' }}>
          <BarChart2 size={48} />
          <h3>No funds selected</h3>
          <p>Add funds to compare using the "Compare" button on any fund card.</p>
          <Link to="/funds" className="btn btn-primary" style={{ marginTop: '1.25rem' }}>Browse Funds</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 700 }}>Compare Funds</h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Comparing {compareList.length} fund{compareList.length > 1 ? 's' : ''} side by side.
          </p>
        </div>
        <Link to="/funds" className="btn btn-primary btn-sm">
          <TrendingUp size={15} /> Add More Funds
        </Link>
      </div>

      {compareList.length < 2 && (
        <div className="alert alert-info">
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          Add at least 2 funds to get a meaningful comparison.
        </div>
      )}

      <div className="table-wrap">
        <table className="table" style={{ minWidth: 600 }}>
          <thead>
            <tr style={{ background: 'var(--blue-50)' }}>
              <th style={{ width: 160 }}>Metric</th>
              {compareList.map(f => (
                <th key={f.id}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--slate-900)', textTransform: 'none', letterSpacing: 0 }}>{f.name}</span>
                    <button onClick={() => removeFromCompare(f.id)} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'none', border: '1px solid var(--slate-200)', color: 'var(--slate-500)', borderRadius: 'var(--radius-full)', padding: '0.15rem 0.5rem', fontSize: '0.7rem', cursor: 'pointer', width: 'fit-content', transition: 'all 0.15s' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--red-300)'; e.currentTarget.style.color = 'var(--red-500)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--slate-200)'; e.currentTarget.style.color = 'var(--slate-500)'; }}
                    >
                      <X size={10} /> Remove
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 600, color: 'var(--slate-600)', fontSize: '0.8125rem' }}>{row.label}</td>
                {compareList.map(f => {
                  const val = row.get(f);
                  return (
                    <td key={f.id} style={{ fontWeight: row.green ? 700 : 500, color: row.green ? 'var(--green-600)' : 'var(--slate-800)' }}>
                      {val}
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr>
              <td style={{ fontWeight: 600, color: 'var(--slate-600)', fontSize: '0.8125rem' }}>Action</td>
              {compareList.map(f => (
                <td key={f.id}>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <Link to={`/invest/${f.id}`} className="btn btn-primary btn-sm">Invest</Link>
                    <Link to={`/funds/${f.id}`}  className="btn btn-outline btn-sm">Details</Link>
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
