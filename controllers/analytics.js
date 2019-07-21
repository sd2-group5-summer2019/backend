const { sequelize } = require('../models');
const dice = require('dice-coefficient');
const levenstein =require('js-levenshtein');

class analytics {
    
    static async questionAnalytics(req,res,next)
    {
        let questions=req.body.questions;
        let categories=req.body.categories;
        let result={
            questions:[
               
            ]
        }
        if(questions!=undefined)
        {
            for(let i=0;i<questions.length;i++)
            {
                try {
                    let question = await sequelize.query('CALL get_question_key_answer(?)',
                    {replacements:[questions[i].question_id],
                    type:sequelize.QueryTypes.CALL})
                   
                let responses = await sequelize.query(`CALL get_question_responses(?)`,
                {replacements:[questions[i].question_id],type:sequelize.QueryTypes.CALL})
                let average;
                average = await questionAverage(question,responses);
                result.questions.push(question[0]);
                result.questions[result.questions.length-1].average=average;    
                } catch (error) {
                    console.log(error);
                    next;
                }
                
                
            }
            
        }
        
        if(categories!=undefined)
        {
            for(let c=0;c<categories.length;c++)
            {
                try {
                    
                
                let questions =await sequelize.query(`CALL get_questions_in_category(?)`,
                {replacements:[categories[c].category_id],type:sequelize.QueryTypes.CALL});
                for(let i=0;i<questions.length;i++)
                {
                    let question = await sequelize.query(`CALL get_question_key_answer(?)`,
                    {replacements:[questions[i].question_id],type:sequelize.QueryTypes.CALL});
                    let responses = await sequelize.query(`CALL get_question_responses(?)`,
                    {replacements:[questions[i].question_id],type:sequelize.QueryTypes.CALL});
                    let average;
                    
                average = await questionAverage(question,responses);
                result.questions.push(question[0]);
                result.questions[result.questions.length-1].average=average;
                    
                }
            }catch(error)
            {
                next;
            }
                
            }
        
        }
        res.send(result);
    }
}
//Get % of correct responses to a given question
async function questionAverage(question,responses)
{
    let correct =0;
    let average=0.0;
    let key_text;
    if (question[0]!=undefined)
        key_text=question[0].key_text;
    else
        key_text=undefined;
    for(let j=0;j<responses.length;j++)
    {
        switch(question[0].question_type)
        {
            case 'multiple_choice':
            {
                if(responses[j].answer_text==key_text)
                {
                    correct+=1;
                    
                }
                break;
            }
            case 'fill_blank':
            {      
                    var r=dice(key_text,responses[j].answer_text)
                    var c=levenstein(key_text,responses[j].answer_text)
                    var p=c/key_text.length;
                    if(r>.9||p>.85)
                    {
                        correct+=1;
                    }
                break;
            }
            case 'select':
            {
                if(responses[j].answer_text==key_text)
                {
                    correct+=1;
                    break;
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
    average = (correct/responses.length) * 100;
    return average;
}
module.exports=analytics;
