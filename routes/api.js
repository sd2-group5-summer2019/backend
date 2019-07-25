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
const alertsController = require('../controllers/alerts');

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
router.post('/changePassword', loginController.changePassword);
router.post('/verifyStudentEmail', loginController.verifyStudentEmail);

// Register routes.
router.post('/register', registerController.register);
router.post('/verifyCode', requireAuth, registerController.verifyCode);
router.post('/setNewPassword', requireAuth, registerController.setNewPassword);

// Get a student's information
router.post('/getAllStudents', requireAuth, studentController.getAllStudents);
router.post('/insertStudent', requireAuth, studentController.insertStudent);
router.post('/updateStudent', requireAuth, studentController.updateStudent);
router.post('/getStudentName', requireAuth, studentController.getStudentName);


// Taking survey routes.
 router.post('/getSurvey', requireAuth, surveyController.getSurvey);
// router.post('/submitSurvey', surveyController.submitSurvey);

// Team stuff
router.post('/getAllTeams', requireAuth, teamController.getAllTeams);
router.post('/generateReport', requireAuth, teamController.generateReport);
router.post('/createTeam', requireAuth, teamController.createTeam);
router.post('/getTeamID', requireAuth, teamController.getTeamID);
router.post('/getTeamMembers', requireAuth, teamController.getTeamMembers);

// Sponsor stuff
router.post('/getAllSponsors', requireAuth, sponsorController.getAllSponsors);
router.post('/assignSponsorToTeam', requireAuth, sponsorController.assignSponsorToTeam);

// Form
router.post('/assignForm', requireAuth, formController.assignForm);
router.post('/createForm', requireAuth, formController.createForm);
router.post('/getForm', requireAuth, formController.getForm);
router.post('/updateForm', requireAuth, formController.updateForm);
router.post('/submitForm', requireAuth, formController.submitForm);
router.post('/deleteForm', requireAuth, formController.deleteForm);
router.post('/getAnswers', requireAuth, formController.getAnswers);
router.post('/getAllForms', requireAuth, formController.getAllForms);
router.post('/getInstances', requireAuth, formController.getInstances);
router.post('/assignForm', requireAuth, formController.assignForm);
router.post('/getAttendance', requireAuth, formController.getAttendance);

// CSV Upload
router.post('/studentUpload', requireAuth, upload.single('file'), csvUploadController.uploadStudentCSV);
router.post('/teamUpload', requireAuth, upload.single('file'), csvUploadController.uploadTeamCSV);

// Alerts
router.post('/getUserDashboardAlerts', requireAuth, alertsController.getUserDashboardAlerts);

// Testing for the frontend JSON.
router.post('/frontendTest', requireAuth, frontendTestController.frontendTest);

//router.post('/registerCSV', registerCSVController.registercsv);
//router.post('/teamregisterCSV', registerCSVController.teamregistercsv);

//router.post('/getAnalytics', analyticsController.questionAnalytics);
module.exports = router;
