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
            const { access_level, title, user_id, description, questions,form_threshold } = req.body;
            if(form_threshold===undefined)
            {
                form_threshold=null;
            }
            // Insert the form.
            try {
                returnFormID = await sequelize.query(
                    'CALL insert_form(?,?,?,?,?,?)', 
                    {replacements:[ access_level, description, title, type, user_id, form_threshold], type: sequelize.QueryTypes.CALL});
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

            // Insert the questions for the new form.
            for(let i = 0; i < questions.length; i++) {
                try {
                    console.log(questions[i].question);
                    if(category_id===undefined)
                    {
                        category_id=1;
                    }
                    if(questions[i].question_threshold===undefined)
                    {
                        questions[i].question_threshold=null;
                    }
                    let insert = await sequelize.query(
                        'CALL insert_form_question(?,?,?,?,?)', 
                        {replacements:[ category_id,form_id, questions[i].question_text,questions[i].question_type,questions[i].question_threshold ], type: sequelize.QueryTypes.CALL})
                    status.status3 = "Question Insert"
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
            const { access_level, title, user_id, description, questions, form_threshold } = req.body;
            
            let isThreshold = 0;

            // Check to see if threshold was applied.
            if(form_threshold != undefined)
            {
                isThreshold = 1;
            }

            try {
                // No threshold given.
                if(isThreshold === 0){
                    returnFormID = await sequelize.query(
                        'CALL insert_form(?,?,?,?,?,?)', 
                        {replacements:[ access_level, description, title, type, user_id, null], 
                        type: sequelize.QueryTypes.CALL});
                    // console.log(returnFormID[0]['LAST_INSERT_ID()']);
                    form_id = returnFormID[0]['LAST_INSERT_ID()'];
                    // console.log(form_id);
                    status.status1 = "Form Created";
                    next;
                }
                // Threshold given.
                else if(isThreshold === 1){
                    returnFormID = await sequelize.query(
                        'CALL insert_form(?,?,?,?,?,?)', 
                        {replacements:[ access_level, description, title, type, user_id, form_threshold], 
                        type: sequelize.QueryTypes.CALL});
                    // console.log(returnFormID[0]['LAST_INSERT_ID()']);
                    form_id = returnFormID[0]['LAST_INSERT_ID()'];
                    // console.log(form_id);
                    status.status1 = "Form Created";
                    next;
                }
            } catch(error) {
                console.log(error);
                status.status1 = "Failed";
                next;
            }
            
            // Loop through and insert questions.
            for(let i = 0; i < questions.length; i++) {

                let question_threshold_temp;
                let category_id_temp;

                // Check for cateogry id and question threshold.
                if(questions[i].category_id === undefined)
                {
                    category_id_temp = 1;
                }
                else 
                {
                    category_id_temp = questions[i].category_id;
                }

                if(questions[i].question_threshold === undefined)
                {
                    question_threshold_temp = null;
                }
                else{
                    question_threshold_temp = questions[i]
                }

                try {
                    // Insert the question.
                    var returnQuestionID = await sequelize.query('CALL insert_form_question(?,?,?,?,?)', 
                        {replacements:[ category_id_temp, form_id, questions[i].question_text, questions[i].question_type, question_threshold_temp ], 
                        type: sequelize.QueryTypes.CALL});
                    
                    // Grab the question id that was inserted.
                    var question_id = returnQuestionID[0]['LAST_INSERT_ID()'];
                    status.status2 = " Insert Question";
                    
                
                    // Add answer keys for each question.
                    if(questions[i].question_type != 'select' && questions[i].question_type != 'free_response')
                    {
                        for(let j = 0 ; j < questions[i].answers.length; j++)
                        {
                            await sequelize.query('CALL insert_answer_key(?,?,?)', 
                                {replacements:[ questions[i].answers[j].answer_text, question_id, questions[i].answers[j].is_correct ], 
                                    type: sequelize.QueryTypes.CALL})
                            status.status2 = " Insert Answer Key";
                           // var question_id = returnQuestionID[0]['LAST_INSERT_ID()'];
                        }
                    }
                }catch(error) {
                    console.log(error);
                    status.status2 = "Failed";
                    next;
                }
            }
            res.send(status);
        }

        if(type === 'meeting') {
            // const for meeting and form.
            const { access_level, title, user_id, description, team_id, start_date, end_date} = req.body;

            // Insert the form.
            try {

                // Check the form threshold.
                if(form_threshold===undefined)
                {
                    form_threshold=null;
                }

                // Insert the form and return is the new ID.
                returnFormID = await sequelize.query(
                    'CALL insert_form(?,?,?,?,?,?)', 
                    {replacements:[ access_level, description, title, type, user_id, form_threshold ], type: sequelize.QueryTypes.CALL});
                    
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
            
            const{ access_level, description, end_date, start_date, title, user_id, milestone_instance_id, form_threshold, assign_to_id } = req.body;

            let temp_task_instance_id;

            let temp_milestone_instance_id = null;
            if(milestone_instance_id != undefined)
            {
                temp_milestone_instance_id = milestone_instance_id;
            }

            // Insert the form.
            try {
                
                let thresholdTemp = null;
                if(form_threshold != undefined)
                {
                    thresholdTemp = form_threshold;
                }

                returnFormID = await sequelize.query(
                    'CALL insert_form(?,?,?,?,?,?)', 
                    {replacements:[ access_level, description, title, type, user_id, thresholdTemp ], 
                    type: sequelize.QueryTypes.CALL});
                // console.log(returnFormID[0]['LAST_INSERT_ID()']);
                form_id = returnFormID[0]['LAST_INSERT_ID()'];
                // console.log(form_id);
                status.status1 = "Form Created";
                
            } catch(error) {
                console.log(error);
                res.send({status : "insert form failed"});
            }

            // Create the instance.
            try{
                let result = await sequelize.query('CALL insert_form_instance_user(?,?,?,?)',
                { replacements: [ end_date, form_id, start_date, assign_to_id ],
                type : sequelize.QueryTypes.CALL});
                console.log(result);
                temp_task_instance_id = result[0]['LAST_INSERT_ID()'];
                console.log(temp_task_instance_id);
            }catch(error){
                console.log(error);
                res.send({status : "insert form instance failed"});
            }

            // Insert the task.
            try{
                let result = await sequelize.query('CALL insert_form_task(?,?)', 
                    {replacements:[ temp_task_instance_id, temp_milestone_instance_id ], 
                    type: sequelize.QueryTypes.CALL});
                    
                status.status2 = "Task Created";
                next;
            }catch(error){
                console.log(error);
                status.status2 = "Task Create Failed";
                next;
            }
            res.send(status);
        }

        if(type === 'milestone') {
            // Insert the form.
            const{ access_level, description, end_date, start_date, team_id, title, user_id } = req.body;
            
            // insert the form.
            try {
                returnFormID = await sequelize.query(
                    'CALL insert_form(?,?,?,?,?,?)', 
                    {replacements:[ access_level, description, title, type, user_id, null ], type: sequelize.QueryTypes.CALL});
                // console.log(returnFormID[0]['LAST_INSERT_ID()']);
                form_id = returnFormID[0]['LAST_INSERT_ID()'];
                // console.log(form_id);
                status.status1 = "Form Created";
                //next;
            } catch(error) {
                console.log(error);
                status.status1 = "Failed";
                next;
            }
            //Assign to group
            // assign to the team_id, user_id for instance table will be null.
            try{
                var returnInstance = await sequelize.query('CALL insert_form_instance_team(?,?,?,?)', 
                    {replacements:[end_date, form_id, start_date, team_id], type: sequelize.QueryTypes.CALL});
                status.status2 = "Instance Created";
                //next;
            }catch(error){
                console.log(error);
                status.status2 = "Instance Create Failed";
                next;
            }
            res.send(status);

        }

        if(type === 'attendance') {
            // Frontend should send instance_id, list of users with
            // user_id, did_attend, and reason.
            const {instance_id, users} = req.body;
            try{
                let meeting = await sequelize.query('CALL meeting_complete(?)',
                 {replacements:[instance_id], type: sequelize.QueryTypes.CALL});
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

    static async createFormInstance(req, res, next){
        /*
        const {form_id, end_date, start_date, form_type, user_id} = req.body;

        try {
            returnInstanceID = await sequelize.query(
                'CALL insert_form(?,?,?,?,?,?)', 
                {replacements:[ end_date, form_id, start_date, user_id], type: sequelize.QueryTypes.CALL});
            
            status.status1 = "Assigned";
            next;
        } catch(error) {
            console.log(error);
            status.status1 = "Failed";
            next;
        }
        */

    }

    static async getForm(req, res, next) {

        const { form_id } = req.body;

        let returnForm;

        try{
            returnForm = await sequelize.query('CALL get_form(?)',
            {replacements : [ form_id], type : sequelize.QueryTypes.CALL});
        }catch(error){
            console.log("get form failed");
            res.send({status : "get form failed"});
        }
        res.send(returnForm);
    }

    static async submitForm(req, res, next) {
        
        const { user_id, instance_id } = req.body;
        let type;
        let status = {};
        let form_id;

        // Get form_id from instance_id.
        try{
            form_id = await sequelize.query('CALL get_form_id(?)',
            {replacements : [ instance_id ], type : sequelize.QueryTypes.CALL});
        }catch(error){
            console.log(error);
            res.send({status : "get form id failed"});
        }

        // Get the form type with form_id provided.
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

            const { results } = req.body;

            for(let i = 0; i < results.length; i++){
                try {
                    // Submit the survey instance.
                    let callSurvey = await sequelize.query(`CALL submit_survey(?,?,?,?)`, 
                        {replacements:[instance_id, results[i].question_id, results[i].text, user_id], type: sequelize.QueryTypes.CALL});
                    // res.send({ status: "Success" });
                    console.log(`Insert ${results[i].question_id} and ${results[i].text}`);
                    status.status2 = "Success"
                    next;
                } catch(error) {
                    console.log(error);
                    status.status3 = "Failed";
                    next;
                }
            }
            res.send(status);
        }

        if(type === 'quiz') {
            for(let i = 0; i < results.length; i++){
                try {
                    let callSurvey = await sequelize.query(`CALL submit_survey(?,?,?,?)`, 
                        {replacements:[results[i].text,instance_id, results[i].question_id, user_id], type: sequelize.QueryTypes.CALL});
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
            //let grade=quizGrader(user_id,form_id,instance_id,results);
            
            const { results } = req.body;
           
            for(let i = 0; i < results.length; i++){
                
                // Insert into the form answers table.
                try {
                    // Submit the survey instance.
                    let callSurvey = await sequelize.query(`CALL submit_quiz(?,?,?,?)`, 
                        {replacements:[instance_id, results[i].question_id, results[i].text, user_id], type: sequelize.QueryTypes.CALL});
                    // res.send({ status: "Success" });
                    console.log(`Insert ${results[i].question_id} and ${results[i].text}`);
                    status.status2 = "Success"
                    next;
                } catch(error) {
                    console.log(error);
                    status.status3 = "Failed";
                    next;
                }
            }

            let quiz_results;
            // Get the users answer.
            try{
                quiz_results = await sequelize.query('CALL get_user_quiz_answers(?)',
                {replacements : [ instance_id ], type : sequelize.QueryTypes.CALL});
            }catch(error){
                console.log(error);
                res.send({ status : "get quiz answers failed" });
            }

            // Calculate the grade.
            let tempCorrect;
            let tempTotal = quiz_results.length;
            for( let i = 0; i < quiz_results.length; i++){
                if(quiz_results[i].key_text === quiz_results[i].answer_text){
                    tempCorrect = tempGrade + 1;
                }
            }
            let tempGrade = (tempCorrect/tempTotal) * 100;

            // Submit the grade and complete the quiz instance.
            try{
                let result = await sequelize.query('CALL complete_quiz(?,?)',
                { replacements : [tempGrade, instance_id],
                type : sequelize.QueryTypes.CALL});
            } catch(error){
                console.log(error);
                res.send({ status : "quiz submission failed"});
            }

            res.send({ status : "Quiz submitted and graded"});

        }

        if(type === 'task') {
            let complete = await sequelize.query('CALL complete_form(?)',
                 {replacements:[instance_id], type: sequelize.QueryTypes.CALL});
            
        }

        if(type === 'milestone') {
            let complete = await sequelize.query('CALL complete_form(?)',
                 {replacements:[instance_id], type: sequelize.QueryTypes.CALL});
        }

        if(type === 'attendance') {
            
        }
    }

    static async updateForm(req, res, next) {
        //
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
        if(type==='quiz')
        {
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

            const { user_id } = req.body;

            let forms;
    
            try{
                 // CALL getForm SP
                forms = await sequelize.query('CALL get_all_forms(?)', {replacements : [ user_id ], type : sequelize.QueryTypes.CALL});

            }catch(error){
                res.send({status : "Get All Forms Failed"});
            }
    
            res.send(forms);
    
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
                    // insert the instance for the team.
                    var insert_result = await sequelize.query('CALL insert_form_instance_team(?,?,?,?)',
                        {replacements:[ end_date, form_id, start_date, teams[j].team_id ], type: 
                        sequelize.QueryTypes.CALL});
                        status.status2="Insert Form Instance Succeed";
                    next; 
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

async function quizGrader(user_id,form_id,instance_id,responses)
{
    try {
        var keys = await sequelize.query(
            'CALL get_quiz_key_answers(?)', 
            {replacements:[ form_id ], type: sequelize.QueryTypes.CALL}) 
    } catch (error) {
        console.log(error)
    }   
    var a = keys.length;
    var b = responses.length;
    for (let i=0;i<a;i++)
    {
        for (let j=0;j<b;j++)
        {
            if(responses[j].question_id==keys[i].question_id)
            {
                //Based on question type
                //Multi-Absolute Compare
                switch (keys[i].question_type)
                {
                    case 'multiple_choice':
                    {
                        if(responses[j].answer_text==keys[i].key_text)
                        {
                            c+=1;
                            break;
                        }
                    }
                    case 'fill_blank':
                    {      
                            var r=dice(keys[i].key_text,responses[j].text)
                            var c=levenstein(keys[i].key_text,responses[j].text)
                            var p=c/keys[i].key_text.length;
                            if(r>.9||p>.75)
                            {
                                c+=1;
                            }
                        
                        break;
                    }
                    case 'select':
                    {
                        break;
                    }
                    default:
                        break;
                }
            }
        }
    }
    let grade=c/a*100;
    //Insert Grades
    try {
        var responses = await sequelize.query(
            'Update form_instances SET grade = ? ,is_complete = 1 where instance_id =?', 
            {replacements:[ grade,instance_id ], type: sequelize.QueryTypes.Update})
             
    } catch (error) {
        console.log(error);
    }
    return grade;
}
module.exports = form;