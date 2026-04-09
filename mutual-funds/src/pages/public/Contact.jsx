import { useState } from 'react';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import { toast } from 'react-toastify';
import { Mail, Phone, MapPin, Clock, Send, Twitter, Linkedin } from 'lucide-react';

const contactItems = [
  { icon: <Mail size={20} />, label: 'Email', value: 'hello@finvest.com', href: 'mailto:hello@finvest.com' },
  { icon: <Phone size={20} />, label: 'Phone', value: '+91 (800) 123-4567', href: 'tel:+918001234567' },
  { icon: <MapPin size={20} />, label: 'Office', value: '12th Floor, Cyber Towers, Hitech City, Hyderabad — 500081' },
  { icon: <Clock size={20} />, label: 'Support Hours', value: 'Mon – Sat, 9:00 AM – 6:00 PM IST' },
];

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      toast.success("Message sent! We'll get back to you within 24 hours.");
      setForm({ name: '', email: '', subject: '', message: '' });
      setLoading(false);
    }, 900);
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="page-content">

        {/* Hero */}
        <div className="page-hero">
          <div className="container">
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 2.75rem)', color: 'white', marginBottom: '0.75rem' }}>
              Contact Us
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.0625rem' }}>
              Have a question or need help? Our team is ready to assist.
            </p>
          </div>
        </div>

        <div className="container" style={{ padding: '3.5rem 1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }} className="lg-grid-contact">

            {/* Info Panel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="card">
                <h3 style={{ fontWeight: 700, color: 'var(--slate-900)', marginBottom: '1.25rem', fontSize: '1.0625rem' }}>Get in Touch</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
                  {contactItems.map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.875rem', alignItems: 'flex-start' }}>
                      <div style={{ width: 40, height: 40, background: 'var(--blue-50)', color: 'var(--blue-600)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {item.icon}
                      </div>
                      <div>
                        <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-400)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>{item.label}</p>
                        {item.href
                          ? <a href={item.href} style={{ fontSize: '0.9rem', color: 'var(--blue-600)', fontWeight: 500 }}>{item.value}</a>
                          : <p style={{ fontSize: '0.9rem', color: 'var(--slate-700)' }}>{item.value}</p>
                        }
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Social */}
              <div className="card">
                <h3 style={{ fontWeight: 700, color: 'var(--slate-900)', marginBottom: '1rem', fontSize: '1.0625rem' }}>Follow Us</h3>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  {[
                    { icon: <Twitter size={18} />, label: 'Twitter' },
                    { icon: <Linkedin size={18} />, label: 'LinkedIn' },
                  ].map(s => (
                    <a key={s.label} href="#" className="btn btn-outline btn-sm">
                      {s.icon} {s.label}
                    </a>
                  ))}
                </div>
              </div>

              {/* FAQ quick links */}
              <div className="card" style={{ background: 'var(--blue-50)', border: '1px solid var(--blue-100)' }}>
                <h3 style={{ fontWeight: 700, color: 'var(--blue-900)', marginBottom: '0.75rem', fontSize: '0.9375rem' }}>Frequently Asked</h3>
                {['How do I start a SIP?', 'How is NAV calculated?', 'Can I switch between funds?', 'Is my money safe?'].map((q, i) => (
                  <a key={i} href="#" style={{ display: 'block', fontSize: '0.875rem', color: 'var(--blue-700)', padding: '0.375rem 0', borderBottom: i < 3 ? '1px solid var(--blue-100)' : 'none', transition: 'color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--blue-900)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--blue-700)'}
                  >
                    {q} →
                  </a>
                ))}
              </div>
            </div>

            {/* Form */}
            <div className="card" style={{ padding: '2rem' }}>
              <h3 style={{ fontWeight: 700, color: 'var(--slate-900)', marginBottom: '0.375rem', fontSize: '1.125rem' }}>Send a Message</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--slate-500)', marginBottom: '1.75rem' }}>We typically respond within 24 hours on business days.</p>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input type="text" name="name" required className="form-input" placeholder="Ravi Kumar" value={form.name} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input type="email" name="email" required className="form-input" placeholder="you@example.com" value={form.email} onChange={handleChange} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <select name="subject" className="form-input" value={form.subject} onChange={handleChange} required>
                    <option value="">Select a topic</option>
                    <option value="investment">Investment Query</option>
                    <option value="account">Account Issue</option>
                    <option value="technical">Technical Support</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Message</label>
                  <textarea name="message" required className="form-input" placeholder="Describe your query in detail..." value={form.message} onChange={handleChange} style={{ minHeight: 150 }} />
                </div>

                <button type="submit" disabled={loading} className="btn btn-primary btn-lg" style={{ alignSelf: 'flex-start', gap: '0.5rem' }}>
                  <Send size={16} />
                  {loading ? 'Sending…' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>

        <style>{`
          @media (min-width: 1024px) {
            .lg-grid-contact { grid-template-columns: 380px 1fr !important; }
          }
        `}</style>
      </main>
      <Footer />
    </div>
  );
}
