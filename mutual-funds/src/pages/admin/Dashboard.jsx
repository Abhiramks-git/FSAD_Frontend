import { useFunds } from '../../contexts/FundContext';
import { Link } from 'react-router-dom';
import { Users, Database, ShieldCheck, Activity, ArrowRight, Clock, Loader, RefreshCw } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import AdminAPI from '../../api/admin';

export default function AdminDashboard() {
  const { funds }     = useFunds();
  const [users,       setUsers]    = useState([]);
  const [loading,     setLoading]  = useState(true);
  const [activity,    setActivity] = useState([]);

  const load = useCallback(() => {
    setLoading(true);
    AdminAPI.getUsers()
      .then(res => {
        const all = res.data;
        setUsers(all);
        // Build activity from users sorted by created date (newest first)
        const acts = [];
        const sorted = [...all].sort((a, b) => {
          const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return tb - ta;
        });
        sorted.slice(0, 8).forEach(u => {
          acts.push({
            action: `${u.role === 'investor' ? 'New investor registered' : u.role === 'advisor' ? 'Advisor account active' : u.role === 'analyst' ? 'Analyst account active' : 'Admin account'}: ${u.name}`,
            time: u.createdAt ? timeAgo(u.createdAt) : 'system',
            type: u.role,
          });
        });
        setActivity(acts);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
    const iv = setInterval(load, 30000); // refresh every 30 seconds
    return () => clearInterval(iv);
  }, [load]);

  function timeAgo(dateStr) {
    const d = new Date(dateStr);
    const diff = (Date.now() - d.getTime()) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return Math.floor(diff / 60) + ' min ago';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
    return Math.floor(diff / 86400) + 'd ago';
  }

  const roleBadge = { admin: 'badge-high', advisor: 'badge-low', analyst: 'badge-blue', investor: 'badge-moderate' };

  const stats = [
    { label: 'Total Users',   value: loading ? '…' : users.length,  icon: <Users size={20} />,    cls: 'stat-icon-blue',   link: '/admin/users' },
    { label: 'Active Funds',  value: funds.length,                   icon: <Database size={20} />, cls: 'stat-icon-green',  link: '/admin/funds' },
    { label: 'Investors',     value: loading ? '…' : users.filter(u => u.role === 'investor').length, icon: <Users size={20} />, cls: 'stat-icon-purple' },
    { label: 'System Status', value: 'Online',                       icon: <Activity size={20} />, cls: 'stat-icon-amber' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 700 }}>Admin Dashboard</h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem', marginTop: '0.25rem' }}>Platform overview — live data from MySQL.</p>
        </div>
        <button onClick={load} className="btn btn-outline btn-sm"><RefreshCw size={14} /> Refresh</button>
      </div>

      <div className="grid-2">
        {stats.map((s, i) => (
          <div key={i} className="stat-card">
            <div className={`stat-icon ${s.cls}`}>{s.icon}</div>
            <div style={{ flex: 1 }}>
              <p className="stat-label">{s.label}</p>
              <p className="stat-value">{s.value}</p>
            </div>
            {s.link && (
              <Link to={s.link} className="btn btn-ghost btn-sm" style={{ color: 'var(--blue-600)' }}>
                <ArrowRight size={16} />
              </Link>
            )}
          </div>
        ))}
      </div>

      <div className="grid-2">
        {/* Live user list from DB */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--slate-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p className="section-title">Registered Users (Live)</p>
            <Link to="/admin/users" className="btn btn-outline btn-sm">Manage</Link>
          </div>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', gap: '0.5rem', color: 'var(--slate-400)' }}>
              <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Loading…
              <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
            </div>
          ) : (
            <div style={{ maxHeight: 320, overflowY: 'auto' }}>
              {users.map((u, i) => (
                <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1.25rem', borderBottom: i < users.length - 1 ? '1px solid var(--slate-50)' : 'none' }}>
                  <div style={{ width: 34, height: 34, background: 'var(--blue-100)', color: 'var(--blue-700)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0 }}>
                    {u.name?.charAt(0)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, color: 'var(--slate-800)', fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--slate-400)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</p>
                  </div>
                  <span className={`badge ${roleBadge[u.role] || 'badge-slate'}`} style={{ textTransform: 'capitalize', fontSize: '0.7rem', flexShrink: 0 }}>{u.role}</span>
                </div>
              ))}
              {users.length === 0 && <p style={{ padding: '1.5rem', color: 'var(--slate-400)', textAlign: 'center', fontSize: '0.875rem' }}>No users found.</p>}
            </div>
          )}
        </div>

        {/* Activity feed — built from real user data */}
        <div className="card">
          <p className="section-title" style={{ marginBottom: '1rem' }}>Recent Activity</p>
          {activity.length === 0 && !loading ? (
            <p style={{ color: 'var(--slate-400)', fontSize: '0.875rem' }}>No activity yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {activity.map((a, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', padding: '0.75rem 0', borderBottom: i < activity.length - 1 ? '1px solid var(--slate-100)' : 'none' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: a.type === 'investor' ? 'var(--blue-50)' : a.type === 'advisor' ? '#f0fdf4' : a.type === 'admin' ? '#fef2f2' : 'var(--slate-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Users size={13} style={{ color: a.type === 'investor' ? 'var(--blue-600)' : a.type === 'advisor' ? '#16a34a' : a.type === 'admin' ? 'var(--red-500)' : 'var(--slate-500)' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--slate-700)', fontWeight: 500, lineHeight: 1.4 }}>{a.action}</p>
                    <p style={{ fontSize: '0.72rem', color: 'var(--slate-400)', marginTop: '0.125rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Clock size={10} /> {a.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <p className="section-title" style={{ marginBottom: '1rem' }}>Admin Actions</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          <Link to="/admin/users" className="btn btn-outline"><Users size={15} /> Manage Users</Link>
          <Link to="/admin/funds" className="btn btn-outline"><Database size={15} /> Manage Funds</Link>
          <Link to="/funds" className="btn btn-outline"><ShieldCheck size={15} /> View Platform</Link>
        </div>
      </div>
    </div>
  );
}
