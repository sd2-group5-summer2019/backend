const express = require('express');
const router = express.Router();
const passportService = require('../services/passport');
const passport = require('passport');
const requireAuth = passport.authenticate('jwt', { session: false });

// Controllers
const loginController = require('../controllers/login');
const studentController = require('../controllers/student');
const registerController = require('../controllers/register');

// Login routes
router.post('/login', loginController.login);
router.post('/register', registerController.register);

// Get a student's information
router.get('/getStudentName', requireAuth, studentController.getStudentName);
router.get('/getStudentID', studentController.getStudentID);

module.exports = router;
