// const express = require('express');
// const router = express.Router();

// // Test route
// router.get('/test', (req, res) => {
//   res.send('Admin route works!');
// });

// module.exports = router;
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/authMiddleware');

router.post('/admin-login', adminController.adminLogin);

// Protect below routes with admin role
router.get('/users', auth, adminController.getUsers);
router.post('/users', auth, adminController.createUser);
router.put('/users/:id', auth, adminController.updateUser);
router.delete('/users/:id', auth, adminController.deleteUser);

module.exports = router;

