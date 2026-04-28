import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import AuthAPI from '../api/auth';

const AuthContext = createContext();

const TOKEN_KEY        = 'finvest_token';
const USER_KEY         = 'finvest_user';
const LAST_ACTIVE_KEY  = 'finvest_last_active';

const TIMEOUT_MS       = 15 * 60 * 1000;   // 15 minutes
const WARNING_MS       = 13 * 60 * 1000;   // show warning after 13 min (2 min warning window)
const CHECK_INTERVAL   = 10 * 1000;        // check every 10 seconds

export const AuthProvider = ({ children }) => {
  const [user,          setUser]         = useState(null);
  const [loading,       setLoading]      = useState(true);
  const [showWarning,   setShowWarning]  = useState(false);
  const [secondsLeft,   setSecondsLeft]  = useState(120);
  const timerRef        = useRef(null);
  const countdownRef    = useRef(null);

  // ── Session helpers ────────────────────────────────────────────────────────
  const stampActivity = useCallback(() => {
    localStorage.setItem(LAST_ACTIVE_KEY, Date.now().toString());
  }, []);

  const saveSession = useCallback((token, userData) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    stampActivity();
    setUser(userData);
  }, [stampActivity]);

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(LAST_ACTIVE_KEY);
    setUser(null);
    setShowWarning(false);
    if (timerRef.current)   clearInterval(timerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
  }, []);

  // ── Auto-logout check ─────────────────────────────────────────────────────
  const checkTimeout = useCallback(() => {
    const lastActive = parseInt(localStorage.getItem(LAST_ACTIVE_KEY) || '0', 10);
    if (!lastActive) return;
    const idle = Date.now() - lastActive;

    if (idle >= TIMEOUT_MS) {
      // Session expired — log out silently
      clearSession();
      window.location.href = '/login?reason=timeout';
      return;
    }

    if (idle >= WARNING_MS) {
      // Show countdown warning
      const remaining = Math.max(0, Math.ceil((TIMEOUT_MS - idle) / 1000));
      setSecondsLeft(remaining);
      setShowWarning(true);

      // Live countdown every second
      if (!countdownRef.current) {
        countdownRef.current = setInterval(() => {
          const now  = Date.now();
          const secs = Math.max(0, Math.ceil((TIMEOUT_MS - (now - lastActive)) / 1000));
          setSecondsLeft(secs);
          if (secs <= 0) {
            clearSession();
            window.location.href = '/login?reason=timeout';
          }
        }, 1000);
      }
    } else {
      // Still active — clear any existing warning/countdown
      if (showWarning) {
        setShowWarning(false);
        if (countdownRef.current) {
          clearInterval(countdownRef.current);
          countdownRef.current = null;
        }
      }
    }
  }, [clearSession, showWarning]);

  // ── "I'm still here" — reset timer ────────────────────────────────────────
  const extendSession = useCallback(() => {
    stampActivity();
    setShowWarning(false);
    setSecondsLeft(120);
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  }, [stampActivity]);

  // ── Track user activity ────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;

    const onActivity = () => {
      stampActivity();
      // If warning is showing and user acts, dismiss it
      if (showWarning) {
        setShowWarning(false);
        if (countdownRef.current) {
          clearInterval(countdownRef.current);
          countdownRef.current = null;
        }
      }
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach(e => window.addEventListener(e, onActivity, { passive: true }));

    // Periodic check
    timerRef.current = setInterval(checkTimeout, CHECK_INTERVAL);

    return () => {
      events.forEach(e => window.removeEventListener(e, onActivity));
      if (timerRef.current)    clearInterval(timerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [user, stampActivity, checkTimeout, showWarning]);

  // ── Restore session on page load ───────────────────────────────────────────
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser  = localStorage.getItem(USER_KEY);
    const lastActive  = parseInt(localStorage.getItem(LAST_ACTIVE_KEY) || '0', 10);

    if (storedToken && storedUser && lastActive) {
      const idle = Date.now() - lastActive;
      if (idle >= TIMEOUT_MS) {
        // Session already expired while browser was closed
        clearSession();
        // Only redirect if not already on login page
        if (!window.location.pathname.startsWith('/login')) {
          window.location.href = '/login?reason=timeout';
        }
      } else {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          clearSession();
        }
      }
    } else if (storedToken && storedUser) {
      // Old session without timestamp — stamp now and restore
      try {
        stampActivity();
        setUser(JSON.parse(storedUser));
      } catch {
        clearSession();
      }
    }

    setLoading(false);
  }, [clearSession, stampActivity]);

  // ── Auth actions ───────────────────────────────────────────────────────────
  const login = async (email, password) => {
    const res  = await AuthAPI.login(email, password);
    const data = res.data;
    saveSession(data.token, { id: data.id, name: data.name, email: data.email, role: data.role });
    return data;
  };

  const register = async (name, email, password) => {
    const res = await AuthAPI.register(name, email, password);
    return res.data;
  };

  const socialLogin = async (provider, email, name, password) => {
    const res  = await AuthAPI.socialLogin(provider, email, name, password);
    const data = res.data;
    saveSession(data.token, { id: data.id, name: data.name, email: data.email, role: data.role });
    return { ok: true, user: data };
  };

  const requestPasswordReset = async (email) => {
    const res = await AuthAPI.forgotPassword(email);
    return res.data;
  };

  const verifyResetToken = async (email, token) => {
    const res = await AuthAPI.verifyOtp(email, token);
    return res.data;
  };

  const resetPassword = async (email, token, newPassword) => {
    const res = await AuthAPI.resetPassword(email, token, newPassword);
    return res.data;
  };

  const logout = () => {
    clearSession();
  };

  return (
    <AuthContext.Provider value={{
      user, loading,
      login, register, socialLogin, logout,
      requestPasswordReset, verifyResetToken, resetPassword,
      extendSession,
    }}>
      {!loading && children}

      {/* ── Session timeout warning modal ─────────────────────────────────── */}
      {showWarning && user && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.55)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '1rem',
        }}>
          <div style={{
            background: 'white', borderRadius: 16, padding: '2rem',
            maxWidth: 420, width: '100%', textAlign: 'center',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            animation: 'scalein 0.2s ease',
          }}>
            {/* Icon */}
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: '#fffbeb', border: '2px solid #fde68a',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.25rem', fontSize: '1.75rem',
            }}>
              ⏱
            </div>

            <h2 style={{ fontWeight: 800, fontSize: '1.125rem', color: '#1e293b', marginBottom: '0.5rem' }}>
              Your session is expiring
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              You've been inactive for a while. For your security, you'll be logged out automatically in:
            </p>

            {/* Countdown */}
            <div style={{
              fontSize: '3rem', fontWeight: 900, fontFamily: 'monospace',
              color: secondsLeft <= 30 ? '#ef4444' : '#d97706',
              marginBottom: '0.375rem', letterSpacing: '-0.02em',
              transition: 'color 0.3s',
            }}>
              {Math.floor(secondsLeft / 60).toString().padStart(2, '0')}
              :{(secondsLeft % 60).toString().padStart(2, '0')}
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '1.75rem' }}>
              minutes : seconds
            </p>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => { clearSession(); window.location.href = '/login'; }}
                style={{
                  flex: 1, padding: '0.75rem', border: '1.5px solid #e2e8f0',
                  borderRadius: 10, background: 'white', color: '#64748b',
                  fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => e.target.style.background = '#f8fafc'}
                onMouseLeave={e => e.target.style.background = 'white'}
              >
                Log out now
              </button>
              <button
                onClick={extendSession}
                style={{
                  flex: 1, padding: '0.75rem', border: 'none',
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
                  color: 'white', fontWeight: 700, cursor: 'pointer',
                  fontSize: '0.9rem', transition: 'opacity 0.15s',
                }}
                onMouseEnter={e => e.target.style.opacity = '0.9'}
                onMouseLeave={e => e.target.style.opacity = '1'}
              >
                Stay logged in
              </button>
            </div>

            <p style={{ color: '#cbd5e1', fontSize: '0.75rem', marginTop: '1rem' }}>
              FinVest automatically logs you out after 15 minutes of inactivity to protect your investments.
            </p>
          </div>
        </div>
      )}

      <style>{`@keyframes scalein { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
