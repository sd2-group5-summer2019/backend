const { sequelize } = require('../models');

class sponsorInfo {

    static async getAllSponsors(req, res, next) {

        let sponsorList;

        try{
            sponsorList = await sequelize.query('CALL get_all_sponsors();', {type: sequelize.QueryTypes.CALL});
        }catch(error){
            console.log("get all sponsors failed");
            res.send({status : "get all sponsors failed"});
        }            
        res.send({sponsors : sponsorList});
    }   

    static async assignSponsorToTeam(req, res, next){
        const { sponsor_id, team_id } = req.body;

        try{
            await sequelize.query('CALL assign_sponsor(?)',
            { replacements : [ sponsor_id, team_id ], type : sequelize.QueryTypes.CALL});
        }catch(error){
            console.log("assign sponsor failed");
            res.send({ status : "assign sponsor failed"});
        }
        res.send({ status : "assign sponsor successful"});
    }
}

module.exports = sponsorInfo;