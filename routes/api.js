const express = require('express');
const router = express.Router();
const passportService = require('../services/passport');
const passport = require('passport');
const requireAuth = passport.authenticate('jwt', { session: false });

// Controllers
const loginController = require('../controllers/login');
const studentController = require('../controllers/student');
const registerController = require('../controllers/register');
//const getSurveyController = require('../controllers/getSurvey');
//const submitSurveyController = require('../controllers/submitSurvey');
const surveyController = require('../controllers/survey');
const frontendTestController = require('../controllers/frontendTest');

// Login routes
router.post('/login', loginController.login);

// Register routes.
router.post('/register', registerController.register);

// Get a student's information
router.get('/getStudentName', requireAuth, studentController.getStudentName);
router.get('/getStudentID', studentController.getStudentID);

// Taking survey routes.
router.get('/getSurvey', surveyController.getSurvey);
router.post('/submitSurvey', surveyController.submitSurvey);

// Testing for the frontend JSON.
router.post('/frontendTest', frontendTestController.frontendTest);

module.exports = router;
