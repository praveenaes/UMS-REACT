// const express = require('express');
// const router = express.Router();

// // Test route
// router.get('/test', (req, res) => {
//   res.send('Auth route works!');
// });

// module.exports = router; // Must export router

const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const upload = require('../middleware/multer');
const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/profile', auth, authController.getProfile);
router.post('/upload', auth, upload.single('profileImage'), authController.uploadProfile);
router.put(
    '/profile/image',
    auth,
    upload.single('profileImage'),
    authController.updateProfileImage
);


module.exports = router;

