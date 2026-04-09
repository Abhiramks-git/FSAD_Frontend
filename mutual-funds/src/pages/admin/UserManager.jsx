import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { UserPlus, Pencil, Trash2, X, Search, Users, Loader } from 'lucide-react';
import AdminAPI from '../../api/admin';

const roleBadge = { admin:'badge-high', advisor:'badge-low', analyst:'badge-blue', investor:'badge-moderate' };

export default function UserManager() {
  const [users,     setUsers]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing,   setEditing]   = useState(null);
  const [saving,    setSaving]    = useState(false);
  const [form,      setForm]      = useState({ name:'', email:'', role:'investor', password:'' });

  const load = () => {
    setLoading(true);
    AdminAPI.getUsers()
      .then(res => setUsers(res.data))
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const openModal = (user = null) => {
    setEditing(user);
    setForm(user ? { name:user.name, email:user.email, role:user.role, password:'' } : { name:'', email:'', role:'investor', password:'' });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.email || (!editing && !form.password)) { toast.error('Fill all required fields'); return; }
    setSaving(true);
    try {
      if (editing) {
        await AdminAPI.updateUser(editing.id, form);
        toast.success('User updated');
      } else {
        await AdminAPI.createUser(form.name, form.email, form.password, form.role);
        toast.success('User created');
      }
      load();
      setShowModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await AdminAPI.deleteUser(id);
      toast.info('User deleted');
      load();
    } catch { toast.error('Delete failed'); }
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'0.75rem' }}>
        <div>
          <h1 style={{ fontSize:'1.375rem', fontWeight:700 }}>User Management</h1>
          <p style={{ color:'var(--slate-500)', fontSize:'0.875rem', marginTop:'0.25rem' }}>{users.length} total users</p>
        </div>
        <button onClick={() => openModal()} className="btn btn-primary"><UserPlus size={16}/> Add User</button>
      </div>

      <div className="card" style={{ padding:0, overflow:'hidden' }}>
        <div style={{ padding:'1rem 1.25rem', borderBottom:'1px solid var(--slate-100)' }}>
          <div className="search-wrap" style={{ maxWidth:320 }}>
            <Search size={16}/>
            <input className="search-input" placeholder="Search users…" value={search} onChange={e => setSearch(e.target.value)}/>
          </div>
        </div>
        {loading ? (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'3rem', gap:'0.75rem', color:'var(--slate-400)' }}>
            <Loader size={18} style={{ animation:'spin 1s linear infinite' }}/> Loading…
          </div>
        ) : (
          <div className="table-wrap" style={{ borderRadius:0, border:'none', boxShadow:'none' }}>
            <table className="table">
              <thead><tr><th>#</th><th>Name</th><th>Email</th><th>Role</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map((u, i) => (
                  <tr key={u.id}>
                    <td style={{ color:'var(--slate-400)', fontSize:'0.8125rem' }}>{i+1}</td>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:'0.625rem' }}>
                        <div style={{ width:32, height:32, borderRadius:'50%', background:'var(--blue-100)', color:'var(--blue-700)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'0.8rem', flexShrink:0 }}>
                          {u.name?.charAt(0)}
                        </div>
                        <span style={{ fontWeight:600 }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ color:'var(--slate-500)' }}>{u.email}</td>
                    <td><span className={`badge ${roleBadge[u.role]||'badge-slate'}`} style={{ textTransform:'capitalize' }}>{u.role}</span></td>
                    <td>
                      <div style={{ display:'flex', gap:'0.375rem' }}>
                        <button onClick={() => openModal(u)} className="btn btn-outline btn-sm"><Pencil size={13}/> Edit</button>
                        <button onClick={() => handleDelete(u.id)} className="btn btn-sm" style={{ background:'#fef2f2', color:'var(--red-500)', border:'1px solid #fecaca' }}><Trash2 size={13}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={5}><div className="empty-state"><Users size={36}/><h3>No users found</h3></div></td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200, padding:'1rem' }}>
          <div className="card animate-scalein" style={{ width:'100%', maxWidth:460, padding:'2rem' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
              <h2 style={{ fontWeight:700, fontSize:'1.125rem' }}>{editing?'Edit User':'Add New User'}</h2>
              <button onClick={() => setShowModal(false)} className="btn btn-ghost btn-sm" style={{ padding:'0.25rem' }}><X size={18}/></button>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
              <div className="form-group"><label className="form-label">Full Name *</label><input className="form-input" value={form.name} onChange={e => setForm({...form,name:e.target.value})} placeholder="Full name"/></div>
              <div className="form-group"><label className="form-label">Email *</label><input type="email" className="form-input" value={form.email} onChange={e => setForm({...form,email:e.target.value})} placeholder="user@example.com"/></div>
              {!editing && <div className="form-group"><label className="form-label">Password *</label><input type="password" className="form-input" value={form.password} onChange={e => setForm({...form,password:e.target.value})} placeholder="Min 4 characters"/></div>}
              <div className="form-group"><label className="form-label">Role</label>
                <select className="form-input" value={form.role} onChange={e => setForm({...form,role:e.target.value})}>
                  <option value="investor">Investor</option><option value="advisor">Advisor</option><option value="analyst">Analyst</option><option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div style={{ display:'flex', gap:'0.75rem', justifyContent:'flex-end', marginTop:'1.75rem' }}>
              <button onClick={() => setShowModal(false)} className="btn btn-ghost">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn btn-primary">{saving?'Saving…':'Save User'}</button>
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  );
}
