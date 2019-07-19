const { sequelize } = require('../models');

class form {

    static async createForm(req, res, next) {

        // Check the form type.
        const { type } = req.body;

        // insert_form will return the last form inserted.
        let returnFormID;

        // for the returned form_id after insert
        let form_id;

        let status = {};
        let category_id = 1;

        if(type === 'survey') {
            // const for survey and form.
            const { access_level, title, user_id, description, questions } = req.body;

            // Insert the form.
            try {
                returnFormID = await sequelize.query(
                    'CALL insert_form(?,?,?,?,?)', 
                    {replacements:[ access_level, description, title, type, user_id ], type: sequelize.QueryTypes.CALL});
                // console.log(returnFormID[0]['LAST_INSERT_ID()']);
                form_id = returnFormID[0]['LAST_INSERT_ID()'];
                // console.log(form_id);
                status.status1 = "Form Created";
                next;
            } catch(error) {
                console.log(error);
                status.status1 = "Failed";
                next;
            }

            // Insert the questions for the new form.
            for(let i = 0; i < questions.length; i++) {
                try {
                    console.log(questions[i].question);
                    let insert = await sequelize.query(
                        'CALL insert_survey_question(?,?,?,?)', 
                        {replacements:[ form_id, category_id, questions[i].question, question_type ], type: sequelize.QueryTypes.CALL})
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
            // const for meeting and form.
            const { access_level, title, user_id, description, team_id, start_date, end_date} = req.body;

            // Insert the form.
            try {
                returnFormID = await sequelize.query(
                    'CALL insert_form(?,?,?,?,?)', 
                    {replacements:[ access_level, description, title, type, user_id ], type: sequelize.QueryTypes.CALL});
                // console.log(returnFormID[0]['LAST_INSERT_ID()']);
                form_id = returnFormID[0]['LAST_INSERT_ID()'];
                // console.log(form_id);
                status.status1 = "Meeting Created";
                next;
            } catch(error) {
                console.log(error);
                status.status1 = "Meeting Creatation Failed";
                next;
            }

            // assign to the team_id, user_id for instance table will be null.
            try{
                let result = await sequelize.query('CALL insert_form_instance_team(?,?,?,?)', 
                    {replacements:[end_date, form_id, start_date, team_id], type: sequelize.QueryTypes.CALL});
                status.status2 = "Instance Created";
                next;
            }catch(error){
                console.log(error);
                status.status2 = "Instance Create Failed";
                next;
            }
            res.send(status);

        }

        if(type === 'task') {
            
        }

        if(type === 'milestone') {
            
        }

        if(type === 'attendance') {
            // Frontend should send instance_id, list of users with
            // user_id, did_attend, and reason.
            const {instance_id, users} = req.body;
            try{
                for(let i = 0; i < users.length; i++)
                {
                    let insert = await sequelize.query('CALL insert_form_attendance(?,?,?,?)', {replacements:[users[i].did_attend, instance_id, users[i].reason, users[i].user_id], type: sequelize.QueryTypes.CALL});
                }                
            }catch(error){
                console.log(error);
            }
            res.send({status : "Attendance success"});
            
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

    // Get instances that are assigned based on the user_id.
    // This will also grab any instances assigned to the that user's team_id.
    static async getInstances(req, res, next){
        const { user_id } = req.body;
        let instanceList;

        try{
            instanceList = await sequelize.query('CALL get_user_instances(?)', 
            {replacements : [ user_id ], type : sequelize.QueryTypes.CALL});
        }catch(error){
            res.send({status : "Get Instances Failed"});
        }






        res.send(instanceList);
    }

    // This will be called to assign instances of a form to one of three choices.
    // 1 = everyone in a course (sd1 : 'summer', year : 2019).
    // 2 = groups, group IDs will be sent.
    // 3 = individual users, list of users will be sent.
    static async assignForm(req, res, next)
    {
        let status = {};
        res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
        if(req.body.code === 1)
        {
            let studentList;
            // Get all students who fit the current criteria.
            const {form_id, start_date, end_date, sd1_term, sd1_year, sd2_term, sd2_year} = req.body;
            try {
                studentList = await sequelize.query('CALL get_all_students_assign(?,?,?,?)', {replacements:[ sd1_term, sd1_year, sd2_term, sd2_year ], type: sequelize.QueryTypes.CALL});
                next;
            } catch (error) {
                status.status1 = "Failed";
                next;
            }
            if(studentList.length > 0)
            {
                // Loop through each student and assign the form instance.
                for(let i = 0; i < studentList.length; i++)
                {
                    try {
                    let insert_instance_result = await sequelize.query('CALL insert_form_instance_user(?,?,?,?)', {replacements:[ end_date, form_id, start_date, studentList[i].user_id ], type: sequelize.QueryTypes.CALL});
                    next;
                    } catch (error) {
                        status.status1 = "Insertion Failed";
                        next;   
                    }
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
            const{end_date, form_id, start_date, teams} = req.body;
            
            // Check request for list of teams.
            if(teams.length == 0)
            {
                res.send({ status : "No teams in Request Body" });
            }

            // loop through each team.
            for (var i = 0; i < teams.length; i++)
            {
                // place holder for users of one team.
                var teamUsers;

                // get users from team.
                try 
                {
                    teamUsers = await sequelize.query('CALL get_users_in_team(?)', 
                        {replacements:[ teams[i].team_id ], type: sequelize.QueryTypes.CALL});
                   
                }
                catch (error) 
                {
                    // Failed to get users of a team.
                    status.status2 = "Could not get users in team.";
                    res.send(status); 
                    next;
                }

                // loop through each memeber of the team.
                for(var j = 0; j < teamUsers.length; j++)
                {
                    try 
                    {
                        // insert the instance for the user.
                        var insert_result = await sequelize.query('CALL insert_form_instance_user(?,?,?,?)',
                            {replacements:[ end_date, form_id, start_date, teamUsers[j].user_id ], type: 
                            sequelize.QueryTypes.CALL});
                        next; 
                    } 
                    catch (error) 
                    {
                        // Failed to insert instance for user.
                        status.status2 = "Insert Form Instance Failed";
                        res.send(status); 
                        next;
                    }
                          
                }                
            }          
            res.send({status : "Success"});
        }
        // List of users given.
        else if (req.body.code === 3)
        {
            const{ form_id, start_date, end_date, students } = req.body;

            // check to see if list in populated.
            if(students.length == 0)
            {
                res.send({ status : "Students not found" });
            }
            
            // Loop through the list of users from the request body.
            for (var i = 0; i < students.length; i++)
            {
                try {
                    var insert_result = await sequelize.query('CALL insert_form_instance_user(?,?,?,?)',
                        {replacements:[ end_date, form_id, start_date, students[i].user_id ],
                        type: sequelize.QueryTypes.CALL});
                    next;       
                } catch (error) {
                    status.status3 = "Insert Form Instance Failed";
                    res.send(status); 
                    next;       
                }
            }
            
            res.send({ status : "success" });
        
        }
        else
        {
            res.send({ status :"No option chosen" });  
        }
    }
}

module.exports = form;