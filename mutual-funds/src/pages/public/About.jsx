import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import { Shield, BarChart2, Lightbulb, Award, Users, TrendingUp } from 'lucide-react';

const values = [
  { icon: <Shield size={22} />, title: 'Trust & Security', desc: 'Bank-grade encryption and SEBI-regulated operations keep your data and investments fully protected.' },
  { icon: <BarChart2 size={22} />, title: 'Transparency', desc: 'No hidden charges, no misleading claims. Every fee, return, and risk is shown clearly upfront.' },
  { icon: <Lightbulb size={22} />, title: 'Innovation', desc: 'Continuously evolving tools — from AI-assisted recommendations to real-time portfolio analytics.' },
  { icon: <Award size={22} />, title: 'Excellence', desc: 'Our analyst team publishes rigorous, data-backed research so you always invest with clarity.' },
];

const team = [
  { name: 'Arjun Mehta', role: 'CEO & Co-Founder', initials: 'AM', desc: '15 years in fintech. Ex-Zerodha, IIM Ahmedabad alumnus.' },
  { name: 'Priya Sharma', role: 'Head of Advisory', initials: 'PS', desc: 'CFPCM certified. Helped 20,000+ investors plan their financial goals.' },
  { name: 'Kiran Gupta', role: 'Lead Data Analyst', initials: 'KG', desc: 'Quantitative finance expert with deep expertise in fund performance modeling.' },
];

const milestones = [
  { year: '2019', event: 'FinVest founded in Hyderabad' },
  { year: '2020', event: 'Reached ₹100 Cr AUM, 5,000 investors' },
  { year: '2022', event: 'Launched SIP automation and advisor portal' },
  { year: '2023', event: 'Series A funding — ₹45 Cr raised' },
  { year: '2025', event: '1.4 Lakh investors, ₹5,200 Cr+ AUM' },
];

export default function About() {
  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="page-content">

        {/* Hero */}
        <div className="page-hero">
          <div className="container">
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 2.75rem)', color: 'white', marginBottom: '0.75rem' }}>
              About FinVest
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.0625rem', maxWidth: 520, lineHeight: 1.7 }}>
              We're on a mission to democratise mutual fund investing for every Indian — from first-time investors to seasoned professionals.
            </p>
          </div>
        </div>

        {/* Mission */}
        <section style={{ padding: '4rem 0', background: 'white' }}>
          <div className="container">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2.5rem', alignItems: 'center' }}
              className="md-grid-2">
              <div>
                <p style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--blue-600)', marginBottom: '0.75rem' }}>Our Story</p>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.625rem, 3vw, 2.25rem)', color: 'var(--slate-900)', marginBottom: '1.25rem', lineHeight: 1.25 }}>
                  Built for investors, by investors
                </h2>
                <p style={{ color: 'var(--slate-600)', lineHeight: 1.8, marginBottom: '1rem' }}>
                  FinVest was founded in 2019 by a group of financial professionals and engineers who saw how opaque and complicated mutual fund investing had become. Too many platforms buried essential information and charged unnecessary fees.
                </p>
                <p style={{ color: 'var(--slate-600)', lineHeight: 1.8 }}>
                  We built FinVest to be the platform we always wanted — transparent pricing, real-time data, and access to expert advisors who put your interests first. Today, over 1.4 lakh investors across India trust FinVest to help them grow their wealth.
                </p>
              </div>

              {/* Timeline */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {milestones.map((m, i) => (
                  <div key={i} style={{ display: 'flex', gap: '1.25rem', paddingBottom: i < milestones.length - 1 ? '1.5rem' : 0 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--blue-600)', flexShrink: 0, marginTop: 4 }} />
                      {i < milestones.length - 1 && <div style={{ width: 2, flex: 1, background: 'var(--blue-100)', marginTop: 4 }} />}
                    </div>
                    <div style={{ paddingBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--blue-600)' }}>{m.year}</span>
                      <p style={{ fontSize: '0.9rem', color: 'var(--slate-700)', marginTop: '0.125rem' }}>{m.event}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section style={{ padding: '4rem 0', background: 'var(--slate-50)' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <p style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--blue-600)', marginBottom: '0.625rem' }}>What We Stand For</p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 3vw, 2rem)', color: 'var(--slate-900)' }}>Our Core Values</h2>
            </div>
            <div className="grid-2" style={{ gap: '1.25rem' }}>
              {values.map((v, i) => (
                <div key={i} className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ width: 44, height: 44, background: 'var(--blue-50)', color: 'var(--blue-600)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {v.icon}
                  </div>
                  <div>
                    <h3 style={{ fontWeight: 700, color: 'var(--slate-900)', marginBottom: '0.375rem' }}>{v.title}</h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--slate-500)', lineHeight: 1.7 }}>{v.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section style={{ background: 'linear-gradient(135deg, var(--blue-900), var(--blue-700))', padding: '3.5rem 0' }}>
          <div className="container">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', textAlign: 'center' }}>
              {[
                { value: '1.4 Lakh+', label: 'Active Investors' },
                { value: '₹5,200 Cr+', label: 'Assets Under Management' },
                { value: '1,000+', label: 'Funds on Platform' },
              ].map((s, i) => (
                <div key={i}>
                  <p style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 800, color: 'white' }}>{s.value}</p>
                  <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.375rem' }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section style={{ padding: '4rem 0', background: 'white' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <p style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--blue-600)', marginBottom: '0.625rem' }}>The People</p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 3vw, 2rem)', color: 'var(--slate-900)' }}>Meet the Team</h2>
            </div>
            <div className="grid-3">
              {team.map((m, i) => (
                <div key={i} className="card" style={{ textAlign: 'center' }}>
                  <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--blue-600)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.375rem', fontWeight: 700, margin: '0 auto 1rem' }}>
                    {m.initials}
                  </div>
                  <h3 style={{ fontWeight: 700, color: 'var(--slate-900)', marginBottom: '0.25rem' }}>{m.name}</h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--blue-600)', fontWeight: 600, marginBottom: '0.75rem' }}>{m.role}</p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--slate-500)', lineHeight: 1.6 }}>{m.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
