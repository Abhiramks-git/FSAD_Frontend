import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useFunds } from '../../contexts/FundContext';
import { useState, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { TrendingUp, Shield, Calendar, DollarSign, PieChart, FileText, Users, ArrowLeft, Plus } from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';

const generateHistoricalData = (fund, years) => {
  const months = Math.round(years * 12);
  const data = [];
  let nav = fund.nav / (1 + (fund.returns?.['5Y'] || 10) / 100);
  const today = new Date();
  for (let i = months; i >= 0; i--) {
    const d = new Date(today);
    d.setMonth(today.getMonth() - i);
    nav = nav * (0.98 + Math.random() * 0.04);
    if (i === 0) nav = fund.nav;
    data.push({ date: d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }), nav: +nav.toFixed(2) });
  }
  return data;
};

const riskBadge = { Low: 'badge-low', Moderate: 'badge-moderate', High: 'badge-high', 'Very High': 'badge-veryhigh' };
const fmt = (v) => `₹${Number(v).toLocaleString('en-IN')} Cr`;

export default function FundDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { funds, addToCompare, compareList } = useFunds();
  const fund = funds.find(f => f.id === id);
  const [tab, setTab]     = useState('about');
  const [range, setRange] = useState('1Y');

  const chartData = useMemo(() => {
    if (!fund) return [];
    const yrs = range === '1M' ? 0.083 : range === '3M' ? 0.25 : range === '1Y' ? 1 : range === '3Y' ? 3 : 5;
    return generateHistoricalData(fund, yrs);
  }, [fund, range]);

  if (!fund) return (
    <div className="page-wrapper">
      <Navbar />
      <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
        <h2 style={{ color: 'var(--slate-600)' }}>Fund not found</h2>
        <button onClick={() => navigate('/funds')} className="btn btn-primary" style={{ marginTop: '1rem' }}>Browse Funds</button>
      </div>
      <Footer />
    </div>
  );

  const { name, amc, category, subCategory, nav, aum, expenseRatio = {}, minSIP, fundManager = {}, fundManager2, about, idealFor, investmentObjective, benchmark = {}, returns = {}, inceptionDate, risk, exitLoad, productLabel = {}, holdings = [] } = fund;

  const isInCompare = compareList?.some(f => f.id === fund.id);

  const tabs = [
    { id: 'about',       label: 'About',         icon: <FileText size={16} /> },
    { id: 'performance', label: 'Performance',    icon: <TrendingUp size={16} /> },
    { id: 'portfolio',   label: 'Portfolio',      icon: <PieChart size={16} /> },
    { id: 'managers',    label: 'Fund Managers',  icon: <Users size={16} /> },
  ];

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="page-content">

        {/* Hero */}
        <div style={{ background: 'linear-gradient(135deg, var(--blue-900) 0%, var(--blue-700) 100%)', padding: '2.5rem 0 3.5rem', position: 'relative' }}>
          <div className="container">
            <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm" style={{ color: 'rgba(255,255,255,0.65)', marginBottom: '1rem', padding: '0.375rem 0' }}>
              <ArrowLeft size={15} /> Back to Funds
            </button>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.625rem', alignItems: 'center' }}>
                <span className={`badge ${riskBadge[risk] || 'badge-slate'}`}>{risk} Risk</span>
                <span className="badge" style={{ background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.85)' }}>{category}</span>
                <span className="badge" style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}>{subCategory}</span>
              </div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', color: 'white', lineHeight: 1.2 }}>{name}</h1>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.9375rem' }}>{amc}</p>
            </div>
          </div>
        </div>

        {/* Stats floating row */}
        <div className="container" style={{ marginTop: '-1.5rem', marginBottom: '2rem', position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }} className="stats-row">
            {[
              { icon: <DollarSign size={18} />, label: 'NAV', value: `₹${nav}`, color: 'var(--blue-600)' },
              { icon: <TrendingUp size={18} />, label: 'AUM', value: fmt(aum), color: '#16a34a' },
              { icon: <Shield size={18} />, label: 'Expense Ratio', value: `${expenseRatio.regular || 0}%`, color: '#7c3aed' },
              { icon: <Calendar size={18} />, label: '1Y Return', value: `+${returns['1Y'] || 0}%`, color: '#d97706' },
              { icon: <TrendingUp size={18} />, label: 'Min SIP', value: `₹${minSIP}`, color: 'var(--blue-600)' },
              { icon: <Calendar size={18} />, label: 'Inception', value: inceptionDate, color: 'var(--slate-600)' },
            ].map((s, i) => (
              <div key={i} style={{ background: 'white', borderRadius: 'var(--radius-xl)', border: '1px solid var(--slate-200)', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ width: 36, height: 36, background: 'var(--slate-50)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, flexShrink: 0 }}>{s.icon}</div>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>{s.label}</p>
                  <p style={{ fontWeight: 700, color: 'var(--slate-900)', fontSize: '0.9375rem' }}>{s.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="container" style={{ paddingBottom: '3rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }} className="detail-grid">

            {/* Left — tabs */}
            <div>
              {/* Tab bar */}
              <div className="tabs">
                {tabs.map(t => (
                  <button key={t.id} onClick={() => setTab(t.id)} className={`tab-btn${tab === t.id ? ' active' : ''}`}>
                    {t.icon}{t.label}
                  </button>
                ))}
              </div>

              {/* About */}
              {tab === 'about' && (
                <div className="card animate-fadein" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div style={{ background: 'var(--blue-50)', borderLeft: '4px solid var(--blue-600)', borderRadius: '0 var(--radius-lg) var(--radius-lg) 0', padding: '1rem 1.25rem' }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--blue-700)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Investment Objective</p>
                    <p style={{ color: 'var(--slate-700)', lineHeight: 1.7, fontSize: '0.9rem' }}>{investmentObjective}</p>
                  </div>
                  <div style={{ background: 'var(--slate-50)', borderLeft: '4px solid var(--slate-300)', borderRadius: '0 var(--radius-lg) var(--radius-lg) 0', padding: '1rem 1.25rem' }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-600)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Ideal For</p>
                    <p style={{ color: 'var(--slate-700)', lineHeight: 1.7, fontSize: '0.9rem' }}>{idealFor}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--slate-400)', marginTop: '0.5rem' }}>*Investors should consult their financial advisers if in doubt.</p>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', paddingTop: '0.5rem', borderTop: '1px solid var(--slate-100)' }}>
                    <div>
                      <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--slate-700)', marginBottom: '0.5rem' }}>Benchmark Index</p>
                      <p style={{ fontSize: '0.875rem', color: 'var(--slate-600)' }}>Tier I: {benchmark.tier1}</p>
                      <p style={{ fontSize: '0.875rem', color: 'var(--slate-600)' }}>Tier II: {benchmark.tier2}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--slate-700)', marginBottom: '0.5rem' }}>Exit Load</p>
                      <p style={{ fontSize: '0.875rem', color: 'var(--slate-600)' }}>{exitLoad || '—'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Performance */}
              {tab === 'performance' && (
                <div className="card animate-fadein" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <p style={{ fontWeight: 700, color: 'var(--slate-900)' }}>NAV History</p>
                    <div style={{ display: 'flex', gap: '0.375rem' }}>
                      {['1M','3M','1Y','3Y','5Y'].map(r => (
                        <button key={r} onClick={() => setRange(r)} className="btn btn-sm"
                          style={{ background: range === r ? 'var(--blue-600)' : 'var(--slate-100)', color: range === r ? 'white' : 'var(--slate-600)', border: 'none', padding: '0.3rem 0.625rem', fontSize: '0.78rem' }}>
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--slate-100)" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis domain={['auto','auto']} tick={{ fontSize: 11 }} tickFormatter={v => `₹${v}`} />
                      <Tooltip formatter={v => [`₹${v}`, 'NAV']} />
                      <Line type="monotone" dataKey="nav" stroke="var(--blue-600)" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} name="NAV" />
                    </LineChart>
                  </ResponsiveContainer>
                  <div className="table-wrap">
                    <table className="table">
                      <thead>
                        <tr><th>Period</th><th className="text-right">Fund (%)</th><th className="text-right">Benchmark</th><th className="text-right">₹10,000 grew to</th></tr>
                      </thead>
                      <tbody>
                        {[
                          ['1 Year',       returns['1Y'],       '10.79%', `₹${(10000 * (1 + (returns['1Y'] || 0)/100)).toFixed(0)}`],
                          ['3 Years',      returns['3Y'],       '24.15%', `₹${(10000 * Math.pow(1 + (returns['3Y'] || 0)/100, 3)).toFixed(0)}`],
                          ['5 Years',      returns['5Y'],       '23.08%', `₹${(10000 * Math.pow(1 + (returns['5Y'] || 0)/100, 5)).toFixed(0)}`],
                          ['Since Inception', returns.sinceInception, '—',  '—'],
                        ].map(([period, ret, bench, grew], i) => (
                          <tr key={i}>
                            <td style={{ fontWeight: 600 }}>{period}</td>
                            <td className="text-right" style={{ color: 'var(--green-600)', fontWeight: 700 }}>+{ret}%</td>
                            <td className="text-right" style={{ color: 'var(--slate-500)' }}>{bench}</td>
                            <td className="text-right" style={{ fontWeight: 600 }}>{grew}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>Past performance may not be sustained in future. Returns &gt;1yr are CAGR.</p>
                </div>
              )}

              {/* Portfolio */}
              {tab === 'portfolio' && (
                <div className="card animate-fadein">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <p style={{ fontWeight: 700, color: 'var(--slate-900)' }}>Portfolio Holdings</p>
                    <p style={{ fontSize: '0.78rem', color: 'var(--slate-400)' }}>As on 31 Dec 2025</p>
                  </div>
                  {holdings.length > 0 ? (
                    <div className="table-wrap">
                      <table className="table">
                        <thead><tr><th>Company</th><th className="text-right">Allocation</th><th className="text-right">Weight</th></tr></thead>
                        <tbody>
                          {holdings.map((h, i) => (
                            <tr key={i}>
                              <td style={{ fontWeight: 600 }}>{h.company}</td>
                              <td className="text-right">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                  <div style={{ width: 60, height: 6, background: 'var(--slate-100)', borderRadius: 99, overflow: 'hidden' }}>
                                    <div style={{ width: `${Math.min(100, h.percentage * 5)}%`, height: '100%', background: 'var(--blue-500)', borderRadius: 99 }} />
                                  </div>
                                  <span style={{ fontWeight: 600, color: 'var(--blue-700)', minWidth: 36, textAlign: 'right' }}>{h.percentage}%</span>
                                </div>
                              </td>
                              <td className="text-right">
                                <span className="badge badge-blue" style={{ fontSize: '0.7rem' }}>
                                  {h.percentage >= 5 ? 'Core' : 'Satellite'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="empty-state"><PieChart size={40} /><h3>Holdings data not available</h3></div>
                  )}
                </div>
              )}

              {/* Managers */}
              {tab === 'managers' && (
                <div className="card animate-fadein" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {[fundManager, fundManager2].filter(Boolean).map((mgr, i) => (
                    <div key={i} style={{ background: i === 0 ? 'var(--blue-50)' : 'var(--slate-50)', borderLeft: `4px solid ${i === 0 ? 'var(--blue-600)' : 'var(--slate-300)'}`, borderRadius: '0 var(--radius-lg) var(--radius-lg) 0', padding: '1.25rem' }}>
                      <div style={{ display: 'flex', gap: '0.875rem', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <div style={{ width: 44, height: 44, borderRadius: '50%', background: i === 0 ? 'var(--blue-600)' : 'var(--slate-400)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1rem', flexShrink: 0 }}>
                          {mgr.name?.charAt(0)}
                        </div>
                        <div>
                          <p style={{ fontWeight: 700, color: 'var(--slate-900)', fontSize: '0.9375rem' }}>{mgr.name}</p>
                          <p style={{ fontSize: '0.8125rem', color: 'var(--slate-500)' }}>{mgr.designation}</p>
                        </div>
                      </div>
                      <p style={{ fontSize: '0.875rem', color: 'var(--slate-600)', lineHeight: 1.7 }}>{mgr.about}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right — invest panel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="card" style={{ position: 'sticky', top: 88 }}>
                <h3 style={{ fontWeight: 700, color: 'var(--slate-900)', marginBottom: '1.25rem', fontSize: '1rem' }}>Invest in this Fund</h3>

                {/* Returns preview */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.625rem', marginBottom: '1.25rem' }}>
                  {[['1Y', returns['1Y']], ['3Y', returns['3Y']], ['5Y', returns['5Y']]].map(([label, val]) => (
                    <div key={label} style={{ background: 'var(--slate-50)', borderRadius: 'var(--radius-md)', padding: '0.625rem', textAlign: 'center' }}>
                      <p style={{ fontSize: '0.7rem', color: 'var(--slate-400)', marginBottom: '0.2rem' }}>{label}</p>
                      <p style={{ fontWeight: 700, color: 'var(--green-600)', fontSize: '0.9rem' }}>+{val}%</p>
                    </div>
                  ))}
                </div>

                <button onClick={() => navigate(`/invest/${id}`)} className="btn btn-primary btn-lg btn-block" style={{ marginBottom: '0.875rem' }}>
                  Invest Now
                </button>

                <button
                  onClick={() => { addToCompare(fund); if (!isInCompare) toast.success('Added to comparison'); }}
                  disabled={isInCompare}
                  className={`btn btn-sm btn-block ${isInCompare ? 'btn-ghost' : 'btn-outline'}`}
                  style={isInCompare ? { color: 'var(--green-600)' } : {}}
                >
                  <Plus size={14} /> {isInCompare ? 'Added to Compare' : 'Add to Compare'}
                </button>

                <p style={{ fontSize: '0.75rem', color: 'var(--slate-400)', textAlign: 'center', marginTop: '0.875rem' }}>
                  Min investment: ₹{minSIP}
                </p>

                <div className="divider" />

                {/* Product label */}
                <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--slate-700)', marginBottom: '0.75rem' }}>Product Label</p>
                <div style={{ background: 'var(--slate-50)', borderRadius: 'var(--radius-lg)', padding: '0.875rem', marginBottom: '0.75rem' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginBottom: '0.375rem' }}>Benchmark: {benchmark.tier1}</p>
                  <span className={`badge ${riskBadge[productLabel.benchmarkRisk] || 'badge-moderate'}`}>{productLabel.benchmarkRisk} Risk</span>
                </div>
                <div style={{ background: 'var(--blue-50)', border: '1px solid var(--blue-100)', borderRadius: 'var(--radius-lg)', padding: '0.875rem' }}>
                  <span className={`badge ${riskBadge[productLabel.risk] || 'badge-moderate'}`} style={{ marginBottom: '0.5rem', display: 'inline-flex' }}>{productLabel.risk} Risk</span>
                  <p style={{ fontSize: '0.78rem', color: 'var(--blue-800)', lineHeight: 1.6 }}>{idealFor}</p>
                  <p style={{ fontSize: '0.72rem', color: 'var(--blue-600)', marginTop: '0.375rem' }}>*Consult your financial adviser.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          @media (min-width: 1024px) {
            .detail-grid { grid-template-columns: 1fr 300px !important; }
          }
          @media (min-width: 640px) {
            .stats-row { grid-template-columns: repeat(3, 1fr) !important; }
          }
        `}</style>
      </main>
      <Footer />
    </div>
  );
}
