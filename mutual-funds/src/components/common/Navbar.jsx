import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Menu, X, TrendingUp, User, LogOut, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsOpen(false);
  };

  const dashboardPath =
    user?.role === 'investor' ? '/investor' :
    user?.role === 'advisor'  ? '/advisor'  :
    user?.role === 'analyst'  ? '/analyst'  :
    user?.role === 'admin'    ? '/admin'    : '/funds';

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-logo" style={{ textDecoration: 'none' }}>
          <TrendingUp size={20} style={{ color: 'var(--blue-600)' }} />
          FinVest
        </Link>

        {/* Desktop Nav */}
        <nav className="navbar-links">
          <Link to="/funds">Explore Funds</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
        </nav>

        {/* Desktop Actions */}
        <div className="navbar-actions">
          {user ? (
            <>
              <Link to={dashboardPath} className="btn btn-ghost btn-sm" style={{ gap: '0.375rem' }}>
                <LayoutDashboard size={16} />
                Dashboard
              </Link>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingLeft: '0.75rem', borderLeft: '1px solid var(--slate-200)' }}>
                <div style={{
                  width: 32, height: 32,
                  borderRadius: '50%',
                  background: 'var(--blue-600)',
                  color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.8rem', fontWeight: 700
                }}>
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <button onClick={handleLogout} className="btn btn-ghost btn-sm" style={{ color: 'var(--slate-500)' }}>
                  <LogOut size={15} />
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline btn-sm">Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
            </>
          )}
        </div>

        {/* Hamburger */}
        <button className="navbar-hamburger" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="navbar-mobile">
          <Link to="/funds"   onClick={() => setIsOpen(false)}>Explore Funds</Link>
          <Link to="/about"   onClick={() => setIsOpen(false)}>About</Link>
          <Link to="/contact" onClick={() => setIsOpen(false)}>Contact</Link>
          <div className="mobile-ctas">
            {user ? (
              <>
                <Link to={dashboardPath} className="btn btn-outline btn-block" onClick={() => setIsOpen(false)}>
                  <LayoutDashboard size={16} /> Dashboard
                </Link>
                <button onClick={handleLogout} className="btn btn-ghost btn-block" style={{ color: 'var(--red-500)' }}>
                  <LogOut size={16} /> Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login"    className="btn btn-outline btn-block" onClick={() => setIsOpen(false)}>Sign In</Link>
                <Link to="/register" className="btn btn-primary btn-block"  onClick={() => setIsOpen(false)}>Get Started</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
