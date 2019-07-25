const nodemailer = require('nodemailer');
const cron = require('node-cron');
const { sequelize } = require('../models/');
const sender = 'Senior Design Portal';
const email = 'sd2group5@gmail.com';
const password = 'thatsnotmywallet!123';
var triggers = cron.schedule('1 * * * * *', () => {
    checkTriggers();
});
async function sendEmail(toEmail, subject, body) {

    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: email,
            pass: password
        }
    });

    let info = await transporter.sendMail({
        from: `${sender} <${email}>`,
        to: toEmail,
        subject: subject,
        text: body
    });

    console.log("Message sent: %s", info.messageId);
}

async function checkTriggers() {
    let survey = {
        subject: 'Alert',
        body: 'This survery caused an alert'
    };

    let quiz = {
        subject: 'Quiz Alert',
        body: 'Quiz body'
    };

    var messages = "";
    let coordinator, coordinatorID, tempForm, tempAlert, type;
    //Get all unsubmitted assignments past due

    let overdueAssignments = await sequelize.query('CALL get_past_due_assignments', { type: sequelize.QueryTypes.CALL });
    //Create Alerts

    for (let o = 0; o < overdueAssignments.length; o++) {
        if (overdueAssignments[o].user_id != null) {
            //Get coordinator from given user
            try {
                coordinator = await sequelize.query('CALL get_my_coordinator_id(?)', { replacements: [overdueAssignments[o].user_id], type: sequelize.QueryTypes.CALL });
                coordinatorID = coordinator[0].user_id;
                //Insert into alerts table
                let newAlert = await sequelize.query(`CALL insert_alert_history(?,?)`, {
                    replacements: [overdueAssignments[o].instance_id, coordinatorID],
                    type: sequelize.QueryTypes.CALL
                });
            } catch (error) {
                console.log(error);
            }
        } else {
            //Get team coordinator
            try {
                coordinator = await sequelize.query('CALL get_team_coordinator_id(?)', { replacements: [overdueAssignments[o].team_id], type: sequelize.QueryTypes.CALL });
                if (coordinator[0] == undefined) {
                    coordinatorID = null;
                } else {
                    coordinatorID = coordinator[0].user_id;
                }
                if (coordinatorID != null) {
                    //Insert into table
                    let newAlert = await sequelize.query(`CALL insert_alert_history(?,?)`, {
                        replacements: [overdueAssignments[0].instance_id, coordinatorID],
                        type: sequelize.QueryTypes.CALL
                    });
                }
            } catch {
                console.log(error);
            }
        }
    }
    //Get Alerts Not Yet Reported
    let unalertedAlerts = await sequelize.query('CALL get_unalerted_alerts', { type: sequelize.QueryTypes.CALL });

    //Get all distinct users to be alerted
    let userSet = new Set(unalertedAlerts.map(x => x.user_id));
    let userArray = Array.from(userSet);

    for (let u = 0; u < userArray.length; u++) {
        //Get all alerts attached to that user
        //Store all emails in one array to reduce sent emails
        let tempAlerts = await sequelize.query('CALL get_alerts(?)', { replacements: [userArray[u]], type: sequelize.QueryTypes.CALL });
        for (let a = 0; a < tempAlerts.length; a++) {
            try {
                //Get instance attached to alert
                let tempInstance = await sequelize.query('CALL get_alert_instance(?)', { replacements: [tempAlerts[a].instance_id], type: sequelize.QueryTypes.CALL });
                //console.log(tempAlert);
                //Get email to be used
                let tempUser = await sequelize.query('CALL get_user(?)', { replacements: [userArray[u]], type: sequelize.QueryTypes.CALL });
                console.log(tempUser);
                //Get user and team that caused trigger
                let alertUser, alertTeam;
                tempForm = await sequelize.query('CALL get_form_from_instance(?)', { replacements: [tempInstance[0].instance_id], type: sequelize.QueryTypes.CALL });
                type = tempForm[0].type;
            } catch (error) {
                console.log(error);
            }
            //Selecting message base depending on form type
            if (type === 'survey') {
                if (tempInstance[0].user_id != null) {
                    let message = "";
                    alertTeam = await sequelize.query('CALL get_user_team(?)', { replacements: [tempInstance[0].user_id], type: sequelize.QueryTypes.CALL });
                    alertUser = await sequelize.query('CALL get_user(?)', { replacements: [tempInstance[0].user_id], type: sequelize.QueryTypes.CALL });

                    message = alertUser[0].first_name + " " + alertUser[0].last_name +
                        "of team " + alertTeam[0].team_number + " " + survey.body + "\n";
                    messages += (message);
                }
            }
            if (type === 'quiz') {
                if (tempInstance[0].user_id != null) {
                    let message = "";
                    alertTeam = await sequelize.query('CALL get_user_team(?)', { replacements: [tempInstance[0].user_id], type: sequelize.QueryTypes.CALL });
                    alertUser = await sequelize.query('CALL get_user(?)', { replacements: [tempInstance[0].user_id], type: sequelize.QueryTypes.CALL });
                    message = alertUser[0].first_name + " " + alertUser[0].last_name +
                        " of team " + alertTeam[0].team_number + " " + quiz.body + "\n";
                    messages += (message);;
                }
            }
            //Task
            if (type === 'task') {
                //Get userid from forms table
                let userID = tempForm[0].user_id;
                let message = "";
                alertTeam = await sequelize.query('CALL get_user_team(?)', { replacements: [userID], type: sequelize.QueryTypes.CALL });
                alertUser = await sequelize.query('CALL get_user(?)', {
                    replacements: [userID],
                    type: sequelize.QueryTypes.CALL
                });
                message = alertUser[0].first_name + " " + alertUser[0].last_name +
                    " of team " + alertTeam[0].team_number + " " + task.body + "\n";
                messages += (message);;
            }
            if (type === 'attendance') {
                let message = "";
                alertTeam = await sequelize.query('CALL get_user_team(?)', { replacements: [tempInstance[0].team_id], type: sequelize.QueryTypes.CALL });
                message = "Team Number" + alertTeam[0].team_number + " " + attendance.body + "\n";
                messages.append(message);
            }
            if (type === 'milestone') {
                if (tempInstance[0].team_id != null) {
                    let message = "";
                    alertUser = await sequelize.query('CALL get_team(?)', { replacements: [tempInstance[0].team_id], type: sequelize.QueryTypes.CALL });
                    message += "Team Number" + " " + alertUser[0].team_number + " " + milestone.body + "\n";
                    messages += (message);
                }

            }
        }
        //Email User
        sendEmail("josephfrantzcito17@gmail.com", survey.subject, messages);
    }
}