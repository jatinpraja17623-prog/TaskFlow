import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);

  const loadProjects = async () => {
    try {
      const { data } = await API.get('/projects');
      setProjects(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadProjects(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError(''); setCreating(true);
    try {
      await API.post('/projects', form);
      setForm({ name: '', description: '' });
      setShowForm(false);
      loadProjects();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project');
    } finally { setCreating(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project and all its tasks?')) return;
    try {
      await API.delete(`/projects/${id}`);
      loadProjects();
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  const icons = ['🚀', '💡', '🎯', '🔥', '⭐', '💎', '🌊', '🎨'];
  const colors = ['108,99,255', '255,101,132', '67,233,123', '247,151,30', '56,189,248', '168,85,247', '34,211,238', '251,146,60'];

  return (
    <div>
      <Navbar />
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 32px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '36px', animation: 'fadeUp 0.4s ease forwards' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '8px' }}>Projects</h1>
            <p style={{ color: 'var(--text3)', fontSize: '14px' }}>
              {projects.length} project{projects.length !== 1 ? 's' : ''} in your workspace
            </p>
          </div>
          {user?.role === 'admin' && (
            <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
              {showForm ? '✕ Cancel' : '+ New Project'}
            </button>
          )}
        </div>

        {/* Create Form */}
        {showForm && (
          <div className="card" style={{ marginBottom: '28px', padding: '28px', animation: 'fadeUp 0.3s ease forwards', borderColor: 'rgba(108,99,255,0.3)' }}>
            <h3 style={{ marginBottom: '20px', fontWeight: 700, fontSize: '17px' }}>✨ New Project</h3>
            {error && <p style={{ color: 'var(--accent2)', fontSize: '13px', marginBottom: '16px' }}>⚠️ {error}</p>}
            <form onSubmit={handleCreate}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label className="label">Project Name *</label>
                  <input className="input" placeholder="e.g. Mobile App Redesign" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div>
                  <label className="label">Description</label>
                  <input className="input" placeholder="What is this project about?" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                </div>
              </div>
              <button className="btn btn-primary" type="submit" disabled={creating}>
                {creating ? '⏳ Creating...' : '✨ Create Project'}
              </button>
            </form>
          </div>
        )}

        {/* Projects Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {[1,2,3].map(i => <div key={i} className="card" style={{ height: '180px', animation: 'pulse 1.5s infinite' }} />)}
          </div>
        ) : projects.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '80px 40px' }}>
            <div style={{ fontSize: '56px', marginBottom: '20px' }}>📂</div>
            <h3 style={{ fontSize: '20px', marginBottom: '10px', color: 'var(--text2)' }}>No projects yet</h3>
            <p style={{ color: 'var(--text3)', fontSize: '14px' }}>
              {user?.role === 'admin' ? 'Create your first project above!' : 'Ask an admin to add you to a project.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {projects.map((p, i) => (
              <div key={p._id} className="card" style={{
                padding: '24px', cursor: 'pointer', position: 'relative',
                animation: `fadeUp 0.4s ease ${i * 0.05}s forwards`, opacity: 0,
                overflow: 'hidden',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = `rgba(${colors[i % colors.length]},0.4)`; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 12px 40px rgba(${colors[i % colors.length]},0.12)`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>

                {/* Background glow */}
                <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '100px', height: '100px', borderRadius: '50%', background: `radial-gradient(circle, rgba(${colors[i % colors.length]},0.08) 0%, transparent 70%)`, pointerEvents: 'none' }} />

                <Link to={`/projects/${p._id}`} style={{ textDecoration: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `rgba(${colors[i % colors.length]},0.15)`, border: `1px solid rgba(${colors[i % colors.length]},0.3)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                      {icons[i % icons.length]}
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text3)', background: 'var(--surface2)', padding: '3px 8px', borderRadius: '6px', border: '1px solid var(--border)' }}>
                      {p.members?.length || 0} members
                    </span>
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px', color: 'var(--text)' }}>{p.name}</h3>
                  <p style={{ color: 'var(--text3)', fontSize: '13px', lineHeight: 1.6, marginBottom: '18px' }}>
                    {p.description || 'No description provided'}
                  </p>
                </Link>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text3)' }}>By {p.createdBy?.name}</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Link to={`/projects/${p._id}`} className="btn btn-ghost" style={{ padding: '5px 12px', fontSize: '12px' }}>
                      Open →
                    </Link>
                    {user?.role === 'admin' && p.createdBy?._id === user?.id && (
                      <button className="btn btn-danger" onClick={() => handleDelete(p._id)} style={{ padding: '5px 12px', fontSize: '12px' }}>
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
