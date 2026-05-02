import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'member' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { data } = await API.post('/auth/register', form);
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ position: 'fixed', top: '-20%', left: '-10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(67,233,123,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '-20%', right: '-10%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(108,99,255,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: '420px', animation: 'fadeUp 0.5s ease forwards' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, var(--accent3), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', margin: '0 auto 16px', boxShadow: '0 8px 32px rgba(67,233,123,0.2)' }}>⚡</div>
          <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '8px', letterSpacing: '-0.03em' }}>Join TaskFlow</h1>
          <p style={{ color: 'var(--text2)', fontSize: '15px' }}>Create your account to get started</p>
        </div>

        <div className="card" style={{ padding: '32px' }}>
          {error && (
            <div style={{ background: 'rgba(255,101,132,0.08)', border: '1px solid rgba(255,101,132,0.2)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', color: 'var(--accent2)', fontSize: '13px' }}>
              ⚠️ {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label className="label">Full Name</label>
              <input className="input" placeholder="John Doe" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label className="label">Email Address</label>
              <input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label className="label">Password</label>
              <input className="input" type="password" placeholder="Min. 6 characters" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
            </div>
            <div style={{ marginBottom: '28px' }}>
              <label className="label">I am a...</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {['member', 'admin'].map(r => (
                  <div key={r} onClick={() => setForm({ ...form, role: r })}
                    style={{ padding: '12px', borderRadius: '10px', border: `1px solid ${form.role === r ? 'var(--accent)' : 'var(--border)'}`, background: form.role === r ? 'rgba(108,99,255,0.1)' : 'var(--surface2)', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s' }}>
                    <div style={{ fontSize: '20px', marginBottom: '4px' }}>{r === 'admin' ? '👑' : '👤'}</div>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: form.role === r ? 'var(--accent)' : 'var(--text2)', textTransform: 'capitalize' }}>{r}</div>
                  </div>
                ))}
              </div>
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: '15px' }}>
              {loading ? '⏳ Creating account...' : '→ Create Account'}
            </button>
          </form>
          <div style={{ textAlign: 'center', marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--border)', fontSize: '14px', color: 'var(--text3)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>Sign in →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
