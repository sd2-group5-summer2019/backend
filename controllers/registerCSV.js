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
			const {file} =req.body;
			console.log(file);
			var department_id;
			try {
				await studentparser(file);
			} catch (error) {
				//res.send({ status : "Retrieval Failure" });
				console.log(error);
				next;
			}
		  res.send({ status : "Sucessfull Request" });
	}
	static groupregistercsv(req,res,next)
	{
		const {file,coordinator_id} =req.body;
		console.log(file);
		var department_id;
		try {
			await grouparser(file,coordinator_id);
		} catch (error) {
			//res.send({ status : "Retrieval Failure" });
			console.log(error);
			next;
			}	
	}
}

//Actual Insertion
async function insert_students(arr)
{
	var id;
	for (i=0;i<arr.length;i++)
	{
		try {
			var sql = `CALL insert_user (?,?,?,?,?,?)`;
			var user =await sequelize.query(sql,
				{replacements:[arr[i].nid,uuid4(),`student`,arr[i].last_name,
				arr[i].first_name,arr[i].email],type: sequelize.QueryTypes.CALL})	
			//console.log(arr[i].first_name+" has been inserted as a user");
		} catch (error) {
			//if already there reactivate
			console.log(error);
			//next;
		}
		try {
			id=user[0]['last_insert_id()'];
			var nStudent =await sequelize.query('call insert_student(?,?,?,?,?,?,?)',
			{replacements:[2,'fall',2020,'spring',2021,null,id ]
			, type: sequelize.QueryTypes.CALL})
			console.log(arr[i].first_name+ " has been registered");
		} catch (error) {
			console.log(error);
//			next;
		}
	}
}
async function insert_teams(arr,id)
{
	
	for (i=0;i<arr.length;i++)
	{
		try {
			var sql = `CALL insert_team (?,?,?,?,?,?,?,?)`;
			var team =await sequelize.query(sql,
					{replacements:[id,arr[i].Description,arr[i].Number,arr[i].SD1_Term,
					arr[i].SD1_Year,arr[i].SD2_Term,arr[i].SD2_Year,arr[i].Title],
					type: sequelize.QueryTypes.CALL})	
				//console.log(arr[i].first_name+" has been inserted as a user");
			} catch (error) {
				//if already there reactivate
				console.log(error);
				//next;
			}
			//ADvisor
		try {
			var team_id=team[0]['last_insert_id()'];
			let user= sequelize.query(`CALL INSERT USER(?,?,?,?,?,?)`,
				{replacements:[arr[i].AdvisorEmail.slice(0,indexof("@"-1)),uuid4(),'sponsor',
				arr[i].Advisor.FirstName,arr[i].Advisor.Surname,arr[i].Advisor.Email],
				type: sequelize.QueryTypes.CALL})
			var uid= user[0]['last_insert_id()'];
			let sql= `CALL insert_advisor(?,?)`;
			let advisor =await sequelize.query(sql,
				{replacements:[uid,team_id],
				type: sequelize.QueryTypes.CALL})	
			
		} catch (error) {
			console.log(error);
//			next;
		}
		try {
			let sql= `CALL insert_sponsor(?,?)`;
			let sponsor =await sequelize.query(sql,
				{replacements:[arr[i].Sponsor.company,arr[i].Sponsor.email],
				type: sequelize.QueryTypes.CALL})	
		} catch (error) {
			console.log(error);
		}
	}
}

//Regular expression to validate emails	
function emailIsValid (email) {
		return /\S+@\S+\.\S+/.test(email)
}
async function studentparser(file)
{
	var array=[];
	file.replace("/","//")
	console.log(file);
	//var stream=;
	fs.createReadStream(file)
	.pipe(parse())
	.on('data', function(data){
			var name=data.Name.toString().split(" ");
			//var f_name=name[0].slice(name[0].indexOf(':"')+1).slice(1);
			if(name[0] =='' || name[1]=='' || data.Email=='' || data.NID =='')
			{
				(result => { res.send({ status : "Values Missing" })});
			}
			if(!emailIsValid(data.Email))
			{
				(result => { res.send({ status : "Invalid email" })});
			}	
			var user = {
				"nid":data.NID,
				"first_name" : name[0],
				"last_name" : name[1],
				"email":data.Email
				};
			//Reject header
			array.push(user);
	})
	.on('end', function(data) {
	  console.log(' done');
	  //console.log(array);
	  //insert_students(array);
	});
	return array;
}
async function teamparser(file,id)
{
	var array=[];
	file.replace("/","//")
	console.log(file);
	//var stream=;
	fs.createReadStream(file)
	.pipe(parse())
	.on('data', function(data){
			var name=data.Name.toString().split(" ");
			//var f_name=name[0].slice(name[0].indexOf(':"')+1).slice(1);
			if(name[0] =='' || name[1]=='' || data.Email=='' || data.NID =='')
			{
				(result => { res.send({ status : "Values Missing" })});
			}
			if(!emailIsValid(data.Email))
			{
				(result => { res.send({ status : "Invalid email" })});
			}	
			var user = {
				"nid":data.NID,
				"first_name" : name[0],
				"last_name" : name[1],
				"email":data.Email
				};
			//Reject header
			array.push(user);
	})
	.on('end', function(data) {
	  console.log(' done');
	  //console.log(array);
	  //insert_students(array);
	});
	return array;
}
module.exports = register_csv;
//studentparser('C:\\Users\\Frant\\Downloads\\test_data.CSV');