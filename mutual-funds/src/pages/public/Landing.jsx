import { Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import { TrendingUp, Shield, Users, ArrowRight, Star, BarChart2, Zap, ChevronRight } from 'lucide-react';

const features = [
  {
    icon: <BarChart2 size={24} />,
    title: 'Wide Selection',
    desc: 'Browse 1000+ curated mutual funds across equity, debt, and hybrid categories from top AMCs.',
  },
  {
    icon: <Users size={24} />,
    title: 'Expert Advisors',
    desc: 'Certified financial advisors guide you to the right funds aligned with your goals and risk appetite.',
  },
  {
    icon: <TrendingUp size={24} />,
    title: 'Real-Time Tracking',
    desc: 'Monitor NAVs, returns, and portfolio performance with live data and intuitive dashboards.',
  },
  {
    icon: <Shield size={24} />,
    title: 'Safe & Regulated',
    desc: 'SEBI-registered platform with bank-grade security so your investments stay fully protected.',
  },
  {
    icon: <Zap size={24} />,
    title: 'Instant Investment',
    desc: 'Start a SIP or lump-sum investment in minutes with seamless KYC and payment flows.',
  },
  {
    icon: <Star size={24} />,
    title: 'Smart Insights',
    desc: 'Data-driven recommendations and analyst reports to help you stay ahead of the market.',
  },
];

const stats = [
  { value: '₹5,200 Cr+', label: 'Assets Under Management' },
  { value: '1.4 Lakh+', label: 'Active Investors' },
  { value: '1,000+', label: 'Mutual Funds Listed' },
];

const topFunds = [
  { name: 'Sundaram Midcap Fund', returns: '28.4%', category: 'Equity', risk: 'High' },
  { name: 'SBI Bluechip Fund', returns: '16.2%', category: 'Equity', risk: 'Moderate' },
  { name: 'HDFC Balanced Advantage', returns: '14.8%', category: 'Hybrid', risk: 'Moderate' },
];

export default function Landing() {
  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="page-content">

        {/* Hero */}
        <section className="hero-section">
          <div className="container" style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '3rem', alignItems: 'center' }}>
              <div>
                <div className="hero-eyebrow">
                  <Star size={13} /> India's Most Trusted Mutual Fund Platform
                </div>
                <h1 className="hero-title">
                  Invest Smarter,<br />
                  <span>Grow Faster</span>
                </h1>
                <p className="hero-subtitle">
                  Access 1,000+ mutual funds, get expert-backed insights, and build a portfolio tailored to your financial goals — all in one place.
                </p>
                <div className="hero-actions">
                  <Link to="/register" className="btn btn-lg" style={{ background: 'white', color: 'var(--blue-700)', fontWeight: 700 }}>
                    Start Investing Free
                    <ArrowRight size={18} />
                  </Link>
                  <Link to="/funds" className="btn btn-lg btn-outline" style={{ border: '1.5px solid rgba(255,255,255,0.3)', color: 'white', background: 'rgba(255,255,255,0.1)' }}>
                    Explore Funds
                  </Link>
                </div>
                <div className="hero-stats">
                  {stats.map((s, i) => (
                    <div key={i}>
                      <p className="hero-stat-value">{s.value}</p>
                      <p className="hero-stat-label">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Top Performing Funds preview strip */}
        <section style={{ background: 'white', borderBottom: '1px solid var(--slate-200)', padding: '1.25rem 0' }}>
          <div className="container">
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', overflowX: 'auto' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-400)', textTransform: 'uppercase', letterSpacing: '0.06em', flexShrink: 0 }}>Top Performers</span>
              <div style={{ display: 'flex', gap: '1.5rem', flexShrink: 0 }}>
                {topFunds.map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--slate-700)', whiteSpace: 'nowrap' }}>{f.name}</span>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--green-600)' }}>+{f.returns}</span>
                    <span className="badge badge-slate" style={{ fontSize: '0.7rem' }}>{f.category}</span>
                  </div>
                ))}
              </div>
              <Link to="/funds" style={{ marginLeft: 'auto', flexShrink: 0, fontSize: '0.8125rem', fontWeight: 600, color: 'var(--blue-600)', display: 'flex', alignItems: 'center', gap: 4 }}>
                View All <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section style={{ padding: '5rem 0', background: 'var(--slate-50)' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <p style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--blue-600)', marginBottom: '0.75rem' }}>Why FinVest</p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', color: 'var(--slate-900)', lineHeight: 1.2 }}>
                Everything you need to invest <em>confidently</em>
              </h2>
              <p style={{ color: 'var(--slate-500)', marginTop: '0.75rem', maxWidth: 520, marginLeft: 'auto', marginRight: 'auto', fontSize: '1rem' }}>
                Built for beginners and seasoned investors alike — powerful tools, clear data, zero jargon.
              </p>
            </div>
            <div className="grid-3">
              {features.map((f, i) => (
                <div key={i} className="card" style={{ transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; e.currentTarget.style.borderColor = 'var(--blue-100)'; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.borderColor = ''; }}
                >
                  <div style={{
                    width: 48, height: 48, background: 'var(--blue-50)', color: 'var(--blue-600)',
                    borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '1rem'
                  }}>
                    {f.icon}
                  </div>
                  <h3 style={{ fontWeight: 700, color: 'var(--slate-900)', marginBottom: '0.5rem', fontSize: '1rem' }}>{f.title}</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--slate-500)', lineHeight: 1.7 }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ background: 'linear-gradient(135deg, var(--blue-900), var(--blue-700))', padding: '5rem 0' }}>
          <div className="container" style={{ textAlign: 'center' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', color: 'white', marginBottom: '1rem' }}>
              Ready to start building wealth?
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.0625rem', marginBottom: '2rem', maxWidth: 480, marginLeft: 'auto', marginRight: 'auto' }}>
              Join over 1.4 lakh investors who trust FinVest. It's free to get started.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/register" className="btn btn-lg" style={{ background: 'white', color: 'var(--blue-700)', fontWeight: 700 }}>
                Create Free Account <ArrowRight size={18} />
              </Link>
              <Link to="/funds" className="btn btn-lg btn-outline" style={{ border: '1.5px solid rgba(255,255,255,0.3)', color: 'white', background: 'transparent' }}>
                Browse Funds
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
