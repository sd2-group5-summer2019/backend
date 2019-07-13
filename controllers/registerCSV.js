/*let mysql = require('mysql');*/
const { sequelize } = require('../models');

const parse = require('csv-parser');
const uuid4 = require('uuid4');
const multer  = require('multer');
const fs=require('fs');
class register_csv {
	static async registercsv(req,res,next)
	//async function parser(filepath)
	{
		try {
			
			const {file} =req.body;
			
			console.log(file);
			
			var array=[];
			var department_id;
			fs.createReadStream(file)
  .pipe(parse())
  .on('data', (data) => results.push(data))
  .on('end', () => {
    console.log(results);
    // [
    //   { NAME: 'Daffy Duck', AGE: '24' },
    //   { NAME: 'Bugs Bunny', AGE: '22' }
    // ]
  });
			try {
				//var stream = fs.createReadStream(file);
				var stream=fs.createReadStream('C:\\Users\\Frant\\Downloads\\test_data.CSV');	
			} catch (error) {
				//res.send({ status : "Retrieval Failure" });
				console.log(error);
				next;
			}
			try {
				
			 
			stream 
			.pipe(parse())
			.on('data', (row) => {
				console.log(data);
			/*var user= JSON.stringify(row);
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
				array.push(use);*/		
			})
			.on('end', () => {
				
				
				
			
			});
		
		}catch (error) {
		console.log(error);		
		}
			await insert_students(array);
		}
		catch (error) {
		console.log(error);
		next;	
		}
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
	  