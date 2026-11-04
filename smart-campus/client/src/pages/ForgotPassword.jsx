import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const pwStrength = (p) => {
  if (!p) return { score: 0, label: '', color: '' };
  let s = 0;
  if (p.length >= 8) s++;
  if (/[A-Z]/.test(p)) s++;
  if (/[a-z]/.test(p)) s++;
  if (/[0-9]/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  const labels = [null,
    {label:'Weak',color:'#ef4444'},
    {label:'Fair',color:'#f59e0b'},
    {label:'Good',color:'#eab308'},
    {label:'Strong',color:'#22c55e'},
    {label:'Very Strong',color:'#10b981'}
  ];
  return { score: s, ...(labels[s] || {}) };
};

const ForgotPassword = () => {
  const { forgotPassword, verifyResetOTP, resetPassword } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1=email, 2=otp, 3=newpw
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['','','','','','']);
  const [passwords, setPasswords] = useState({ password: '', confirm: '' });
  const [showPw, setShowPw] = useState({ password: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(300);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const otpRefs = useRef([]);

  useEffect(() => {
    if (step !== 2 || timer <= 0) return;
    const t = setInterval(() => setTimer(p => p - 1), 1000);
    return () => clearInterval(t);
  }, [step, timer]);

  useEffect(() => {
    if (step !== 2 || canResend) return;
    const t = setInterval(() => setResendCooldown(p => {
      if (p <= 1) { setCanResend(true); return 0; }
      return p - 1;
    }), 1000);
    return () => clearInterval(t);
  }, [step, canResend, resendCooldown]);

  const fmt = (s) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  // Step 1: Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      toast.error('Enter a valid email address'); return;
    }
    setLoading(true);
    try {
      await forgotPassword(email);
      toast.success('OTP sent to your email!');
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP.');
    } finally { setLoading(false); }
  };

  // OTP input handlers
  const handleOtpChange = (i, val) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[i] = val.slice(-1);
    setOtp(next);
    if (val && i < 5) otpRefs.current[i + 1]?.focus();
  };
  const handleOtpKey = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
  };
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text').replace(/\D/g,'').slice(0,6);
    if (text.length === 6) { setOtp(text.split('')); otpRefs.current[5]?.focus(); }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) { toast.error('Enter all 6 digits'); return; }
    setLoading(true);
    try {
      await verifyResetOTP(email, code);
      toast.success('OTP verified! Set your new password.');
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired OTP.');
      setOtp(['','','','','','']);
      otpRefs.current[0]?.focus();
    } finally { setLoading(false); }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setLoading(true);
    try {
      await forgotPassword(email);
      toast.success('New OTP sent!');
      setTimer(300); setResendCooldown(60); setCanResend(false);
      setOtp(['','','','','','']);
    } catch (err) { toast.error('Could not resend. Try again.'); }
    finally { setLoading(false); }
  };

  // Step 3: Reset password
  const handleReset = async (e) => {
    e.preventDefault();
    if (!passwords.password) { toast.error('Enter a password'); return; }
    if (passwords.password.length < 8) { toast.error('Min. 8 characters'); return; }
    if (!/[A-Z]/.test(passwords.password)) { toast.error('Must include uppercase'); return; }
    if (!/[0-9]/.test(passwords.password)) { toast.error('Must include a number'); return; }
    if (passwords.password !== passwords.confirm) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      await resetPassword(email, passwords.password);
      toast.success('Password reset successful! Please login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed. Please restart.');
    } finally { setLoading(false); }
  };

  const str = pwStrength(passwords.password);

  const stepLabels = ['Enter Email', 'Verify OTP', 'New Password'];

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-brand-icon">SC</div>
          <span className="auth-brand-name">Smart Campus</span>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
          {stepLabels.map((label, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700,
                background: step > i + 1 ? 'var(--success)' : step === i + 1 ? 'var(--primary)' : 'var(--bg2)',
                color: step >= i + 1 ? '#fff' : 'var(--text-light)',
              }}>
                {step > i + 1 ? '✓' : i + 1}
              </div>
              <span style={{ fontSize: 12, color: step === i + 1 ? 'var(--primary)' : 'var(--text-light)', fontWeight: step === i + 1 ? 700 : 400 }}>
                {label}
              </span>
              {i < 2 && <div style={{ width: 20, height: 2, background: step > i + 1 ? 'var(--success)' : 'var(--border)' }} />}
            </div>
          ))}
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <div className="auth-header">
              <div style={{ fontSize: 40, marginBottom: 8 }}>🔐</div>
              <h2>Forgot Password?</h2>
              <p>Enter your email to receive a verification code</p>
            </div>
            <form onSubmit={handleSendOTP}>
              <div className="form-group">
                <label>University Email</label>
                <input type="email" className="form-control" placeholder="you@university.edu"
                  value={email} onChange={e => setEmail(e.target.value)} autoFocus />
              </div>
              <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
                {loading ? '⏳ Sending OTP...' : '📤 Send Verification Code'}
              </button>
            </form>
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <div className="auth-header">
              <div style={{ fontSize: 40, marginBottom: 8 }}>📧</div>
              <h2>Enter Verification Code</h2>
              <p>We sent a 6-digit code to <strong style={{ color: 'var(--primary)' }}>{email}</strong></p>
            </div>
            <form onSubmit={handleVerifyOTP}>
              <div className="otp-input-group" onPaste={handleOtpPaste}>
                {otp.map((digit, i) => (
                  <input key={i} ref={el => otpRefs.current[i] = el}
                    type="text" inputMode="numeric" maxLength={1}
                    className={`otp-box ${digit ? 'filled' : ''}`}
                    value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKey(i, e)}
                    autoFocus={i === 0}
                  />
                ))}
              </div>
              <div style={{ textAlign: 'center', margin: '10px 0 16px', fontSize: 13, color: timer < 60 ? '#ef4444' : 'var(--text-light)' }}>
                {timer > 0 ? <>⏱ Expires in <strong>{fmt(timer)}</strong></> : <span style={{ color: '#ef4444' }}>Code expired — please resend</span>}
              </div>
              <button type="submit" className="btn btn-primary btn-block btn-lg"
                disabled={loading || otp.join('').length < 6 || timer <= 0}>
                {loading ? '⏳ Verifying...' : '✅ Verify Code'}
              </button>
            </form>
            <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13 }}>
              {canResend
                ? <button className="btn btn-outline" onClick={handleResend} disabled={loading}>📤 Resend Code</button>
                : <span style={{ color: 'var(--text-light)' }}>Resend in <strong>{resendCooldown}s</strong></span>
              }
            </div>
          </>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <>
            <div className="auth-header">
              <div style={{ fontSize: 40, marginBottom: 8 }}>🔑</div>
              <h2>Set New Password</h2>
              <p>Choose a strong password for your account</p>
            </div>
            <form onSubmit={handleReset}>
              <div className="form-group">
                <label>New Password</label>
                <div className="password-wrap">
                  <input type={showPw.password ? 'text' : 'password'} className="form-control"
                    placeholder="Min. 8 chars, uppercase, number"
                    value={passwords.password}
                    onChange={e => setPasswords(p => ({ ...p, password: e.target.value }))} autoFocus />
                  <button type="button" className="password-toggle"
                    onClick={() => setShowPw(p => ({ ...p, password: !p.password }))}>
                    {showPw.password ? '🙈' : '👁'}
                  </button>
                </div>
                {passwords.password && (
                  <div style={{ marginTop: 6 }}>
                    <div style={{ height: 5, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ width: `${str.score * 20}%`, height: '100%', background: str.color, borderRadius: 4 }} />
                    </div>
                    <span style={{ fontSize: 11.5, color: str.color, fontWeight: 700 }}>{str.label}</span>
                  </div>
                )}
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <div className="password-wrap">
                  <input type={showPw.confirm ? 'text' : 'password'} className="form-control"
                    placeholder="Re-enter new password"
                    value={passwords.confirm}
                    onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))} />
                  <button type="button" className="password-toggle"
                    onClick={() => setShowPw(p => ({ ...p, confirm: !p.confirm }))}>
                    {showPw.confirm ? '🙈' : '👁'}
                  </button>
                </div>
                {passwords.confirm && passwords.confirm === passwords.password && (
                  <div style={{ fontSize: 12, color: 'var(--success)', fontWeight: 600, marginTop: 4 }}>✅ Passwords match</div>
                )}
              </div>
              <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
                {loading ? '⏳ Resetting...' : '🔑 Reset Password'}
              </button>
            </form>
          </>
        )}

        <div className="auth-footer" style={{ marginTop: 20 }}>
          <Link to="/login">← Back to Login</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
