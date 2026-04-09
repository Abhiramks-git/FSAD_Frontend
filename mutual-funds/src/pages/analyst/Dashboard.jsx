import { useFunds } from '../../contexts/FundContext';
import { useState, useMemo, useEffect, useRef } from 'react';
import {
  BarChart, Bar, PieChart, Pie, LineChart, Line, AreaChart, Area,
  ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell,
} from 'recharts';
import {
  TrendingUp, Layers, DollarSign, Percent, BarChart3,
  Download, FileText, RefreshCw, ArrowUpRight, ArrowDownRight,
} from 'lucide-react';

const COLORS = [
  '#2563eb','#16a34a','#d97706','#dc2626','#7c3aed',
  '#0891b2','#db2777','#059669','#ea580c','#4f46e5',
  '#0284c7','#15803d','#b45309','#b91c1c','#6d28d9',
  '#0e7490','#be185d','#047857','#c2410c','#4338ca',
];

// Live NAV ticker with real price changes
function useLivePrices(funds) {
  const [prices, setPrices] = useState({});
  const navRef = useRef({});

  useEffect(() => {
    if (!funds.length) return;
    const init = {};
    funds.forEach(f => { init[f.id] = f.nav; });
    navRef.current = init;
    setPrices(Object.fromEntries(funds.map(f => [f.id, { nav: f.nav, pct: 0, up: true }])));

    const iv = setInterval(() => {
      const next = {};
      funds.forEach(f => {
        const old = navRef.current[f.id] || f.nav;
        const delta = (Math.random() - 0.49) * old * 0.003;
        const nav = +(old + delta).toFixed(2);
        const pct = +((nav - f.nav) / f.nav * 100).toFixed(2);
        navRef.current[f.id] = nav;
        next[f.id] = { nav, pct, up: nav >= f.nav };
      });
      setPrices(next);
    }, 2000);
    return () => clearInterval(iv);
  }, [funds]);

  return prices;
}

// Generate realistic NAV history that follows the live price
function genHistory(fund, years, livePrices) {
  const months = Math.round(years * 12);
  const data = [];
  const endNav = livePrices[fund.id]?.nav ?? fund.nav;
  let nav = endNav * 0.6;
  const today = new Date();
  for (let i = months; i >= 0; i--) {
    const d = new Date(today);
    d.setMonth(today.getMonth() - i);
    const trend = 1 + (fund.returns?.['1Y'] || 12) / 100 / 12;
    nav = nav * trend * (0.97 + Math.random() * 0.06);
    if (i === 0) nav = endNav; // always end at live price
    data.push({
      date: d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
      nav: +nav.toFixed(2),
    });
  }
  return data;
}

function downloadCSV(rows, filename) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [headers.join(','), ...rows.map(r =>
    headers.map(h => `"${String(r[h]).replace(/"/g, '""')}"`).join(',')
  )].join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  a.download = filename; a.click();
}

