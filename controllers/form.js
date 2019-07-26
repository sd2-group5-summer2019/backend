const { sequelize } = require('../models');
const dice = require('dice-coefficient');
const levenstein =require('js-levenshtein');
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
                    'CALL insert_form(?,?,?,?,?,?)', 
                    {replacements:[ access_level, description,title, type, user_id,null], type: sequelize.QueryTypes.CALL});
                // console.log(returnFormID[0]['LAST_INSERT_ID()']);
                form_id = returnFormID[0]['LAST_INSERT_ID()'];
                 console.log(form_id);
                status.status1 = "Form Created";
                next;
            } catch(error) {
                console.log(form_id);
                status.status1 = "Failed";
                next;
            }

            // Insert the questions for the new form.
            for(let i = 0; i < questions.length ; i++) {
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
                        {replacements:[category_id, form_id, questions[i].question_text,questions[i].question_threshold, questions[i].question_type ], 
                        type: sequelize.QueryTypes.CALL})
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

            console.log(req);

            const { access_level, title, user_id, description, questions } = req.body;
            try {
                let threshold=req.body.form_threshold;
                if(threshold===undefined)
                {
                    threshold=null;
                }

                returnFormID = await sequelize.query(
                    'CALL insert_form(?,?,?,?,?,?)', 
                    {replacements:[ access_level, description, threshold, title, type, user_id], type: sequelize.QueryTypes.CALL});
                // console.log(returnFormID[0]['LAST_INSERT_ID()']);
                form_id = returnFormID[0]['LAST_INSERT_ID()'];
                // console.log(form_id);
                status.status1 = "Form Created";
                next;
            } catch(error) {
                console.log(returnFormID);
                status.status1 = "Failed";
                res.send(status);
            }

            console.log("new form id is " + form_id);
            
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

                    var returnQuestionID = await sequelize.query(
                        'CALL insert_form_question(?,?,?,?,?)', 
                        {replacements:[ category_id, form_id, questions[i].question_text,questions[i].question_threshold, questions[i].question_type ], type: sequelize.QueryTypes.CALL})
                   
                        status.status2 = " Insert Question";
                        var question_id = returnQuestionID[0]['LAST_INSERT_ID()'];

                
                    // Add answer keys for each question.
                    if(questions[i].question_type != 'select' && questions[i].question_type != 'free_response')
                    {
                        for(let j = 0 ; j < questions[i].answers.length; j++)
                        {
                            console.log(questions[i]);
                            await sequelize.query('CALL insert_answer_key(?,?,?)', 
                                {replacements:[ questions[i].answers[j].answer, question_id, questions[i].answers[j].isCorrect ], type: sequelize.QueryTypes.CALL});
                            status.status2 = " Insert Answer Key";
                        }
                    }
                }catch(error) {
                    console.log(error);
                    status.status2 = "Failed";
                    res.send(status);
                }
            }
            res.send({'status':status, 'form_id':form_id});
        }

        if(type === 'meeting') {
            // const for meeting and form.
            const { access_level, title, user_id, description, team_id, start_date, end_date} = req.body;

            // Insert the form.
            try {

              /*  // Check the form threshold.
                if(form_threshold===undefined)
                {
                    form_threshold=null;
                }*/

                // Insert the form and return is the new ID.
                returnFormID = await sequelize.query(
                    'CALL insert_form(?,?,?,?,?,?)', 
                    {replacements:[ access_level, description,  null, title, type, user_id ], type: sequelize.QueryTypes.CALL});
                    
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
            
            const{ access_level, description, end_date, start_date, title, user_id, milestone_instance_id, form_threshold, assign_to_id, team_id } = req.body;

            let temp_task_instance_id;

            let temp_milestone_instance_id = null;
            if(milestone_instance_id != undefined)
            {
                temp_milestone_instance_id = milestone_instance_id;
            }

            // Insert the form.
            try {

                returnFormID = await sequelize.query(
                    'CALL insert_form(?,?,?,?,?,?)', 
                    {replacements:[ access_level, description, null, title, type, user_id ], 
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
                let result = await sequelize.query('CALL insert_form_instance_user_and_team(?,?,?,?,?)',
                { replacements: [ end_date, form_id, start_date, team_id, assign_to_id ],
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
            const{access_level,description,end_date,start_date,team_id,title,type,user_id}=req.body;
            
            try {
                returnFormID = await sequelize.query(
                    'CALL insert_form(?,?,?,?,?,?)', 
                    {replacements:[ access_level, description, null, title, type, user_id ], 
                    type: sequelize.QueryTypes.CALL});
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
                status.status2 = "Milestone Create Failed";
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

    static async getForm(req, res, next) {

        // TODO need to return all info for a form.
        const { form_id } = req.body;

        let returnForm, formType;
        
        // get the form type.
        try{
            let result = await sequelize.query('CALL get_form_type(?)',
            { replacements : [form_id], type : sequelize.QueryTypes.CALL});
            
            formType = result[0]['type'];
            
        }catch(error){
            console.log(error);
            res.send({ status : "Could not get form type" });
        }

        // Get the form and any questions for the user to submit.
        if(formType === 'survey'){
            let returnSurvey;
            try{
                returnSurvey = await sequelize.query('CALL get_survey(?)',
                {replacements : [ form_id ], type : sequelize.QueryTypes.CALL});
            }catch(error){
                console.log(error);
                res.send({ status : "Could not get survey to take" });
            }
            res.send({survey : returnSurvey});
        }
        else if(formType === 'quiz'){
            let returnQuiz;
            try{
                returnQuiz = await sequelize.query('CALL get_quiz(?)',
                {replacements : [ form_id ], type : sequelize.QueryTypes.CALL});
            }catch(error){
                console.log(error);
                res.send({ status : "Could not get quiz to take" });
            }
            res.send({ quiz : returnQuiz});
        }
    }

    static async submitForm(req, res, next) {
        
        const { user_id, instance_id } = req.body;
        let type;
        let status = {};
        let form_id;

        // Get form_id from instance_id.
        try{
            let result = await sequelize.query('CALL get_form_id(?)',
            {replacements : [ instance_id ], type : sequelize.QueryTypes.CALL});
            form_id = result[0]['form_id'];
        }catch(error){
            console.log(error);
            res.send({status : "get form id failed"});
        }
        
        // Get the form type with form_id provided.
        try {
            let result = await sequelize.query('CALL get_form_type(?)', 
            {replacements:[ form_id ], type: sequelize.QueryTypes.CALL});
            console.log(result);
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
                        {replacements:[form_id, results[i].question_id, results[i].answer_text, user_id], type: sequelize.QueryTypes.CALL});
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
            triggerCheck(user_id,form_id,instance_id,results);
            res.send(status);
        }

        if(type === 'quiz') {
            const { results } = req.body;
           console.log(results);
            for(let i = 0; i < results.length; i++){
                
                // Insert into the form answers table.
                try {
                    // Submit the survey instance.
                    let callSurvey = await sequelize.query(`CALL submit_quiz(?,?,?,?)`, 
                        {replacements:[ results[i].text, instance_id, results[i].question_id, user_id ], type: sequelize.QueryTypes.CALL});
                    // res.send({ status: "Success" });
                    console.log(`Insert ${results[i].question_id} and ${results[i].text}`);
                    status.status2 = "Submit quiz success";
                    next;
                } catch(error) {
                    console.log(error);
                    status.status3 = "Submit quiz failed";
                }
            }

            let grade = await quizGrader(user_id, form_id, instance_id, results);
            status.grade = grade;

            let team_id;

            try{
                team_id = await sequelize.query('CALL get_team_id(?)',
                {replacements : [user_id], type : sequelize.QueryTypes.CALL});
            }catch(error){
                console.log(error);
                res.send({status : "get team id failed"});
            }

            //triggerCheck(form_id, instance_id, results, team_id, user_id);

            /*
            let quiz_answer_keys;
            // Get the quiz answer keys.
            try{
                let result = await sequelize.query('CALL get_quiz_key_answers(?)', { replacements : [form_id], type: sequelize.QueryTypes.CALL});
                quiz_answer_keys = result;
            }catch(error)
            {
                console.log(error);
                res.send({ status : "failed to get quiz key answers"});
            }

            let quiz_user_answers;
            // Get the users answer.
            try{
                quiz_user_answers = await sequelize.query('CALL get_user_quiz_answers(?)',
                {replacements : [ instance_id ], type : sequelize.QueryTypes.CALL});
            }catch(error){
                console.log(error);
                res.send({ status : "get quiz answers failed" });
            }

            // Calculate the grade.
            let tempCorrect ;
            let tempGrade = 0;
            let tempTotal = quiz_user_answers.length;

            // Loop through each user answer.
            for( let i = 0; i < quiz_user_answers.length; i++){

                // Loop through answer keys for comparison.
                for(let j = 0; j < quiz_answer_keys.length; j++){

                    // Compare the answer to the keys.
                    if(quiz_user_answers[i].answer_text == quiz_answer_keys[j].key_text){
                        
                    }
                }
            }

            tempGrade = (tempCorrect/tempTotal) * 100;
            console.log("TEMP GRADE = " + tempGrade);
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
            */
        }

        if(type === 'task') {
            try{
                let complete = await sequelize.query('CALL complete_form(?)',
                {replacements:[instance_id], type: sequelize.QueryTypes.CALL});
            }catch(error){
                console.log(error);
                res.send({ status : ""});
            }
        }

        if(type === 'milestone') {
            //Update instance to completed
            let complete = await sequelize.query('CALL complete_form(?)',
            {replacements:[instance_id], type: sequelize.QueryTypes.CALL});
        }

        res.send(status);
    
    }

    static async updateForm(req, res, next) {
        //Modify title,access level or threshold
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
        console.log(req.body);
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
                    'CALL get_form_results(?,?)', 
                    {replacements:[ userid, formid ], type: sequelize.QueryTypes.CALL});
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
                    'CALL get_form_results(?,?)', 
                    {replacements:[ userid, formid ], type: sequelize.QueryTypes.CALL});
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

    //Delete An unassigned Form

    static async getAllForms(req, res, next){

            const { user_id } = req.body;

            let forms;
    
            try{
                 // CALL getForm SP
                forms = await sequelize.query('CALL get_all_forms(?)', 
                {replacements : [ user_id ], 
                type : sequelize.QueryTypes.CALL});

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
            console.log(error);
            res.send({status : "Get Instances Failed"});
        }

        res.send(instanceList);
    }

    // Gets attendance instance based on meeting instance.
    static async getAttendance(req, res, next){

        // Meeting instance id.
        const { instance_id } = req.body;

        let result;

        try{
            result = await sequelize.query('CALL get_completed_meeting(?)',
            {replacements : [ instance_id ], type : sequelize.QueryTypes.CALL});
        }catch (error){
            console.log(error);
        }

        // return all info for attendance.
        res.send(result);

    }

    // This will be called to assign instances of a form to one of three choices.
    // 1 = everyone in a course (sd1 : 'summer', year : 2019).
    // 2 = groups, group IDs will be sent.
    // 3 = individual users, list of users will be sent.
    static async assignForm(req, res, next){
        
        let status = {};
        if(req.body.code === 1)
        {
            let studentList;
            // Get all students who fit the current criteria.
            const {form_id, start_date, end_date, sd1_term, sd1_year, sd2_term, sd2_year} = req.body;
            try {
                studentList = await sequelize.query('CALL get_all_students_assign(?,?,?,?)', {replacements:[ sd1_term, sd1_year, sd2_term, sd2_year ], type: sequelize.QueryTypes.CALL});
                next;
            } catch (error) {
                console.log(error);
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
                        status.status2="Insert Form Instance Succeeded";
                    next; 
                } 
                catch (error) 
                {
                    // Failed to get users of a team.
                    status.status2 = "Could not get users in team.";
                    res.send(status); 
                    next;
                }

                      
            }          
            res.send({status : "Success"});
        }
        // List of users given.
        else if (req.body.code === 3)
        {
            console.log(req.body);
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
                    console.log(error);
                    status.status3 = "Insert Form Instance Failed";
                    res.send(status); 
                }
            }
            console.log(req.body);
            
            res.send({ status : "success" });
        
        }
        else
        {
            res.send({ status :"No option chosen" });  
        }
    }
}

//This grades submitted quizzes and updates the instance
    async function quizGrader(user_id,form_id,instance_id,responses)
    {
        // grabs the answers keys to a form id.
        try {
            var keys = await sequelize.query(
                'CALL get_quiz_key_answers(?)', 
                {replacements:[ form_id ], type: sequelize.QueryTypes.CALL}) 
        } catch (error) {
            console.log(error)
        }   

        // a and b are for lengths.
        var a = keys.length;
        var b = responses.length;
        let correct=0.0;

        console.log("a = " + a + ", b = " + b); 

        // Loop through each key.
        for (let i=0;i<keys.length;i++)
        {

            // Loop through each answer.
            for (let j=0;j<responses.length;j++)
            {

                // Check to see if question matches answer.
                if(responses[j].question_id==keys[i].question_id)
                {
                    //Based on question type
                    //Multi-Absolute Compare
                    switch (keys[i].question_type)
                    {
                        case 'multiple_choice':
                        {

                            if(responses[j].text==keys[i].key_text)
                            {
                                correct++;
                            }
                            break;
                        }
                        case 'fill_blank':
                        {      
                                var r=dice(keys[i].key_text,responses[j].answer_text)
                                var c=levenstein(keys[i].key_text,responses[j].answer_text)
                                var p=c/keys[i].key_text.length;
                                if(r>.9||p>.75)
                                {
                                    correct+=1;
                                }
                            
                            break;
                        }
                        case 'select':
                        {
                            if(responses[j].answer_text==keys[i].key_text)
                            {
                                correct++;
                            }
                            break;
                        }
                        case 'free_response':
                            correct+=1;
                            break;
                        default:
                            break;
                    }
                }
            }
        }
        let grade;
        if(keys.length!=0)
        {
            grade=(correct/keys.length)*100;
        }
            
        else
             grade=100;
        //Insert Grades
        try {
            var responses = await sequelize.query(
                'Update form_instances SET grade = ? ,is_complete = 1 where instance_id =?', 
                {replacements:[ grade,instance_id ], type: sequelize.QueryTypes.Update})
                 
        } catch (error) {
            console.log(error);
        }
        console.log(grade);
        return grade;
    }
//Checks for trigger and email advisor as needed
async function triggerCheck(form_id, instance_id, results, team_id, user_id) {

    let report = [];
    let tempResult;
    let type;
    var date = new Date().toISOString().slice(0, 10);
    let advisorID;
    if (user_id != undefined)
        advisorID = await sequelize.query('CALL get_student_advisor(?)', { replacements: [user_id], type: sequelize.QueryTypes.CALL });
    else
        advisorID = await sequelize.query('CALL get_team_advisor(?)', { replacements: [team_id], type: sequelize.QueryTypes.CALL });
    try {
        //get type
        tempResult = await sequelize.query('CALL get_form_type(?)', { replacements: [form_id], type: sequelize.QueryTypes.CALL });
        type = tempResult[0]['type'];


        // res.send({ thisType });
    } catch (error) {
        console.log(error);
        // res.send({ status: "Failed"
    }

    if (type === 'survey') {
        for (let i = 0; i < results.length; i++) {
            //Get question threshold
            let question = await sequelize.query('CALL get_form_question(?)', { replacements: [results[i].question_id], type: sequelize.QueryTypes.CALL });
            if (question[0].question_threshold != null && question[0].question_threshold > results[i].text) {
                //Insert into alerts array
                let newAlert = await sequelize.query(`CALL insert_alert_history(?,?)`, {
                    replacements: [instance_id, advisorID[0].user_id],
                    type: sequelize.QueryTypes.CALL
                });
            }
        }
    }
    if (type === 'quiz') {
        tempForm = await sequelize.query('CALL get_form(?)', { replacements: [form_id], type: sequelize.QueryTypes.CALL });
        threshold = tempForm[0]['form_threshold'];

        let instanceGrade;
        try{
            instanceGrade = await sequelize.query('SELECT form_instances.grade FROM form_instances WHERE form_instances.instance_id = ?', {replacements : [instance_id], type : sequelize.QueryTypes.CALL});
        }catch(error){
            console.log(error);
        }

        if (threshold != undefined)
        {
            if (instanceGrade[0].grade < threshold) {
                //Insert into alerts array
                let newAlert = await sequelize.query(`CALL insert_alert_history(?,?)`, {
                    replacements: [instance_id, advisorID[0].user_id],
                    type: sequelize.QueryTypes.CALL
                });
            }
        }
    }
    if (type === 'milestone')
        instance = await sequelize.query('CALL get_team_instance(?,?,?)', { replacements: [form_id, instance_id], type: sequelize.QueryTypes.CALL });
    else if (type === 'task') {
        instance = await sequelize.query('CALL get_instance(?,?)', { replacements: [form_id, instance_id], type: sequelize.QueryTypes.CALL });
    } else
        instance = await sequelize.query('CALL get_form_instance(?,?,?)', { replacements: [form_id, instance_id, user_id], type: sequelize.QueryTypes.CALL });

    if (instance[0].end_date < date) {
        //Insert into alerts array for both 
        let newAlert = await sequelize.query(`CALL insert_alert_history(?,?)`, {
            replacements: [instance_id, advisorID[0].user_id],
            type: sequelize.QueryTypes.CALL
        });
    }

    //Email report

    //mail.sendEmail(advisorID[0]['email'],subject,body);
}
module.exports = form;