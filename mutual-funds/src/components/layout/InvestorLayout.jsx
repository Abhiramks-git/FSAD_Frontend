import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard, Briefcase, BarChart2, Calculator,
  TrendingUp, LogOut, Search, Bell
} from 'lucide-react';

const navItems = [
  { to: '/investor',            label: 'Dashboard',   icon: <LayoutDashboard size={18} />, end: true },
  { to: '/investor/portfolio',  label: 'My Portfolio', icon: <Briefcase size={18} /> },
  { to: '/investor/compare',    label: 'Compare Funds',icon: <BarChart2 size={18} /> },
  { to: '/investor/calculator', label: 'SIP Calculator',icon: <Calculator size={18} /> },
];

export default function InvestorLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <TrendingUp size={18} style={{ color: 'var(--blue-500)' }} />
          FinVest
        </div>

        <div style={{ padding: '0.75rem 0.5rem 0.5rem' }}>
          <p className="sidebar-section-label">Investor</p>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}

          <div className="divider" style={{ margin: '0.75rem 0.5rem' }} />

          <NavLink to="/funds" className="sidebar-link">
            <Search size={18} />
            Explore Funds
          </NavLink>
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
            <div className="sidebar-user-info">
              <p className="sidebar-user-name">{user?.name}</p>
              <p className="sidebar-user-role">{user?.role}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="btn btn-ghost btn-sm btn-block" style={{ marginTop: '0.5rem', color: 'var(--slate-500)', justifyContent: 'flex-start', gap: '0.625rem' }}>
            <LogOut size={15} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="main-content">
        <header className="main-topbar">
          <p className="topbar-title">Investor Portal</p>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button className="btn btn-ghost btn-sm" style={{ color: 'var(--slate-500)' }}>
              <Bell size={18} />
            </button>
            <div className="sidebar-avatar" style={{ width: 32, height: 32, fontSize: '0.8rem' }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>
        <div className="main-body">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
