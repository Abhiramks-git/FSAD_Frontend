import { Link } from 'react-router-dom';
import { TrendingUp, Twitter, Linkedin, Facebook, Shield } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand */}
          <div>
            <div className="footer-brand-name" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={20} style={{ color: 'var(--blue-400)' }} /> FinVest
            </div>
            <p className="footer-brand-desc">
              India's trusted platform for smarter mutual fund investing. Transparent, data-driven, and built for every investor.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
              {[
                { icon: <Twitter size={16} />, href: '#', label: 'Twitter' },
                { icon: <Linkedin size={16} />, href: '#', label: 'LinkedIn' },
                { icon: <Facebook size={16} />, href: '#', label: 'Facebook' },
              ].map(s => (
                <a key={s.label} href={s.href} aria-label={s.label} style={{
                  width: 34, height: 34,
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--slate-400)',
                  transition: 'all 0.15s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'white'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'var(--slate-400)'; }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <p className="footer-col-title">Platform</p>
            <nav className="footer-links">
              <Link to="/funds">Explore Funds</Link>
              <Link to="/investor/calculator">SIP Calculator</Link>
              <Link to="/investor/compare">Compare Funds</Link>
              <Link to="/investor/portfolio">My Portfolio</Link>
            </nav>
          </div>

          {/* Company */}
          <div>
            <p className="footer-col-title">Company</p>
            <nav className="footer-links">
              <Link to="/about">About Us</Link>
              <Link to="/contact">Contact</Link>
              <a href="#">Careers</a>
              <a href="#">Press</a>
            </nav>
          </div>

          {/* Legal */}
          <div>
            <p className="footer-col-title">Legal</p>
            <nav className="footer-links">
              <a href="#">Terms of Service</a>
              <a href="#">Privacy Policy</a>
              <a href="#">Disclaimers</a>
              <a href="#">SEBI Disclosures</a>
            </nav>
          </div>
        </div>

        <p className="footer-disclaimer">
          <Shield size={13} style={{ display: 'inline', marginRight: '0.375rem', opacity: 0.6 }} />
          Mutual fund investments are subject to market risks. Past performance is not indicative of future returns. Please read all scheme related documents carefully before investing. FinVest is a platform for informational and transactional purposes only and does not constitute investment advice.
        </p>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} FinVest. All rights reserved.</span>
          <span>AMFI Registered Mutual Fund Distributor | ARN-XXXXXX</span>
        </div>
      </div>
    </footer>
  );
}
