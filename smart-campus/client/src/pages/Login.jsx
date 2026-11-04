import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Login = () => {
  const { login, adminVerifyOTP } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [step, setStep] = useState('login'); // login | admin-otp
  const [form, setForm] = useState({ email: '', password: '', rememberMe: false });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleOtpChange = (i, val) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[i] = val.slice(-1);
    setOtp(next);
    if (val && i < 5) document.getElementById(`otp-${i+1}`)?.focus();
  };

  const handleOtpPaste = e => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').replace(/\D/g,'').slice(0,6);
    const next = [...otp];
    paste.split('').forEach((c,i) => { next[i] = c; });
    setOtp(next);
    document.getElementById(`otp-${Math.min(paste.length,5)}`)?.focus();
  };

  const handleLogin = async e => {
    e.preventDefault();
    if (!form.email || !form.password) { toast.error('Please fill all fields'); return; }
    setLoading(true);
    try {
      const res = await login(form);
      if (res.requireOTP) {
        setAdminEmail(form.email);
        setStep('admin-otp');
        toast.info('OTP sent to your email');
      } else if (res.requireVerification) {
        navigate('/verify-otp', { state: { email: form.email, type: 'verify' } });
      } else {
        toast.success('Welcome back! 🎉');
        const role = res.user?.role;
        if (role === 'admin') navigate('/dashboard/admin');
        else if (role === 'faculty') navigate('/dashboard/faculty');
        else navigate('/dashboard/student');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally { setLoading(false); }
  };

  const handleOtpVerify = async e => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) { toast.error('Enter complete 6-digit OTP'); return; }
    setLoading(true);
    try {
      await adminVerifyOTP({ email: adminEmail, otp: code });
      toast.success('Welcome, Admin! 🛡️');
      navigate('/dashboard/admin');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired OTP');
      setOtp(['','','','','','']);
      document.getElementById('otp-0')?.focus();
    } finally { setLoading(false); }
  };

  const startCooldown = () => {
    setResendCooldown(60);
    const t = setInterval(() => {
      setResendCooldown(c => { if (c <= 1) { clearInterval(t); return 0; } return c - 1; });
    }, 1000);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-brand-icon">SC</div>
          <span className="auth-brand-name">Smart Campus</span>
        </div>

        {step === 'login' ? (
          <>
            <div className="auth-header">
              <h2>Welcome Back 👋</h2>
              <p>Sign in to your campus account</p>
            </div>
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label>University Email</label>
                <input type="email" name="email" className="form-control"
                  placeholder="you@university.edu" value={form.email} onChange={handleChange} autoFocus />
              </div>
              <div className="form-group">
                <label>Password</label>
                <div className="password-wrap">
                  <input type={showPass ? 'text' : 'password'} name="password" className="form-control"
                    placeholder="Enter your password" value={form.password} onChange={handleChange} />
                  <button type="button" className="password-toggle" onClick={() => setShowPass(s => !s)}>
                    {showPass ? '🙈 Hide' : '👁 Show'}
                  </button>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <label style={{ display: 'flex', gap: 8, alignItems: 'center', cursor: 'pointer', fontSize: 14 }}>
                  <input type="checkbox" name="rememberMe" checked={form.rememberMe} onChange={handleChange} />
                  Remember me
                </label>
                <Link to="/forgot-password" style={{ fontSize: 14, color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
                  Forgot password?
                </Link>
              </div>
              <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
                {loading ? '⏳ Signing in...' : '🔐 Sign In'}
              </button>
            </form>
            <div className="auth-footer">
              Don't have an account? <Link to="/register">Create one →</Link>
            </div>
          </>
        ) : (
          <>
            <div className="auth-header">
              <h2>Admin Verification 🛡️</h2>
              <p>Enter the 6-digit OTP sent to <strong>{adminEmail}</strong></p>
            </div>
            <form onSubmit={handleOtpVerify}>
              <div className="otp-container" onPaste={handleOtpPaste}>
                {otp.map((d, i) => (
                  <input key={i} id={`otp-${i}`} className="otp-input" type="text"
                    inputMode="numeric" maxLength={1} value={d}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => { if (e.key==='Backspace' && !d && i>0) document.getElementById(`otp-${i-1}`)?.focus(); }} />
                ))}
              </div>
              <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading} style={{ marginTop: 12 }}>
                {loading ? '⏳ Verifying...' : '✅ Verify & Login'}
              </button>
            </form>
            <div style={{ textAlign: 'center', marginTop: 16, fontSize: 14, color: 'var(--text-light)' }}>
              <button className="btn-link" onClick={() => { setStep('login'); setOtp(['','','','','','']); }}>
                ← Back to Login
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
