import { useNavigate } from 'react-router-dom';
import { ShieldX, ArrowLeft, Home } from 'lucide-react';

export default function Unauthorized() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--slate-50)', padding: '2rem' }}>
      <div style={{ textAlign: 'center', maxWidth: 440 }}>
        <div style={{ width: 80, height: 80, background: '#fef2f2', border: '2px solid #fecaca', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--red-500)' }}>
          <ShieldX size={36} />
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--slate-900)', marginBottom: '0.75rem' }}>Access Denied</h1>
        <p style={{ color: 'var(--slate-500)', fontSize: '1rem', lineHeight: 1.7, marginBottom: '2rem' }}>
          You don't have permission to view this page. Please sign in with an account that has the required role.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => navigate(-1)} className="btn btn-outline"><ArrowLeft size={16} /> Go Back</button>
          <button onClick={() => navigate('/login')} className="btn btn-primary"><Home size={16} /> Sign In</button>
        </div>
      </div>
    </div>
  );
}
