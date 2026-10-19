const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log(req.body);

    if(!name || !email || !password) return res.status(400).json({ msg: 'Missing fields' });

    const exists = await User.findOne({ email });
    if(exists) return res.status(400).json({ msg: 'Email already registered' });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const user = new User({ name, email, password: hashed });
    await user.save();
    res.status(201).json({ msg: 'User created' });
  } catch(err) { res.status(500).json({ error: err.message }) }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if(!user) return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: 'user' }, process.env.JWT_SECRET, { expiresIn: process.env.TOKEN_EXPIRES_IN });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, profileImage: user.profileImage } });
  } catch(err) { res.status(500).json({ error: err.message }) }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if(!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user);
  } catch(err) { res.status(500).json({ error: err.message }) }
};

exports.uploadProfile = async (req, res) => {
  try {
    if(!req.file) return res.status(400).json({ msg: 'No file' });
    const user = await User.findByIdAndUpdate(req.user.id, { profileImage: `/uploads/${req.file.filename}` }, { new: true }).select('-password');
    res.json(user);
  } catch(err) { res.status(500).json({ error: err.message }) }
};

exports.updateProfileImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ msg: 'No file' });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    if (user.profileImage) {
      const oldImagePath = path.join(
        __dirname,
        '..',
        'public',
        user.profileImage
      );

      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }


    user.profileImage = `/uploads/${req.file.filename}`;
    await user.save();

    res.json({
      profileImage: user.profileImage
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};