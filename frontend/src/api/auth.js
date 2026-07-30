import api from './client';

export const loginUser = (email, password) =>
  api.post('/auth/login', { email, password }).then((r) => r.data);

export const registerUser = (data) =>
  api.post('/auth/register', data).then((r) => r.data);

export const verifyEmail = (otpCode) =>
  api.post('/auth/verify-email', { otpCode }).then((r) => r.data);

export const resendOTP = () =>
  api.post('/auth/resend-otp').then((r) => r.data);

export const getMe = () =>
  api.get('/auth/me').then((r) => r.data);
