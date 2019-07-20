/*let mysql = require('mysql');*/
const { sequelize } = require('../models');

const parse = require('csv-parser');
const uuid4 = require('uuid4');
const fs=require('fs');
class register_csv {
	//Registers Students via a csv file
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
	//Assigns students to teamas based on valid csv file
	static async teamregistercsv(req,res,next)
	{
		const {file,coordinator_id} =req.body;
		var department_id;
		try {
			var status=await teamparser(file,coordinator_id);
		} catch (error) {
			res.send({ status : "Retrieval Failure" });
			console.log(error);
			next;
			}
			res.send(status);
	
	}
	
}
//Actual Creation of students
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
			
			//Get User ID
			id=user[0]['LAST_INSERT_ID()'];
			await sequelize.query('call insert_student(?,?,?,?,?,?,?)',
			{replacements:[2,'fall',2020,'spring',2021,null,id ]
			, type: sequelize.QueryTypes.CALL})
			//console.log(arr[i].first_name+ " has been registered");
		} catch (error) {
			console.log(error);
//			next;
		}
	}
}
//Actual insertion of teams and assigning students 
async function insert_teams(arr,arr2,coordinator_id)
{
	var team;
	for (i=0;i<arr.length;i++)
	{
		//Create the new sponsor
		try {
			let sql= `CALL insert_sponsor(?,?)`;
			var sponsorID =await sequelize.query(sql,
				{replacements:[arr[i].Sponsor.company,arr[i].Sponsor.email],
				type: sequelize.QueryTypes.CALL})	
		} catch (error) {
			console.log(error);
		}
		//Adding team to database
		try {
			var sql = `CALL insert_team (?,?,?,?,?,?,?,?,?)`;
			team =await sequelize.query(sql,
					{replacements:[coordinator_id,arr[i].description,arr[i].number,arr[i].SD1_Term,
					arr[i].SD1_Year,arr[i].SD2_Term,arr[i].SD2_Year,sponsorID[0]['LAST_INSERT_ID()'],arr[i].title],
					type: sequelize.QueryTypes.CALL})	
			} catch (error) {
				console.log(error);
			}
		//Creating Advisor Entry
		try {
			//Get team id to assign to advisor
			var team_id=team[0]['LAST_INSERT_ID()'];
			//Insert as user first
			var user= await sequelize.query(`CALL INSERT_USER(?,?,?,?,?,?)`,
				{replacements:[arr[i].Advisor.email.slice(0,arr[i].Advisor.email.toString().indexOf("@")),
				uuid4(),'advisor',
				arr[i].Advisor.last_name,arr[i].Advisor.first_name,arr[i].Advisor.email],
				type: sequelize.QueryTypes.CALL})
			//Retrieve new userID
			var uid= user[0]['LAST_INSERT_ID()'];
			let sql= `CALL insert_advisor(?,?)`;
			let advisor =await sequelize.query(sql,
				{replacements:[team_id,uid],
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
			//Get User ID based on name
			var result=await sequelize.query(`Select user_id from users where first_name= ? and last_name=?`,
			{replacements:[arr2[j].first_name,arr2[j].last_name],type: sequelize.QueryTypes.CALL})
			//Name not found
			if(result[0][0]===undefined)
			{
				continue;
			}
			//Assign student to team
			let sql=`CALL csv_assign_to_team(?,?)`;
			var results=await sequelize.query(sql,
					{replacements:[arr2[j].team,result[0][0]['user_id'],
					],type: sequelize.QueryTypes.CALL})	
		} catch (error) {
				console.log(error);
			}
	}
}
//Regular expression to validate emails	
function emailIsValid (email) {
		return /\S+@\S+\.\S+/.test(email)
}
//Function to create student users
async function studentparser(file)
{
	var array=[];
	//Doubling slashes to better handle them
	file.replace("/","//")
	//Create File Stream
	fs.createReadStream(file)
	.pipe(parse())
	.on('data', function(data){	
			//Verifying values are there
			if(data.NID =='' || data['First Name']=='' || data['Last Name']=='' || data.Email =='')
			{
				 return("Values Missing");
			}
			//Verifying email is correct
			if(!emailIsValid(data['Email Address']))
			{
				return("Invalid Email");
			}	
			//Building user object
			var user = {
				"nid":data['NID'],
				"first_name" : data['First Name'],
				"last_name" : data['Last Name'],
				"email":data['Email Address']
				};
			//Push user to array
			array.push(user);
	})
	.on('end', function(data) {
	  insert_students(array);
	});
	return ("Success");
}
//Function to create teams and assign students to said teams
async function teamparser(file,id)
{
	var students=[];
	var array=[];
	var switched=false;
	file.replace("/","//")
	/*
	Need to add check if file actually exists
	*/
	//Creating Stream to read .csv file
	fs.createReadStream(file)
	.pipe(parse())
	.on('data', function(data){
		//Move from retrieving teams to retrieving students
		if(data['Team Number']==""|| data['Team Number']=="First Name")
		{
			switched=true;
		}
		if(switched)
		{
			if(data['Team Number']!=undefined&&data['Team Number']!=""&&data['Team Number']!="Primary")
			{
				//Building student object
				var student=
				{
					"first_name":data['Team Number'],
					"last_name":data['Project Title'],
					"team":data['Project Description']
				}
				students.push(student);
			}
		}
		else
		{
			var SD1=data['SD1 Term'].split(" ");
			var SD2=data['SD2 Term'].split(" ");
			var Advisor=data['Advisor Name'].split(" ");
			//Verifying emails are properly structured
			if(!emailIsValid(data['Advisor Email'])||!emailIsValid(data['Sponsor Email']))
			{
				return("Email Invalid");
			}
			//Ensuring values are there
			if(data['Team Number']==''||data['Project Title']==''||data['SD1 Term']==''||data['SD2 Term']=='')
			{
				return("Values Missing");
			}
			//Building Team Object
			var team = {
				"number":data['Team Number'],
				"title":data['Project Title'],
				"description":data['Project Description'],
				"SD1_Term":SD1[0],
				"SD1_Year":SD1[1],
				"SD2_Term":SD2[0],
				"SD2_Year":SD2[1],
				"Advisor":
				{
					"first_name":Advisor[0],
					"last_name":Advisor[1],
					"email":data['Advisor Email']
				},
				"Sponsor":
				{
					"company":data['Sponsor Company'],
					"email":data['Sponsor Email']
				},
			};
			//Push to teams array
			array.push(team);
		}
	})
	.on('end', function(data) {
	  //insert teams and assign students
	  insert_teams(array,students,id);
	});
	return("Success");
}
module.exports = register_csv;