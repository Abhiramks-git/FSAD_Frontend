import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp, TrendingDown, Wallet, BarChart2,
  ArrowUpRight, ArrowDownRight, Loader, XCircle,
  Calendar, RefreshCw
} from 'lucide-react';
import { toast } from 'react-toastify';
import InvestmentAPI from '../../api/investments';

export default function Portfolio() {
  const [investments, setInvestments] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [cancelling,  setCancelling]  = useState(null); // id being cancelled
  const [error,       setError]       = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    InvestmentAPI.getPortfolio()
      .then(res  => { setInvestments(res.data); setError(null); })
      .catch(()  => setError('Could not load portfolio. Is the server running?'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const cancelSip = async (inv) => {
    if (!window.confirm(`Cancel SIP for ${inv.fundName}?`)) return;
    setCancelling(inv.id);
    try {
      const res = await InvestmentAPI.cancelSip(inv.id);
      setInvestments(prev => prev.map(i => i.id === inv.id ? res.data : i));
      toast.success(`SIP cancelled for ${inv.fundName}`);
    } catch {
      toast.error('Failed to cancel SIP');
    } finally {
      setCancelling(null);
    }
  };

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'4rem', gap:'0.75rem', color:'var(--slate-500)' }}>
      <Loader size={20} style={{ animation:'spin 1s linear infinite' }}/> Loading portfolio…
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  );

  if (error) return (
    <div>
      <div className="alert alert-danger" style={{ marginBottom:'1rem' }}>{error}</div>
      <button onClick={load} className="btn btn-outline btn-sm"><RefreshCw size={14}/> Retry</button>
    </div>
  );

  const totalInvested = investments.reduce((s, i) => s + (i.amount ?? 0), 0);
  const totalValue    = investments.reduce((s, i) => s + (i.currentValue ?? 0), 0);
  const totalPL       = totalValue - totalInvested;
  const totalReturn   = totalInvested > 0 ? ((totalPL / totalInvested) * 100).toFixed(2) : '0.00';
  const isPos         = totalPL >= 0;
  const activeSips    = investments.filter(i => i.mode === 'sip' && i.sipActive).length;

  const fmt    = v  => `₹${Number(v).toLocaleString('en-IN', { maximumFractionDigits:0 })}`;
  const fmtPct = v  => `${v >= 0 ? '+' : ''}${Number(v).toFixed(2)}%`;

  if (investments.length === 0) return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
      <h1 style={{ fontSize:'1.375rem', fontWeight:700 }}>My Portfolio</h1>
      <div className="empty-state card" style={{ padding:'4rem 2rem' }}>
        <Wallet size={48}/>
        <h3>No investments yet</h3>
        <p>Start your investment journey today.</p>
        <Link to="/funds" className="btn btn-primary" style={{ marginTop:'1.25rem' }}>Browse Funds</Link>
      </div>
    </div>
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'0.75rem' }}>
        <div>
          <h1 style={{ fontSize:'1.375rem', fontWeight:700 }}>My Portfolio</h1>
          <p style={{ color:'var(--slate-500)', fontSize:'0.875rem', marginTop:'0.25rem' }}>
            {investments.length} holding{investments.length > 1 ? 's' : ''} · {activeSips} active SIP{activeSips !== 1 ? 's' : ''}
          </p>
        </div>
        <button onClick={load} className="btn btn-outline btn-sm"><RefreshCw size={14}/> Refresh</button>
      </div>

      {/* Summary stats */}
      <div className="grid-3">
        {[
          { label:'Total Invested', value:fmt(totalInvested), icon:<Wallet size={20}/>,   cls:'stat-icon-blue'  },
          { label:'Current Value',  value:fmt(totalValue),    icon:<BarChart2 size={20}/>, cls:'stat-icon-green' },
          {
            label:'Overall Return',
            value: fmtPct(+totalReturn),
            sub: `${isPos ? '+' : ''}${fmt(Math.abs(totalPL))} P&L`,
            icon: isPos ? <TrendingUp size={20}/> : <TrendingDown size={20}/>,
            cls:  isPos ? 'stat-icon-green' : 'stat-icon',
            green: isPos
          },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className={`stat-icon ${s.cls}`}>{s.icon}</div>
            <div>
              <p className="stat-label">{s.label}</p>
              <p className="stat-value" style={{ color: s.green != null ? (s.green ? 'var(--green-600)' : 'var(--red-500)') : undefined }}>{s.value}</p>
              {s.sub && <p style={{ fontSize:'0.78rem', color:'var(--slate-500)', marginTop:'0.125rem' }}>{s.sub}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Active SIPs banner */}
      {activeSips > 0 && (
        <div className="alert alert-info" style={{ display:'flex', alignItems:'center', gap:'0.625rem' }}>
          <Calendar size={16} style={{ flexShrink:0 }}/>
          <span>You have <strong>{activeSips}</strong> active SIP{activeSips > 1 ? 's' : ''}. Monthly deductions are scheduled automatically.</span>
        </div>
      )}

      {/* Holdings table */}
      <div className="card" style={{ padding:0, overflow:'hidden' }}>
        <div style={{ padding:'1.25rem 1.5rem', borderBottom:'1px solid var(--slate-100)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <p className="section-title">All Holdings</p>
          <Link to="/funds" className="btn btn-primary btn-sm">+ Add Investment</Link>
        </div>
        <div className="table-wrap" style={{ borderRadius:0, border:'none', boxShadow:'none' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Fund</th>
                <th>Date</th>
                <th>Type</th>
                <th className="text-right">Units</th>
                <th className="text-right">Buy NAV</th>
                <th className="text-right">Curr. NAV</th>
                <th className="text-right">Invested</th>
                <th className="text-right">Current Value</th>
                <th className="text-right">P&L</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {investments.map(inv => {
                const pl  = inv.profitLossPct ?? 0;
                const up  = pl >= 0;
                const isSipActive = inv.mode === 'sip' && inv.sipActive;
                return (
                  <tr key={inv.id}>
                    <td>
                      <Link to={`/funds/${inv.fundId}`} style={{ color:'var(--blue-600)', fontWeight:600, fontSize:'0.875rem' }}>
                        {inv.fundName}
                      </Link>
                      {inv.fundCategory && (
                        <p style={{ fontSize:'0.72rem', color:'var(--slate-400)', marginTop:'0.1rem' }}>{inv.fundCategory}</p>
                      )}
                    </td>
                    <td style={{ color:'var(--slate-500)', fontSize:'0.8125rem', whiteSpace:'nowrap' }}>{inv.investmentDate}</td>
                    <td>
                      <div style={{ display:'flex', flexDirection:'column', gap:'0.25rem' }}>
                        <span className={`badge ${inv.mode === 'sip' ? (isSipActive ? 'badge-low' : 'badge-slate') : 'badge-blue'}`}
                          style={{ fontSize:'0.7rem', textTransform:'uppercase', width:'fit-content' }}>
                          {inv.mode === 'sip' ? (isSipActive ? 'SIP Active' : 'SIP Stopped') : 'Lumpsum'}
                        </span>
                        {isSipActive && inv.sipNextDate && (
                          <span style={{ fontSize:'0.7rem', color:'var(--slate-400)' }}>Next: {inv.sipNextDate}</span>
                        )}
                      </div>
                    </td>
                    <td className="text-right" style={{ fontWeight:600 }}>{inv.units?.toFixed(3)}</td>
                    <td className="text-right">₹{inv.navAtPurchase?.toFixed(2)}</td>
                    <td className="text-right">₹{inv.currentNav?.toFixed(2)}</td>
                    <td className="text-right" style={{ fontWeight:600 }}>
                      {fmt(inv.amount)}
                    </td>
                    <td className="text-right" style={{ fontWeight:700 }}>
                      {fmt(inv.currentValue)}
                    </td>
                    <td className="text-right">
                      <span style={{
                        display:'inline-flex', alignItems:'center', gap:3, fontWeight:700,
                        color: up ? 'var(--green-600)' : 'var(--red-500)',
                        background: up ? '#dcfce7' : '#fef2f2',
                        padding:'0.2rem 0.5rem', borderRadius:'var(--radius-full)', fontSize:'0.8125rem'
                      }}>
                        {up ? <ArrowUpRight size={13}/> : <ArrowDownRight size={13}/>}
                        {fmtPct(pl)}
                      </span>
                    </td>
                    <td className="text-right">
                      {isSipActive ? (
                        <button
                          onClick={() => cancelSip(inv)}
                          disabled={cancelling === inv.id}
                          className="btn btn-sm"
                          style={{ background:'#fef2f2', color:'var(--red-500)', border:'1px solid #fecaca', gap:'0.25rem' }}
                          title="Cancel SIP"
                        >
                          {cancelling === inv.id
                            ? <Loader size={13} style={{ animation:'spin 1s linear infinite' }}/>
                            : <XCircle size={13}/>
                          }
                          Cancel SIP
                        </button>
                      ) : (
                        <Link to={`/invest/${inv.fundId}`} className="btn btn-outline btn-sm">Add More</Link>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
