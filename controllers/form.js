const { sequelize } = require('../models');

class form {

    static async createForm(req, res, next) {

        const { access_level, end_date, start_date, title, type, user_id, questions } = req.body;
        let formID;
        let status = {};
        // access_level = 'coordinator'
        // type = 'survey';
        let category_id = 1;
        // start_date = '9999-11-12'
        // end_date = '9999-12-24';

        if(type === 'survey') {

            try {
                formID = await sequelize.query(
                    'CALL insert_form(?,?,?,?,?,?)', 
                    {replacements:[ access_level, end_date, start_date, title, type, user_id ], type: sequelize.QueryTypes.CALL});
                status.status1 = "Form Created";
                next;
            } catch(error) {
                console.log(error);
                status.status1 = "Failed";
                next;
            }

            for(let i = 0; i < questions.length; i++) {
                try {
                    let insert = await sequelize.query(
                        'CALL insert_survey_question(?,?,?)', 
                        {replacements:[ category_id, formID, questions[i].question ], type: sequelize.QueryTypes.CALL})
                    status.status2 = "Survey Insert"
                    next;
                } catch(error) {
                    console.log(error);
                    status.status2 = "Failed";
                    next;
                }
            }
            res.send(status);
        }

        if(type === 'quiz') {
            
        }

        if(type === 'meeting') {
            
        }

        if(type === 'task') {
            
        }

        if(type === 'milestone') {
            
        }

        if(type === 'attendance') {
            
        }

    }

    static async getForm(req, res, next) {

        const { formid } = req.body;

        // CALL getForm SP
        await sequelize.query(
            'CALL get_form(?)', 
            {replacements:[ formid ], type: sequelize.QueryTypes.CALL})
            .then(result => {
                // Placeholder for now
                console.log(result[0]);
                res.send({ result });
                // We want to take the result and make the appropriate JSON to send back to the front end
            })
            .catch(error => {
                console.log(error);
                res.send({ status: "Failed" });
        }); 
    }

    static async submitForm(req, res, next) {
        
        const { user_id, form_id , results } = req.body;
        let type;
        let status = {};

        try {
            let result = await sequelize.query('CALL get_form_type(?)', {replacements:[ form_id ], type: sequelize.QueryTypes.CALL});
            type = result[0]['type'];
            status.status1 = "Success";
            next;
            // res.send({ thisType });
        } catch(error) {
            console.log(error);
            // res.send({ status: "Failed" });
            status.status1 = "Failed";
            next;
        }

        if(type === 'survey') {
            console.log('Inside typeSurvey');

            for(let i = 0; i < results.length; i++){
                try {
                    let callSurvey = await sequelize.query(`CALL submit_survey(?,?,?,?)`, 
                        {replacements:[form_id, results[i].question_id, results[i].text, user_id], type: sequelize.QueryTypes.CALL});
                    // res.send({ status: "Success" });
                    console.log(`Insert ${results[i].question_id} and ${results[i].text}`);
                    status.status2 = "Success"
                    next;
                } catch(error) {
                    console.log(error);
                    // res.send({ status: "Failed" });
                    status.status3 = "Failed";
                    next;
                }
            }

            res.send(status);
        }

        if(type === 'quiz') {
            
        }

        if(type === 'meeting') {
            
        }

        if(type === 'task') {
            
        }

        if(type === 'milestone') {
            
        }

        if(type === 'attendance') {
            
        }
    
    }

    static async updateForm(req, res, next) {

        if(type === 'survey') {

        }

        if(type === 'quiz') {
            
        }

        if(type === 'meeting') {
            
        }

        if(type === 'task') {
            
        }

        if(type === 'milestone') {
            
        }

        if(type === 'attendance') {
            
        }

    }

    static async getAnswers(req, res, next) {

        const { userid, formid } = req.body;
        console.log(userid);
        let type;
        let status = {};
        let answers;

        try {
            let result = await sequelize.query('CALL get_form_type(?)', {replacements:[ formid ], type: sequelize.QueryTypes.CALL});
            type = result[0]['type'];
            console.log(type);
            status.status1 = "Success";
            next;
            // res.send({ thisType });
        } catch(error) {
            console.log(error);
            // res.send({ status: "Failed" });
            status.status1 = "Failed";
            next;
        }

        if(type === 'survey') {
            try {
                // CALL get_user_form_answers(?)
                answers = await sequelize.query(
                    'SELECT DISTINCT QUE.question_text, ANS.answer_text FROM form_answers ANS INNER JOIN form_questions QUE ON ANS.question_id = QUE.question_id WHERE ANS.user_id = ?', 
                    {replacements:[ userid ], type: sequelize.QueryTypes.SELECT});
                status.status2 = "Success"    
                next;
            } catch (error) {
                console.log(error);
                // res.send({ status: "Failed" });
                status.status2 = "Failed";
                res.send(status);
                next;
            }  
        }

        res.send(answers);
    }

    static async deleteForm(req, res, next) {

        if(type === 'survey') {

        }

        if(type === 'quiz') {
            
        }

        if(type === 'meeting') {
            
        }

        if(type === 'task') {
            
        }

        if(type === 'milestone') {
            
        }

        if(type === 'attendance') {
            
        }

    }

}

module.exports = form;