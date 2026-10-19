const Admin = require('../models/Admin');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Admin login
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if(!admin) return res.status(400).json({ msg: 'Invalid credentials' });
    console.log("Login attempt:", email, password);
    console.log("Admin record from DB:", admin);

    const ok = await bcrypt.compare(password, admin.password);
    console.log("Password match:", ok);
    if(!ok) return res.status(400).json({ msg: 'Invalid credentials' });
    const token = jwt.sign({ id: admin._id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: process.env.TOKEN_EXPIRES_IN });
    res.json({ token, user: { id: admin._id, email: admin.email, isAdmin: true } });
  } catch(err){ res.status(500).json({ error: err.message }) }
};

// CRUD users
exports.getUsers = async (req, res) => {
  try {
    const { q } = req.query;

    let query = {};

    if (q) {
      query = {
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { email: { $regex: q, $options: 'i' } },
        ],
      };
    }

    const users = await User.find(query).select('-password');
    res.json(users);

  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};


exports.deleteUser = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ msg: 'Deleted' });
};

exports.updateUser = async (req, res) => {
  const { name, email } = req.body;
  const user = await User.findByIdAndUpdate(req.params.id, { name, email }, { new: true }).select('-password');
  res.json(user);
};

exports.createUser = async (req, res) => {
  const { name, email, password } = req.body;
  const exists = await User.findOne({ email });
  if(exists) return res.status(400).json({ msg: 'Email exists' });
  const hashed = await bcrypt.hash(password, 10);
  const user = new User({ name, email, password: hashed });
  await user.save();
  res.status(201).json(user);
};
