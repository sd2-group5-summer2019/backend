const express = require('express');
const router = express.Router();
const passportService = require('../services/passport');
const passport = require('passport');
const multer = require('multer');
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
const csvUploadController = require('../controllers/csvUpload');

const csvTypes = [
    'text/plain',
    'text/x-csv',
    'application/vnd.ms-excel',
    'application/csv',
    'application/x-csv',
    'text/csv',
    'text/comma-separated-values',
    'text/x-comma-separated-values',
    'text/tab-separated-values',
];

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (csvTypes.indexOf(file.mimetype)) {
            cb(null, './uploads/')
        } else {
            cb(new Error('Given File is not supported.'));
        }
    },
    filename: function (req, file, cb) {
        let date = new Date().toISOString();
        date = date.slice(0,10);
        let fileName = date + "_" + file.originalname;
        cb(null, fileName);
    }
});

const upload = multer({ storage });

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

// CSV Upload
router.post('/csvUpload', upload.single('file'), csvUploadController.uploadCSV);

// Testing for the frontend JSON.
router.post('/frontendTest', frontendTestController.frontendTest);

module.exports = router;
