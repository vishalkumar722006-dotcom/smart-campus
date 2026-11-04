import React, { useState } from 'react';
import { useToast } from '../context/ToastContext';

const Contact = () => {
  const toast = useToast();
  const [form, setForm] = useState({ name:'', email:'', message:'' });
  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('Message sent! We will respond shortly.');
    setForm({ name:'', email:'', message:'' });
  };
  return (
    <div className="page-container">
      <div className="page-header"><div className="container"><h1>Contact Us</h1><p>Get in touch with the Smart Campus team</p></div></div>
      <div className="container" style={{ maxWidth: 560, paddingTop: 48, paddingBottom: 60 }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group"><label>Name</label><input type="text" className="form-control" value={form.name} onChange={e => setForm(p=>({...p,name:e.target.value}))} required /></div>
          <div className="form-group"><label>Email</label><input type="email" className="form-control" value={form.email} onChange={e => setForm(p=>({...p,email:e.target.value}))} required /></div>
          <div className="form-group"><label>Message</label><textarea className="form-control" rows={5} value={form.message} onChange={e => setForm(p=>({...p,message:e.target.value}))} required /></div>
          <button type="submit" className="btn btn-primary btn-block">Send Message</button>
        </form>
      </div>
    </div>
  );
};
export default Contact;
