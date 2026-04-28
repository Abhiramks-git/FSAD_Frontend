import { useState, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  TrendingUp, Mail, Lock, Eye, EyeOff, ArrowRight,
  RefreshCw, X, ShieldCheck, KeyRound, CheckCircle2, AlertCircle
} from 'lucide-react';

function mkCaptcha() {
  const ops = ['+', '-', '×'];
  const op = ops[Math.floor(Math.random() * 3)];
  let a, b;
  if (op === '+') { a = Math.floor(Math.random() * 20) + 1; b = Math.floor(Math.random() * 20) + 1; }
  else if (op === '-') { a = Math.floor(Math.random() * 20) + 10; b = Math.floor(Math.random() * a) + 1; }
  else { a = Math.floor(Math.random() * 9) + 2; b = Math.floor(Math.random() * 9) + 2; }
  return { q: `${a} ${op} ${b} = ?`, ans: op === '+' ? a + b : op === '-' ? a - b : a * b };
}

// ── Inline error box ───────────────────────────────────────────────────────────
function ErrorBox({ message }) {
  if (!message) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: 'var(--radius-md)', padding: '0.625rem 0.875rem', fontSize: '0.875rem', color: 'var(--red-500)', fontWeight: 600 }}>
      <AlertCircle size={16} style={{ flexShrink: 0 }} />
      {message}
    </div>
  );
}

