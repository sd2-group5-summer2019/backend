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
const registerCSVController = require('../controllers/registerCSV');
const analyticsController=require('../controllers/analytics');
// Login routes
router.post('/login', loginController.login);
router.post('/login_secure', loginController.login_secure);

// Register routes.
router.post('/register', registerController.register);
router.post('/verifyStudentEmail', registerController.verifyStudentEmail);
router.post('/verifyCode', registerController.verifyCode);
router.post('/setNewPassword', registerController.setNewPassword);

// Get a student's information
router.post('/getAllStudents', studentController.getAllStudents);
router.post('/insertStudent', studentController.insertStudent);
router.post('/updateStudent', studentController.updateStudent);

// Taking survey routes.
 router.post('/getSurvey', surveyController.getSurvey);
// router.post('/submitSurvey', surveyController.submitSurvey);

// Team stuff
router.post('/getAllTeams', teamController.getAllTeams);
router.post('/generateReport', teamController.generateReport);
router.post('/createTeam', teamController.createTeam);
router.post('/getTeamID', teamController.getTeamID);

// Sponsor stuff
router.post('/getAllSponsors', sponsorController.getAllSponsors);
router.post('/assignSponsorToTeam', sponsorController.assignSponsorToTeam);

// Form
router.post('/assignForm', formController.assignForm);
router.post('/createForm', formController.createForm);
router.post('/getForm', formController.getForm);
router.post('/updateForm', formController.updateForm);
router.post('/submitForm', formController.submitForm);
router.post('/deleteForm', formController.deleteForm);
router.post('/getAnswers', formController.getAnswers);
router.post('/getAllForms', formController.getAllForms)
router.post('/getInstances', formController.getInstances);
router.post('/assignForm', formController.assignForm);

// Testing for the frontend JSON.
router.post('/frontendTest', frontendTestController.frontendTest);

router.post('/registerCSV', registerCSVController.registercsv);
router.post('/teamregisterCSV', registerCSVController.teamregistercsv);

router.post('/getAnalytics', analyticsController.questionAnalytics);
module.exports = router;
