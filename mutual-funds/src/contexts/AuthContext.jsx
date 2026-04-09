import { createContext, useContext, useState, useEffect } from 'react';
import AuthAPI from '../api/auth';

const AuthContext = createContext();

// localStorage keeps the user logged in even after closing the browser
const TOKEN_KEY = 'finvest_token';
const USER_KEY  = 'finvest_user';

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on every page load / tab reopen
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser  = localStorage.getItem(USER_KEY);
    if (storedToken && storedUser) {
      try { setUser(JSON.parse(storedUser)); }
      catch { localStorage.clear(); }
    }
    setLoading(false);
  }, []);

  const saveSession = (token, userData) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setUser(userData);
  };

  const clearSession = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  };

  // ── Login ──────────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    const res  = await AuthAPI.login(email, password);
    const data = res.data; // { token, id, name, email, role }
    saveSession(data.token, { id: data.id, name: data.name, email: data.email, role: data.role });
    return data;
  };

  // ── Register ───────────────────────────────────────────────────────────────
  const register = async (name, email, password) => {
    const res = await AuthAPI.register(name, email, password);
    return res.data; // { ok, message }
  };

  // ── Social login ──────────────────────────────────────────────────────────
  const socialLogin = async (provider, email, name, password) => {
    const res  = await AuthAPI.socialLogin(provider, email, name, password);
    const data = res.data;
    saveSession(data.token, { id: data.id, name: data.name, email: data.email, role: data.role });
    return { ok: true, user: data };
  };

  // ── Forgot password ────────────────────────────────────────────────────────
  const requestPasswordReset = async (email) => {
    const res = await AuthAPI.forgotPassword(email);
    return res.data; // { ok, message }  — NO devToken now, real email is sent
  };

  const verifyResetToken = async (email, token) => {
    const res = await AuthAPI.verifyOtp(email, token);
    return res.data; // { ok, message }
  };

  const resetPassword = async (email, token, newPassword) => {
    const res = await AuthAPI.resetPassword(email, token, newPassword);
    return res.data;
  };

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = () => clearSession();

  return (
    <AuthContext.Provider value={{
      user, loading,
      login, register, socialLogin, logout,
      requestPasswordReset, verifyResetToken, resetPassword,
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
