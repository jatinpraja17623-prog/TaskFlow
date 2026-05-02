import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const StatCard = ({ label, value, color, icon, delay, bg }) => (
  <div className="card" style={{
    flex: 1, minWidth: '160px', padding: '28px 24px',
    animation: `fadeUp 0.4s ease ${delay}s forwards`, opacity: 0,
    borderTop: `2px solid ${color}`,
    position: 'relative', overflow: 'hidden',
  }}>
    <div style={{
      position: 'absolute', top: '-10px', right: '-10px',
      width: '80px', height: '80px', borderRadius: '50%',
      background: `radial-gradient(circle, ${bg} 0%, transparent 70%)`,
      pointerEvents: 'none'
    }} />
    <div style={{
      width: '40px', height: '40px', borderRadius: '10px',
      background: bg, border: `1px solid ${color}40`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      marginBottom: '16px', fontSize: '18px'
    }}>{icon}</div>
    <div style={{
      fontSize: '42px', fontWeight: 800, color,
      fontFamily: 'Syne', letterSpacing: '-0.04em', lineHeight: 1
    }}>{value}</div>
    <div style={{
      fontSize: '11px', color: 'var(--text3)', marginTop: '10px',
      textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600
    }}>{label}</div>
  </div>
);

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, todo: 0, inProgress: 0, done: 0, overdue: 0 });
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, projectsRes] = await Promise.all([
          API.get('/tasks/dashboard/stats'),
          API.get('/projects'),
        ]);
        setStats(statsRes.data);
        setProjects(projectsRes.data.slice(0, 6));
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div>
      <Navbar />
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 32px' }}>

        {/* Header */}
        <div style={{ marginBottom: '40px', animation: 'fadeUp 0.4s ease forwards' }}>
          <div style={{ fontSize: '13px', color: 'var(--text3)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {greeting} ☀️
          </div>
          <h1 style={{ fontSize: '36px', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '8px' }}>
            {user?.name?.split(' ')[0]}'s Workspace
          </h1>
          <p style={{ color: 'var(--text2)', fontSize: '15px' }}>
            Here's what's happening across your projects today.
          </p>
        </div>

        {loading ? (
          <div style={{ display: 'flex', gap: '16px' }}>
            {[1,2,3,4,5].map(i => (
              <div key={i} className="card" style={{ flex: 1, height: '120px', animation: 'pulse 1.5s infinite' }} />
            ))}
          </div>
        ) : (
          <>
            {/* Stats */}
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '48px' }}>
              <StatCard label="Total Tasks" value={stats.total} color="#a0a8c0" icon="📋" delay={0} bg="rgba(160,168,192,0.08)" />
              <StatCard label="To Do" value={stats.todo} color="#6b7594" icon="⭕" delay={0.05} bg="rgba(107,117,148,0.08)" />
              <StatCard label="In Progress" value={stats.inProgress} color="#6c63ff" icon="🔄" delay={0.1} bg="rgba(108,99,255,0.12)" />
              <StatCard label="Completed" value={stats.done} color="#43e97b" icon="✅" delay={0.15} bg="rgba(67,233,123,0.1)" />
              <StatCard label="Overdue" value={stats.overdue} color="#ff6584" icon="⚠️" delay={0.2} bg="rgba(255,101,132,0.1)" />
            </div>

            {/* Progress bar */}
            {stats.total > 0 && (
              <div className="card" style={{ marginBottom: '48px', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text2)' }}>Overall Progress</span>
                  <span style={{ fontSize: '13px', color: 'var(--accent3)', fontWeight: 600 }}>
                    {Math.round((stats.done / stats.total) * 100)}% complete
                  </span>
                </div>
                <div style={{ height: '8px', background: 'var(--surface3)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: '4px',
                    background: 'linear-gradient(90deg, var(--accent), var(--accent3))',
                    width: `${(stats.done / stats.total) * 100}%`,
                    transition: 'width 1s ease'
                  }} />
                </div>
                <div style={{ display: 'flex', gap: '24px', marginTop: '12px' }}>
                  {[
                    { label: 'Todo', value: stats.todo, color: 'var(--text3)' },
                    { label: 'In Progress', value: stats.inProgress, color: 'var(--accent)' },
                    { label: 'Done', value: stats.done, color: 'var(--accent3)' },
                  ].map(({ label, value, color }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color }} />
                      <span style={{ fontSize: '12px', color: 'var(--text3)' }}>{label}: <span style={{ color }}>{value}</span></span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Projects */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 700 }}>Recent Projects</h2>
                <Link to="/projects" style={{ color: 'var(--accent)', fontSize: '13px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  View all →
                </Link>
              </div>

              {projects.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📂</div>
                  <h3 style={{ marginBottom: '8px', color: 'var(--text2)' }}>No projects yet</h3>
                  <p style={{ color: 'var(--text3)', marginBottom: '24px', fontSize: '14px' }}>
                    {user?.role === 'admin' ? 'Create your first project to get started!' : 'Ask an admin to add you to a project.'}
                  </p>
                  {user?.role === 'admin' && (
                    <Link to="/projects" className="btn btn-primary">+ Create Project</Link>
                  )}
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                  {projects.map((p, i) => (
                    <Link key={p._id} to={`/projects/${p._id}`} style={{ textDecoration: 'none' }}>
                      <div className="card" style={{
                        cursor: 'pointer', animation: `fadeUp 0.4s ease ${i * 0.05 + 0.2}s forwards`, opacity: 0,
                        padding: '20px',
                      }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(108,99,255,0.15)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                        <div style={{
                          width: '40px', height: '40px', borderRadius: '10px', marginBottom: '14px',
                          background: `hsl(${(i * 60) % 360}, 70%, 20%)`,
                          border: `1px solid hsl(${(i * 60) % 360}, 70%, 30%)`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px'
                        }}>
                          {['🚀', '💡', '🎯', '🔥', '⭐', '💎'][i % 6]}
                        </div>
                        <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '6px', color: 'var(--text)' }}>{p.name}</h3>
                        <p style={{ color: 'var(--text3)', fontSize: '13px', lineHeight: 1.5, marginBottom: '14px' }}>
                          {p.description || 'No description provided'}
                        </p>
                        <div style={{ fontSize: '11px', color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>👥 {p.members?.length || 0} members</span>
                          <span style={{ color: 'var(--border2)' }}>•</span>
                          <span>By {p.createdBy?.name}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}