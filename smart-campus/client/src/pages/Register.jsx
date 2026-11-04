import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const DEPARTMENTS = [
  'Computer Science','Electronics Engineering','Mechanical Engineering',
  'Civil Engineering','Physics','Chemistry','Mathematics',
  'Business Administration','Law','Medicine','Architecture',
  'Arts & Humanities','Administration','Other',
];

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
  return { score: s, ...(labels[s] || {label:'',color:''}) };
};

const PasswordInput = ({ label, name, value, onChange, placeholder }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="form-group">
      <label>{label}</label>
      <div className="password-wrap">
        <input type={show ? 'text' : 'password'} name={name} className="form-control"
          placeholder={placeholder} value={value} onChange={onChange} autoComplete="new-password" />
        <button type="button" className="password-toggle" onClick={() => setShow(s => !s)}>
          {show ? '🙈' : '👁️'}
        </button>
      </div>
    </div>
  );
};

const Register = () => {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name:'', userId:'', email:'', phone:'', department:'',
    password:'', confirmPassword:'', role:'student',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    setErrors(p => ({ ...p, [e.target.name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Full name is required';
    if (!form.userId.trim()) errs.userId = 'Student/Faculty ID is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.phone.trim()) errs.phone = 'Phone is required';
    if (!form.department) errs.department = 'Select your department';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 8) errs.password = 'Minimum 8 characters required';
    else if (!/[A-Z]/.test(form.password)) errs.password = 'Must include an uppercase letter';
    else if (!/[a-z]/.test(form.password)) errs.password = 'Must include a lowercase letter';
    else if (!/[0-9]/.test(form.password)) errs.password = 'Must include a number';
    if (!form.confirmPassword) errs.confirmPassword = 'Please confirm your password';
    else if (form.confirmPassword !== form.password) errs.confirmPassword = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await register(form);
      toast.success('Account created! Check your email for a 6-digit verification code.');
      navigate('/verify-otp', { state: { email: form.email, type: 'verify' } });
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(msg);
    } finally { setSubmitting(false); }
  };

  const str = pwStrength(form.password);

  return (
    <div className="auth-page">
      <div className="auth-card wide">
        <div className="auth-brand">
          <div className="auth-brand-icon">SC</div>
          <span className="auth-brand-name">Smart Campus</span>
        </div>
        <div className="auth-header">
          <h2>Create Your Account</h2>
          <p>Join thousands of students and faculty managing campus resources</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {/* Role toggle */}
          <div className="role-toggle" style={{marginBottom:20}}>
            {['student','faculty'].map(r => (
              <div key={r}
                className={`role-option ${form.role === r ? 'selected' : ''}`}
                onClick={() => setForm(p => ({ ...p, role: r }))}>
                <span>{r === 'student' ? '🎓' : '👨‍🏫'}</span>
                <span>{r === 'student' ? 'Student' : 'Faculty / Staff'}</span>
              </div>
            ))}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Full Name *</label>
              <input type="text" name="name" className={`form-control ${errors.name?'is-invalid':''}`}
                placeholder="e.g. Rahul Sharma" value={form.name} onChange={handleChange} />
              {errors.name && <div className="form-error">{errors.name}</div>}
            </div>
            <div className="form-group">
              <label>{form.role === 'faculty' ? 'Faculty ID *' : 'Student ID *'}</label>
              <input type="text" name="userId" className={`form-control ${errors.userId?'is-invalid':''}`}
                placeholder={form.role === 'faculty' ? 'FAC2026001' : 'STU2026001'}
                value={form.userId} onChange={handleChange} />
              {errors.userId && <div className="form-error">{errors.userId}</div>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>University Email *</label>
              <input type="email" name="email" className={`form-control ${errors.email?'is-invalid':''}`}
                placeholder="you@university.edu" value={form.email} onChange={handleChange} />
              {errors.email && <div className="form-error">{errors.email}</div>}
            </div>
            <div className="form-group">
              <label>Phone Number *</label>
              <input type="tel" name="phone" className={`form-control ${errors.phone?'is-invalid':''}`}
                placeholder="9876543210" value={form.phone} onChange={handleChange} />
              {errors.phone && <div className="form-error">{errors.phone}</div>}
            </div>
          </div>

          <div className="form-group">
            <label>Department *</label>
            <select name="department" className={`form-control ${errors.department?'is-invalid':''}`}
              value={form.department} onChange={handleChange}>
              <option value="">— Select your department —</option>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            {errors.department && <div className="form-error">{errors.department}</div>}
          </div>

          <div className="form-row">
            <div>
              <PasswordInput label="Password *" name="password" value={form.password}
                onChange={handleChange} placeholder="Min. 8 chars, A-Z, 0-9" />
              {form.password && (
                <div style={{marginTop:5}}>
                  <div style={{height:4,background:'var(--border)',borderRadius:4,overflow:'hidden'}}>
                    <div style={{width:`${str.score*20}%`,height:'100%',background:str.color,transition:'all .3s',borderRadius:4}}/>
                  </div>
                  <span style={{fontSize:11.5,color:str.color,fontWeight:700,display:'block',marginTop:3}}>{str.label}</span>
                </div>
              )}
              {errors.password && <div className="form-error">{errors.password}</div>}
            </div>
            <div>
              <PasswordInput label="Confirm Password *" name="confirmPassword" value={form.confirmPassword}
                onChange={handleChange} placeholder="Re-enter your password" />
              {form.confirmPassword && form.confirmPassword === form.password && !errors.confirmPassword && (
                <div style={{fontSize:12,color:'var(--success)',fontWeight:600,marginTop:4}}>✅ Passwords match</div>
              )}
              {errors.confirmPassword && <div className="form-error">{errors.confirmPassword}</div>}
            </div>
          </div>

          <div style={{background:'var(--bg2)',borderRadius:'var(--radius-sm)',padding:'10px 14px',fontSize:12.5,color:'var(--text-light)',marginBottom:16,lineHeight:1.6}}>
            <strong>Password requirements:</strong> 8+ characters &nbsp;·&nbsp; Uppercase letter &nbsp;·&nbsp; Lowercase letter &nbsp;·&nbsp; Number
          </div>

          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={submitting}>
            {submitting ? '⏳ Creating account...' : '🚀 Create Account & Verify Email'}
          </button>
        </form>

        <div style={{margin:'16px 0',padding:'12px 16px',background:'#f0fdf4',borderRadius:'var(--radius-sm)',border:'1px solid #86efac',fontSize:13,color:'#166534',display:'flex',gap:8,alignItems:'flex-start'}}>
          <span style={{fontSize:16}}>📧</span>
          <span>After registration, a <strong>6-digit OTP</strong> will be sent to your email. You must verify your email before logging in.</span>
        </div>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in →</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
