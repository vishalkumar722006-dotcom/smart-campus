import React, { createContext, useContext, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { const u = localStorage.getItem('user'); return u ? JSON.parse(u) : null; }
    catch { return null; }
  });

  const saveAuth = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const register = async (data) => {
    const res = await api.post('/auth/register', data);
    return res.data;
  };

  const verifyOTP = async (email, otp) => {
    const res = await api.post('/auth/verify-otp', { email, otp });
    return res.data;
  };

  const resendOTP = async (email, type = 'verify') => {
    const res = await api.post('/auth/resend-otp', { email, type });
    return res.data;
  };

  const login = async (emailOrObj, password) => {
    // Support both login(email, password) and login({ email, password, ... })
    const payload = typeof emailOrObj === 'object' ? emailOrObj : { email: emailOrObj, password };
    const res = await api.post('/auth/login', payload);
    if (res.data.token) saveAuth(res.data.token, res.data.user);
    return res.data;
  };

  const adminVerifyOTP = async (emailOrObj, otp) => {
    // Support both adminVerifyOTP(email, otp) and adminVerifyOTP({ email, otp })
    const payload = typeof emailOrObj === 'object' ? emailOrObj : { email: emailOrObj, otp };
    const res = await api.post('/auth/admin-verify-otp', payload);
    if (res.data.token) saveAuth(res.data.token, res.data.user);
    return res.data;
  };

  const forgotPassword = async (email) => {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
  };

  const verifyResetOTP = async (email, otp) => {
    const res = await api.post('/auth/verify-reset-otp', { email, otp });
    return res.data;
  };

  const resetPassword = async (email, password) => {
    const res = await api.post('/auth/reset-password', { email, password });
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, register, verifyOTP, resendOTP, login, adminVerifyOTP, forgotPassword, verifyResetOTP, resetPassword, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
