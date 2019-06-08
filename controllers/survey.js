const { sequelize } = require('../models');

class survey
{
    static async getSurvey(req, res, next) 
    {
        res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
        const { form_id } = req.body;

        await sequelize.query(`CALL getSurvey(?);`, 
        {replacements:[ form_id ], type: sequelize.QueryTypes.CALL})
            .then(result => { res.send({ return : result });
            }).catch(error => { res.send({ status : "Unkonw error" }); 
        });
    }

    static async submitSurvey(req, res, next) 
    {
        res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
        const {user_id, question_id, form_id, text } = req.body;

        await sequelize.query(`CALL submitSurvey(?,?,?,?)`, 
        {replacements:[user_id, question_id, form_id, text], type: sequelize.QueryTypes.CALL})
            .then(result => { res.send({ status: "Success" });
            }).catch(error => {res.send({status : "error" });
            console.log(error)}); 
        
    }
}

module.exports = survey;