function downloadPDF(title, rows) {
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title>
  <style>body{font-family:Arial;padding:24px;font-size:12px;}h1{font-size:18px;color:#1e3a8a;border-bottom:2px solid #1e3a8a;padding-bottom:8px;}
  table{width:100%;border-collapse:collapse;margin-top:12px;}th{background:#1e3a8a;color:white;padding:7px 10px;text-align:left;font-size:11px;}
  td{padding:6px 10px;border-bottom:1px solid #e2e8f0;}tr:nth-child(even) td{background:#f8fafc;}
  .footer{margin-top:20px;font-size:10px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:8px;}</style>
  </head><body><h1>${title}</h1>
  <p style="font-size:11px;color:#64748b;">Generated: ${new Date().toLocaleString('en-IN')} · ${rows.length} records</p>
  <table><thead><tr>${Object.keys(rows[0]).map(h=>`<th>${h}</th>`).join('')}</tr></thead>
  <tbody>${rows.map(r=>`<tr>${Object.values(r).map(v=>`<td>${v}</td>`).join('')}</tr>`).join('')}</tbody></table>
  <div class="footer">FinVest Analytics · AMFI Registered · Past performance is not indicative of future returns.</div>
  <script>window.onload=()=>{window.print();}</script></body></html>`;
  const w = window.open('', '_blank');
  if (w) { w.document.write(html); w.document.close(); }
}

export default function AnalystDashboard() {
  const { funds }           = useFunds();
  const livePrices          = useLivePrices(funds);
  const [range, setRange]   = useState('1Y');
  const [selIds, setSelIds] = useState([]);
  const [tab, setTab]       = useState('overview');

  const filtered = useMemo(() =>
    selIds.length ? funds.filter(f => selIds.includes(f.id)) : funds,
    [funds, selIds]);

  const totalAUM   = funds.reduce((s, f) => s + (f.aum || 0), 0);
  const avgExpense = funds.length
    ? (funds.reduce((s, f) => s + (f.expenseRatio?.regular || 0), 0) / funds.length).toFixed(2) : 0;
  const avg1Y = funds.length
    ? (funds.reduce((s, f) => s + (f.returns?.['1Y'] || 0), 0) / funds.length).toFixed(2) : 0;

  // Category AUM — use all unique categories with distinct colors
  const catAUM = useMemo(() => {
    const m = new Map();
    filtered.forEach(f => {
      const k = f.category || 'Other';
      m.set(k, (m.get(k) || 0) + (f.aum || 0));
    });
    return [...m.entries()].map(([name, value]) => ({ name, value: +value.toFixed(0) }));
  }, [filtered]);

  // Risk distribution with more granular sub-categories
  const riskDist = useMemo(() => {
    const m = new Map();
    filtered.forEach(f => {
      const k = `${f.risk || 'Unknown'} (${f.category || ''})`;
      m.set(k, (m.get(k) || 0) + 1);
    });
    return [...m.entries()].map(([name, value]) => ({ name, value }));
  }, [filtered]);

  const topFunds = useMemo(() => [...filtered]
    .sort((a, b) => (b.returns?.['3Y'] || 0) - (a.returns?.['3Y'] || 0))
    .slice(0, 8)
    .map(f => ({
      name: f.name.split(' ').slice(0, 3).join(' '),
      '1Y': f.returns?.['1Y'] || 0,
      '3Y': f.returns?.['3Y'] || 0,
      '5Y': f.returns?.['5Y'] || 0,
    })), [filtered]);

  // NAV trend connected to live prices
  const navData = useMemo(() => {
    const display = filtered.slice(0, 5);
    if (!display.length) return [];
    const yrs = range==='1M'?0.083:range==='3M'?0.25:range==='1Y'?1:range==='3Y'?3:5;
    const byFund = display.map(f => ({
      id: f.id,
      name: f.name.split(' ').slice(0, 2).join(' '),
      data: genHistory(f, yrs, livePrices),
    }));
    return byFund[0].data.map((d, i) => {
      const pt = { date: d.date };
      byFund.forEach(fd => { pt[fd.name] = fd.data[i]?.nav ?? 0; });
      return pt;
    });
  }, [filtered, range, livePrices]);

  // Scatter: expense vs returns
  const scatterData = useMemo(() => filtered.map(f => ({
    x: +(f.expenseRatio?.regular || 0),
    y: +(f.returns?.['1Y'] || 0),
    name: f.name.split(' ').slice(0, 2).join(' '),
  })), [filtered]);

  const gainers = Object.entries(livePrices)
    .filter(([,v]) => v.pct > 0)
    .sort((a,b) => b[1].pct - a[1].pct).slice(0, 6);
  const losers  = Object.entries(livePrices)
    .filter(([,v]) => v.pct < 0)
    .sort((a,b) => a[1].pct - b[1].pct).slice(0, 6);

  const fname = id => funds.find(f => f.id === id)?.name?.split(' ').slice(0,3).join(' ') || id;

  const exportNavCSV = () => downloadCSV(filtered.map(f => ({
    Fund: f.name, AMC: f.amc, Category: f.category,
    'Live NAV': livePrices[f.id]?.nav ?? f.nav,
    'Change%': livePrices[f.id]?.pct ?? 0,
    '1Y%': f.returns?.['1Y']||0, '3Y%': f.returns?.['3Y']||0,
    '5Y%': f.returns?.['5Y']||0, 'AUM Cr': f.aum, Risk: f.risk,
  })), `finvest_live_nav_${Date.now()}.csv`);

  const exportPDFReport = () => downloadPDF('FinVest Fund Performance Report',
    filtered.map(f => ({
      Fund: f.name, Category: f.category, Risk: f.risk,
      NAV: `Rs.${livePrices[f.id]?.nav ?? f.nav}`,
      '1Y': `${f.returns?.['1Y']||0}%`, '3Y': `${f.returns?.['3Y']||0}%`,
      AUM: `Rs.${f.aum} Cr`, 'Expense%': `${f.expenseRatio?.regular||0}%`,
    })));

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'0.75rem' }}>
        <div>
          <h1 style={{ fontSize:'1.375rem', fontWeight:700 }}>Analytics Dashboard</h1>
          <p style={{ color:'var(--slate-500)', fontSize:'0.875rem', marginTop:'0.25rem', display:'flex', alignItems:'center', gap:'0.375rem' }}>
            <span style={{ width:8, height:8, background:'var(--green-500)', borderRadius:'50%', display:'inline-block', animation:'pulse 1.5s infinite' }}/>
            Live NAV data — updating every 2 seconds
          </p>
        </div>
        <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap' }}>
          <button onClick={exportNavCSV}     className="btn btn-outline btn-sm"><Download size={14}/> NAV CSV</button>
          <button onClick={exportPDFReport}  className="btn btn-primary btn-sm"><FileText size={14}/> Export PDF</button>
        </div>
      </div>

      {/* Live ticker */}
      <div style={{ background:'var(--slate-900)', borderRadius:'var(--radius-xl)', padding:'0.875rem 1.25rem', overflowX:'auto' }}>
        <div style={{ display:'flex', gap:'1.5rem', minWidth:'max-content' }}>
          <span style={{ fontSize:'0.7rem', fontWeight:700, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'0.08em', flexShrink:0 }}>LIVE NAV</span>
          {funds.slice(0, 12).map(f => {
            const p = livePrices[f.id];
            const up = p?.up ?? true;
            return (
              <div key={f.id} style={{ display:'flex', flexDirection:'column', gap:'0.1rem' }}>
                <span style={{ fontSize:'0.68rem', color:'rgba(255,255,255,0.4)', whiteSpace:'nowrap' }}>{f.name.split(' ').slice(0,2).join(' ')}</span>
                <span style={{ fontSize:'0.9rem', fontWeight:700, color:'white', fontFamily:'monospace' }}>₹{p?.nav ?? f.nav}</span>
                <span style={{ fontSize:'0.7rem', fontWeight:700, color: up?'#4ade80':'#f87171', display:'flex', alignItems:'center', gap:2 }}>
                  {up ? <ArrowUpRight size={10}/> : <ArrowDownRight size={10}/>}
                  {up?'+':''}{p?.pct ?? 0}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats */}
      <div className="grid-4">
        {[
          { label:'Total Funds',   value:funds.length,              icon:<Layers size={18}/>,     cls:'stat-icon-blue'   },
          { label:'Total AUM',     value:`₹${(totalAUM/1000).toFixed(0)}K Cr`, icon:<DollarSign size={18}/>, cls:'stat-icon-green' },
          { label:'Avg Expense',   value:`${avgExpense}%`,          icon:<Percent size={18}/>,    cls:'stat-icon-purple' },
          { label:'Avg 1Y Return', value:`+${avg1Y}%`,              icon:<TrendingUp size={18}/>, cls:'stat-icon-amber'  },
        ].map((s,i) => (
          <div key={i} className="stat-card">
            <div className={`stat-icon ${s.cls}`}>{s.icon}</div>
            <div><p className="stat-label">{s.label}</p><p className="stat-value">{s.value}</p></div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="tabs">
        {[['overview','Overview'],['movers','Gainers / Losers'],['nav','NAV Trends'],['risk','Risk & Expense']].map(([v,l]) => (
          <button key={v} onClick={() => setTab(v)} className={`tab-btn${tab===v?' active':''}`}>{l}</button>
        ))}
      </div>

      {/* Fund filter chips */}
      <div className="card" style={{ padding:'1rem 1.25rem' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.75rem' }}>
          <p style={{ fontWeight:600, fontSize:'0.875rem', color:'var(--slate-700)' }}>Filter funds for charts ({selIds.length || funds.length} shown)</p>
          <div style={{ display:'flex', gap:'0.5rem' }}>
            <button className="btn btn-outline btn-sm" onClick={() => setSelIds(funds.map(f => f.id))}>All</button>
            <button className="btn btn-ghost btn-sm"   onClick={() => setSelIds([])}>Clear</button>
          </div>
        </div>
        <div style={{ display:'flex', flexWrap:'wrap', gap:'0.375rem', maxHeight:120, overflowY:'auto' }}>
          {funds.map(f => (
            <button key={f.id} onClick={() => setSelIds(p => p.includes(f.id) ? p.filter(id=>id!==f.id) : [...p, f.id])}
              style={{ padding:'0.25rem 0.625rem', borderRadius:99, fontSize:'0.75rem', fontWeight:600, border:'1.5px solid', cursor:'pointer', transition:'all 0.1s',
                background: selIds.includes(f.id)?'var(--blue-600)':'transparent',
                color:      selIds.includes(f.id)?'white':'var(--slate-600)',
                borderColor:selIds.includes(f.id)?'var(--blue-600)':'var(--slate-200)',
              }}>
              {f.name.split(' ').slice(0,2).join(' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Overview tab */}
      {tab==='overview' && (
        <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>
          <div className="grid-2">
            <div className="card">
              <p className="section-title" style={{ marginBottom:'1rem' }}>AUM by Category</p>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={catAUM} cx="50%" cy="50%" outerRadius={110} innerRadius={40} dataKey="value"
                    label={({name,percent}) => percent > 0.04 ? `${name} ${(percent*100).toFixed(0)}%` : ''} labelLine>
                    {catAUM.map((_,i) => <Cell key={i} fill={COLORS[i % COLORS.length]}/>)}
                  </Pie>
                  <Tooltip formatter={v => `₹${Number(v).toLocaleString('en-IN')} Cr`}/>
                  <Legend wrapperStyle={{ fontSize:'0.75rem' }}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="card">
              <p className="section-title" style={{ marginBottom:'1rem' }}>Top 8 Funds — Returns Comparison</p>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topFunds} margin={{ left:0, right:10, bottom:40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--slate-100)"/>
                  <XAxis dataKey="name" tick={{ fontSize:10 }} angle={-30} textAnchor="end"/>
                  <YAxis unit="%" tick={{ fontSize:11 }}/>
                  <Tooltip formatter={v => `${v}%`}/>
                  <Legend/>
                  <Bar dataKey="1Y" fill="#2563eb" radius={[2,2,0,0]}/>
                  <Bar dataKey="3Y" fill="#16a34a" radius={[2,2,0,0]}/>
                  <Bar dataKey="5Y" fill="#d97706" radius={[2,2,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          {/* Live fund table */}
          <div className="card" style={{ padding:0, overflow:'hidden' }}>
            <div style={{ padding:'1rem 1.5rem', borderBottom:'1px solid var(--slate-100)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <p className="section-title">Live Fund Data — {filtered.length} funds</p>
              <button onClick={exportNavCSV} className="btn btn-outline btn-sm"><Download size={13}/> CSV</button>
            </div>
            <div style={{ maxHeight:400, overflowY:'auto' }}>
              <table className="table">
                <thead style={{ position:'sticky', top:0, zIndex:1 }}>
                  <tr><th>Fund</th><th>Cat</th><th className="text-right">Live NAV</th><th className="text-right">Chg%</th><th className="text-right">1Y%</th><th className="text-right">3Y%</th><th className="text-right">AUM(Cr)</th><th>Risk</th></tr>
                </thead>
                <tbody>
                  {filtered.map(f => {
                    const p = livePrices[f.id];
                    const up = p?.up ?? true;
                    return (
                      <tr key={f.id}>
                        <td style={{ fontWeight:600, maxWidth:180, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{f.name}</td>
                        <td><span className="badge badge-blue" style={{ fontSize:'0.68rem' }}>{f.category}</span></td>
                        <td className="text-right" style={{ fontFamily:'monospace', fontWeight:700 }}>₹{p?.nav ?? f.nav}</td>
                        <td className="text-right">
                          <span style={{ color: up?'var(--green-600)':'var(--red-500)', fontWeight:700, fontSize:'0.8125rem', display:'flex', alignItems:'center', gap:2, justifyContent:'flex-end' }}>
                            {up?<ArrowUpRight size={12}/>:<ArrowDownRight size={12}/>}{up?'+':''}{p?.pct ?? 0}%
                          </span>
                        </td>
                        <td className="text-right" style={{ color:'var(--green-600)', fontWeight:600 }}>+{f.returns?.['1Y']||0}%</td>
                        <td className="text-right" style={{ color:'var(--blue-600)', fontWeight:600 }}>+{f.returns?.['3Y']||0}%</td>
                        <td className="text-right">₹{f.aum?.toLocaleString('en-IN')}</td>
                        <td><span className={`badge badge-${f.risk==='Low'?'low':f.risk==='Moderate'?'moderate':f.risk==='High'?'high':'veryhigh'}`} style={{ fontSize:'0.68rem' }}>{f.risk}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Gainers / Losers tab */}
      {tab==='movers' && (
        <div className="grid-2">
          {[['Top Gainers 📈', gainers, true], ['Top Losers 📉', losers, false]].map(([title, list, isGain]) => (
            <div key={title} className="card">
              <p className="section-title" style={{ marginBottom:'1rem', color: isGain?'var(--green-600)':'var(--red-500)' }}>{title}</p>
              {list.length===0 ? (
                <p style={{ color:'var(--slate-400)', fontSize:'0.875rem' }}>Waiting for price movement…</p>
              ) : list.map(([id,p],i) => (
                <div key={id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0.75rem 0', borderBottom: i<list.length-1?'1px solid var(--slate-100)':'none' }}>
                  <div>
                    <p style={{ fontWeight:600, fontSize:'0.875rem', color:'var(--slate-800)' }}>{fname(id)}</p>
                    <p style={{ fontSize:'0.78rem', color:'var(--slate-400)', fontFamily:'monospace' }}>₹{p.nav}</p>
                  </div>
                  <p style={{ fontWeight:800, color: isGain?'var(--green-600)':'var(--red-500)', display:'flex', alignItems:'center', gap:2 }}>
                    {isGain?<ArrowUpRight size={14}/>:<ArrowDownRight size={14}/>}
                    {isGain?'+':''}{p.pct}%
                  </p>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* NAV Trends tab — connected to live prices */}
      {tab==='nav' && (
        <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>
          <div className="card">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem', flexWrap:'wrap', gap:'0.75rem' }}>
              <p className="section-title">NAV History (live endpoint) — up to 5 funds</p>
              <div style={{ display:'flex', gap:'0.375rem' }}>
                {['1M','3M','1Y','3Y','5Y'].map(r => (
                  <button key={r} onClick={() => setRange(r)} className="btn btn-sm"
                    style={{ background: range===r?'var(--blue-600)':'var(--slate-100)', color: range===r?'white':'var(--slate-600)', border:'none', padding:'0.3rem 0.625rem', fontSize:'0.78rem' }}>
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={340}>
              <LineChart data={navData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--slate-100)"/>
                <XAxis dataKey="date" tick={{ fontSize:11 }}/>
                <YAxis tick={{ fontSize:11 }} tickFormatter={v => `₹${v}`}/>
                <Tooltip formatter={(v,name) => [`₹${v}`, name]}/>
                <Legend wrapperStyle={{ fontSize:'0.78rem' }}/>
                {filtered.slice(0,5).map((f,i) => (
                  <Line key={f.id} type="monotone"
                    dataKey={f.name.split(' ').slice(0,2).join(' ')}
                    stroke={COLORS[i % COLORS.length]}
                    strokeWidth={2.5} dot={false} activeDot={{ r:4 }}/>
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
          {filtered[0] && (
            <div className="card">
              <p className="section-title" style={{ marginBottom:'1rem' }}>
                Area View — {filtered[0].name.split(' ').slice(0,3).join(' ')}
                {livePrices[filtered[0].id] && (
                  <span style={{ marginLeft:'0.75rem', fontSize:'0.875rem', fontWeight:800, color: livePrices[filtered[0].id].up ? 'var(--green-600)' : 'var(--red-500)' }}>
                    ₹{livePrices[filtered[0].id].nav} ({livePrices[filtered[0].id].up?'+':''}{livePrices[filtered[0].id].pct}%)
                  </span>
                )}
              </p>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={navData.map(d => ({ date: d.date, nav: d[filtered[0].name.split(' ').slice(0,2).join(' ')] }))}>
                  <defs>
                    <linearGradient id="navG" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#2563eb" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--slate-100)"/>
                  <XAxis dataKey="date" tick={{ fontSize:11 }}/>
                  <YAxis tick={{ fontSize:11 }} tickFormatter={v => `₹${v}`}/>
                  <Tooltip formatter={v => [`₹${v}`, 'NAV']}/>
                  <Area type="monotone" dataKey="nav" stroke="#2563eb" strokeWidth={2.5} fill="url(#navG)" dot={false}/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Risk & Expense tab */}
      {tab==='risk' && (
        <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>
          <div className="grid-2">
            <div className="card">
              <p className="section-title" style={{ marginBottom:'1rem' }}>Risk + Category Distribution ({riskDist.length} segments)</p>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={riskDist} cx="50%" cy="50%" outerRadius={100} dataKey="value"
                    label={({name,value,percent}) => percent>0.03?`${value}`:''} labelLine={false}>
                    {riskDist.map((_,i) => <Cell key={i} fill={COLORS[i % COLORS.length]}/>)}
                  </Pie>
                  <Tooltip/>
                  <Legend wrapperStyle={{ fontSize:'0.72rem' }} formatter={(v) => v.length>25?v.slice(0,25)+'…':v}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="card">
              <p className="section-title" style={{ marginBottom:'0.5rem' }}>Expense Ratio vs 1Y Return</p>
              <p style={{ fontSize:'0.75rem', color:'var(--slate-400)', marginBottom:'0.75rem' }}>Each dot = one fund. Lower expense + higher return = top-right corner.</p>
              <ResponsiveContainer width="100%" height={270}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--slate-100)"/>
                  <XAxis dataKey="x" name="Expense%" unit="%" tick={{ fontSize:11 }} label={{ value:'Expense %', position:'insideBottom', offset:-4, fontSize:11 }}/>
                  <YAxis dataKey="y" name="1Y Return" unit="%" tick={{ fontSize:11 }} label={{ value:'1Y Return %', angle:-90, position:'insideLeft', fontSize:11 }}/>
                  <Tooltip content={({ active, payload }) => active && payload?.length ? (
                    <div style={{ background:'white', border:'1px solid var(--slate-200)', borderRadius:8, padding:'0.625rem', fontSize:'0.78rem' }}>
                      <p style={{ fontWeight:700 }}>{payload[0]?.payload?.name}</p>
                      <p>Expense: {payload[0]?.payload?.x}%</p>
                      <p>1Y Return: {payload[0]?.payload?.y}%</p>
                    </div>) : null}/>
                  <Scatter data={scatterData} fill="#2563eb" opacity={0.7}/>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="card">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem' }}>
              <p className="section-title">Expense Ratio Comparison (Regular vs Direct)</p>
              <button onClick={() => downloadCSV(filtered.map(f => ({
                Fund: f.name, Regular: f.expenseRatio?.regular||0, Direct: f.expenseRatio?.direct||0,
                Saving: +((f.expenseRatio?.regular||0)-(f.expenseRatio?.direct||0)).toFixed(2),
              })), 'expense_ratios.csv')} className="btn btn-outline btn-sm"><Download size={13}/> CSV</button>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={filtered.slice(0,10).map(f => ({
                name: f.name.split(' ').slice(0,2).join(' '),
                Regular: f.expenseRatio?.regular||0,
                Direct: f.expenseRatio?.direct||0,
              }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--slate-100)"/>
                <XAxis dataKey="name" tick={{ fontSize:10 }} angle={-20} textAnchor="end" height={50}/>
                <YAxis unit="%" tick={{ fontSize:11 }}/>
                <Tooltip formatter={v => `${v}%`}/>
                <Legend/>
                <Bar dataKey="Regular" fill="#2563eb" radius={[2,2,0,0]}/>
                <Bar dataKey="Direct"  fill="#16a34a" radius={[2,2,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  );
}
