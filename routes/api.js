const express = require('express');
const router = express.Router();

// Controllers
const loginController = require('../controllers/login');
const studentController = require('../controllers/student');
const registerController = require('../controllers/register');

// Login routes
router.post('/login', loginController.login);
router.post('/register', registerController.register);

// Get a student's information
router.get('/getStudentName', studentController.getStudentName);
router.get('/getStudentID', studentController.getStudentID);

module.exports = router;