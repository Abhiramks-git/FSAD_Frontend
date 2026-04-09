import { useAuth }    from '../../contexts/AuthContext';
import { useFunds }   from '../../contexts/FundContext';
import { useNavigate, Link } from 'react-router-dom';
import {
  Wallet, TrendingUp, TrendingDown, Calendar,
  ArrowUpRight, ArrowDownRight, BarChart2, Loader,
  RefreshCw, ChevronRight, MessageCircle, Send, X, CheckCircle2
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import InvestmentAPI from '../../api/investments';
import QueryAPI from '../../api/queries';

// ── Live NAV ticker ─────────────────────────────────────────────────────────────
function NavTicker({ funds }) {
  const [prices, setPrices] = useState({});

  useEffect(() => {
    if (!funds.length) return;
    const init = {};
    funds.slice(0, 10).forEach(f => { init[f.id] = { nav: f.nav, pct: 0, up: true }; });
    setPrices(init);
    const iv = setInterval(() => {
      setPrices(prev => {
        const next = { ...prev };
        funds.slice(0, 10).forEach(f => {
          const old  = prev[f.id]?.nav ?? f.nav;
          const delta = (Math.random() - 0.49) * old * 0.002;
          const nav  = +(old + delta).toFixed(2);
          const pct  = +((nav - f.nav) / f.nav * 100).toFixed(2);
          next[f.id] = { nav, pct, up: nav >= f.nav };
        });
        return next;
      });
    }, 2500);
    return () => clearInterval(iv);
  }, [funds]);

  if (!funds.length) return null;
  return (
    <div style={{ background:'var(--slate-900)', borderRadius:'var(--radius-xl)', padding:'0.875rem 1.25rem', overflowX:'auto' }}>
      <div style={{ display:'flex', gap:'1.75rem', minWidth:'max-content', alignItems:'center' }}>
        <span style={{ fontSize:'0.7rem', fontWeight:700, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'0.08em', flexShrink:0 }}>LIVE NAV</span>
        {funds.slice(0, 10).map(f => {
          const p  = prices[f.id];
          const up = p?.up ?? true;
          return (
            <div key={f.id} style={{ display:'flex', flexDirection:'column', gap:'0.1rem' }}>
              <span style={{ fontSize:'0.68rem', color:'rgba(255,255,255,0.4)', whiteSpace:'nowrap' }}>
                {f.name.split(' ').slice(0, 3).join(' ')}
              </span>
              <span style={{ fontSize:'0.875rem', fontWeight:700, color:'white', fontFamily:'monospace' }}>
                ₹{p?.nav ?? f.nav}
              </span>
              <span style={{ fontSize:'0.7rem', fontWeight:700, color: up?'#4ade80':'#f87171', display:'flex', alignItems:'center', gap:2 }}>
                {up ? <ArrowUpRight size={10}/> : <ArrowDownRight size={10}/>}
                {up?'+':''}{p?.pct ?? 0}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Ask Advisor Modal ───────────────────────────────────────────────────────────
function AskAdvisorModal({ onClose }) {
  const [question, setQuestion] = useState('');
  const [sending,  setSending]  = useState(false);
  const [sent,     setSent]     = useState(false);
  const [myQs,     setMyQs]     = useState([]);
  const [loadingQs,setLoadingQs]= useState(true);
  const [tab,      setTab]      = useState('ask'); // ask | history

  useEffect(() => {
    QueryAPI.myQueries()
      .then(res => setMyQs(res.data))
      .catch(() => {})
      .finally(() => setLoadingQs(false));
  }, [sent]);

  const handleSend = async () => {
    if (!question.trim()) { toast.error('Please type your question first'); return; }
    setSending(true);
    try {
      await QueryAPI.askQuestion(question.trim());
      setSent(true);
      setQuestion('');
      toast.success('Question sent to advisor!');
    } catch {
      toast.error('Failed to send question. Try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:300, padding:'1rem' }}>
      <div className="card animate-scalein" style={{ width:'100%', maxWidth:520, padding:'2rem', maxHeight:'85vh', overflowY:'auto' }}>
        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'0.625rem' }}>
            <MessageCircle size={20} style={{ color:'var(--blue-600)' }}/>
            <h2 style={{ fontWeight:700, fontSize:'1.0625rem' }}>Ask Your Advisor</h2>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ padding:'0.25rem' }}><X size={18}/></button>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', gap:'0.5rem', marginBottom:'1.5rem' }}>
          {[['ask','Ask Question'],['history','My Questions']].map(([v,l]) => (
            <button key={v} onClick={() => setTab(v)} className="btn btn-sm"
              style={{ background: tab===v?'var(--blue-600)':'var(--slate-100)', color: tab===v?'white':'var(--slate-600)', border:'none' }}>
              {l}
            </button>
          ))}
        </div>

        {tab === 'ask' && (
          sent ? (
            <div style={{ textAlign:'center', padding:'1.5rem 0' }}>
              <CheckCircle2 size={52} style={{ color:'var(--green-500)', margin:'0 auto 1rem' }}/>
              <h3 style={{ fontWeight:700, fontSize:'1.0625rem', marginBottom:'0.5rem' }}>Question Sent!</h3>
              <p style={{ color:'var(--slate-500)', fontSize:'0.875rem', marginBottom:'1.5rem' }}>
                Your advisor will reply shortly. Check "My Questions" to track the answer.
              </p>
              <div style={{ display:'flex', gap:'0.75rem', justifyContent:'center' }}>
                <button onClick={() => { setSent(false); setTab('history'); }} className="btn btn-outline btn-sm">View My Questions</button>
                <button onClick={() => setSent(false)} className="btn btn-primary btn-sm">Ask Another</button>
              </div>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
              <div style={{ background:'var(--blue-50)', border:'1px solid var(--blue-100)', borderRadius:'var(--radius-lg)', padding:'0.875rem 1rem', fontSize:'0.8125rem', color:'var(--blue-700)' }}>
                💡 Ask anything about your investments — SIP strategy, fund selection, portfolio rebalancing, tax planning, etc.
              </div>
              <div className="form-group">
                <label className="form-label">Your Question</label>
                <textarea
                  value={question}
                  onChange={e => setQuestion(e.target.value)}
                  rows={5}
                  placeholder="e.g. Should I continue my SIP in small cap funds given current market conditions?"
                  style={{ width:'100%', padding:'0.75rem', border:'1.5px solid var(--slate-200)', borderRadius:'var(--radius-md)', fontSize:'0.9rem', resize:'vertical', fontFamily:'inherit', outline:'none', boxSizing:'border-box', transition:'border-color 0.15s' }}
                  onFocus={e => e.target.style.borderColor = 'var(--blue-400)'}
                  onBlur={e => e.target.style.borderColor = 'var(--slate-200)'}
                />
                <p style={{ fontSize:'0.75rem', color:'var(--slate-400)', marginTop:'0.25rem' }}>{question.length}/500 characters</p>
              </div>
              <button onClick={handleSend} disabled={sending || !question.trim()} className="btn btn-primary btn-block">
                {sending
                  ? <><span style={{ width:14, height:14, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'white', borderRadius:'50%', animation:'spin 0.7s linear infinite', display:'inline-block' }}/> Sending…</>
                  : <><Send size={15}/> Send to Advisor</>
                }
              </button>
            </div>
          )
        )}

        {tab === 'history' && (
          loadingQs ? (
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem', gap:'0.75rem', color:'var(--slate-400)' }}>
              <Loader size={16} style={{ animation:'spin 1s linear infinite' }}/> Loading…
            </div>
          ) : myQs.length === 0 ? (
            <div style={{ textAlign:'center', padding:'2rem', color:'var(--slate-400)' }}>
              <MessageCircle size={40} style={{ margin:'0 auto 0.75rem' }}/>
              <p>You haven't asked any questions yet.</p>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
              {myQs.map(q => (
                <div key={q.id} style={{ background:'var(--slate-50)', borderRadius:'var(--radius-md)', padding:'1rem', borderLeft:`3px solid ${q.status==='answered'?'var(--green-500)':'#f59e0b'}` }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.5rem' }}>
                    <p style={{ fontSize:'0.8125rem', color:'var(--slate-700)', fontWeight:600, flex:1 }}>{q.question}</p>
                    <span style={{ fontSize:'0.7rem', padding:'0.15rem 0.5rem', borderRadius:99, fontWeight:700, marginLeft:'0.5rem', background: q.status==='answered'?'#dcfce7':'#fffbeb', color: q.status==='answered'?'#15803d':'#92400e', flexShrink:0 }}>
                      {q.status === 'answered' ? '✓ Answered' : '⏳ Pending'}
                    </span>
                  </div>
                  {q.answer && (
                    <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:'var(--radius-sm)', padding:'0.625rem 0.75rem', marginTop:'0.5rem' }}>
                      <p style={{ fontSize:'0.75rem', color:'#15803d', fontWeight:700, marginBottom:'0.25rem' }}>Advisor's Reply:</p>
                      <p style={{ fontSize:'0.875rem', color:'#166534', lineHeight:1.5 }}>{q.answer}</p>
                    </div>
                  )}
                  <p style={{ fontSize:'0.72rem', color:'var(--slate-400)', marginTop:'0.5rem' }}>
                    {q.createdAt ? new Date(q.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }) : ''}
                  </p>
                </div>
              ))}
            </div>
          )
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  );
}

// ── Main Dashboard ──────────────────────────────────────────────────────────────
export default function InvestorDashboard() {
  const { user }   = useAuth();
  const { funds }  = useFunds();
  const navigate   = useNavigate();

  const [summary,    setSummary]    = useState(null);
  const [recent,     setRecent]     = useState([]);
  const [loadSum,    setLoadSum]    = useState(true);
  const [loadPort,   setLoadPort]   = useState(true);
  const [showAsk,    setShowAsk]    = useState(false);

  const hour     = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const fetchData = useCallback(() => {
    setLoadSum(true); setLoadPort(true);

    InvestmentAPI.getSummary()
      .then(res  => setSummary(res.data))
      .catch(()  => setSummary(null))
      .finally(() => setLoadSum(false));

    InvestmentAPI.getPortfolio()
      .then(res  => setRecent(res.data.slice(0, 5)))
      .catch(()  => setRecent([]))
      .finally(() => setLoadPort(false));
  }, []);

  // Fetch on mount, every 30s, and whenever tab becomes visible again
  // This ensures stats update immediately when user returns from Invest page
  useEffect(() => {
    fetchData();
    const iv = setInterval(fetchData, 30000);

    const onVisible = () => { if (document.visibilityState === 'visible') fetchData(); };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      clearInterval(iv);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [fetchData]);

  const fmt    = v  => v != null ? `₹${Number(v).toLocaleString('en-IN', { maximumFractionDigits:0 })}` : '—';
  const fmtPct = v  => v != null ? `${v >= 0 ? '+' : ''}${Number(v).toFixed(2)}%` : '—';
  const isUp   = (summary?.profitLoss ?? 0) >= 0;

  // Recommended = highest 3Y return funds not already in portfolio
  const ownedIds  = new Set(recent.map(r => r.fundId));
  const recommend = [...funds]
    .filter(f => !ownedIds.has(f.id))
    .sort((a, b) => (b.returns?.['3Y'] ?? 0) - (a.returns?.['3Y'] ?? 0))
    .slice(0, 3);

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>
      {showAsk && <AskAdvisorModal onClose={() => setShowAsk(false)}/>}

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'0.75rem' }}>
        <div>
          <h1 style={{ fontSize:'1.375rem', fontWeight:700, color:'var(--slate-900)' }}>
            {greeting}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p style={{ color:'var(--slate-500)', fontSize:'0.875rem', marginTop:'0.25rem' }}>
            Here's your investment overview for today.
          </p>
        </div>
        <div style={{ display:'flex', gap:'0.5rem' }}>
          <button onClick={() => setShowAsk(true)} className="btn btn-outline btn-sm">
            <MessageCircle size={14}/> Ask Advisor
          </button>
          <button onClick={fetchData} className="btn btn-outline btn-sm">
            <RefreshCw size={14}/> Refresh
          </button>
        </div>
      </div>

      {/* Live ticker */}
      <NavTicker funds={funds}/>

      {/* Stats — from real DB summary */}
      {loadSum ? (
        <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', color:'var(--slate-400)', padding:'0.5rem 0' }}>
          <Loader size={16} style={{ animation:'spin 1s linear infinite' }}/> Loading your stats…
          <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
        </div>
      ) : (
        <div className="grid-3">
          <div className="stat-card">
            <div className="stat-icon stat-icon-blue"><Wallet size={20}/></div>
            <div>
              <p className="stat-label">Portfolio Value</p>
              <p className="stat-value">{fmt(summary?.currentValue ?? 0)}</p>
              {summary && (
                <p className={`stat-change ${isUp?'stat-up':'stat-down'}`} style={{ display:'flex', alignItems:'center', gap:3 }}>
                  {isUp ? <ArrowUpRight size={14}/> : <ArrowDownRight size={14}/>}
                  {fmtPct(summary.profitLossPct)} overall
                </p>
              )}
            </div>
          </div>

          {/* Active SIPs — real count from DB */}
          <div className="stat-card">
            <div className="stat-icon stat-icon-green"><Calendar size={20}/></div>
            <div>
              <p className="stat-label">Active SIPs</p>
              <p className="stat-value">{summary?.activeSips ?? 0}</p>
              <p style={{ fontSize:'0.78rem', color:'var(--slate-500)', marginTop:'0.125rem' }}>
                {summary?.holdingsCount ?? 0} total holdings
              </p>
            </div>
          </div>

          <div className="stat-card">
            <div className={`stat-icon ${isUp?'stat-icon-green':'stat-icon'}`}>
              {isUp ? <TrendingUp size={20}/> : <TrendingDown size={20}/>}
            </div>
            <div>
              <p className="stat-label">Total P&L</p>
              <p className="stat-value" style={{ color: isUp?'var(--green-600)':'var(--red-500)' }}>
                {fmt(summary?.profitLoss ?? 0)}
              </p>
              <p style={{ fontSize:'0.78rem', color:'var(--slate-500)', marginTop:'0.125rem' }}>
                Invested: {fmt(summary?.totalInvested ?? 0)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Two column layout */}
      <div className="grid-2">
        {/* Recent transactions */}
        <div className="card">
          <div className="section-header">
            <div>
              <p className="section-title">Recent Investments</p>
              <p className="section-subtitle">Your latest transactions</p>
            </div>
            <Link to="/investor/portfolio" className="btn btn-ghost btn-sm" style={{ color:'var(--blue-600)', fontSize:'0.8125rem' }}>
              View All <ChevronRight size={14}/>
            </Link>
          </div>

          {loadPort ? (
            <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', color:'var(--slate-400)', padding:'1rem 0' }}>
              <Loader size={16} style={{ animation:'spin 1s linear infinite' }}/> Loading…
            </div>
          ) : recent.length === 0 ? (
            <div className="empty-state" style={{ padding:'1.5rem 0' }}>
              <Wallet size={36}/>
              <h3>No investments yet</h3>
              <p>Start your first investment today.</p>
              <Link to="/funds" className="btn btn-primary btn-sm" style={{ marginTop:'0.875rem' }}>Browse Funds</Link>
            </div>
          ) : (
            <div>
              {recent.map((tx, i) => {
                const up = (tx.profitLoss ?? 0) >= 0;
                return (
                  <div key={tx.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0.875rem 0', borderBottom: i < recent.length-1 ? '1px solid var(--slate-100)' : 'none' }}>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontWeight:600, color:'var(--slate-800)', fontSize:'0.875rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {tx.fundName}
                      </p>
                      <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginTop:'0.2rem' }}>
                        <span style={{ fontSize:'0.75rem', color:'var(--slate-400)' }}>{tx.investmentDate}</span>
                        {tx.mode === 'sip' && tx.sipActive && (
                          <span style={{ fontSize:'0.68rem', background:'#dcfce7', color:'#15803d', padding:'0.1rem 0.4rem', borderRadius:99, fontWeight:700 }}>SIP</span>
                        )}
                      </div>
                    </div>
                    <div style={{ textAlign:'right', marginLeft:'0.75rem' }}>
                      <p style={{ fontWeight:700, color:'var(--slate-800)', fontSize:'0.9375rem' }}>
                        {fmt(tx.amount)}
                      </p>
                      <p style={{ fontSize:'0.75rem', fontWeight:600, color: up?'var(--green-600)':'var(--red-500)', display:'flex', alignItems:'center', gap:2, justifyContent:'flex-end' }}>
                        {up ? <ArrowUpRight size={12}/> : <ArrowDownRight size={12}/>}
                        {fmtPct(tx.profitLossPct)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recommended funds */}
        <div className="card">
          <div className="section-header">
            <div>
              <p className="section-title">Recommended for You</p>
              <p className="section-subtitle">Top 3Y performers you don't own</p>
            </div>
          </div>
          {recommend.length === 0 ? (
            <p style={{ color:'var(--slate-400)', fontSize:'0.875rem', padding:'1rem 0' }}>
              Great job — you've already invested in top-performing funds!
            </p>
          ) : (
            <div>
              {recommend.map((f, i) => (
                <div key={f.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0.875rem 0', borderBottom: i < recommend.length-1 ? '1px solid var(--slate-100)' : 'none' }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontWeight:600, color:'var(--slate-800)', fontSize:'0.875rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {f.name}
                    </p>
                    <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginTop:'0.25rem' }}>
                      <span style={{ fontSize:'0.78rem', color:'var(--green-600)', fontWeight:600, display:'flex', alignItems:'center', gap:2 }}>
                        <TrendingUp size={11}/>+{f.returns?.['3Y'] ?? 0}% (3Y)
                      </span>
                      <span style={{ fontSize:'0.7rem', background:'var(--slate-100)', color:'var(--slate-600)', padding:'0.1rem 0.4rem', borderRadius:99 }}>
                        {f.category}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => navigate(`/invest/${f.id}`)} className="btn btn-primary btn-sm" style={{ marginLeft:'0.75rem', flexShrink:0 }}>
                    Invest
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="card">
        <p className="section-title" style={{ marginBottom:'1rem' }}>Quick Actions</p>
        <div style={{ display:'flex', flexWrap:'wrap', gap:'0.75rem' }}>
          <Link to="/funds"               className="btn btn-outline"><BarChart2 size={15}/> Explore Funds</Link>
          <Link to="/investor/calculator" className="btn btn-outline"><Calendar size={15}/>  SIP Calculator</Link>
          <Link to="/investor/portfolio"  className="btn btn-outline"><Wallet size={15}/>    My Portfolio</Link>
          <button onClick={() => setShowAsk(true)} className="btn btn-outline">
            <MessageCircle size={15}/> Ask Advisor
          </button>
        </div>
      </div>
    </div>
  );
}