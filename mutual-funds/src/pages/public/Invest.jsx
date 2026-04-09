import { useParams, useNavigate } from 'react-router-dom';
import { useFunds } from '../../contexts/FundContext';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import { ArrowLeft, Shield, CheckCircle, CreditCard, Wallet, Calendar, Info } from 'lucide-react';
import InvestmentAPI from '../../api/investments';

export default function Invest() {
  const { fundId }  = useParams();
  const { funds }   = useFunds();
  const navigate    = useNavigate();
  const fund        = funds.find(f => f.id === fundId);

  const [amount,  setAmount]  = useState(500);
  const [mode,    setMode]    = useState('lumpsum');
  const [sipDay,  setSipDay]  = useState(5);
  const [loading, setLoad]    = useState(false);

  // Once fund is available from API, set the correct minimum
  useEffect(() => {
    if (fund?.minSIP) setAmount(fund.minSIP);
  }, [fund?.minSIP]);

  if (!fund) return (
    <div className="page-wrapper"><Navbar/>
      <div style={{ textAlign:'center', padding:'5rem 1rem' }}>
        <h2>Fund not found</h2>
        <button onClick={() => navigate('/funds')} className="btn btn-primary" style={{ marginTop:'1rem' }}>Browse Funds</button>
      </div>
    <Footer/></div>
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (amount < fund.minSIP) { toast.error(`Minimum investment is ₹${fund.minSIP}`); return; }
    setLoad(true);
    try {
      await InvestmentAPI.invest(fund.id, amount, mode, mode === 'sip' ? sipDay : null);
      toast.success(`${mode === 'sip' ? 'SIP started' : 'Invested'}: ₹${amount.toLocaleString('en-IN')} in ${fund.name.split(' ').slice(0,3).join(' ')}!`);
      navigate('/investor/portfolio');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Investment failed. Please try again.');
      setLoad(false);
    }
  };

  const units = (amount / fund.nav).toFixed(3);

  return (
    <div className="page-wrapper">
      <Navbar/>
      <main className="page-content">
        <div className="page-hero">
          <div className="container">
            <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm"
              style={{ color:'rgba(255,255,255,0.7)', marginBottom:'1rem', padding:'0.375rem 0' }}>
              <ArrowLeft size={16}/> Back
            </button>
            <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(1.625rem,3vw,2.25rem)', color:'white', marginBottom:'0.375rem' }}>
              Invest in {fund.name}
            </h1>
            <p style={{ color:'rgba(255,255,255,0.65)' }}>{fund.amc} · {fund.category} · {fund.subCategory}</p>
          </div>
        </div>

        <div className="container" style={{ padding:'2.5rem 1.5rem' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:'1.5rem', maxWidth:900, margin:'0 auto' }} className="invest-grid">

            {/* Form */}
            <div className="card" style={{ padding:'2rem' }}>

              {/* Mode toggle */}
              <div style={{ display:'flex', background:'var(--slate-100)', borderRadius:'var(--radius-lg)', padding:4, marginBottom:'1.75rem', gap:4 }}>
                {[['lumpsum','One-time (Lumpsum)'],['sip','Monthly SIP']].map(([k,l]) => (
                  <button key={k} onClick={() => setMode(k)} style={{
                    flex:1, padding:'0.625rem', border:'none', borderRadius:'var(--radius-md)',
                    fontWeight:600, fontSize:'0.875rem', cursor:'pointer', transition:'all 0.15s',
                    background: mode===k ? 'white' : 'transparent',
                    color: mode===k ? 'var(--blue-700)' : 'var(--slate-500)',
                    boxShadow: mode===k ? 'var(--shadow-sm)' : 'none'
                  }}>
                    {l}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
                {/* Amount */}
                <div className="form-group">
                  <label className="form-label">
                    {mode === 'sip' ? 'Monthly SIP Amount' : 'Investment Amount'} (₹)
                  </label>
                  <div style={{ position:'relative' }}>
                    <span style={{ position:'absolute', left:'0.875rem', top:'50%', transform:'translateY(-50%)', color:'var(--slate-400)', fontWeight:600 }}>₹</span>
                    <input type="number" required min={fund.minSIP} step={100}
                      className="form-input"
                      style={{ paddingLeft:'1.875rem', fontSize:'1.125rem', fontWeight:700 }}
                      value={amount} onChange={e => setAmount(Number(e.target.value))}/>
                  </div>
                  <p style={{ fontSize:'0.78rem', color:'var(--slate-400)', marginTop:'0.25rem' }}>
                    Minimum: ₹{fund.minSIP?.toLocaleString('en-IN')}
                  </p>
                  {/* Quick amount pills */}
                  <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap', marginTop:'0.625rem' }}>
                    {[500,1000,2500,5000,10000,25000].filter(v => v >= fund.minSIP).map(v => (
                      <button key={v} type="button" onClick={() => setAmount(v)} className="btn btn-sm"
                        style={{ background: amount===v?'var(--blue-600)':'var(--slate-100)', color: amount===v?'white':'var(--slate-600)', border:'none', padding:'0.3rem 0.75rem', fontSize:'0.8125rem' }}>
                        ₹{v.toLocaleString('en-IN')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* SIP day selector — only shown when mode = sip */}
                {mode === 'sip' && (
                  <div className="form-group">
                    <label className="form-label" style={{ display:'flex', alignItems:'center', gap:'0.375rem' }}>
                      <Calendar size={14} style={{ color:'var(--blue-600)' }}/> SIP Deduction Date
                    </label>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:'0.375rem' }}>
                      {[1,3,5,7,10,15,20,25,28].map(d => (
                        <button key={d} type="button" onClick={() => setSipDay(d)} className="btn btn-sm"
                          style={{ background: sipDay===d?'var(--blue-600)':'var(--slate-100)', color: sipDay===d?'white':'var(--slate-600)', border:'none', padding:'0.3rem 0.75rem', fontSize:'0.8125rem', minWidth:40 }}>
                          {d}
                        </button>
                      ))}
                    </div>
                    <p style={{ fontSize:'0.78rem', color:'var(--slate-500)', marginTop:'0.375rem', display:'flex', alignItems:'center', gap:'0.3rem' }}>
                      <Info size={12}/> ₹{amount.toLocaleString('en-IN')} will be deducted on <strong>day {sipDay}</strong> of every month.
                    </p>
                  </div>
                )}

                {/* Payment method */}
                <div className="form-group">
                  <label className="form-label">Payment Method</label>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem' }}>
                    {[{icon:<Wallet size={16}/>,label:'UPI'},{icon:<CreditCard size={16}/>,label:'Net Banking'}].map(pm => (
                      <div key={pm.label} style={{ padding:'0.875rem 1rem', border:'1.5px solid var(--blue-300)', borderRadius:'var(--radius-md)', background:'var(--blue-50)', display:'flex', alignItems:'center', gap:'0.5rem', fontSize:'0.875rem', fontWeight:600, color:'var(--blue-700)', cursor:'pointer' }}>
                        {pm.icon} {pm.label}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Units preview */}
                <div style={{ background:'var(--slate-50)', borderRadius:'var(--radius-lg)', padding:'1rem 1.125rem', border:'1px solid var(--slate-200)' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.5rem' }}>
                    <span style={{ fontSize:'0.875rem', color:'var(--slate-500)' }}>Units you'll receive</span>
                    <span style={{ fontWeight:700, color:'var(--slate-800)' }}>≈ {units} units</span>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ fontSize:'0.875rem', color:'var(--slate-500)' }}>At current NAV</span>
                    <span style={{ fontWeight:700, color:'var(--slate-800)' }}>₹{fund.nav}</span>
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn btn-primary btn-lg btn-block">
                  {loading ? (
                    <span style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
                      <span style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'white', borderRadius:'50%', animation:'spin 0.7s linear infinite' }}/>
                      Processing…
                    </span>
                  ) : mode === 'sip'
                    ? `Start SIP — ₹${amount.toLocaleString('en-IN')}/month`
                    : `Confirm & Invest ₹${amount.toLocaleString('en-IN')}`
                  }
                </button>
              </form>
            </div>

            {/* Right panel */}
            <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
              <div className="card">
                <h3 style={{ fontWeight:700, color:'var(--slate-900)', marginBottom:'1rem', fontSize:'1rem' }}>Fund Summary</h3>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
                  {[
                    ['NAV',          `₹${fund.nav}`],
                    ['Min SIP',      `₹${fund.minSIP}`],
                    ['1Y Return',    `+${fund.returns?.['1Y']??0}%`, true],
                    ['3Y Return',    `+${fund.returns?.['3Y']??0}%`, true],
                    ['5Y Return',    `+${fund.returns?.['5Y']??0}%`, true],
                    ['Risk',         fund.risk],
                    ['AUM',          `₹${fund.aum?.toLocaleString('en-IN')} Cr`],
                    ['Expense Ratio',`${fund.expenseRatio?.regular??0}% (Reg)`],
                  ].map(([l,v,g],i) => (
                    <div key={i} style={{ background:'var(--slate-50)', borderRadius:'var(--radius-md)', padding:'0.75rem' }}>
                      <p style={{ fontSize:'0.75rem', color:'var(--slate-500)', marginBottom:'0.25rem' }}>{l}</p>
                      <p style={{ fontWeight:700, color: g?'var(--green-600)':'var(--slate-800)', fontSize:'0.9375rem' }}>{v}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card" style={{ background:'var(--blue-50)', border:'1px solid var(--blue-100)' }}>
                <div style={{ display:'flex', gap:'0.75rem', alignItems:'flex-start' }}>
                  <Shield size={18} style={{ color:'var(--blue-600)', flexShrink:0, marginTop:2 }}/>
                  <div>
                    <p style={{ fontWeight:700, color:'var(--blue-900)', fontSize:'0.875rem', marginBottom:'0.375rem' }}>SEBI Regulated</p>
                    <p style={{ fontSize:'0.8125rem', color:'var(--blue-700)', lineHeight:1.6 }}>
                      Mutual fund investments are subject to market risks. Past performance does not guarantee future results. Please read the SID carefully.
                    </p>
                  </div>
                </div>
              </div>

              <div className="card">
                <p style={{ fontWeight:700, color:'var(--slate-800)', marginBottom:'0.875rem', fontSize:'0.9375rem' }}>
                  {mode === 'sip' ? 'How SIP works' : 'What happens next?'}
                </p>
                {(mode === 'sip' ? [
                  `₹${amount.toLocaleString('en-IN')} auto-debited on day ${sipDay} each month`,
                  'Units allocated at that day\'s NAV automatically',
                  'Cancel anytime from your portfolio page',
                  'Track performance in real-time in My Portfolio',
                ] : [
                  'Payment processed securely via your bank',
                  'Units allotted at same-day NAV',
                  'Confirmation saved to your portfolio',
                  'View holding in My Portfolio instantly',
                ]).map((s, i) => (
                  <div key={i} style={{ display:'flex', gap:'0.625rem', alignItems:'flex-start', marginBottom: i < 3 ? '0.625rem' : 0 }}>
                    <CheckCircle size={15} style={{ color:'var(--green-600)', flexShrink:0, marginTop:2 }}/>
                    <p style={{ fontSize:'0.8125rem', color:'var(--slate-600)' }}>{s}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <style>{`
          @media(min-width:768px){.invest-grid{grid-template-columns:1fr 340px!important;}}
          @keyframes spin{to{transform:rotate(360deg);}}
        `}</style>
      </main>
      <Footer/>
    </div>
  );
}
