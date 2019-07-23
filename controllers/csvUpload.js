const { sequelize } = require('../models/');
const parse = require('csv-parse');
const parser = parse({delimiter: ','});
const fs = require('fs');
const bcrypt = require('bcrypt');
const saltRounds = 10;

async function insertStudents(NID, last_name, first_name, email, sd1_term, sd1_year) {
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

class csvUpload {
    static uploadCSV(req, res, next) {
        const { file } = req.file;
        const { sd1_term, sd1_year } = req.body;

        const csvData = [];
        const inputStream = fs.createReadStream(req.file.path);

        inputStream.pipe(parser)
            .on('data', (csvRow) => {
                csvData.push(csvRow)
            })
            .on('end', () => {
                // Index # -> name
                // 3 -> NID, 4 -> last name, 5 -> first name, 7 -> email
                for(let i = 1; i < csvData.length; i++) {
                    insertStudents(csvData[i][3], csvData[i][4], csvData[i][5], csvData[i][7], sd1_term, sd1_year);
                }

                res.json('Upload Successful');
            });
    }
}

module.exports = csvUpload;