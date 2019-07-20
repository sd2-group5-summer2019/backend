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
        var form_id;
        var instance;
        let status = {};
        let category_id = 1;

        if(type === 'survey') {
            // const for survey and form.
            const { access_level, title, user_id, description, questions } = req.body;
            let threshold=req.body.form_threshold;
            if(threshold===undefined)
            {
                threshold=null;
            }
            // Insert the form.
            try {
                returnFormID = await sequelize.query(
                    'CALL insert_form(?,?,?,?,?,?)', 
                    {replacements:[ access_level, description,threshold, title, type, user_id ], type: sequelize.QueryTypes.CALL});
                // console.log(returnFormID[0]['LAST_INSERT_ID()']);
                form_id = returnFormID[0]['LAST_INSERT_ID()'];
                // console.log(form_id);
                status.status1 = "Form Created";
                next;
            } catch(error) {
                console.log(form_id);
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
                        {replacements:[category_id, form_id, questions[i].question_text,questions[i].question_threshold, questions[i].question_type ], type: sequelize.QueryTypes.CALL})
                    status.status3 = "Question Insert"
                    next;
                } catch(error) {
                    console.log(error);
                    status.status3 = "Question Failed";
                    next;
                }
            }
            res.send(status);
        }

        if(type === 'quiz') {
            const { access_level, title, user_id, description, questions } = req.body;
            try {
                let threshold=req.body.form_threshold;
                if(threshold===undefined)
                {
                    threshold=null;
                }

                returnFormID = await sequelize.query(
                    'CALL insert_form(?,?,?,?,?,?)', 
                    {replacements:[ access_level,description,threshold, title, type, user_id], type: sequelize.QueryTypes.CALL});
                // console.log(returnFormID[0]['LAST_INSERT_ID()']);
                form_id = returnFormID[0]['LAST_INSERT_ID()'];
                // console.log(form_id);
                status.status1 = "Form Created";
                next;
            } catch(error) {
                console.log(returnFormID);
                status.status1 = "Failed";
                next;
            }
            
            for(let i = 0; i < questions.length; i++) {
                try {
                    category_id=questions[i].category_id;
                    if(questions[i].category_id===undefined)
                    {
                        category_id=1;
                    }
                    if(questions[i].question_threshold===undefined)
                    {
                        questions[i].question_threshold=null;
                    }
                    var returnQuestionID = await sequelize.query(
                        'CALL insert_form_question(?,?,?,?,?)', 
                        {replacements:[ category_id, form_id, questions[i].question_text,questions[i].question_threshold, questions[i].question_type ], type: sequelize.QueryTypes.CALL})
                   
                        status.status2 = " Insert Question";
                        var question_id = returnQuestionID[0]['LAST_INSERT_ID()'];

                
                
                    if(questions[i].question_type != 'select'&&questions[i].question_type!='free_response')
                    {
                        for(let j=0;j<questions[i].answers.length;j++)
                        {
                            let answer = await sequelize.query(
                                'CALL insert_answer_key(?,?,?)', 
                                {replacements:[ questions[i].answers[j].answer_text,question_id,questions[i].answers[j].is_correct ], type: sequelize.QueryTypes.CALL})
                            status.status2 = " Insert Answer Key";
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
                if(form_threshold===undefined)
                {
                    form_threshold=null;
                }
                returnFormID = await sequelize.query(
                    'CALL insert_form(?,?,?,?,?,?)', 
                    {replacements:[ access_level, description, title, type, user_id,form_threshold ], type: sequelize.QueryTypes.CALL});
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
            
            // Insert the form.
                const{access_level,description,end_date,milestone_id,owner_id,start_date,team_id,title,type,user_id,form_threshold}=req.body;
            
                try {
                 
                    returnFormID = await sequelize.query(
                        'CALL insert_form(?,?,?,?,?,?)', 
                        {replacements:[ access_level, description, title,null ,type, user_id ], type: sequelize.QueryTypes.CALL});
                    // console.log(returnFormID[0]['LAST_INSERT_ID()']);
                    form_id = returnFormID[0]['LAST_INSERT_ID()'];
                    // console.log(form_id);
                    status.status1 = "Form Created";
                    
                } catch(error) {
                    console.log(error);
                    status.status1 = "Failed";
                    next;
                }
                try{
                    var returnInstance = await sequelize.query('CALL get_milestone_instance(?)', 
                        {replacements:[milestone_id], type: sequelize.QueryTypes.CALL});
                        instance = returnInstance[0].instance_id;
                    status.status2 = "Instance Created";
                    next;
                }catch(error){
                    console.log(error);
                    status.status2 = "Instance Create Failed";
                    next;
                }
                try{
                    let result = await sequelize.query('CALL insert_form_task(?,?,?)', 
                        {replacements:[user_id, instance/*returnInstance[0]['LAST_INSERT_ID()']*/, milestone_id], type: sequelize.QueryTypes.CALL});
                      
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
                    {replacements:[ access_level, description, title, type, user_id,null ], type: sequelize.QueryTypes.CALL});
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
                instance = returnInstance[0]['LAST_INSERT_ID()'];
                //next;
            }catch(error){
                console.log(error);
                status.status2 = "Instance Create Failed";
                next;
            }
            try{
                let returnMilestone = await sequelize.query('CALL insert_form_milestone(?,?)', 
                    {replacements:[instance, team_id], type: sequelize.QueryTypes.CALL});
                status.status2 = "Milestone Created";
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
                let meeting = await sequelize.query('CALL complete_form(?)',
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

        const { form_id } = req.body;
        
        
        let result={
            "form":{
                "questions":[
                    {"answers":[{}]}],

            },
            
        };
        try {
             // CALL getForm SP
            
            let form = await sequelize.query(
                'CALL get_form(?)', 
                {replacements:[ form_id ], type: sequelize.QueryTypes.CALL})
            
                    // Placeholder for now
                    if(form===undefined||form[0]==null)
                    {
                        res.send({status:"form not found"});
                        next;
                    }
                    result.form=form[0];
                    switch (form[0].type)
                    {
                        case 'quiz':
                            //get questions
                            let questions = await sequelize.query(
                                'CALL get_form_questions(?)', 
                                {replacements:[ form_id ], type: sequelize.QueryTypes.CALL})
                            for (let i=0;i<questions.length;i++)
                            {
                                let answers = await sequelize.query(
                                    'CALL get_answer_keys_to_question(?)',
                                    {replacements:[questions[i].question_id],type: sequelize.QueryTypes.CALL}
                                )
                                questions[i].answers=answers;
                            }
                            result.questions=questions;
                            break;
                            
                    }
                
                
        } catch (error) {
            console.log(error);
            next;
        }
        res.send({ result });
                // We want to take the result and make the appropriate JSON to send back to the front end
          
            
    }
    //Submisstion of a form
    static async submitForm(req, res, next) {
        
        const { user_id, form_id,instance_id , results } = req.body;
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
                    status.status2 = "Question Insert Success"
                    next;
                } catch(error) {
                    console.log(error);
                    status.status3 = "Question Insert Failed";
                    next;
                }
            }
            triggerCheck(user_id,form_id,instance_id,results);
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
            let grade=quizGrader(user_id,form_id,instance_id,results);
            
            status.status3=grade;
            triggerCheck(user_id,form_id,instance_id,results);
        }

        if(type === 'task') {
            let complete = await sequelize.query('CALL complete_form(?)',
                 {replacements:[instance_id], type: sequelize.QueryTypes.CALL});
                 triggerCheck(user_id,form_id,instance_id,results);
        }

        if(type === 'milestone') {
            //Update instance to compled
            let complete = await sequelize.query('CALL complete_form(?)',
                 {replacements:[instance_id], type: sequelize.QueryTypes.CALL});
            triggerCheck(user_id,form_id,instance_id,results);
        }

        res.send({status:"Submisstion worked"});
    
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
    //Delete An unassigned Form
    static async deleteForm(req, res, next) {

        //Prevent deletetion of forms with alredy created instances
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

            // loop through each team
            for(let j = 0; j < teams.length; j++)
            {
                try 
                {
                    // insert the instance for the team.
                    var insert_result = await sequelize.query('CALL insert_form_instance_team(?,?,?,?)',
                        {replacements:[ end_date, form_id, start_date, teams[j].team_id ], type: 
                        sequelize.QueryTypes.CALL});
                        status.stauts2="Insert Form Instance Suceed";
                    next; 
                } 
                catch (error) 
                {
                    // Failed to insert instance for team.
                    status.status2 = "Insert Form Instance Failed";
                    
                    next;
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
//This grades submitted quizzes and updates the instance
async function quizGrader(user_id,form_id,instance_id,responses)
{
    let score=0;
    let grade=0;
    try {

        var b = responses.length;
        //For each question
        
            
            let result=0;
            for (let j=0;j<responses.length;j++)
            {
                //Get correct answers
            var keys = await sequelize.query(
                'CALL get_quiz_key_answers(?)', 
                {replacements:[ responses[j].question_id ],
                type: sequelize.QueryTypes.CALL})
            //Get all correct answers for given question
                for(let k=0;k<keys.length;k++)
                {
                    if(responses[j].question_id==keys[k].question_id)
                    {
                            //Based on question type
                            //Multi-Absolute Compare
                        switch (keys[k].question_type)
                        {
                            case 'multiple_choice':
                            {
                            if(responses[j].answer_text==keys[k].key_text)
                                {
                                    result+=1;
                                    
                                }
                            }
                            case 'fill_blank':
                            {      
                                    var r=dice(keys[k].key_text,responses[j].text)
                                    var c=levenstein(keys[k].key_text,responses[j].text)
                                    var p=c/keys[k].key_text.length;
                                    if(r>.9||p>.75)
                                    {
                                        result+=1;
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
            result=result/(keys.length*2);
            score+=result; 
        
        }catch(error)
        {
            console.log(error);
            next;
        }
        grade=score/a*100;
        //Insert Grades
    try {
        let responses = await sequelize.query(
            'Update form_instances SET grade = ?  where instance_id =?', 
            {replacements:[ grade,instance_id ], type: sequelize.QueryTypes.Update})
             
    } catch (error) {
        console.log(error);
        console.log("Grade Insertion Failed");
    }
    return grade;
}
//Checks for trigger and email advisor as needed
async function triggerCheck(user_id,form_id,instance_id,responses)
{
    let report=[];
    var date=new Date().toISOString().slice(0,10);
    try {
        //get type
        let result = await sequelize.query('CALL get_form_type(?)', {replacements:[ form_id ], type: sequelize.QueryTypes.CALL});
        type = result[0]['type'];
        status.status1 = "Success";
        next;
        // res.send({ thisType });
    } catch(error) {
        console.log(error);
        // res.send({ status: "Failed"
     } try {
        //
        let result = await sequelize.query('select * from form_instances where instance_id=?', 
        {replacements:[ instance_id ], type: sequelize.QueryTypes.SELECT});
        type = result[0]['type'];
        status.status1 = "Success";
        next;
        // res.send({ thisType });
    } catch(error) {
        console.log(error);
    }
    if(type==='survey')
    {
        for (let i=0;i<results.length;i++)
        {
            let question= await sequelize.query('CALL get_form_question(?)', 
            {replacements:[ results[i].question_id ], type: sequelize.QueryTypes.CALL});
            if(question[0]!=null&&question[0].question_threshold>results[i].text)
            {
              report.push("Member reported poorly on question");  
            }
        }
    }
    if(type==='quiz')
    {
        if(result[0].grade<form[0].form_threshold)
        {
            report.push("Member Has Performed poorly on a quiz");
        }
    }
    if(result<date)
    {
        report.push("Member failed to submit "+form[0].type+" on time");
    }
    //Email report
}
module.exports = form;