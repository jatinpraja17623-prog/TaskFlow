const express = require('express');
const Task = require('../models/Task');
const { protect } = require('../middleware/auth');
const router = express.Router();

// Get tasks for a project
router.get('/project/:projectId', protect, async (req, res) => {
  try {
    const tasks = await Task.find({ project: req.params.projectId })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Create task
router.post('/project/:projectId', protect, async (req, res) => {
  const { title, description, dueDate, assignedTo } = req.body;
  if (!title) return res.status(400).json({ message: 'Title required' });
  try {
    const task = await Task.create({
      title, description, dueDate: dueDate || null,
      assignedTo: assignedTo || null,
      project: req.params.projectId,
      createdBy: req.user._id
    });
    await task.populate('assignedTo', 'name email');
    res.status(201).json(task);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Update task
router.put('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('assignedTo', 'name email');
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Delete task
router.delete('/:id', protect, async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Dashboard stats
router.get('/dashboard/stats', protect, async (req, res) => {
  try {
    const Project = require('../models/Project');
    const projects = await Project.find({
      $or: [{ createdBy: req.user._id }, { 'members.user': req.user._id }]
    });
    const projectIds = projects.map(p => p._id);
    const [total, todo, inProgress, done, overdue] = await Promise.all([
      Task.countDocuments({ project: { $in: projectIds } }),
      Task.countDocuments({ project: { $in: projectIds }, status: 'todo' }),
      Task.countDocuments({ project: { $in: projectIds }, status: 'in-progress' }),
      Task.countDocuments({ project: { $in: projectIds }, status: 'done' }),
      Task.countDocuments({ project: { $in: projectIds }, status: { $ne: 'done' }, dueDate: { $lt: new Date() } }),
    ]);
    res.json({ total, todo, inProgress, done, overdue });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
