import { Link } from 'react-router-dom';
import { useFunds } from '../../contexts/FundContext';
import { TrendingUp, BarChart2, PlusCircle, CheckCircle } from 'lucide-react';

export default function FundCard({ fund }) {
  const { addToCompare, compareList } = useFunds();
  const isInCompare = compareList.some(f => f.id === fund.id);

  const nav          = fund.nav ?? 0;
  const aum          = fund.aum ?? 0;
  const expenseRatio = fund.expenseRatio?.regular ?? 0;
  const returns1Y    = fund.returns?.['1Y'] ?? 0;
  const returns3Y    = fund.returns?.['3Y'] ?? 0;
  const risk         = fund.risk ?? 'Moderate';

  const riskBadge = {
    'Low':       'badge-low',
    'Moderate':  'badge-moderate',
    'High':      'badge-high',
    'Very High': 'badge-veryhigh',
  }[risk] || 'badge-slate';

  const formatAUM = (v) => v >= 10000 ? `₹${(v/1000).toFixed(0)}K Cr` : `₹${v.toLocaleString()} Cr`;

  return (
    <div className="fund-card card-hover">
      {/* Top */}
      <div className="fund-card-top">
        <div style={{ flex: 1, minWidth: 0 }}>
          <p className="fund-name">{fund.name}</p>
          <p className="fund-meta">{fund.amc} &nbsp;·&nbsp; {fund.category}</p>
        </div>
        <span className={`badge ${riskBadge}`} style={{ flexShrink: 0 }}>{risk}</span>
      </div>

      {/* Stats */}
      <div className="fund-stats">
        <div className="fund-stat-item">
          <p className="fund-stat-label">NAV</p>
          <p className="fund-stat-value">₹{nav.toLocaleString()}</p>
        </div>
        <div className="fund-stat-item" style={{ textAlign: 'right' }}>
          <p className="fund-stat-label">1Y Return</p>
          <p className="fund-stat-value fund-return-value">
            <TrendingUp size={13} style={{ display: 'inline', marginRight: 3 }} />
            +{returns1Y}%
          </p>
        </div>
        <div className="fund-stat-item">
          <p className="fund-stat-label">3Y Return</p>
          <p className="fund-stat-value" style={{ color: 'var(--blue-600)' }}>+{returns3Y}%</p>
        </div>
        <div className="fund-stat-item" style={{ textAlign: 'right' }}>
          <p className="fund-stat-label">AUM</p>
          <p className="fund-stat-value">{formatAUM(aum)}</p>
        </div>
      </div>

      {/* Expense ratio */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.78rem', color: 'var(--slate-500)' }}>
        <BarChart2 size={13} />
        Expense Ratio: <strong style={{ color: 'var(--slate-700)' }}>{expenseRatio}%</strong>
        &nbsp;·&nbsp; Min SIP: <strong style={{ color: 'var(--slate-700)' }}>₹{fund.minSIP ?? 500}</strong>
      </div>

      {/* Footer */}
      <div className="fund-card-footer">
        <Link
          to={`/funds/${fund.id}`}
          className="btn btn-primary btn-sm"
        >
          View Details
        </Link>
        <button
          onClick={(e) => { e.preventDefault(); addToCompare(fund); }}
          disabled={isInCompare}
          className={`btn btn-sm ${isInCompare ? 'btn-ghost' : 'btn-outline'}`}
          style={{ gap: '0.35rem', color: isInCompare ? 'var(--green-600)' : undefined }}
        >
          {isInCompare
            ? <><CheckCircle size={14} /> Added</>
            : <><PlusCircle size={14} /> Compare</>
          }
        </button>
      </div>
    </div>
  );
}
