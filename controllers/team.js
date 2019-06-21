const { sequelize } = require('../models');

class teamInfo {

    static async getAllTeams(req, res, next) {
        res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');

        await sequelize.query('CALL get_all_teams();', {type: sequelize.QueryTypes.CALL})
            .then(result => res.json(result))
            .catch(error => {
                console.log(error);
                res.send({ status: "Request failed" });
            });            
    }   
}

module.exports = teamInfo;