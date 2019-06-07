// This will call a stored procedure and attempt so
// submit the survey the user just completed.
// The json parametes from the frontend are as follows:
// question_id , form_id, text
// POST method is being used.

const { sequelize } = require('../models');

class submitSurvey {
    static async submitSurvey(req, res, next) {
        res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
        const {user_id, question_id, form_id, text } = req.body;

        await sequelize.query(`CALL submitSurvey(?,?,?,?)`, 
        {replacements:[user_id, question_id, form_id, text], type: sequelize.QueryTypes.CALL})
            .then(result => { res.send({ status: "Success" });
            }).catch(error => {res.send({status : "error" });
            console.log(error)}); 
        
    }
}

module.exports = submitSurvey;