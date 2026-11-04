import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const VerifyOTP = () => {
  const { verifyOTP, resendOTP } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || '';
  const type = location.state?.type || 'verify';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(300); // 5 min
  const [resendCooldown, setResendCooldown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const refs = useRef([]);

  // Countdown timer (5 min)
  useEffect(() => {
    if (timer <= 0) return;
    const t = setInterval(() => setTimer(p => p - 1), 1000);
    return () => clearInterval(t);
  }, [timer]);

  // Resend cooldown
  useEffect(() => {
    if (canResend) return;
    if (resendCooldown <= 0) { setCanResend(true); return; }
    const t = setInterval(() => setResendCooldown(p => {
      if (p <= 1) { setCanResend(true); return 0; }
      return p - 1;
    }), 1000);
    return () => clearInterval(t);
  }, [resendCooldown, canResend]);

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`;

  const handleChange = (i, val) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[i] = val.slice(-1);
    setOtp(next);
    if (val && i < 5) refs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (text.length === 6) {
      setOtp(text.split(''));
      refs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) { toast.error('Please enter all 6 digits'); return; }
    setSubmitting(true);
    try {
      await verifyOTP(email, code);
      toast.success('✅ Email verified! You can now log in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired OTP. Please try again.');
      setOtp(['', '', '', '', '', '']);
      refs.current[0]?.focus();
    } finally { setSubmitting(false); }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setResending(true);
    try {
      await resendOTP(email, type);
      toast.success('New OTP sent to your email!');
      setTimer(300);
      setResendCooldown(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      refs.current[0]?.focus();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not resend OTP. Please wait.');
    } finally { setResending(false); }
  };

  if (!email) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
            <h3>No email provided</h3>
            <p style={{ color: 'var(--text-light)', marginBottom: 20 }}>Please register or use forgot password first.</p>
            <Link to="/register" className="btn btn-primary">Go to Register</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-brand-icon">SC</div>
          <span className="auth-brand-name">Smart Campus</span>
        </div>
        <div className="auth-header">
          <div style={{ fontSize: 48, marginBottom: 8 }}>📧</div>
          <h2>Verify Your Email</h2>
          <p>We sent a 6-digit code to</p>
          <p style={{ fontWeight: 700, color: 'var(--primary)', marginTop: 4 }}>{email}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="otp-input-group" onPaste={handlePaste}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={el => refs.current[i] = el}
                type="text"
                inputMode="numeric"
                maxLength={1}
                className={`otp-box ${digit ? 'filled' : ''}`}
                value={digit}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                autoFocus={i === 0}
              />
            ))}
          </div>

          {/* Timer */}
          <div style={{ textAlign: 'center', margin: '12px 0' }}>
            {timer > 0 ? (
              <span style={{ fontSize: 14, color: timer < 60 ? '#ef4444' : 'var(--text-light)' }}>
                ⏱ Code expires in <strong>{fmt(timer)}</strong>
              </span>
            ) : (
              <span style={{ fontSize: 14, color: '#ef4444', fontWeight: 600 }}>⚠️ Code has expired. Please resend.</span>
            )}
          </div>

          <button type="submit" className="btn btn-primary btn-block btn-lg"
            disabled={submitting || otp.join('').length < 6 || timer <= 0}>
            {submitting ? '⏳ Verifying...' : '✅ Verify OTP'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 14 }}>
          <p style={{ color: 'var(--text-light)', marginBottom: 8 }}>Didn't receive the code?</p>
          {canResend ? (
            <button className="btn btn-outline" onClick={handleResend} disabled={resending} style={{ minWidth: 160 }}>
              {resending ? '⏳ Sending...' : '📤 Resend OTP'}
            </button>
          ) : (
            <span style={{ color: 'var(--text-light)', fontSize: 13 }}>
              Resend available in <strong>{resendCooldown}s</strong>
            </span>
          )}
        </div>

        <div style={{ margin: '16px 0', padding: '10px 14px', background: '#fffbeb', borderRadius: 'var(--radius-sm)', border: '1px solid #fcd34d', fontSize: 12.5, color: '#92400e' }}>
          💡 Check your spam folder if you don't see the email. The code is valid for 5 minutes.
        </div>

        <div className="auth-footer">
          <Link to="/login">← Back to Login</Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
