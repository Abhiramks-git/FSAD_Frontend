import { useState } from 'react';
import { useFunds, mapFund } from '../../contexts/FundContext';
import { toast } from 'react-toastify';
import { Plus, Pencil, Trash2, X, Search, Database } from 'lucide-react';
import FundAPI from '../../api/funds';

const riskBadge = { 'Low':'badge-low','Moderate':'badge-moderate','High':'badge-high','Very High':'badge-veryhigh' };
const emptyForm = { id:'', name:'', amc:'', category:'Equity', subCategory:'', nav:'', aum:'', expenseRatioRegular:'', expenseRatioDirect:'', minSip:'', risk:'Moderate' };

export default function FundManagement() {
  const { funds, setFunds } = useFunds();
  const [search,    setSearch]    = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing,   setEditing]   = useState(null);
  const [saving,    setSaving]    = useState(false);
  const [form,      setForm]      = useState(emptyForm);

  const filtered = funds.filter(f =>
    f.name?.toLowerCase().includes(search.toLowerCase()) ||
    f.amc?.toLowerCase().includes(search.toLowerCase())
  );

  const openModal = (fund = null) => {
    setEditing(fund);
    setForm(fund ? {
      id: fund.id, name: fund.name, amc: fund.amc, category: fund.category,
      subCategory: fund.subCategory, nav: fund.nav, aum: fund.aum,
      expenseRatioRegular: fund.expenseRatio?.regular, expenseRatioDirect: fund.expenseRatio?.direct,
      minSip: fund.minSIP, risk: fund.risk,
    } : emptyForm);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.nav) { toast.error('Fund name and NAV are required'); return; }
    setSaving(true);
    try {
      const payload = {
        id: form.id || `fund_${Date.now()}`,
        name: form.name, amc: form.amc, category: form.category,
        subCategory: form.subCategory,
        nav: parseFloat(form.nav), aum: parseFloat(form.aum) || 0,
        expenseRatioRegular: parseFloat(form.expenseRatioRegular) || 0,
        expenseRatioDirect: parseFloat(form.expenseRatioDirect) || 0,
        minSip: parseInt(form.minSip) || 500, risk: form.risk,
        return1y: editing?.returns?.['1Y'] || 0,
        return3y: editing?.returns?.['3Y'] || 0,
        return5y: editing?.returns?.['5Y'] || 0,
        returnSinceInception: editing?.returns?.sinceInception || 0,
        about: editing?.about || '', idealFor: editing?.idealFor || '',
        investmentObjective: editing?.investmentObjective || '',
        exitLoad: editing?.exitLoad || '',
        benchmarkTier1: editing?.benchmark?.tier1 || '',
        benchmarkTier2: editing?.benchmark?.tier2 || '',
        fundManagerName: editing?.fundManager?.name || '',
        fundManagerDesignation: editing?.fundManager?.designation || '',
        fundManagerAbout: editing?.fundManager?.about || '',
        inceptionDate: editing?.inceptionDate || new Date().toLocaleDateString('en-IN'),
      };

      let res;
      if (editing) {
        res = await FundAPI.update(editing.id, payload);
        toast.success('Fund updated');
      } else {
        res = await FundAPI.create(payload);
        toast.success('Fund added');
      }

      const mapped = mapFund(res.data);
      if (editing) setFunds(funds.map(f => f.id === editing.id ? mapped : f));
      else setFunds([mapped, ...funds]);
      setShowModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this fund?')) return;
    try {
      await FundAPI.delete(id);
      setFunds(funds.filter(f => f.id !== id));
      toast.info('Fund deleted');
    } catch { toast.error('Delete failed'); }
  };

  const sf = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'0.75rem' }}>
        <div>
          <h1 style={{ fontSize:'1.375rem', fontWeight:700 }}>Fund Management</h1>
          <p style={{ color:'var(--slate-500)', fontSize:'0.875rem', marginTop:'0.25rem' }}>{funds.length} funds on platform</p>
        </div>
        <button onClick={() => openModal()} className="btn btn-primary"><Plus size={16}/> Add Fund</button>
      </div>

      <div className="card" style={{ padding:0, overflow:'hidden' }}>
        <div style={{ padding:'1rem 1.25rem', borderBottom:'1px solid var(--slate-100)' }}>
          <div className="search-wrap" style={{ maxWidth:360 }}>
            <Search size={16}/>
            <input className="search-input" placeholder="Search by fund name or AMC…" value={search} onChange={e => setSearch(e.target.value)}/>
          </div>
        </div>
        <div className="table-wrap" style={{ borderRadius:0, border:'none', boxShadow:'none' }}>
          <table className="table">
            <thead><tr><th>Fund Name</th><th>AMC</th><th>Category</th><th>NAV</th><th>1Y Return</th><th>Risk</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(fn => (
                <tr key={fn.id}>
                  <td style={{ fontWeight:600, maxWidth:220 }}>{fn.name}</td>
                  <td style={{ color:'var(--slate-500)' }}>{fn.amc}</td>
                  <td><span className="badge badge-blue" style={{ fontSize:'0.7rem' }}>{fn.category}</span></td>
                  <td style={{ fontWeight:600 }}>₹{fn.nav}</td>
                  <td style={{ color:'var(--green-600)', fontWeight:700 }}>+{fn.returns?.['1Y']??0}%</td>
                  <td><span className={`badge ${riskBadge[fn.risk]||'badge-slate'}`}>{fn.risk}</span></td>
                  <td>
                    <div style={{ display:'flex', gap:'0.375rem' }}>
                      <button onClick={() => openModal(fn)} className="btn btn-outline btn-sm"><Pencil size={13}/> Edit</button>
                      <button onClick={() => handleDelete(fn.id)} className="btn btn-sm" style={{ background:'#fef2f2', color:'var(--red-500)', border:'1px solid #fecaca' }}><Trash2 size={13}/></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={7}><div className="empty-state"><Database size={36}/><h3>No funds found</h3></div></td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200, padding:'1rem', overflowY:'auto' }}>
          <div className="card animate-scalein" style={{ width:'100%', maxWidth:580, padding:'2rem', margin:'1rem auto' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
              <h2 style={{ fontWeight:700, fontSize:'1.125rem' }}>{editing?'Edit Fund':'Add New Fund'}</h2>
              <button onClick={() => setShowModal(false)} className="btn btn-ghost btn-sm" style={{ padding:'0.25rem' }}><X size={18}/></button>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
              <div className="form-group" style={{ gridColumn:'1/-1' }}><label className="form-label">Fund Name *</label><input className="form-input" value={form.name} onChange={e => sf('name',e.target.value)} placeholder="e.g. HDFC Top 100 Fund"/></div>
              <div className="form-group"><label className="form-label">AMC</label><input className="form-input" value={form.amc} onChange={e => sf('amc',e.target.value)} placeholder="e.g. HDFC AMC"/></div>
              <div className="form-group"><label className="form-label">Category</label>
                <select className="form-input" value={form.category} onChange={e => sf('category',e.target.value)}>
                  <option>Equity</option><option>Debt</option><option>Hybrid</option><option>Index</option>
                </select>
              </div>
              <div className="form-group"><label className="form-label">Sub-Category</label><input className="form-input" value={form.subCategory} onChange={e => sf('subCategory',e.target.value)} placeholder="e.g. Large Cap"/></div>
              <div className="form-group"><label className="form-label">Risk</label>
                <select className="form-input" value={form.risk} onChange={e => sf('risk',e.target.value)}>
                  <option>Low</option><option>Moderate</option><option>High</option><option value="Very High">Very High</option>
                </select>
              </div>
              <div className="form-group"><label className="form-label">NAV (₹) *</label><input type="number" step="0.01" className="form-input" value={form.nav} onChange={e => sf('nav',e.target.value)} placeholder="0.00"/></div>
              <div className="form-group"><label className="form-label">AUM (₹ Cr)</label><input type="number" className="form-input" value={form.aum} onChange={e => sf('aum',e.target.value)} placeholder="0"/></div>
              <div className="form-group"><label className="form-label">Min SIP (₹)</label><input type="number" className="form-input" value={form.minSip} onChange={e => sf('minSip',e.target.value)} placeholder="500"/></div>
              <div className="form-group"><label className="form-label">Expense (Reg. %)</label><input type="number" step="0.01" className="form-input" value={form.expenseRatioRegular} onChange={e => sf('expenseRatioRegular',e.target.value)} placeholder="1.50"/></div>
              <div className="form-group"><label className="form-label">Expense (Dir. %)</label><input type="number" step="0.01" className="form-input" value={form.expenseRatioDirect} onChange={e => sf('expenseRatioDirect',e.target.value)} placeholder="0.50"/></div>
            </div>
            <div style={{ display:'flex', gap:'0.75rem', justifyContent:'flex-end', marginTop:'1.75rem' }}>
              <button onClick={() => setShowModal(false)} className="btn btn-ghost">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn btn-primary">{saving?'Saving…':'Save Fund'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
