import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp, TrendingDown, Wallet, BarChart2,
  ArrowUpRight, ArrowDownRight, Loader, XCircle,
  Calendar, RefreshCw, AlertTriangle, CheckCircle2
} from 'lucide-react';
import { toast } from 'react-toastify';
import InvestmentAPI from '../../api/investments';

// ── Confirmation modal for cancelling an investment ────────────────────────────
function CancelConfirmModal({ inv, onConfirm, onClose, busy }) {
  if (!inv) return null;
  const isFullCancel = inv._cancelType === 'full';
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:300, padding:'1rem' }}>
      <div className="card animate-scalein" style={{ width:'100%', maxWidth:440, padding:'2rem' }}>
        <div style={{ display:'flex', alignItems:'flex-start', gap:'1rem', marginBottom:'1.5rem' }}>
          <div style={{ width:44, height:44, borderRadius:'50%', background: isFullCancel ? '#fef2f2' : '#fffbeb', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <AlertTriangle size={22} style={{ color: isFullCancel ? 'var(--red-500)' : '#d97706' }}/>
          </div>
          <div>
            <h2 style={{ fontWeight:700, fontSize:'1.0625rem', marginBottom:'0.375rem', color: isFullCancel ? 'var(--red-600)' : '#92400e' }}>
              {isFullCancel ? 'Redeem Investment?' : 'Cancel SIP?'}
            </h2>
            <p style={{ color:'var(--slate-600)', fontSize:'0.875rem', lineHeight:1.6 }}>
              {isFullCancel
                ? <>You are about to <strong>fully exit</strong> your investment in <strong>{inv.fundName}</strong>. Your units will be redeemed at the current NAV and the holding will be removed from your portfolio. <strong>This cannot be undone.</strong></>
                : <>This will <strong>stop future SIP debits</strong> for <strong>{inv.fundName}</strong>. Your existing units will remain in your portfolio — only future instalments will be stopped.</>
              }
            </p>
          </div>
        </div>

        {/* Summary box */}
        <div style={{ background:'var(--slate-50)', borderRadius:'var(--radius-lg)', padding:'1rem', marginBottom:'1.5rem', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem' }}>
          <div>
            <p style={{ fontSize:'0.75rem', color:'var(--slate-400)', marginBottom:'0.2rem' }}>Amount Invested</p>
            <p style={{ fontWeight:700 }}>₹{Number(inv.amount).toLocaleString('en-IN', { maximumFractionDigits:0 })}</p>
          </div>
          <div>
            <p style={{ fontSize:'0.75rem', color:'var(--slate-400)', marginBottom:'0.2rem' }}>Current Value</p>
            <p style={{ fontWeight:700 }}>₹{Number(inv.currentValue).toLocaleString('en-IN', { maximumFractionDigits:0 })}</p>
          </div>
          <div>
            <p style={{ fontSize:'0.75rem', color:'var(--slate-400)', marginBottom:'0.2rem' }}>P&L</p>
            <p style={{ fontWeight:700, color: inv.profitLoss >= 0 ? 'var(--green-600)' : 'var(--red-500)' }}>
              {inv.profitLoss >= 0 ? '+' : ''}₹{Math.abs(Number(inv.profitLoss)).toLocaleString('en-IN', { maximumFractionDigits:0 })}
              {' '}({Number(inv.profitLossPct).toFixed(2)}%)
            </p>
          </div>
          <div>
            <p style={{ fontSize:'0.75rem', color:'var(--slate-400)', marginBottom:'0.2rem' }}>Units</p>
            <p style={{ fontWeight:700 }}>{Number(inv.units).toFixed(3)}</p>
          </div>
        </div>

        <div style={{ display:'flex', gap:'0.75rem', justifyContent:'flex-end' }}>
          <button onClick={onClose} disabled={busy} className="btn btn-ghost">Keep Investment</button>
          <button onClick={onConfirm} disabled={busy} className="btn btn-sm"
            style={{ background: isFullCancel ? 'var(--red-500)' : '#d97706', color:'white', border:'none', padding:'0.5rem 1.25rem', borderRadius:'var(--radius-md)', fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:'0.375rem' }}>
            {busy
              ? <><Loader size={14} style={{ animation:'spin 1s linear infinite' }}/> Processing…</>
              : isFullCancel ? <><XCircle size={14}/> Yes, Redeem</> : <><XCircle size={14}/> Yes, Cancel SIP</>
            }
          </button>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  );
}

// ── Main Portfolio ─────────────────────────────────────────────────────────────
export default function Portfolio() {
  const [investments, setInvestments] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [modalInv,    setModalInv]    = useState(null); // investment shown in confirm modal
  const [busy,        setBusy]        = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    InvestmentAPI.getPortfolio()
      .then(res  => { setInvestments(res.data); setError(null); })
      .catch(()  => setError('Could not load portfolio. Is the backend running?'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Cancel SIP (stops future debits, keeps holding) ──────────────────────
  const confirmAction = async () => {
    if (!modalInv) return;
    setBusy(true);
    try {
      if (modalInv._cancelType === 'full') {
        // Full redeem — deletes the row
        const res = await InvestmentAPI.cancelInvestment(modalInv.id);
        setInvestments(prev => prev.filter(i => i.id !== modalInv.id));
        toast.success(`Redeemed ₹${Number(res.data?.currentValue ?? 0).toLocaleString('en-IN', { maximumFractionDigits:0 })} from ${modalInv.fundName}`);
      } else {
        // Cancel SIP only
        const res = await InvestmentAPI.cancelSip(modalInv.id);
        setInvestments(prev => prev.map(i => i.id === modalInv.id ? res.data : i));
        toast.success(`SIP cancelled for ${modalInv.fundName}`);
      }
      setModalInv(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const fmt    = v => `₹${Number(v ?? 0).toLocaleString('en-IN', { maximumFractionDigits:0 })}`;
  const fmtPct = v => `${Number(v ?? 0) >= 0 ? '+' : ''}${Number(v ?? 0).toFixed(2)}%`;

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
      {/* Confirmation modal */}
      {modalInv && (
        <CancelConfirmModal
          inv={modalInv}
          onConfirm={confirmAction}
          onClose={() => setModalInv(null)}
          busy={busy}
        />
      )}

      {/* Header */}
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
            sub: `${isPos?'+':''}${fmt(Math.abs(totalPL))} P&L`,
            icon: isPos ? <TrendingUp size={20}/> : <TrendingDown size={20}/>,
            cls:  isPos ? 'stat-icon-green' : 'stat-icon',
            color: isPos ? 'var(--green-600)' : 'var(--red-500)',
          },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className={`stat-icon ${s.cls}`}>{s.icon}</div>
            <div>
              <p className="stat-label">{s.label}</p>
              <p className="stat-value" style={{ color: s.color }}>{s.value}</p>
              {s.sub && <p style={{ fontSize:'0.78rem', color:'var(--slate-500)', marginTop:'0.125rem' }}>{s.sub}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Active SIPs info banner */}
      {activeSips > 0 && (
        <div className="alert alert-info" style={{ display:'flex', alignItems:'center', gap:'0.625rem' }}>
          <Calendar size={16} style={{ flexShrink:0 }}/>
          <span>
            You have <strong>{activeSips}</strong> active SIP{activeSips > 1 ? 's' : ''} running.
            Monthly debits are scheduled automatically. Cancel SIP to stop future debits, or Redeem to exit fully.
          </span>
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
                <th className="text-right">Return</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {investments.map(inv => {
                const pl         = inv.profitLossPct ?? 0;
                const up         = pl >= 0;
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

                    <td style={{ color:'var(--slate-500)', fontSize:'0.8125rem', whiteSpace:'nowrap' }}>
                      {inv.investmentDate}
                    </td>

                    <td>
                      <div style={{ display:'flex', flexDirection:'column', gap:'0.25rem' }}>
                        <span className={`badge ${inv.mode === 'sip' ? (isSipActive ? 'badge-low' : 'badge-slate') : 'badge-blue'}`}
                          style={{ fontSize:'0.7rem', textTransform:'uppercase', width:'fit-content' }}>
                          {inv.mode === 'sip' ? (isSipActive ? 'SIP Active' : 'SIP Stopped') : 'Lumpsum'}
                        </span>
                        {isSipActive && inv.sipNextDate && (
                          <span style={{ fontSize:'0.68rem', color:'var(--slate-400)' }}>
                            Next: {inv.sipNextDate}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="text-right" style={{ fontWeight:600 }}>{inv.units?.toFixed(3)}</td>
                    <td className="text-right">₹{inv.navAtPurchase?.toFixed(2)}</td>
                    <td className="text-right">₹{inv.currentNav?.toFixed(2)}</td>
                    <td className="text-right" style={{ fontWeight:600 }}>{fmt(inv.amount)}</td>
                    <td className="text-right" style={{ fontWeight:700 }}>{fmt(inv.currentValue)}</td>

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
                      <div style={{ display:'flex', gap:'0.375rem', justifyContent:'flex-end', flexWrap:'wrap' }}>
                        {/* Cancel SIP button — only when SIP is active */}
                        {isSipActive && (
                          <button
                            onClick={() => setModalInv({ ...inv, _cancelType: 'sip' })}
                            className="btn btn-sm"
                            style={{ background:'#fffbeb', color:'#92400e', border:'1px solid #fde68a', fontSize:'0.75rem', whiteSpace:'nowrap' }}
                            title="Stop future SIP debits, keep existing units"
                          >
                            <Calendar size={12}/> Cancel SIP
                          </button>
                        )}

                        {/* Redeem / Exit button — available for ALL investments */}
                        <button
                          onClick={() => setModalInv({ ...inv, _cancelType: 'full' })}
                          className="btn btn-sm"
                          style={{ background:'#fef2f2', color:'var(--red-500)', border:'1px solid #fecaca', fontSize:'0.75rem', whiteSpace:'nowrap' }}
                          title="Exit this investment and remove it from portfolio"
                        >
                          <XCircle size={12}/> Redeem
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  );
}