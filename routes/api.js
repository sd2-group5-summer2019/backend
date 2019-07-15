const express = require('express');
const router = express.Router();
const passportService = require('../services/passport');
const passport = require('passport');
const requireAuth = passport.authenticate('jwt', { session: false });

// Controllers
const loginController = require('../controllers/login');
const studentController = require('../controllers/student');
const registerController = require('../controllers/register');
const surveyController = require('../controllers/survey');
const teamController = require('../controllers/team');
const sponsorController = require('../controllers/sponsor');
const formController = require('../controllers/form');
const frontendTestController = require('../controllers/frontendTest');

// Login routes
router.post('/login', loginController.login);
router.post('/login_secure', loginController.login_secure);

// Register routes.
router.post('/register', registerController.register);

// Get a student's information
router.post('/getAllStudents', studentController.getAllStudents);

// Taking survey routes.
// router.post('/getSurvey', surveyController.getSurvey);
// router.post('/submitSurvey', surveyController.submitSurvey);

// Team stuff
router.post('/getAllTeams', teamController.getAllTeams);

// Sponsor stuff
router.post('/getAllSponsors', sponsorController.getAllSponsors);

// Form
router.post('/createForm', formController.createForm);
router.post('/getForm', formController.getForm);
router.post('/updateForm', formController.updateForm);
router.post('/submitForm', formController.submitForm);
router.post('/deleteForm', formController.deleteForm);
router.post('/getAnswers', formController.getAnswers);
router.post('/getInstances', formController.getInstances);
router.post('/assignForm', formController.assignForm);

// Testing for the frontend JSON.
router.post('/frontendTest', frontendTestController.frontendTest);

module.exports = router;
