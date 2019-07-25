const { sequelize } = require('../models');
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

    static async getTeamMembers(req, res, next) {
        f
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