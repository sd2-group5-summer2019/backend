// This will get a survey through a GET method to the DB.
// JSON parameters are form_id.
// This will return every question that has the same form_id.

const { sequelize } = require('../models');

class getSurvey {
    static async getSurvey(req, res, next) {
        res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
        const { form_id } = req.body;

        await sequelize.query(`CALL getSurvey(?);`, 
        {replacements:[ form_id ], type: sequelize.QueryTypes.CALL})
            .then(result => { res.send({ return : result });
            }).catch(error => { res.send({ status : "Unkonw error" }); 
        });
    }
}

module.exports = getSurvey;