const { sequelize } = require('../models');
const config = require('../config/config');
const dice = require('dice-coefficient');
const levenstein =require('js-levenshtein');
class quizzes
{

}
    async function quizGrader(user_id,instance_id,responses)
    {
        try {
            var keys = await sequelize.query(
                'CALL get_quiz_key_answers(?)', 
                {replacements:[ form_id ], type: sequelize.QueryTypes.CALL}) 
                next;   
        } catch (error) {
            console.log(error)
            next;
        }   
        var a = keys.length;
        var b = responses.length;
        for (var i=0;i=a;i++)
        {
            for (var j=0;j=b;j++)
            {
                if(responses[j].question_id>keys[i].question_id)
                {
                    break;
                }
                if(responses[j].question_id==keys[i].question_id)
                {
                    //Based on question type
                    //Multi-Absolute Compare
                    if(responses[j].answer_text==keys[i].key_text)
                    {
                        c+=1;
                        break;
                    }
                    //Short answer - levenstein & dice coefficient
                    if(keys[i].question_type=='fill_blank')
                    {
                        var r=dice(keys[i].key_text,responses[j].answer_text)
                        var c=levenstein(keys[i].key_text,responses[j].answer_text)
                        var p=c/keys[i].key_text.length;

                    }
                    

                    // Long answer - do nothing
                }
    
            }
        }
    
        var grade=c/a*100;
        //Insert Grades
        try {
            var responses = await sequelize.query(
                'Update form_instances SET grade = ? where instance_id =?', 
                {replacements:[ grade,instance_id ], type: sequelize.QueryTypes.Update})
                next;    
        } catch (error) {
            console.log(error);
        }
        
    }
    async function questionTagResults (req,res,next)
    {
    //Get question with tag 
        const {category_id}=req.body;
        var questions = await sequelize.query(
        'CALL get_responses_to_question_tag(?)',
        {replacements:[ category_id ], type: sequelize.QueryTypes.CALL})
        .then(result => {
            // Placeholder for now
            
            res.send({ result });
        })
        .catch(error => {
            console.log(error);
            res.send({ status: "Failed" });
        });
        var a =questions.length;
        var c=0;
        for(var i=0;i<a;i++)
        {
            if(results[i].answer_text==results[i].key_text)
            {
                c+=1;
            }
        }
    }  
    //Get respons


//Calc results
//Return results w/ average
//module.exports=quizzes;
module.exports = 
    quizzes;
   