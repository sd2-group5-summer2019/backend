/*let mysql = require('mysql');*/
const { sequelize } = require('../models');

const parse = require('csv-parser');
const uuid4 = require('uuid4');
const fs=require('fs');
class register_csv {
	static async registercsv(req,res,next)
	//async function parser(filepath)
	{
		const{ file,user_id }=req.body;
		
		if(file==undefined)
		{
			res.send({status:"No file inputted"});
		}
		var array=[];
		var department_id;
		/*var department=await sequelize.query(`Call get_coordinator_department(?)`,
			{replacements:[user_id]
			, type: sequelize.QueryTypes.CALL})
			.then().catch(error => { res.send({ status : "Retrieval Failure" }); 
		});	
		if (department[0]!=undefined)
		{
			department_id=department[0]['id'];
		}*/
		var stream = fs.createReadStream(file);
		if(stream ==undefined)
		{
			res.send({ status : "Retrieval Failure" });
		}
		
		stream 
		.pipe(parse())
		.on('data', (row) => {
		var user= JSON.stringify(row);
		user.replace("\xFFFD", "").replace('"',);
		
		var split = user.split(",");
		var name=split[1].split(" ");
		var email = split[2].slice(split[2].indexOf(':"')+1).replace("}","");	
		var nid=split[0].slice(split[0].indexOf(':"')+1);
		var f_name=name[0].slice(name[0].indexOf(':"')+1).slice(1);
		if(f_name =='' || name[1]=='' || email=='' || nid =='')
		{
			(result => { res.send({ status : "Values Missing" })});
		}
		if(!emailIsValid(email))
		{
			(result => { res.send({ status : "Invalid email" })});
		}	
		var use = {
			"nid":nid.split('"').join(''),
			"first_name" : f_name,
			"last_name" : name[1],
			"email":email.split('"').join('')
			};
		//Reject header
		if (use.nid!="NID")
			array.push(use);		
		})
		.on('end', () => {
			
			
			 
		
		});
		await insert_students(array);
		// (result => { res.send({ status : "Sucessfull Request" })});
		//console.log(array);
	}
	
	
}

//Actual Insertion
async function insert_students(arr)
{
	for (i=0;i<arr.length;i++)
	{
		var sql = `CALL insert_user (?,?,?,?,?,?)`;
		await sequelize.query(sql,
			{replacements:[arr[i].nid,uuid4(),`student`,arr[i].first_name,arr[i].last_name
			,arr[i].email]})
			/*, type: sequelize.QueryTypes.CALL})*/
			.then(result => { res.send({ return : "Success" });
			}).catch(error => { res.send({ status : "Insertion Failure" }); 
		});	
		var id = results[0].user_id;
		await sequelize.query('call insert_student(?,?,?,?,?,?,?)',
			{replacements:[id,null,null,2,'fall',2020,'spring',2021 ]
			, type: sequelize.QueryTypes.CALL})
			.then(result => { res.send({ return : "Success" });
			}).catch(error => { res.send({ status : "Insertion Failure" }); 
		});
	}
}
//Regular expression to validate emails	
function emailIsValid (email) {
		return /\S+@\S+\.\S+/.test(email)
}
//var arr=[];
module.exports = register_csv;
	  