const express = require('express');
const router = express.Router();

// Controllers
const loginController = require('../controllers/login');
const studentController = require('../controllers/student');
const registerController = require('../controllers/register');
const getSurveyController = require('../controllers/getSurvey');
const submitSurveyController = require('../controllers/submitSurvey');

// Login routes
router.post('/login', loginController.login);

// Register routes.
router.post('/register', registerController.register);

// Get a student's information
router.get('/getStudentName', studentController.getStudentName);
router.get('/getStudentID', studentController.getStudentID);

// Taking survey routes.
router.get('/getSurvey', getSurveyController.getSurvey);
router.post('/submitSurvey', submitSurveyController.submitSurvey);

module.exports = router;