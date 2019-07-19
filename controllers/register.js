const { sequelize } = require('../models');
const bcrypt = require('bcrypt');
const uuid = require('uuidv4');
const mail = require('./mailer');
// const verifyStudent = require('../models/verifyStudentEmail');
const saltRounds = 10;

class register {
    static async register(req, res, next) {
        res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
        const { username, password, type, first_name, last_name, email } = req.body;

        // Generate a salt and then hash the password
        const salt = await bcrypt.genSalt(saltRounds);
        const hash = await bcrypt.hash(password, salt);

        // Insert into the DB but note that we are storing the hash instead of the plaintext password
        await sequelize.query(`CALL insert_user(?,?,?,?,?,?);`, 
        {replacements:[username, hash, type, last_name, first_name, email], type: sequelize.QueryTypes.CALL})
            .then(result => {
                // DB will return if insert was successful and how many rows were inserted.                
                res.send({ status: "Success" });
            }).catch(error => {
                // If error occurs, DB will send back JSON with a lot of information.
                // Thinking of adding more exceptions.
                console.log(error);
                if(error.parent.code === 'ER_DUP_ENTRY')
                    res.send({ err : "Duplicate"});
                else
                    res.send({ status : "Unkonw error"});
            });
    }

    static async verifyStudentEmail(req, res, next) {
        const { username } = req.body;
        const auth_code = uuid();

        // First check if verified
        // If they already are, send { status: "Already verified" } => redirect them to standard login page
        try {
            let result = await sequelize.query(`CALL get_student_verification(?)`, {replacements:[username], type: sequelize.QueryTypes.CALL});

            if(result[0] !== undefined) {
                if(result[0]['username'] === username) {
                    // Check if they are already verified
                    if(result[0]['is_verified'] === 1)
                        res.send({ status: "User Already Verified" });

                    try {
                        await sequelize.query(`CALL insert_auth_code(?,?)`, {replacements:[auth_code, username], type: sequelize.QueryTypes.CALL});
                        // mail.sendEmail(result[0]['email'], verifyStudentEmail.subject, verifyStudentEmail.body);
                        next;
                    }
                    catch(error) {
                        res.send({ status: "Failed" });
                        console.log(error);
                        next;
                    }
                }
            }
            else {
                res.send({ status: "User Not Found" });
            }
        } 
        catch(error) {
            res.send({ status: "MySQL Error" });
            console.log(error);
            next;
        }
    }

    static async verifyCode(req, res, next) {
        const { username, auth_code } = req.body;

        try {
            let result = await sequelize.query(`CALL get_auth_code(?)`, {replacements:[username], type: sequelize.QueryTypes.CALL});

            if(result[0] !== undefined) {
                if(result[0]['username'] === username) {
                    if(result[0]['auth_code'] === auth_code) {
                        await sequelize.query(`CALL student_verified(?)`, {replacements:[username], type: sequelize.QueryTypes.CALL});
                        res.send({ status: "Success" });
                    }
                    else {
                        res.send({ status: "Incorrect code" });
                    }
                }
            }
            else {
                res.send({ status: "User Not Found" });
            }
        }
        catch(error) {
            res.send({ status: "Failed" });
            console.log(error);
            next;
        }
    }

    static async setNewPassword(req, res, next) {
        const { username, new_password } = req.body;

        // Generate a salt and then hash the password
        const salt = await bcrypt.genSalt(saltRounds);
        const hash = await bcrypt.hash(new_password, salt);

        try {
            let result = await sequelize.query(`SELECT * FROM users WHERE username = ?`, {replacements:[username], type: sequelize.QueryTypes.SELECT});

            if(result[0] !== undefined) {
                if(result[0]['username'] === username) {
                    try {
                        await sequelize.query(`UPDATE users set password = ? WHERE username = ?`, {replacements:[hash, username], type: sequelize.QueryTypes.UPDATE});
                        res.send({ status: "Success" });
                    }
                    catch(error) {
                        res.send({ status: "Update Password Failed" });
                        console.log(error);
                        next;
                    }
                }
            }
            else {
                res.send({ status: "User Not Found" });
            }
        }
        catch(error) {
            res.send({ status: "Failed" });
            console.log(error);
            next;
        }
    }
}

module.exports = register;