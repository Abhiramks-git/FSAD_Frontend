import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import { TrendingUp, Mail, Lock, User, Eye, EyeOff, ArrowRight, CheckCircle, RefreshCw, X } from 'lucide-react';

function mkCaptcha() {
  const ops=['+','-','×']; const op=ops[Math.floor(Math.random()*3)];
  let a,b;
  if(op==='+'){a=Math.floor(Math.random()*20)+1;b=Math.floor(Math.random()*20)+1;}
  else if(op==='-'){a=Math.floor(Math.random()*20)+10;b=Math.floor(Math.random()*a)+1;}
  else{a=Math.floor(Math.random()*9)+2;b=Math.floor(Math.random()*9)+2;}
  return{q:`${a} ${op} ${b} = ?`,ans:op==='+'?a+b:op==='-'?a-b:a*b};
}

function SocialModal({ provider, onClose, onSuccess }) {
  const { socialLogin }     = useAuth();
  const [step,setStep]      = useState('email');
  const [email,setEmail]    = useState('');
  const [name,setName]      = useState('');
  const [pwd,setPwd]        = useState('');
  const [show,setShow]      = useState(false);
  const [loading,setLoad]   = useState(false);

  const onEmail = e => { e.preventDefault(); if(!email.includes('@')){toast.error('Enter a valid email');return;} setStep('password'); };
  const onPwd = async e => {
    e.preventDefault();
    if(pwd.length<4){toast.error('Password must be at least 4 characters');return;}
    setLoad(true);
    try {
      const res = await socialLogin(provider,email,name||email.split('@')[0],pwd);
      toast.success(`Account created with ${provider}`);
      onSuccess(res.user);
    } catch(err) { toast.error(err.response?.data?.message||'Signup failed'); setLoad(false); }
  };

  return (
    <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:300,padding:'1rem' }}>
      <div className="card animate-scalein" style={{ width:'100%',maxWidth:400,padding:'2rem' }}>
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.5rem' }}>
          <h2 style={{ fontWeight:700,fontSize:'1.0625rem' }}>Sign up with {provider}</h2>
          <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ padding:'0.25rem' }}><X size={18}/></button>
        </div>
        {step==='email' ? (
          <form onSubmit={onEmail} style={{ display:'flex',flexDirection:'column',gap:'1rem' }}>
            <div className="form-group">
              <label className="form-label">{provider} Email</label>
              <div style={{ position:'relative' }}>
                <Mail size={16} style={{ position:'absolute',left:'0.75rem',top:'50%',transform:'translateY(-50%)',color:'var(--slate-400)',pointerEvents:'none' }}/>
                <input type="email" required className="form-input" style={{ paddingLeft:'2.25rem' }} placeholder={`you@${provider==='Google'?'gmail':'github'}.com`} value={email} onChange={e=>setEmail(e.target.value)} autoFocus/>
              </div>
            </div>
            <div className="form-group"><label className="form-label">Display Name (optional)</label><input type="text" className="form-input" placeholder="Your name" value={name} onChange={e=>setName(e.target.value)}/></div>
            <button type="submit" className="btn btn-primary btn-block">Continue <ArrowRight size={15}/></button>
          </form>
        ) : (
          <form onSubmit={onPwd} style={{ display:'flex',flexDirection:'column',gap:'1rem' }}>
            <div style={{ background:'var(--slate-50)',borderRadius:'var(--radius-md)',padding:'0.625rem 0.875rem',fontSize:'0.875rem',color:'var(--slate-600)' }}>{email}</div>
            <div className="form-group">
              <label className="form-label">Create Password</label>
              <div style={{ position:'relative' }}>
                <Lock size={16} style={{ position:'absolute',left:'0.75rem',top:'50%',transform:'translateY(-50%)',color:'var(--slate-400)',pointerEvents:'none' }}/>
                <input type={show?'text':'password'} required className="form-input" style={{ paddingLeft:'2.25rem',paddingRight:'2.5rem' }} placeholder="Min 4 characters" value={pwd} onChange={e=>setPwd(e.target.value)} autoFocus/>
                <button type="button" onClick={()=>setShow(!show)} style={{ position:'absolute',right:'0.75rem',top:'50%',transform:'translateY(-50%)',background:'none',border:'none',color:'var(--slate-400)',cursor:'pointer',padding:0 }}>
                  {show?<EyeOff size={16}/>:<Eye size={16}/>}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary btn-block">{loading?'Creating account…':'Create Account'}</button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function Register() {
  const [form,setForm]          = useState({name:'',email:'',password:'',confirmPassword:''});
  const [showPwd,setShowPwd]    = useState(false);
  const [captcha,setCaptcha]    = useState(()=>mkCaptcha());
  const [captchaAns,setAns]     = useState('');
  const [loading,setLoading]    = useState(false);
  const [social,setSocial]      = useState(null);
  const { register,socialLogin }= useAuth();
  const navigate = useNavigate();

  const refresh = useCallback(()=>{setCaptcha(mkCaptcha());setAns('');},[]);
  const handleChange = e => setForm({...form,[e.target.name]:e.target.value});

  const handleSubmit = async e => {
    e.preventDefault();
    if(parseInt(captchaAns)!==captcha.ans){toast.error('Incorrect CAPTCHA.');refresh();return;}
    if(form.password!==form.confirmPassword){toast.error('Passwords do not match');return;}
    if(form.password.length<4){toast.error('Password must be at least 4 characters');return;}
    setLoading(true);
    try {
      const res = await register(form.name,form.email,form.password);
      if(res.ok){ toast.success('Account created! Please sign in.'); navigate('/login'); }
      else { toast.error(res.message); setLoading(false); refresh(); }
    } catch(err){ toast.error(err.response?.data?.message||'Registration failed'); setLoading(false); refresh(); }
  };

  const handleSocialSuccess = user => { setSocial(null); navigate(user.role==='investor'?'/investor':'/funds'); };
  const perks = ['No commissions, no hidden fees','SIP starting at ₹100/month','Certified advisor support','Real-time NAV & portfolio tracking'];

  return (
    <div className="auth-page">
      {social && <SocialModal provider={social} onClose={()=>setSocial(null)} onSuccess={handleSocialSuccess}/>}
      <div className="auth-container">
        <div className="auth-left" style={{ position:'relative' }}>
          <div style={{ position:'relative',zIndex:1 }}>
            <div style={{ display:'flex',alignItems:'center',gap:'0.625rem',marginBottom:'3rem' }}>
              <TrendingUp size={22} style={{ color:'var(--blue-300)' }}/>
              <span style={{ fontFamily:'var(--font-display)',fontSize:'1.5rem',color:'white' }}>FinVest</span>
            </div>
            <h2 style={{ fontFamily:'var(--font-display)',fontSize:'2rem',color:'white',marginBottom:'1rem',lineHeight:1.2 }}>Start your investment journey today</h2>
            <p style={{ color:'rgba(255,255,255,0.65)',fontSize:'0.9375rem',lineHeight:1.7,maxWidth:360,marginBottom:'2rem' }}>Free forever. No credit card required.</p>
            <div style={{ display:'flex',flexDirection:'column',gap:'0.875rem' }}>
              {perks.map((p,i)=>(
                <div key={i} style={{ display:'flex',alignItems:'center',gap:'0.625rem' }}>
                  <CheckCircle size={18} style={{ color:'var(--blue-300)',flexShrink:0 }}/>
                  <span style={{ color:'rgba(255,255,255,0.75)',fontSize:'0.9rem' }}>{p}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="auth-right">
          <div className="auth-form-box animate-fadein">
            <h1 className="auth-form-title">Create account</h1>
            <p className="auth-form-sub">Already have an account? <Link to="/login">Sign in</Link></p>

            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.75rem',marginBottom:'1.5rem' }}>
              <button onClick={()=>setSocial('Google')} className="btn btn-outline btn-sm" style={{ gap:'0.5rem' }}>
                <svg width="15" height="15" viewBox="0 0 24 24"><g transform="matrix(1,0,0,1,27.009,-39.239)"><path fill="#4285F4" d="M-3.264,51.509c0-0.79-0.07-1.54-0.19-2.27h-11.3v4.51h6.47c-0.28,1.48-1.13,2.73-2.4,3.58v2.98h3.86c2.26-2.09,3.56-5.17,3.56-8.8z"/><path fill="#34A853" d="M-14.754,63.239c3.24,0,5.95-1.08,7.93-2.91l-3.86-3c-1.08,0.72-2.45,1.15-4.07,1.15c-3.13,0-5.78-2.11-6.73-4.96h-3.98v3.09c1.97,3.92,6.02,6.63,10.71,6.63z"/><path fill="#FBBC05" d="M-21.484,53.529c-0.25-0.72-0.38-1.49-0.38-2.29c0-0.8,0.14-1.57,0.38-2.29v-3.09h-3.98c-0.81,1.62-1.28,3.44-1.28,5.38c0,1.94,0.47,3.76,1.28,5.38l3.98-3.09z"/><path fill="#EA4335" d="M-14.754,43.989c1.77,0,3.35,0.61,4.6,1.8l3.37-3.37c-2.07-1.94-4.78-3.13-7.97-3.13c-4.69,0-8.74,2.71-10.71,6.63l3.98,3.09c0.95-2.85,3.6-4.96,6.73-4.96z"/></g></svg>
                Google
              </button>
              <button onClick={()=>setSocial('GitHub')} className="btn btn-outline btn-sm" style={{ gap:'0.5rem' }}>
                <svg width="15" height="15" fill="currentColor" viewBox="0 0 20 20"><path d="M10 0C4.477 0 0 4.477 0 10c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.03-2.682-.103-.253-.447-1.27.098-2.646 0 0 .84-.269 2.75 1.025.8-.223 1.65-.334 2.5-.334.85 0 1.7.111 2.5.334 1.91-1.294 2.75-1.025 2.75-1.025.545 1.376.201 2.393.099 2.646.64.698 1.03 1.591 1.03 2.682 0 3.841-2.337 4.687-4.565 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C17.138 18.163 20 14.418 20 10c0-5.523-4.477-10-10-10z"/></svg>
                GitHub
              </button>
            </div>

            <div className="auth-divider">or register with email</div>

            <form onSubmit={handleSubmit} style={{ display:'flex',flexDirection:'column',gap:'1rem' }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div style={{ position:'relative' }}>
                  <User size={16} style={{ position:'absolute',left:'0.75rem',top:'50%',transform:'translateY(-50%)',color:'var(--slate-400)',pointerEvents:'none' }}/>
                  <input type="text" name="name" required className="form-input" style={{ paddingLeft:'2.25rem' }} placeholder="Ravi Kumar" value={form.name} onChange={handleChange}/>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div style={{ position:'relative' }}>
                  <Mail size={16} style={{ position:'absolute',left:'0.75rem',top:'50%',transform:'translateY(-50%)',color:'var(--slate-400)',pointerEvents:'none' }}/>
                  <input type="email" name="email" required className="form-input" style={{ paddingLeft:'2.25rem' }} placeholder="you@example.com" value={form.email} onChange={handleChange}/>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <div style={{ position:'relative' }}>
                  <Lock size={16} style={{ position:'absolute',left:'0.75rem',top:'50%',transform:'translateY(-50%)',color:'var(--slate-400)',pointerEvents:'none' }}/>
                  <input type={showPwd?'text':'password'} name="password" required className="form-input" style={{ paddingLeft:'2.25rem',paddingRight:'2.5rem' }} placeholder="Min 4 characters" value={form.password} onChange={handleChange}/>
                  <button type="button" onClick={()=>setShowPwd(!showPwd)} style={{ position:'absolute',right:'0.75rem',top:'50%',transform:'translateY(-50%)',background:'none',border:'none',color:'var(--slate-400)',cursor:'pointer',padding:0 }}>
                    {showPwd?<EyeOff size={16}/>:<Eye size={16}/>}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <div style={{ position:'relative' }}>
                  <Lock size={16} style={{ position:'absolute',left:'0.75rem',top:'50%',transform:'translateY(-50%)',color:'var(--slate-400)',pointerEvents:'none' }}/>
                  <input type="password" name="confirmPassword" required className="form-input" style={{ paddingLeft:'2.25rem' }} placeholder="Repeat password" value={form.confirmPassword} onChange={handleChange}/>
                </div>
              </div>

              {/* CAPTCHA */}
              <div style={{ background:'var(--slate-50)',border:'1px solid var(--slate-200)',borderRadius:'var(--radius-lg)',padding:'0.875rem 1rem' }}>
                <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.625rem' }}>
                  <label className="form-label" style={{ margin:0 }}>Security Check</label>
                  <button type="button" onClick={refresh} style={{ display:'flex',alignItems:'center',gap:'0.3rem',fontSize:'0.78rem',color:'var(--blue-600)',background:'none',border:'none',cursor:'pointer',fontWeight:600 }}>
                    <RefreshCw size={13}/> Refresh
                  </button>
                </div>
                <div style={{ display:'flex',gap:'0.75rem',alignItems:'center' }}>
                  <div style={{ background:'linear-gradient(135deg,var(--blue-700),var(--blue-500))',borderRadius:'var(--radius-md)',padding:'0.625rem 1rem',fontFamily:'monospace',fontSize:'1.1rem',fontWeight:800,color:'white',letterSpacing:'0.05em',flexShrink:0,userSelect:'none',textDecoration:'line-through',textDecorationColor:'rgba(255,255,255,0.3)' }}>
                    {captcha.q}
                  </div>
                  <input type="number" required className="form-input" placeholder="Answer" value={captchaAns} onChange={e=>setAns(e.target.value)} style={{ maxWidth:90 }}/>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn btn-primary btn-lg btn-block">
                {loading?'Creating account…':<><span>Create Account</span><ArrowRight size={16}/></>}
              </button>
              <p style={{ fontSize:'0.78rem',color:'var(--slate-400)',textAlign:'center' }}>
                By creating an account you agree to our <a href="#" style={{ color:'var(--blue-600)' }}>Terms</a> and <a href="#" style={{ color:'var(--blue-600)' }}>Privacy Policy</a>.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
