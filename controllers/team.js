const { sequelize } = require('../models');

class teamInfo {

    static async getAllTeams(req, res, next) {
        res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');

        await sequelize.query('CALL get_all_teams();', {type: sequelize.QueryTypes.CALL})
            .then(result => res.json(result))
            .catch(error => {
                console.log(error);
                res.send({ status: "Request failed" });
            });            
    }
    static async generateReport(req,res,next)
    {
        let sql=`get_team_with_coordinator(?)`

        //Case coordinator 
        //Get teams with co
        report=[];
        var date=new Date().toDateString;
        //Case advisor 
        try
        {
            let sql=`get_advisor_teams(?)`;
            let teams=await sequelize.query (sql,{replacements:[user_id],type:sequelize.QueryTypes.CALL});
            for (let i=0;i<teams.length;i++)
            {
                let sql=`get_team_instances(?)`
                try {
                    let teamAssignments=await sequelize.query (sql,{replacements:[teams[i].team_id,date],type:sequelize.QueryTypes.CALL}); 
                    //Check for triggers
                    for( let b=0;b<teamAssignments.length;b++)
                    {

                    }
                    //Check for recently closed assignments
                    //push message to arry
                    try {
                        let sql=`get_users_in_team(?)`
                        let teamMembers = await sequelize.query (sql,{replacements:[teams[i].team_id],type:sequelize.QueryTypes.CALL})
                        for (let a=0;a<teamMembers.length;a++)
                        {
                            let sql=`get_user_instances(?)`  
                            let userAssignments = await sequelize.query (sql,{replacements:[teams[i].team_id],type:sequelize.QueryTypes.CALL})  
                            //Check for triggers
                            for( let b=0;b<userAssignments.length;b++)
                            {

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
    res.send(200);   
    } 
}

module.exports = teamInfo;