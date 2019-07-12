const { sequelize } = require('../models');

class form {

    static async createForm(req, res, next) {

        const { access_level, title, type, user_id, description, questions } = req.body;
        let returnFormID;
        let form_id;
        let status = {};
        let category_id = 1;
        // start_date = '9999-11-12'
        // end_date = '9999-12-24';
        console.log(type);

        if(type === 'survey') {

            try {
                returnFormID = await sequelize.query(
                    'CALL insert_form(?,?,?,?,?)', 
                    {replacements:[ access_level, description, title, type, user_id ], type: sequelize.QueryTypes.CALL});
                // console.log(returnFormID[0]['LAST_INSERT_ID()']);
                form_id = returnFormID[0]['LAST_INSERT_ID()'];
                 console.log(form_id);
                status.status1 = "Form Created";
                next;
            } catch(error) {
                console.log(error);
                status.status1 = "Failed";
                next;
            }

            for(let i = 0; i < questions.length; i++) {
                try {
                    console.log(questions[i].question);
                    let insert = await sequelize.query(
                        'CALL insert_survey_question(?,?,?, ?)', 
                        {replacements:[ category_id, form_id, questions[i].question , questions[i].type], type: sequelize.QueryTypes.CALL})
                    status.status2 = "Survey Insert"
                    next;
                } catch(error) {
                    console.log(error);
                    status.status2 = "Failed";
                    next;
                }
            }
            res.send({form_id});
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

    static async createFormInstance(req, res, next){
        const {form_id, end_date, start_date, form_type, user_id} = req.body;

        try {
            returnInstanceID = await sequelize.query(
                'CALL insert_form(?,?,?,?)', 
                {replacements:[ end_date, form_id, start_date, '34'], type: sequelize.QueryTypes.CALL});
            
            status.status1 = "Assigned";
            next;
        } catch(error) {
            console.log(error);
            status.status1 = "Failed";
            next;
        }

    }

    static async getForm(req, res, next) {

        const { form_id } = req.body;

        // CALL getForm SP
        await sequelize.query(
            'CALL get_survey(?)', 
            {replacements:[ form_id ], type: sequelize.QueryTypes.CALL})
            .then(result => {
                // Placeholder for now
                // console.log(result[0]);
                console.log(result);
                res.send(result);
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

    static async getAllForms(req, res, next){

            const { form_id } = req.body;
    
            // CALL getForm SP
            await sequelize.query('CALL get_all_forms()', {type: sequelize.QueryTypes.CALL})
            .then(result => {
                    // Placeholder for now
                    // console.log(result[0]);
                    console.log(result);
                    res.send(result);
                    // We want to take the result and make the appropriate JSON to send back to the front end
                })
                .catch(error => {
                    console.log(error);
                    res.send({ status: "Failed" });
            }); 
        
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

    // This will be called to assign instances of a form to one of three choices.
    // 1 = everyone in a course (sd1 : 'summer', year : 2019).
    // 2 = groups, group IDs will be sent.
    // 3 = individual users, list of users will be sent.
    static async assignForm(req, res, next)
    {
        if(req.body.code === 1)
        {
            // Get all students who fit the current criteria.
            const {form_id, start_date, end_date, sd1_term, sd1_year, sd2_term, sd2_year} = req.body;

            let studentList = await sequelize.query('CALL get_all_students_assign(?,?,?,?)', {replacements:[ sd1_term, sd1_year, sd2_term, sd2_year ], type: sequelize.QueryTypes.CALL});
            if(studentList.length > 0)
            {
                // Loop through each student and assign the form instance.
                for(let i = 0; i < studentList.length; i++)
                {
                    let insert_instance_result = await sequelize.query('CALL insert_form_instance(?,?,?,?)', {replacements:[ end_date, form_id, start_date, studentList[i].user_id ], type: sequelize.QueryTypes.CALL});
                }
            }
            else
            {
                res.send({ Result : "No Students Found" });
            }

            res.send({ status : "success" });
        }
        else if (req.body.code === 2)
        {
            res.send({result : 2});
        }
        else if (req.body.code === 3)
        {
            res.send({result : 3});
        }
    }

}

module.exports = form;