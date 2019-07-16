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
				res.send({ status : "Retrieval Failure" });
				console.log(error);
				next;
			}
		  res.send({ status : "Sucessfull Request" });
	}
	static async teamregistercsv(req,res,next)
	{
		const {file,coordinator_id} =req.body;
		console.log(file);
		var department_id;
		try {
			
			var arr=await teamparser(file,coordinator_id);
			
		} catch (error) {
			res.send({ status : "Retrieval Failure" });
			console.log(error);
			next;
			}
			res.send({ status : "Sucessfull Request" });
	
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
async function insert_teams(arr,arr2,id)
{
	var team;
	for (i=0;i<arr.length;i++)
	{
		try {
			var sql = `CALL insert_team (?,?,?,?,?,?,?,?)`;
			team =await sequelize.query(sql,
					{replacements:[id,arr[i].description,arr[i].number,arr[i].SD1_Term,
					arr[i].SD1_Year,arr[i].SD2_Term,arr[i].SD2_Year,arr[i].title],
					type: sequelize.QueryTypes.CALL})	
				//console.log(arr[i].first_name+" has been inserted as a user");
			} catch (error) {
				//if already there reactivate
				console.log(error);
				//next;
			}
			//ADvisor
		try {
			//var team_id=team[0]['last_insert_id()'];
			var team_id=arr[i].number;
			var user= await sequelize.query(`CALL INSERT_USER(?,?,?,?,?,?)`,
				{replacements:[arr[i].Advisor.email.slice(0,arr[i].Advisor.email.toString().indexOf("@")),
				uuid4(),'sponsor',
				arr[i].Advisor.first_name,arr[i].Advisor.last_name,arr[i].Advisor.email],
				type: sequelize.QueryTypes.CALL})
			var uid= user[0]['last_insert_id()'];
			let sql= `CALL insert_advisor(?,?)`;
			let advisor =await sequelize.query(sql,
				{replacements:[team_id,uid],
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
	//Group Assigning
	for (var j=0;j<arr2.length;j++)
	{
		try
		{
			try {
				var result=await sequelize.query(`Select user_id from users where first_name= ? and last_name=?`,
				{replacements:[arr2[j].first_name,arr2[j].last_name],type: sequelize.QueryTypes.CALL})
			}catch(error)
			{
				console.log(error)
			}
			if(result[0][0]===undefined)
			{
				continue;
			}
			let term1 = arr2[j].SD1.slice(0,arr2[j].SD1.indexOf(" ")+1);
			let year1 = arr2[j].SD1.slice(arr2[j].SD1.indexOf(" ")+1,arr2[j].SD1.length);
			let term2 = arr2[j].SD2.slice(0,arr2[j].SD1.indexOf(" ")+1);
			let year2 = arr2[j].SD2.slice(arr2[j].SD1.indexOf(" ")+1,arr2[j].SD1.length);
		let sql=`CALL assign_to_team(?,?,?,?)`;
		var results=await sequelize.query(sql,
				{replacements:[arr2[j].team,result[0][0]['user_id'],
				arr[j].SD1_Term,arr[j].SD1_Year,arr[j].SD2_Term,arr[j].SD2_Year,year],type: sequelize.QueryTypes.CALL})	
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
	  insert_students(array);
	  //return array;
	});
	//return array;
}
async function teamparser(file,id)
{
	var students=[];
	var array=[];
	var switched=false;
	file.replace("/","//")
	console.log(file);
	//var stream=;
	fs.createReadStream(file)
	.pipe(parse())
	.on('data', function(data){
		//console.log(data);
		if(data.Number==""|| data.Number=="Primary")
		{
			switched=true;
		//	console.log(switched);
		}
		if(switched)
		{
				if(data.Number!=undefined&&data.Number!=""&&data.Number!="Primary")
			{
				var student=
				{
					"first_name":data.Number,
					"last_name":data.ProjectTitle,
					"team":data.Description
				}
				students.push(student);
			}
		}
		else
		{
			var SD1=data.SD1.split(" ");
			var SD2=data.SD2.split(" ");
			var Advisor=data.AdvisorName.split(" ");
			
			if(!emailIsValid(data.AdvisorEmail)||!emailIsValid(data.SponsorEmail))
			{
				(result => { res.send({ status : "Invalid email" })});
			}	
			if(data.Number==''||data.ProjectTitle==''||data.SD1==''||data.SD2=='')
			{
				(result => { res.send({ status : "Values Missing" })});
			}
			
				
			var team = {
				"number":data.Number,
				"title":data.ProjectTitle,
				"description":data.Description,
				"SD1_Term":SD1[0],
				"SD1_Year":SD1[1],
				"SD2_Term":SD2[0],
				"SD2_Year":SD2[1],
				"Advisor":
				{
					"first_name":Advisor[0],
					"last_name":Advisor[1],
					"email":data.AdvisorEmail
				},
				"Sponsor":
				{
					"company":data.SponsorCompany,
					"email":data.SponsorEmail
				},
			};
			//Reject header
			array.push(team);
		}
		//console.log(team);
		//console.log(student);
	})
	.on('end', function(data) {
	  //console.log(' done');
	 // console.log(students);
	  insert_teams(array,students,id);
	  //return array;
	});
	return array;
}
module.exports = register_csv;
//studentparser('C:\\Users\\Frant\\Downloads\\test_data.CSV');