// ── Social Login Modal ──────────────────────────────────────────────────────────
function SocialModal({ provider, onClose, onSuccess }) {
  const { socialLogin } = useAuth();
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [pwd, setPwd] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoad] = useState(false);
  const [err, setErr] = useState('');

  const onEmail = e => {
    e.preventDefault();
    setErr('');
    if (!email.includes('@')) { setErr('Please enter a valid email address.'); return; }
    setStep('password');
  };

  const onPwd = async e => {
    e.preventDefault();
    setErr('');
    if (pwd.length < 4) { setErr('Password must be at least 4 characters.'); return; }
    setLoad(true);
    try {
      const res = await socialLogin(provider, email, name || email.split('@')[0], pwd);
      onSuccess(res.user);
    } catch (err) {
      setErr(err.response?.data?.message || 'Login failed. Check your credentials.');
      setLoad(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: '1rem' }}>
      <div className="card animate-scalein" style={{ width: '100%', maxWidth: 400, padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontWeight: 700, fontSize: '1.0625rem' }}>Sign in with {provider}</h2>
          <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ padding: '0.25rem' }}><X size={18} /></button>
        </div>
        {err && <ErrorBox message={err} />}
        <div style={{ marginTop: err ? '1rem' : 0 }}>
          {step === 'email' ? (
            <form onSubmit={onEmail} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <div className="form-group">
                <label className="form-label">{provider} Email</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)', pointerEvents: 'none' }} />
                  <input type="email" required className="form-input" style={{ paddingLeft: '2.25rem' }} placeholder={`you@${provider === 'Google' ? 'gmail' : 'github'}.com`} value={email} onChange={e => setEmail(e.target.value)} autoFocus />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Display Name (optional)</label>
                <input type="text" className="form-input" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <button type="submit" className="btn btn-primary btn-block">Continue <ArrowRight size={15} /></button>
            </form>
          ) : (
            <form onSubmit={onPwd} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <div style={{ background: 'var(--slate-50)', borderRadius: 'var(--radius-md)', padding: '0.625rem 0.875rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--slate-700)' }}>{email}</span>
                <button type="button" onClick={() => setStep('email')} style={{ fontSize: '0.78rem', color: 'var(--blue-600)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Change</button>
              </div>
              <div className="form-group">
                <label className="form-label">Set / Enter Your Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)', pointerEvents: 'none' }} />
                  <input type={show ? 'text' : 'password'} required className="form-input" style={{ paddingLeft: '2.25rem', paddingRight: '2.5rem' }} placeholder="Min 4 characters" value={pwd} onChange={e => setPwd(e.target.value)} autoFocus />
                  <button type="button" onClick={() => setShow(!show)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--slate-400)', cursor: 'pointer', padding: 0 }}>
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--slate-400)', marginTop: '0.375rem' }}>New here? This becomes your password. Returning? Enter your existing password.</p>
              </div>
              <button type="submit" disabled={loading} className="btn btn-primary btn-block">
                {loading ? 'Signing in…' : `Continue with ${provider}`}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Forgot Password Modal ───────────────────────────────────────────────────────
function ForgotModal({ onClose }) {
  const { requestPasswordReset, verifyResetToken, resetPassword } = useAuth();
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoad] = useState(false);
  const [err, setErr] = useState('');
  const steps = ['email', 'otp', 'newpw', 'done'];

  const handleEmail = async e => {
    e.preventDefault(); setErr(''); setLoad(true);
    try {
      const res = await requestPasswordReset(email);
      if (res.ok) { setStep('otp'); toast.success('OTP sent! Check your inbox.'); }
      else setErr(res.message);
    } catch { setErr('Server error. Please check the backend is running.'); }
    finally { setLoad(false); }
  };

  const handleOtp = async e => {
    e.preventDefault(); setErr('');
    try {
      const res = await verifyResetToken(email, otp);
      if (res.ok) setStep('newpw');
      else setErr(res.message);
    } catch { setErr('Verification failed. Please try again.'); }
  };

  const handleReset = async e => {
    e.preventDefault(); setErr('');
    if (newPw !== confirm) { setErr('Passwords do not match.'); return; }
    if (newPw.length < 4) { setErr('Password must be at least 4 characters.'); return; }
    setLoad(true);
    try {
      const res = await resetPassword(email, otp, newPw);
      if (res.ok) { setStep('done'); }
      else setErr(res.message);
    } catch { setErr('Reset failed. Please try again.'); }
    finally { setLoad(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: '1rem' }}>
      <div className="card animate-scalein" style={{ width: '100%', maxWidth: 420, padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <KeyRound size={20} style={{ color: 'var(--blue-600)' }} />
            <h2 style={{ fontWeight: 700, fontSize: '1.0625rem' }}>Reset Password</h2>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ padding: '0.25rem' }}><X size={18} /></button>
        </div>
        <div style={{ display: 'flex', gap: '0.375rem', marginBottom: '1.25rem' }}>
          {steps.map((s, i) => (
            <div key={s} style={{ flex: 1, height: 4, borderRadius: 99, background: steps.indexOf(step) >= i ? 'var(--blue-600)' : 'var(--slate-200)', transition: 'background 0.3s' }} />
          ))}
        </div>
        {err && <div style={{ marginBottom: '1rem' }}><ErrorBox message={err} /></div>}

        {step === 'email' && (
          <form onSubmit={handleEmail} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--slate-500)' }}>Enter your registered email. We'll send a 6-digit OTP.</p>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)', pointerEvents: 'none' }} />
                <input type="email" required className="form-input" style={{ paddingLeft: '2.25rem' }} placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} autoFocus />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary btn-block">{loading ? 'Sending OTP…' : 'Send OTP to Email'}</button>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--slate-500)' }}>Enter the 6-digit OTP sent to <strong>{email}</strong>. Check your inbox and spam folder.</p>
            <div className="form-group">
              <label className="form-label">Enter OTP</label>
              <input type="text" required maxLength={6} className="form-input" style={{ letterSpacing: '0.2em', fontWeight: 700, fontSize: '1.25rem', textAlign: 'center' }} placeholder="123456" value={otp} onChange={e => setOtp(e.target.value)} autoFocus />
            </div>
            <button type="submit" className="btn btn-primary btn-block">Verify OTP</button>
            <button type="button" onClick={() => { setStep('email'); setErr(''); }} className="btn btn-ghost btn-sm btn-block" style={{ color: 'var(--slate-500)' }}>← Back</button>
          </form>
        )}

        {step === 'newpw' && (
          <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--slate-500)' }}>OTP verified ✓ Choose a strong new password.</p>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)', pointerEvents: 'none' }} />
                <input type={showPw ? 'text' : 'password'} required className="form-input" style={{ paddingLeft: '2.25rem', paddingRight: '2.5rem' }} placeholder="Min 4 characters" value={newPw} onChange={e => setNewPw(e.target.value)} autoFocus />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--slate-400)', cursor: 'pointer', padding: 0 }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input type="password" required className="form-input" placeholder="Repeat password" value={confirm} onChange={e => setConfirm(e.target.value)} />
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary btn-block">{loading ? 'Resetting…' : 'Reset Password'}</button>
          </form>
        )}

        {step === 'done' && (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <CheckCircle2 size={52} style={{ color: 'var(--green-600)', margin: '0 auto 1rem' }} />
            <h3 style={{ fontWeight: 700, fontSize: '1.125rem', marginBottom: '0.5rem' }}>Password Reset!</h3>
            <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>You can now sign in with your new password.</p>
            <button onClick={onClose} className="btn btn-primary">Go to Sign In</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Login Page ─────────────────────────────────────────────────────────────
export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [captcha, setCaptcha] = useState(() => mkCaptcha());
  const [captchaAns, setAns] = useState('');
  const [social, setSocial] = useState(null);
  const [forgot, setForgot] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Show session-timeout banner when redirected with ?reason=timeout
  const timedOut = typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('reason') === 'timeout';

  const refresh = useCallback(() => { setCaptcha(mkCaptcha()); setAns(''); }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoginError('');
    if (parseInt(captchaAns) !== captcha.ans) {
      setLoginError('Incorrect CAPTCHA answer. Please try again.');
      refresh(); return;
    }
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success('Welcome back, ' + user.name.split(' ')[0] + '!');
      const routes = { investor: '/investor', advisor: '/advisor', analyst: '/analyst', admin: '/admin' };
      navigate(routes[user.role] || '/funds');
    } catch (err) {
      const msg = err.response?.data?.message || 'Incorrect email or password. Please try again.';
      setLoginError(msg);
      setLoading(false);
      refresh();
    }
  };

  const handleSocialSuccess = user => {
    setSocial(null);
    const routes = { investor: '/investor', advisor: '/advisor', analyst: '/analyst', admin: '/admin' };
    navigate(routes[user.role] || '/funds');
  };

  return (
    <div className="auth-page">
      {social && <SocialModal provider={social} onClose={() => setSocial(null)} onSuccess={handleSocialSuccess} />}
      {forgot && <ForgotModal onClose={() => setForgot(false)} />}

      <div className="auth-container">
        {/* Left brand panel */}
        <div className="auth-left" style={{ position: 'relative' }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '3rem' }}>
              <TrendingUp size={22} style={{ color: 'var(--blue-300)' }} />
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'white' }}>FinVest</span>
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'white', marginBottom: '1rem', lineHeight: 1.2 }}>Grow your wealth with confidence</h2>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.9375rem', lineHeight: 1.7, maxWidth: 360 }}>1,000+ mutual funds, real-time portfolio tracking, expert advisor guidance.</p>
            <div style={{ marginTop: '2.5rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {[{ label: 'Portfolio Growth (2025)', value: '+24.3%' }, { label: 'Active Investors', value: '1.4 Lakh+' }, { label: 'Funds Listed', value: '100+' }].map((item, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 'var(--radius-lg)', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.875rem' }}>{item.label}</span>
                  <span style={{ color: 'white', fontWeight: 700 }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right form panel */}
        <div className="auth-right">
          <div className="auth-form-box animate-fadein">
            {timedOut && (
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: '0.625rem',
                background: '#fffbeb', border: '1.5px solid #fde68a',
                borderRadius: 10, padding: '0.875rem 1rem', marginBottom: '1.25rem',
              }}>
                <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>⏱</span>
                <div>
                  <p style={{ fontWeight: 700, color: '#92400e', fontSize: '0.875rem', marginBottom: '0.2rem' }}>
                    Session expired
                  </p>
                  <p style={{ color: '#a16207', fontSize: '0.8125rem', lineHeight: 1.5 }}>
                    You were logged out after 15 minutes of inactivity. Please sign in again to continue.
                  </p>
                </div>
              </div>
            )}
            <h1 className="auth-form-title">Sign in</h1>
            <p className="auth-form-sub">Don't have an account? <Link to="/register">Create one free</Link></p>

            {/* Social buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {['Google', 'GitHub'].map(p => (
                <button key={p} onClick={() => setSocial(p)} className="btn btn-outline btn-sm">{p}</button>
              ))}
            </div>

            <div className="auth-divider">or sign in with email</div>

            {/* Inline error — shown prominently */}
            {loginError && (
              <div style={{ margin: '0.75rem 0' }}>
                <ErrorBox message={loginError} />
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Email address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: loginError ? 'var(--red-500)' : 'var(--slate-400)', pointerEvents: 'none' }} />
                  <input type="email" required className="form-input" style={{ paddingLeft: '2.25rem', borderColor: loginError ? 'var(--red-300)' : undefined }} placeholder="you@example.com" value={email} onChange={e => { setEmail(e.target.value); setLoginError(''); }} />
                </div>
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label">Password</label>
                  <button type="button" onClick={() => setForgot(true)} style={{ fontSize: '0.8rem', color: 'var(--blue-600)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Forgot password?</button>
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: loginError ? 'var(--red-500)' : 'var(--slate-400)', pointerEvents: 'none' }} />
                  <input type={showPwd ? 'text' : 'password'} required className="form-input" style={{ paddingLeft: '2.25rem', paddingRight: '2.5rem', borderColor: loginError ? 'var(--red-300)' : undefined }} placeholder="••••••••" value={password} onChange={e => { setPassword(e.target.value); setLoginError(''); }} />
                  <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--slate-400)', cursor: 'pointer', padding: 0 }}>
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* CAPTCHA */}
              <div style={{ background: 'var(--slate-50)', border: '1px solid var(--slate-200)', borderRadius: 'var(--radius-lg)', padding: '0.875rem 1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.625rem' }}>
                  <label className="form-label" style={{ margin: 0 }}>Security Check</label>
                  <button type="button" onClick={refresh} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', color: 'var(--blue-600)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                    <RefreshCw size={13} /> New
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <div style={{ background: 'linear-gradient(135deg,var(--blue-700),var(--blue-500))', borderRadius: 'var(--radius-md)', padding: '0.625rem 1rem', fontFamily: 'monospace', fontSize: '1.1rem', fontWeight: 800, color: 'white', letterSpacing: '0.05em', flexShrink: 0, userSelect: 'none' }}>
                    {captcha.q}
                  </div>
                  <input type="number" required className="form-input" placeholder="Answer" value={captchaAns} onChange={e => setAns(e.target.value)} style={{ maxWidth: 90 }} />
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn btn-primary btn-lg btn-block" style={{ marginTop: '0.5rem' }}>
                {loading ? 'Signing in…' : <><span>Sign In</span><ArrowRight size={16} /></>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
