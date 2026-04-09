import { useState } from 'react';
import { useFunds, mapFund } from '../../contexts/FundContext';
import { toast } from 'react-toastify';
import { RefreshCw, TrendingUp, CheckCircle } from 'lucide-react';
import FundAPI from '../../api/funds';

export default function PerformanceUpdater() {
  const { funds, setFunds }   = useFunds();
  const [selectedId, setId]   = useState('');
  const [form, setForm]       = useState({ nav:'', '1Y':'', '3Y':'', '5Y':'' });
  const [saving, setSaving]   = useState(false);
  const [saved,  setSaved]    = useState(false);

  const selected = funds.find(f => f.id === selectedId);

  const handleSelect = (e) => {
    const id   = e.target.value;
    setId(id); setSaved(false);
    const fund = funds.find(f => f.id === id);
    if (fund) setForm({ nav: fund.nav, '1Y': fund.returns?.['1Y']??'', '3Y': fund.returns?.['3Y']??'', '5Y': fund.returns?.['5Y']??'' });
  };

  const handleUpdate = async () => {
    if (!selectedId) { toast.error('Select a fund first'); return; }
    setSaving(true);
    try {
      const res = await FundAPI.updatePerformance(
        selectedId,
        parseFloat(form.nav),
        parseFloat(form['1Y']),
        parseFloat(form['3Y']),
        parseFloat(form['5Y'])
      );
      // Update local state so charts/cards refresh immediately
      const mapped = mapFund(res.data);
      setFunds(funds.map(f => f.id === selectedId ? mapped : f));
      setSaved(true);
      toast.success(`${selected.name} updated in database`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed. Is the server running?');
    } finally { setSaving(false); }
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>
      <div>
        <h1 style={{ fontSize:'1.375rem', fontWeight:700 }}>Update Fund Performance</h1>
        <p style={{ color:'var(--slate-500)', fontSize:'0.875rem', marginTop:'0.25rem' }}>
          Changes are saved directly to MySQL and reflected across the platform immediately.
        </p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:'1.5rem' }} className="updater-grid">
        {/* Selector card */}
        <div className="card">
          <p className="section-title" style={{ marginBottom:'1rem' }}>Select Fund</p>
          <select className="form-input" value={selectedId} onChange={handleSelect}>
            <option value="">— Choose a fund to update —</option>
            {funds.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>

          {selected && (
            <div style={{ marginTop:'1.25rem', background:'var(--slate-50)', borderRadius:'var(--radius-lg)', padding:'1rem' }}>
              <p style={{ fontWeight:700, color:'var(--slate-800)', marginBottom:'0.625rem', fontSize:'0.9375rem' }}>{selected.name}</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.625rem' }}>
                {[['AMC',selected.amc],['Category',selected.category],['Risk',selected.risk],['Inception',selected.inceptionDate??'—']].map(([k,v]) => (
                  <div key={k}>
                    <p style={{ fontSize:'0.75rem', color:'var(--slate-400)', marginBottom:'0.125rem' }}>{k}</p>
                    <p style={{ fontSize:'0.875rem', fontWeight:600, color:'var(--slate-700)' }}>{v}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Form card */}
        {selected && (
          <div className="card">
            <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'1.25rem' }}>
              <TrendingUp size={18} style={{ color:'var(--blue-600)' }}/>
              <p className="section-title">Update Performance Data</p>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
              <div className="form-group" style={{ gridColumn:'1/-1' }}>
                <label className="form-label">Current NAV (₹)</label>
                <input type="number" step="0.01" className="form-input"
                  value={form.nav} onChange={e => setForm(f => ({...f, nav:e.target.value}))}
                  placeholder="e.g. 1425.39"/>
              </div>
              {['1Y','3Y','5Y'].map(period => (
                <div key={period} className="form-group">
                  <label className="form-label">{period} Return (%)</label>
                  <input type="number" step="0.01" className="form-input"
                    value={form[period]} onChange={e => setForm(f => ({...f,[period]:e.target.value}))}
                    placeholder="e.g. 14.5"/>
                </div>
              ))}
            </div>

            <div className="alert alert-info" style={{ marginTop:'1rem', fontSize:'0.8125rem' }}>
              Changes will be saved to MySQL and all dashboards will update immediately.
            </div>

            <div style={{ marginTop:'1.25rem', display:'flex', gap:'0.75rem', alignItems:'center' }}>
              <button onClick={handleUpdate} disabled={saving} className="btn btn-primary">
                {saving
                  ? <><span style={{ width:14, height:14, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'white', borderRadius:'50%', animation:'spin 0.7s linear infinite', display:'inline-block' }}/> Saving…</>
                  : <><RefreshCw size={15}/> Save to Database</>
                }
              </button>
              {saved && (
                <span style={{ display:'flex', alignItems:'center', gap:'0.375rem', color:'var(--green-600)', fontSize:'0.875rem', fontWeight:600 }}>
                  <CheckCircle size={16}/> Saved to MySQL ✓
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media(min-width:768px){.updater-grid{grid-template-columns:1fr 1fr!important;}}
        @keyframes spin{to{transform:rotate(360deg);}}
      `}</style>
    </div>
  );
}
