import client from './client';

const AuthAPI = {
  login: (email, password) =>
    client.post('/auth/login', { email, password }),

  register: (name, email, password) =>
    client.post('/auth/register', { name, email, password }),

  socialLogin: (provider, email, name, password) =>
    client.post('/auth/social-login', { provider, email, name, password }),

  forgotPassword: (email) =>
    client.post('/auth/forgot-password', { email }),

  verifyOtp: (email, token) =>
    client.post('/auth/verify-otp', { email, token }),

  resetPassword: (email, token, newPassword) =>
    client.post('/auth/reset-password', { email, token, newPassword }),

  getMe: () =>
    client.get('/auth/me'),
};

export default AuthAPI;
