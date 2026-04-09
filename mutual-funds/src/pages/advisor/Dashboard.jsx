import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import {
  MessageCircle, FileText, Users, TrendingUp, TrendingDown,
  Clock, ArrowRight, ArrowUpRight, ArrowDownRight, Loader,
  Wallet, RefreshCw, ChevronDown, ChevronUp
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import InvestmentAPI from '../../api/investments';

function fmt(v)    { return `₹${Number(v ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`; }
function fmtPct(v) { return `${Number(v ?? 0) >= 0 ? '+' : ''}${Number(v ?? 0).toFixed(2)}%`; }

export default function AdvisorDashboard() {
  const { user } = useAuth();
  const [clients,   setClients]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [expanded,  setExpanded]  = useState(null); // userId whose holdings are shown

  const load = useCallback(() => {
    setLoading(true);
    InvestmentAPI.getAdvisorClients()
      .then(res => setClients(res.data))
      .catch(() => toast.error('Could not load client data. Is the server running?'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const totalAUM       = clients.reduce((s, c) => s + (c.currentValue   ?? 0), 0);
  const totalInvested  = clients.reduce((s, c) => s + (c.totalInvested  ?? 0), 0);
  const totalPL        = totalAUM - totalInvested;
  const totalSips      = clients.reduce((s, c) => s + (c.activeSips     ?? 0), 0);

  const stats = [
    { label:'Total Clients',     value: loading ? '—' : clients.length,           iconClass:'stat-icon-blue',   icon:<Users size={20}/> },
    { label:'Total AUM Managed', value: loading ? '—' : fmt(totalAUM),             iconClass:'stat-icon-green',  icon:<Wallet size={20}/> },
    { label:'Total P&L (All)',   value: loading ? '—' : fmtPct(totalPL / (totalInvested || 1) * 100),
      iconClass: totalPL >= 0 ? 'stat-icon-green' : 'stat-icon', icon: totalPL >= 0 ? <TrendingUp size={20}/> : <TrendingDown size={20}/> },
    { label:'Active SIPs',       value: loading ? '—' : totalSips,                iconClass:'stat-icon-amber',  icon:<Clock size={20}/> },
  ];

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'0.75rem' }}>
        <div>
          <h1 style={{ fontSize:'1.375rem', fontWeight:700 }}>Welcome, {user?.name?.split(' ')[0]} 👋</h1>
          <p style={{ color:'var(--slate-500)', fontSize:'0.875rem', marginTop:'0.25rem' }}>
            Your advisory overview — real investor data from MySQL.
          </p>
        </div>
        <button onClick={load} className="btn btn-outline btn-sm"><RefreshCw size={14}/> Refresh</button>
      </div>

      {/* Summary stats */}
      <div className="grid-2">
        {stats.map((s, i) => (
          <div key={i} className="stat-card">
            <div className={`stat-icon ${s.iconClass}`}>{s.icon}</div>
            <div>
              <p className="stat-label">{s.label}</p>
              <p className="stat-value">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Client list */}
      <div className="card" style={{ padding:0, overflow:'hidden' }}>
        <div style={{ padding:'1.25rem 1.5rem', borderBottom:'1px solid var(--slate-100)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <p className="section-title">All Investor Clients</p>
            <p className="section-subtitle">Click a row to see full holdings</p>
          </div>
        </div>

        {loading ? (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'3rem', gap:'0.75rem', color:'var(--slate-400)' }}>
            <Loader size={18} style={{ animation:'spin 1s linear infinite' }}/> Loading client data…
            <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
          </div>
        ) : clients.length === 0 ? (
          <div className="empty-state" style={{ padding:'3rem' }}>
            <Users size={40}/>
            <h3>No investors yet</h3>
            <p>When investors register and make investments, they'll appear here.</p>
          </div>
        ) : (
          <div>
            {/* Table header */}
            <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr 1fr 0.5fr', gap:'0.75rem', padding:'0.625rem 1.5rem', background:'var(--slate-50)', borderBottom:'1px solid var(--slate-100)', fontSize:'0.72rem', fontWeight:700, color:'var(--slate-500)', textTransform:'uppercase', letterSpacing:'0.05em' }}>
              <span>Investor</span>
              <span style={{ textAlign:'right' }}>Invested</span>
              <span style={{ textAlign:'right' }}>Current Value</span>
              <span style={{ textAlign:'right' }}>P&L</span>
              <span style={{ textAlign:'right' }}>Return %</span>
              <span style={{ textAlign:'right' }}>Active SIPs</span>
              <span style={{ textAlign:'right' }}>Details</span>
            </div>

            {clients.map(client => {
              const isUp   = (client.profitLoss ?? 0) >= 0;
              const isOpen = expanded === client.userId;
              return (
                <div key={client.userId}>
                  {/* Row */}
                  <div
                    onClick={() => setExpanded(isOpen ? null : client.userId)}
                    style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr 1fr 0.5fr', gap:'0.75rem', padding:'1rem 1.5rem', borderBottom:'1px solid var(--slate-100)', cursor:'pointer', transition:'background 0.1s', alignItems:'center' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--blue-50)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* Investor */}
                    <div style={{ display:'flex', alignItems:'center', gap:'0.625rem' }}>
                      <div style={{ width:34, height:34, borderRadius:'50%', background:'var(--blue-100)', color:'var(--blue-700)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'0.875rem', flexShrink:0 }}>
                        {client.userName?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p style={{ fontWeight:600, color:'var(--slate-800)', fontSize:'0.875rem' }}>{client.userName}</p>
                        <p style={{ fontSize:'0.75rem', color:'var(--slate-400)' }}>{client.userEmail}</p>
                      </div>
                    </div>
                    {/* Invested */}
                    <p style={{ textAlign:'right', fontWeight:600, color:'var(--slate-700)', fontSize:'0.875rem' }}>
                      {fmt(client.totalInvested)}
                    </p>
                    {/* Current value */}
                    <p style={{ textAlign:'right', fontWeight:700, color:'var(--slate-900)', fontSize:'0.875rem' }}>
                      {fmt(client.currentValue)}
                    </p>
                    {/* P&L absolute */}
                    <p style={{ textAlign:'right', fontWeight:700, color: isUp ? 'var(--green-600)' : 'var(--red-500)', fontSize:'0.875rem', display:'flex', alignItems:'center', gap:3, justifyContent:'flex-end' }}>
                      {isUp ? <ArrowUpRight size={14}/> : <ArrowDownRight size={14}/>}
                      {fmt(Math.abs(client.profitLoss ?? 0))}
                    </p>
                    {/* Return % badge */}
                    <div style={{ textAlign:'right' }}>
                      <span style={{ display:'inline-flex', alignItems:'center', gap:3, fontWeight:700, color: isUp ? 'var(--green-600)' : 'var(--red-500)', background: isUp ? '#dcfce7' : '#fef2f2', padding:'0.25rem 0.625rem', borderRadius:'var(--radius-full)', fontSize:'0.8125rem' }}>
                        {fmtPct(client.profitLossPct)}
                      </span>
                    </div>
                    {/* SIPs */}
                    <p style={{ textAlign:'right', color:'var(--slate-600)', fontSize:'0.875rem' }}>
                      {client.activeSips > 0
                        ? <span style={{ background:'#dcfce7', color:'#15803d', padding:'0.2rem 0.5rem', borderRadius:99, fontWeight:700, fontSize:'0.8125rem' }}>{client.activeSips} SIP{client.activeSips > 1 ? 's' : ''}</span>
                        : <span style={{ color:'var(--slate-400)' }}>—</span>
                      }
                    </p>
                    {/* Expand toggle */}
                    <div style={{ textAlign:'right', color:'var(--blue-600)' }}>
                      {isOpen ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
                    </div>
                  </div>

                  {/* Expanded holdings */}
                  {isOpen && client.holdings?.length > 0 && (
                    <div style={{ background:'var(--slate-50)', borderBottom:'1px solid var(--slate-100)' }}>
                      <div style={{ padding:'0.75rem 1.5rem 0.375rem', fontSize:'0.75rem', fontWeight:700, color:'var(--slate-500)', textTransform:'uppercase', letterSpacing:'0.05em' }}>
                        Holdings for {client.userName}
                      </div>
                      <div className="table-wrap" style={{ borderRadius:0, border:'none', boxShadow:'none' }}>
                        <table className="table" style={{ fontSize:'0.8125rem' }}>
                          <thead>
                            <tr>
                              <th>Fund</th>
                              <th>Type</th>
                              <th className="text-right">Units</th>
                              <th className="text-right">Invested</th>
                              <th className="text-right">Current Value</th>
                              <th className="text-right">P&L</th>
                              <th className="text-right">Return</th>
                            </tr>
                          </thead>
                          <tbody>
                            {client.holdings.map(h => {
                              const up = (h.profitLoss ?? 0) >= 0;
                              return (
                                <tr key={h.id}>
                                  <td>
                                    <p style={{ fontWeight:600 }}>{h.fundName}</p>
                                    <p style={{ fontSize:'0.72rem', color:'var(--slate-400)' }}>{h.fundCategory}</p>
                                  </td>
                                  <td>
                                    <span className={`badge ${h.mode === 'sip' && h.sipActive ? 'badge-low' : 'badge-slate'}`} style={{ fontSize:'0.68rem' }}>
                                      {h.mode === 'sip' ? (h.sipActive ? 'SIP Active' : 'SIP Stopped') : 'Lumpsum'}
                                    </span>
                                  </td>
                                  <td className="text-right">{h.units?.toFixed(3)}</td>
                                  <td className="text-right">{fmt(h.amount)}</td>
                                  <td className="text-right" style={{ fontWeight:700 }}>{fmt(h.currentValue)}</td>
                                  <td className="text-right" style={{ color: up ? 'var(--green-600)' : 'var(--red-500)', fontWeight:700 }}>
                                    <span style={{ display:'flex', alignItems:'center', gap:2, justifyContent:'flex-end' }}>
                                      {up ? <ArrowUpRight size={12}/> : <ArrowDownRight size={12}/>}
                                      {fmt(Math.abs(h.profitLoss ?? 0))}
                                    </span>
                                  </td>
                                  <td className="text-right">
                                    <span style={{ fontWeight:700, color: up ? 'var(--green-600)' : 'var(--red-500)', fontSize:'0.8125rem' }}>
                                      {fmtPct(h.profitLossPct)}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {isOpen && (!client.holdings || client.holdings.length === 0) && (
                    <div style={{ padding:'1.5rem', background:'var(--slate-50)', borderBottom:'1px solid var(--slate-100)', textAlign:'center', color:'var(--slate-400)', fontSize:'0.875rem' }}>
                      This investor has no investments yet.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="card">
        <p className="section-title" style={{ marginBottom:'1rem' }}>Quick Actions</p>
        <div style={{ display:'flex', flexWrap:'wrap', gap:'0.75rem' }}>
          <Link to="/advisor/content" className="btn btn-outline"><FileText size={15}/> Manage Content</Link>
          <Link to="/advisor/clients" className="btn btn-outline"><MessageCircle size={15}/> Client Queries</Link>
          <Link to="/funds"           className="btn btn-outline"><TrendingUp size={15}/> Explore Funds</Link>
        </div>
      </div>
    </div>
  );
}
