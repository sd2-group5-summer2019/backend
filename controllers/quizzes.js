const { sequelize } = require('../models');
const config = require('../config/config');
const dice = require('dice-coefficient');
const levenstein =require('js-levenshtein');

export async function quizGrader(user_id,form_id,instance_id,responses)
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
                
                //Short answer - levenstein & dice coefficient
               
                // Long answer - do nothing
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
module.exports =     quizzes;
   