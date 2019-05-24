const express = require('express');
const router = express.Router();

// Controllers
const loginController = require('../controllers/login');
const studentController = require('../controllers/student');

// This is for testing that a proper connection was extablished between the front/back ends
// DELETE THIS ONCE WE ESTABLISH A PROPER FRONT/BACK END CONNECTION 
router.get('/', (req, res, next)=> res.send('We did it!'));

// Login routes
router.get('/login', loginController.login);

// Get a student's information
router.get('/getStudentName', studentController.getStudentName);
router.get('/getStudentID', studentController.getStudentID);

module.exports = router;