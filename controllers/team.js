const { sequelize } = require('../models');
const mail = require('./mailer');
const body = "There's an issue with one of your teams";
const subject = "ALERT";
class teamInfo {

    // This will return team information based on the user type.
    // If coordinator, then all teams with coordinator_id.
    // If advisor, then only one team.
    static async getAllTeams(req, res, next) {
        res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');

        const { user_id } = req.body;

        // Placeholder for the team(s) returned from the DB.
        let teamList;

        // Get the teams based on user_id. 
        try {
            teamList = await sequelize.query('CALL get_all_teams(?);', { replacements: [user_id], type: sequelize.QueryTypes.CALL });
        } catch (error) {
            res.send({ status: "Get All Teams Failed" });
            console.log("Get All Teams Failed");
        }

        // Return the list to the frontend.
        res.send({ team: teamList });
        res;
    }

    static async createTeam(req, res, next) {

        const { user_id, project_name, description, sd1_semester, sd1_year, sd2_semester, sd2_year, sponsor } = req.body;
        let user_type;

        // Check to see if user_id is type coordinator/
        try {
            user_type = await sequelize.query('CALL get_user_type(?)', {
                replacements: [user_id],
                type: sequelize.QueryTypes.CALL
            });
        } catch (error) {
            console.log("Get User Type Failed");
            next;
        }

        console.log("Get User Type Success");

        // If user is not coordinator, return to frontend.
        if (user_type != 'coordinator') {
            res.send({ status: "User is not Coordinator" });
        }

        let newTeamID;

        // Insert team.
        try {
            let result = await sequelize.query('CALL insert_team(?,?,?,?,?,?,?,?)', {
                replacements: [description, project_name, sd1_semester, sd1_year, sd2_semester, sd2_year, sponsor, user_id],
                type: sequelize.QueryTypes.CALL
            });
            newTeamID = result[0]['LAST_INSERT_ID()'];
        } catch (error) {
            console.log("create team failed");
            res.send({ status: "create team failed" });
        }

        // returns the new team id. 
        res.send({ status: "success", team_id: newTeamID });
    }

    static async getTeamID(req, res, next) {
        const { user_id } = req.body;
        let teamid;
        try {
            teamid = await sequelize.query('CALL get_team_id(?)', { replacements: [user_id], type: sequelize.QueryTypes.CALL });
        } catch (error) {
            console.log("get team id failed");
            res.send({ status: "get team id failed" });
        }
        res.send({ status: "success", team_id: teamid });
    }
    static async sendEmail(req, res, next) {
        const { user_id } = req.body;
        var message;
        //Get Alert
        let tempAlert = await sequelize.query('CALL get_alerts(?)', { replacements: [user_id], type: sequelize.QueryTypes.CALL });
        //console.log(tempResult);
        //Get instance attached to alert
        let tempInstance = await sequelize.query('CALL get_alert_instance(?)', { replacements: [tempAlert[0].instance_id], type: sequelize.QueryTypes.CALL });
        //console.log(tempAlert);
        let survey = require('../emails/surveyTriggerEmail');
        let quiz = require('../emails/quizTriggerEmail');
        let milestone = require('../emails/milestoneTriggerEmail');
        let attendance = require('../emails/attendanceTriggerEmail');
        //Get email to be used
        let tempUser = await sequelize.query('CALL get_user(?)', { replacements: [tempInstance[0].user_id], type: sequelize.QueryTypes.CALL });
        console.log(tempUser);

        let alertUser;


        let tempForm = await sequelize.query('CALL get_form_from_instance(?)', { replacements: [tempInstance[0].instance_id], type: sequelize.QueryTypes.CALL });
        let type = tempForm[0].type;



        console.log(tempAlert);
        if (tempAlert[0] != undefined) {
            if (type === 'survey') {
                if (tempInstance[0].user_id != null) {
                    let message = survey.body;
                    alertUser = await sequelize.query('CALL get_user(?)', { replacements: [tempAlert[0].user_id], type: sequelize.QueryTypes.CALL });

                    message += " " + alertUser[0].first_name + " " + alertUser[0].last_name;
                    mail.sendEmail("josephfrantzcito17@gmail.com", survey.subject, message);


                }
            }
            if (type === 'quiz') {
                if (tempInstance[0].user_id != null) {
                    let message = quiz.body;
                    alertUser = await sequelize.query('CALL get_user(?)', { replacements: [tempAlert[0].user_id], type: sequelize.QueryTypes.CALL });

                    message += " " + alertUser[0].first_name + " " + alertUser[0].last_name;
                    mail.sendEmail("josephfrantzcito17@gmail.com", quiz.subject, message);


                }
            }
            if (type === 'attendance') {
                if (tempInstance[0].user_id != null) {
                    let message = quiz.body;
                    alertUser = await sequelize.query('CALL get_team(?)', { replacements: [tempAlert[0].user_id], type: sequelize.QueryTypes.CALL });

                    message += " " + alertUser[0].team_number;
                    mail.sendEmail("josephfrantzcito17@gmail.com", attendance.subject, message);

                }
            }
            if (type === 'milestone') {
                if (tempInstance[0].team_id != null) {
                    let message = quiz.body;
                    alertUser = await sequelize.query('CALL get_team(?)', { replacements: [tempInstance[0].team_id], type: sequelize.QueryTypes.CALL });

                    message += " " + alertUser[0].team_number;
                    mail.sendEmail("josephfrantzcito17@gmail.com", milestone.subject, message);

                }

            }
        } else
        //Update alert as alerted
            await sequelize.query('CALL update_alert(?)', { replacements: [tempAlert[0].instance_id, tempAlert[0].user_id], type: sequelize.QueryTypes.CALL });
        res.send({ "status": "operation successfull" });
    }


}
module.exports = teamInfo;