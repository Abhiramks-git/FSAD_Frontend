import { useState } from 'react';
import { toast } from 'react-toastify';
import { Plus, Pencil, Trash2, X, FileText } from 'lucide-react';

const INIT = [
  { id: 1, title: 'Why Invest in Midcap Funds?', content: 'Midcap funds offer a sweet spot between growth and stability...', status: 'Published', category: 'Equity' },
  { id: 2, title: 'Tax Benefits of ELSS Funds',  content: 'ELSS provides dual benefits of tax saving under 80C and wealth creation...', status: 'Draft', category: 'Tax' },
  { id: 3, title: 'SIP vs Lump Sum — What to Choose?', content: 'A systematic comparison of both investment modes...', status: 'Published', category: 'Strategy' },
];

export default function ContentManager() {
  const [articles, setArticles] = useState(INIT);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', content: '', status: 'Draft', category: 'Equity' });

  const openModal = (a = null) => {
    setEditing(a);
    setForm(a ? { title: a.title, content: a.content, status: a.status, category: a.category } : { title: '', content: '', status: 'Draft', category: 'Equity' });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.title || !form.content) { toast.error('Title and content are required'); return; }
    if (editing) {
      setArticles(articles.map(a => a.id === editing.id ? { ...a, ...form } : a));
      toast.success('Article updated');
    } else {
      setArticles([{ id: Date.now(), ...form }, ...articles]);
      toast.success('Article created');
    }
    setShowModal(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 700 }}>Content Manager</h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.875rem', marginTop: '0.25rem' }}>{articles.length} articles</p>
        </div>
        <button onClick={() => openModal()} className="btn btn-primary"><Plus size={16} /> New Article</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
        {articles.map(a => (
          <div key={a.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
              <span className={`badge ${a.status === 'Published' ? 'badge-low' : 'badge-slate'}`}>{a.status}</span>
              <span className="badge badge-blue" style={{ fontSize: '0.7rem' }}>{a.category}</span>
            </div>
            <div style={{ width: 40, height: 40, background: 'var(--blue-50)', color: 'var(--blue-600)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={18} />
            </div>
            <h3 style={{ fontWeight: 700, color: 'var(--slate-900)', fontSize: '0.9375rem', lineHeight: 1.35 }}>{a.title}</h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--slate-500)', lineHeight: 1.6, flex: 1 }}>{a.content.slice(0, 100)}…</p>
            <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid var(--slate-100)' }}>
              <button onClick={() => openModal(a)} className="btn btn-outline btn-sm" style={{ flex: 1 }}><Pencil size={13} /> Edit</button>
              <button onClick={() => { setArticles(articles.filter(x => x.id !== a.id)); toast.info('Deleted'); }} className="btn btn-sm" style={{ background: '#fef2f2', color: 'var(--red-500)', border: '1px solid #fecaca' }}><Trash2 size={13} /></button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }}>
          <div className="card animate-scalein" style={{ width: '100%', maxWidth: 560, padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontWeight: 700, fontSize: '1.125rem' }}>{editing ? 'Edit Article' : 'New Article'}</h2>
              <button onClick={() => setShowModal(false)} className="btn btn-ghost btn-sm" style={{ padding: '0.25rem' }}><X size={18} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group"><label className="form-label">Title *</label><input className="form-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Article title" /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group"><label className="form-label">Category</label>
                  <select className="form-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    <option>Equity</option><option>Debt</option><option>Hybrid</option><option>Tax</option><option>Strategy</option>
                  </select>
                </div>
                <div className="form-group"><label className="form-label">Status</label>
                  <select className="form-input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    <option>Draft</option><option>Published</option>
                  </select>
                </div>
              </div>
              <div className="form-group"><label className="form-label">Content *</label><textarea className="form-input" value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} placeholder="Write article content…" style={{ minHeight: 140 }} /></div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.75rem' }}>
              <button onClick={() => setShowModal(false)} className="btn btn-ghost">Cancel</button>
              <button onClick={handleSave} className="btn btn-primary">Save Article</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
