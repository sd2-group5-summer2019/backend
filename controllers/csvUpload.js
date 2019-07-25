const { sequelize } = require('../models/');
const parse = require('csv-parse');
const parser = parse({delimiter: ','});
const csv = require('fast-csv');
const fs = require('fs');
const bcrypt = require('bcrypt');
const saltRounds = 10;

async function insertStudents(NID, last_name, first_name, email, sd1_term, sd1_year, res) {
    let new_user_id;
    let type = 'student';

    let current_date = (new Date()).valueOf().toString();
    let random = Math.random().toString();
    let tmp_pass = current_date + random;

    // Generate a salt and then hash the password
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(tmp_pass, salt);

    // insert the new user.
    try {
        let result = await sequelize.query(`CALL insert_user(?,?,?,?,?,?);`, 
            {replacements:[NID, hash, type, last_name, first_name, email], type: sequelize.QueryTypes.CALL});
            new_user_id = result[0]['LAST_INSERT_ID()'];
    }
    catch(error) {
        console.log(error);
        if(error.parent.code === 'ER_DUP_ENTRY')
            res.send({ err : "Duplicate" });
        else
            res.send({ status : "Unkown error" });
    }

    // Insert student
    try {
        await sequelize.query('CALL insert_student(?,?,?,?,?,?,?)',
            {replacements : [1, sd1_term, sd1_year, null, null, null, new_user_id], type : sequelize.QueryTypes.CALL});
    }
    catch(error) {
        res.send({ status: "Insert error" });
        console.log(error);
    }
}

async function insertTeams(teams, students, user_id, res) {
    let teamID = [];
    teamID.push(null);

    // teamID contains the teamID's after they are insert into the db
    // The index of teamID will correspond to the team number that is in the csv
    // Since there is no team 0, I have set that to null.

    for(let i = 0; i < teams.length; i++) {
        // Insert team
        try {
            let result = await sequelize.query('CALL insert_team(?,?,?,?,?,?,?)',
                {replacements: [teams[i][2], teams[i][1], teams[i][3], teams[i][4], teams[i][5], teams[i][6], user_id],
                type: sequelize.QueryTypes.CALL});
            newTeamID = result[0]['LAST_INSERT_ID()'];
            teamID.push(newTeamID);
            // console.log(newTeamID);
        }
        catch(error) {
            console.log(error);
            // res.send({status: "create team failed"});
        }
    }

    // console.log(teamID);

    for(let i = 0; i < students.length; i++) {
        let student_id;
        let studentTeamNum = students[i][3];
        // console.log('Team Num:', studentTeamNum);
        let team_id = teamID[studentTeamNum];
        // console.log('Team ID:', team_id);

        try {
            let result = await sequelize.query(
                'SELECT student_id FROM students INNER JOIN users ON students.user_id = users.user_id WHERE users.user_id = (SELECT user_id FROM users WHERE username = ?)',
                {replacements: [students[i][2]], 
                type: sequelize.QueryTypes.SELECT});
            student_id = result[0]['student_id'];
        }
        catch(error) {
            console.log(error);
        }

        // Insert student 
        try {
            await sequelize.query('CALL update_student_with_team(?,?)',
                {replacements: [student_id, team_id],
                type: sequelize.QueryTypes.CALL});
        }
        catch (error) {
            console.log(error);
        }
    }
}

class csvUpload {
    static uploadStudentCSV(req, res, next) {
        const { file } = req.file;
        const { sd1_term, sd1_year } = req.body;

        const students = [];
        
        csv.parseFile(req.file.path)
            .on('data', (csvRow) => {
                students.push(csvRow)
            })
            .on('end', () => {
                // Index # -> name
                // 3 -> NID, 4 -> last name, 5 -> first name, 7 -> email
                for(let i = 1; i < students.length; i++) {
                    insertStudents(students[i][3], students[i][4], students[i][5], students[i][7], sd1_term, sd1_year, res);
                }
                res.json('Upload Successful');     
            });
    }

    static uploadTeamCSV(req, res, next) {
        const { file } = req.file;
        const { user_id } = req.body;

        const csvData = [];
        const teams = [];
        const students = [];

        csv.parseFile(req.file.path)
            .on('data', (csvRow) => {
                csvData.push(csvRow)
            })
            .on('end', () => {
                // This lets us keep track of whether we are inserting teams or students
                let isStudent = false;

                // Based on the CSV, Row 0 should be
                // Team #, Project Title, Description, SD1 Term, SD1 Year, SD2 Term, SD2 Year, Sponsor, Sponsor Email

                // The first row to indicate students will be
                // First Name, Last Name, NID, Team Number

                for(let i = 1; i < csvData.length; i++) {
                    if(csvData[i][0] === '') continue;

                    if(csvData[i][0] === 'First Name') {
                        isStudent = true;
                        continue;
                    }

                    if(isStudent === false) {
                        // insertTeam(csvData[i], user_id, res); 
                        // console.log(result);
                        // teamID.push(result[0]['LAST_INSERT_ID()']);
                        teams.push(csvData[i]);
                    }
                    else if(isStudent === true) {
                        students.push(csvData[i]);
                        // insertStudentToTeam(csvData[i]);
                    }        
                }

                insertTeams(teams, students, user_id, res);
                res.json('Upload Successful');
            });        
    }
}

module.exports = csvUpload;