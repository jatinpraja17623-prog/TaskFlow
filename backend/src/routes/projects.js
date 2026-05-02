const express = require('express');
const Project = require('../models/Project');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const router = express.Router();

// Get all projects for user
router.get('/', protect, async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [{ createdBy: req.user._id }, { 'members.user': req.user._id }]
    }).populate('createdBy', 'name email').sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Create project
router.post('/', protect, async (req, res) => {
  if (req.user.role !== 'admin')
    return res.status(403).json({ message: 'Only admins can create projects' });
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ message: 'Project name required' });
  try {
    const project = await Project.create({
      name, description,
      createdBy: req.user._id,
      members: [{ user: req.user._id, role: 'admin' }]
    });
    await project.populate('createdBy', 'name email');
    res.status(201).json(project);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get single project
router.get('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('members.user', 'name email');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Delete project
router.delete('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.createdBy.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });
    await project.deleteOne();
    res.json({ message: 'Project deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Add member
router.post('/:id/members', protect, async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const project = await Project.findById(req.params.id);
    const alreadyMember = project.members.find(m => m.user.toString() === user._id.toString());
    if (alreadyMember) return res.status(400).json({ message: 'Already a member' });
    project.members.push({ user: user._id, role: 'member' });
    await project.save();
    res.json({ message: 'Member added' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
