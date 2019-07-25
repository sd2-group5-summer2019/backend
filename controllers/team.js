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
        //Send emails to all advisors with alerts
    static async sendEmail(req, res, next) {
        let survey = require('../emails/surveyTriggerEmail');
        let quiz = require('../emails/quizTriggerEmail');
        let milestone = require('../emails/milestoneTriggerEmail');
        let attendance = require('../emails/attendanceTriggerEmail');
        let task = require('../emails/taskTriggerEmail')
        var messages = "";

        //Get all unsubmitted assignments past due
        //Create Alerts 
        //Send email
        //Get Alert Not Yet Reported
        let unalertedAlerts = await sequelize.query('CALL get_unalerted_alerts', { type: sequelize.QueryTypes.CALL });
        //Get all distinct users to be alerted
        let userSet = new Set(unalertedAlerts.map(x => x.user_id));
        let userArray = Array.from(userSet);
        for (let u = 0; u < userArray.length; u++) {
            //Get all alerts attached to that user
            //Store all emails in one array to reduce sent emails

            let tempAlerts = await sequelize.query('CALL get_alerts(?)', { replacements: [userArray[u]], type: sequelize.QueryTypes.CALL });
            for (let a = 0; a < tempAlerts.length; a++) {
                //Get instance attached to alert
                let tempInstance = await sequelize.query('CALL get_alert_instance(?)', { replacements: [tempAlerts[a].instance_id], type: sequelize.QueryTypes.CALL });
                //console.log(tempAlert);
                //Get email to be used
                let tempUser = await sequelize.query('CALL get_user(?)', { replacements: [userArray[u]], type: sequelize.QueryTypes.CALL });
                console.log(tempUser);
                //Get user and team that caused trigger
                let alertUser;
                let alertTeam;
                let tempForm = await sequelize.query('CALL get_form_from_instance(?)', { replacements: [tempInstance[0].instance_id], type: sequelize.QueryTypes.CALL });
                let type = tempForm[0].type;

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
                    alertTeam = await sequelize.query('CALL get_user_team(?)', { replacements: [tempInstance[0].user_id], type: sequelize.QueryTypes.CALL });
                    alertUser = await sequelize.query('CALL get_user(?)', { replacements: [alertUser[0].user_id], type: sequelize.QueryTypes.CALL });

                    message = alertUser[0].first_name + " " + alertUser[0].last_name +
                        "of team " + alertTeam[0].team_number + " " + attendance.body + "\n";
                    messages.append(message);

                }
                if (type === 'milestone') {
                    if (tempInstance[0].team_id != null) {
                        let message = "";
                        alertUser = await sequelize.query('CALL get_team(?)', { replacements: [tempInstance[0].team_id], type: sequelize.QueryTypes.CALL });

                        message += "Team Number" + " " + alertUser[0].team_number + " " + milestone.body;
                        messages += (message);
                    }

                }

                //Update alert as alerted
                await sequelize.query('CALL update_alert(?)', { replacements: [tempAlerts[a].alert_id], type: sequelize.QueryTypes.CALL });


            }

            //Email User
            mail.sendEmail("josephfrantzcito17@gmail.com", survey.subject, messages);

        }
        res.send(200);
    }

    static async getTeamMembers(req, res, next) {
        const { team_id } = req.body;
        console.log(team_id)
        let team_members;
        try {
            team_members = await sequelize.query('CALL get_team_names(?);', { replacements: [team_id], type: sequelize.QueryTypes.CALL });
            console.log(team_members);
        } catch (error) {
            console.log("get team members failed");
            res.send({ status: "get team members failed" });
        }
        res.send({ status: "success", team_members: team_members });
    }
}



module.exports = teamInfo;