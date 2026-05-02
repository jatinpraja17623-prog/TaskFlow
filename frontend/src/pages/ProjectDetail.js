import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const columns = [
  { key: 'todo', label: 'To Do', icon: '⭕', color: 'var(--text3)', bg: 'rgba(160,168,192,0.06)' },
  { key: 'in-progress', label: 'In Progress', icon: '🔄', color: 'var(--accent)', bg: 'rgba(108,99,255,0.06)' },
  { key: 'done', label: 'Done', icon: '✅', color: 'var(--accent3)', bg: 'rgba(67,233,123,0.06)' },
];

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', dueDate: '', assignedTo: '' });
  const [memberEmail, setMemberEmail] = useState('');
  const [loading, setLoading] = useState(true);

  const loadAll = async () => {
    try {
      const [projRes, tasksRes] = await Promise.all([
        API.get(`/projects/${id}`),
        API.get(`/tasks/project/${id}`),
      ]);
      setProject(projRes.data);
      setTasks(tasksRes.data);
      setMembers(projRes.data.members || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadAll(); }, [id]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await API.post(`/tasks/project/${id}`, taskForm);
      setTaskForm({ title: '', description: '', dueDate: '', assignedTo: '' });
      setShowTaskForm(false);
      loadAll();
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await API.put(`/tasks/${taskId}`, { status: newStatus });
      setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
    } catch (err) { console.error(err); }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await API.delete(`/tasks/${taskId}`);
      setTasks(prev => prev.filter(t => t._id !== taskId));
    } catch (err) { alert('Error'); }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await API.post(`/projects/${id}/members`, { email: memberEmail });
      setMemberEmail(''); setShowMemberForm(false);
      loadAll();
    } catch (err) { alert(err.response?.data?.message || 'User not found'); }
  };

  const isOverdue = (task) => task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';

  if (loading) return (
    <div>
      <Navbar />
      <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text3)' }}>
        <div style={{ fontSize: '32px', marginBottom: '12px', animation: 'pulse 1.5s infinite' }}>⚡</div>
        Loading project...
      </div>
    </div>
  );

  const tasksByStatus = (status) => tasks.filter(t => t.status === status);
  const completionRate = tasks.length > 0 ? Math.round((tasksByStatus('done').length / tasks.length) * 100) : 0;

  return (
    <div>
      <Navbar />
      <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '36px 32px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', animation: 'fadeUp 0.4s ease forwards' }}>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              📁 Project
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '6px' }}>{project?.name}</h1>
            {project?.description && <p style={{ color: 'var(--text3)', fontSize: '14px' }}>{project.description}</p>}
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {user?.role === 'admin' && (
              <button className="btn btn-ghost" onClick={() => setShowMemberForm(!showMemberForm)} style={{ fontSize: '13px' }}>
                👥 Add Member
              </button>
            )}
            <button className="btn btn-primary" onClick={() => setShowTaskForm(!showTaskForm)} style={{ fontSize: '13px' }}>
              {showTaskForm ? '✕ Cancel' : '+ Add Task'}
            </button>
          </div>
        </div>

        {/* Stats bar */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '28px', flexWrap: 'wrap', animation: 'fadeUp 0.4s ease 0.05s forwards', opacity: 0 }}>
          <div className="card" style={{ flex: 1, minWidth: '200px', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '13px', color: 'var(--text3)' }}>Completion</span>
            <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--accent3)', fontFamily: 'Syne' }}>{completionRate}%</span>
          </div>
          <div className="card" style={{ flex: 1, minWidth: '200px', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '13px', color: 'var(--text3)' }}>Total Tasks</span>
            <span style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'Syne' }}>{tasks.length}</span>
          </div>
          <div className="card" style={{ flex: 1, minWidth: '200px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text3)' }}>Team:</span>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {members.map(m => (
                <div key={m.user?._id || m._id} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '20px', padding: '3px 10px' }}>
                  <span style={{ fontSize: '12px' }}>{m.user?.name || 'Unknown'}</span>
                  <span className={`badge badge-${m.role}`} style={{ fontSize: '10px', padding: '1px 6px' }}>{m.role}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Add Member Form */}
        {showMemberForm && (
          <div className="card" style={{ marginBottom: '20px', padding: '20px', borderColor: 'rgba(108,99,255,0.3)', animation: 'fadeUp 0.3s ease forwards' }}>
            <h3 style={{ marginBottom: '14px', fontWeight: 700, fontSize: '15px' }}>👥 Add Team Member</h3>
            <form onSubmit={handleAddMember} style={{ display: 'flex', gap: '10px' }}>
              <input className="input" placeholder="Enter member's email address" value={memberEmail} onChange={e => setMemberEmail(e.target.value)} required style={{ flex: 1 }} />
              <button className="btn btn-primary" type="submit">Add Member</button>
            </form>
          </div>
        )}

        {/* Add Task Form */}
        {showTaskForm && (
          <div className="card" style={{ marginBottom: '24px', padding: '24px', borderColor: 'rgba(108,99,255,0.3)', animation: 'fadeUp 0.3s ease forwards' }}>
            <h3 style={{ marginBottom: '18px', fontWeight: 700, fontSize: '15px' }}>✨ New Task</h3>
            <form onSubmit={handleCreateTask}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label className="label">Task Title *</label>
                  <input className="input" placeholder="What needs to be done?" value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} required />
                </div>
                <div>
                  <label className="label">Due Date</label>
                  <input className="input" type="date" value={taskForm.dueDate} onChange={e => setTaskForm({ ...taskForm, dueDate: e.target.value })} />
                </div>
                <div>
                  <label className="label">Assign To</label>
                  <select className="input" value={taskForm.assignedTo} onChange={e => setTaskForm({ ...taskForm, assignedTo: e.target.value })}>
                    <option value="">Unassigned</option>
                    {members.map(m => (
                      <option key={m.user?._id} value={m.user?._id}>{m.user?.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label className="label">Description</label>
                <input className="input" placeholder="Optional details..." value={taskForm.description} onChange={e => setTaskForm({ ...taskForm, description: e.target.value })} />
              </div>
              <button className="btn btn-primary" type="submit">✨ Create Task</button>
            </form>
          </div>
        )}

        {/* Kanban Board */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', animation: 'fadeUp 0.4s ease 0.1s forwards', opacity: 0 }}>
          {columns.map(col => (
            <div key={col.key}>
              {/* Column Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', padding: '0 4px' }}>
                <span style={{ fontSize: '16px' }}>{col.icon}</span>
                <span style={{ fontWeight: 700, fontSize: '14px', color: col.color }}>{col.label}</span>
                <div style={{
                  marginLeft: 'auto', minWidth: '24px', height: '24px', borderRadius: '12px',
                  background: col.bg, border: `1px solid ${col.color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', fontWeight: 700, color: col.color, padding: '0 8px'
                }}>
                  {tasksByStatus(col.key).length}
                </div>
              </div>

              {/* Tasks */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minHeight: '200px' }}>
                {tasksByStatus(col.key).map((task, i) => (
                  <div key={task._id} style={{
                    background: 'var(--surface)', border: `1px solid var(--border)`,
                    borderRadius: '12px', padding: '16px',
                    borderLeft: `3px solid ${isOverdue(task) ? 'var(--accent2)' : col.color}`,
                    animation: `fadeUp 0.3s ease ${i * 0.04}s forwards`, opacity: 0,
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = col.color; e.currentTarget.style.boxShadow = `0 4px 20px rgba(0,0,0,0.3)`; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.borderLeftColor = isOverdue(task) ? 'var(--accent2)' : col.color; e.currentTarget.style.boxShadow = 'none'; }}>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'flex-start', gap: '8px' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: 600, lineHeight: 1.4, flex: 1, color: 'var(--text)' }}>{task.title}</h4>
                      <button onClick={() => handleDeleteTask(task._id)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: '14px', padding: '0', flexShrink: 0, lineHeight: 1 }}
                        onMouseEnter={e => e.target.style.color = 'var(--accent2)'}
                        onMouseLeave={e => e.target.style.color = 'var(--text3)'}>✕</button>
                    </div>

                    {task.description && (
                      <p style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '10px', lineHeight: 1.5 }}>{task.description}</p>
                    )}

                    {task.assignedTo && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '8px' }}>
                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'white', fontWeight: 700 }}>
                          {task.assignedTo.name?.[0]?.toUpperCase()}
                        </div>
                        <span style={{ fontSize: '12px', color: 'var(--text2)' }}>{task.assignedTo.name}</span>
                      </div>
                    )}

                    {task.dueDate && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '10px' }}>
                        <span style={{ fontSize: '11px', color: isOverdue(task) ? 'var(--accent2)' : 'var(--text3)' }}>
                          {isOverdue(task) ? '⚠️ Overdue · ' : '📅 '}
                          {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    )}

                    <select value={task.status} onChange={e => handleStatusChange(task._id, e.target.value)}
                      style={{ width: '100%', padding: '6px 10px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text2)', fontSize: '12px', cursor: 'pointer', outline: 'none' }}>
                      <option value="todo">⭕ To Do</option>
                      <option value="in-progress">🔄 In Progress</option>
                      <option value="done">✅ Done</option>
                    </select>
                  </div>
                ))}

                {tasksByStatus(col.key).length === 0 && (
                  <div style={{ border: '1px dashed var(--border)', borderRadius: '12px', padding: '28px', textAlign: 'center', color: 'var(--text3)', fontSize: '13px' }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px', opacity: 0.5 }}>{col.icon}</div>
                    No tasks here
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
