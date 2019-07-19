const { sequelize } = require('../models');

class teamInfo {

    // This will return team information based on the user type.
    // If coordinator, then all teams with coordinator_id.
    // If advisor, then only one team.
    static async getAllTeams(req, res, next) {
        const { user_id } = req.body;

        // Placeholder for the team(s) returned from the DB.
        let teamList;
        
        // Get the teams based on user_id.
        try{
            teamList = await sequelize.query('CALL get_all_teams(?);', 
            {replacements: [ user_id ], type: sequelize.QueryTypes.CALL});
        }catch(error){
            res.send({status : "Get All Teams Failed"});
            console.log("Get All Teams Failed");
        }

        // Return the list to the frontend.
        res.send(teamList);   
    }


    static async generateReport(req,res,next)
    {
        
        //let sql=`get_team_with_coordinator(?)`

        //Case coordinator 
        //Get teams with co
        const {user_id}=req.body;
        var report=[];
        var date=new Date().toISOString().slice(0,10);
        //Case advisor 
        try
        {
            var sql=`CALL get_advisor_teams(?)`;
            let teams=await sequelize.query (sql,{replacements:[user_id],type:sequelize.QueryTypes.CALL});
            for (let i=0;i<teams.length;i++)
            {
                sql=`CALL get_team_instances(?)`
                try {
                    let teamAssignments=await sequelize.query (sql,{replacements:[teams[i].team_id,date],type:sequelize.QueryTypes.CALL}); 
                    //Check for triggers
                    for( let j=0;j<teamAssignments.length;j++)
                    {
                        sql=`CALL get_form_from_instance(?)`;
                        //If trigger not met
                        try {
                            let form=await sequelize.query (sql,{replacements:[teamAssignments[j].instance_id]
                                ,type:sequelize.QueryTypes.CALL});
                            //Missed milestone
                            if(date >teamAssignments[j].end_date && teamAssignments[j].is_complete ==0)
                            {
                                report.push("Team has failed to complete "+form[0].type +" "+form[0].title)
                            }    
                        } catch (error) {
                            console.log(error);
                            next;
                        }
                    }
                    //Check for recently closed assignments
                    //push message to arry
                    try {
                        sql=`CALL get_team_names(?)`
                        let teamMembers = await sequelize.query (sql,{replacements:[teams[i].team_id],type:sequelize.QueryTypes.CALL})
                        for (let a=0;a<teamMembers.length;a++)
                        {
                            sql=`CALL get_user_instances(?)`  
                            let userAssignments = await sequelize.query (sql,{replacements:[teamMembers[a].user_id],type:sequelize.QueryTypes.CALL})  
                            //Check for triggers
                            for( let b=0;b<userAssignments.length;b++)
                            {
                               
                                sql=`CALL get_form_from_instance(?)`;
                                //If trigger not met
                                let form=await sequelize.query (sql,{replacements:[userAssignments[b].instance_id]
                                ,type:sequelize.QueryTypes.CALL});
                                //Missed task 
                                if(form!=undefined)
                                {
                                    switch (form[0].type)
                                    {
                                        case 'attendance':
                                            sql=`call get_meeting_attendance(?,?)`;
                                          
                                                let attendance=await sequelize.query (sql,{replacements:[userAssignments[b].instance_id,userAssignments[b].user_id]
                                                    ,type:sequelize.QueryTypes.CALL});
                                                if(attendance!=undefined && attendance.did_attend==0)
                                                {
                                                    report.push("Member"+" "+teamMembers[a].first_name+" "+teamMembers[a].last_name +"missed a meeting");
                                                }
                                            
                                            break;
                                        //Covered In teams
                                        case 'milestone':
                                            break;
                                        //Covered in attendance 
                                        case 'meeting':
                                            break;
                                        case 'quiz':
                                            if(userAssignments[b].grade<form[threshold])
                                                report.push("Member "+teamMembers[a].first_name+" "+teamMembers[a].last_name+" has performed poorly on "+form[0].type +" "+form[0].title)
                                                break;
                                        case 'task':
                                            if(date >userAssignments[b].end_date && userAssignments[b].is_complete ==0)
                                            {
                                                report.push("Member "+teamMembers[a].first_name+" "+teamMembers[a].last_name +" has failed to complete "+form[0].type +" "+form[0].title)
                                            }  
                                            break;
                                        case 'survey':
                                            sql=`call get_user_survey_answers(?,?)`;
                                            let respones=await sequelize.query (sql,{replacements:[userAssignments[b].instance_id,userAssignments[b].user_id]
                                                ,type:sequelize.QueryTypes.CALL});
                                            for(let i=0;i<responses.length;i++)
                                            {
                                                if(responses[i].threshold>responses[i].answer_text)
                                                {
                                                    if(responses[i].user!=null)
                                                    {
                                                        report.push("Member has responsed poorly to a survey question"
                                                        +"about user");
                                                    }
                                                }
                                            }
                                            break;
                                        default:
                                            break;
                                    }    

                                }
                                
                            }
                        }
                        

                        
                    } catch (error) {
                        console.log(error);
                    }
                } catch (error) {
                  console.log(error);  
                }
            }

        }catch(error){
            console.log(error)
        }
        if(report!=[])
        {
            res.send(JSON.stringify(report));  
        }
        else
        {
            res.send(JSON("Your teams are healthy"));
        }
     
    }
}

module.exports = teamInfo;