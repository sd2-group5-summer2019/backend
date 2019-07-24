const { sequelize } = require('../models');
const bcrypt = require('bcrypt');
const saltRounds = 10;

class register {
    static async register(req, res, next) {
        const { username, password, type, first_name, last_name, email } = req.body;

        // Generate a salt and then hash the password
        const salt = await bcrypt.genSalt(saltRounds);
        const hash = await bcrypt.hash(password, salt);

        let new_user_id;
        // insert the new user.
        try{
            let result = await sequelize.query(`CALL insert_user(?,?,?,?,?,?);`, 
            {replacements:[username, hash, type, last_name, first_name, email], type: sequelize.QueryTypes.CALL});
            new_user_id = result[0]['LAST_INSERT_ID()'];
        }catch(error){
            console.log(error);
            if(error.parent.code === 'ER_DUP_ENTRY')
                res.send({ err : "Duplicate" });
            else
                res.send({ status : "Unkonw error" });
        }

        // Based on user type, insert into respected table.
        if(type == 'coordinator'){
            try{
                await sequelize.query('CALL insert_coordinator(?,?)',
                {replacements : [1, new_user_id],
                type : sequelize.QueryTypes.CALL});
            }catch(error){
                res.send({ status: "Insert error" });
                console.log(error);
            }
        }
        else if(type == 'student'){
            const { sd1_term, sd1_year, sd2_term, sd2_year } = req.body;
            try{
                await sequelize.query('CALL insert_student(?,?,?,?,?,?,?)',
                {replacements : [1, sd1_term, sd1_year, sd2_term, sd2_year, null, new_user_id],
                type : sequelize.QueryTypes.CALL});
            }catch(error){
                res.send({ status: "Insert error" });
                console.log(error);
            }
        }
        else if(type == 'advisor'){
            try{
                await sequelize.query('CALL insert_advisor(?,?)',
                {replacements : [null, new_user_id],
                type : sequelize.QueryTypes.CALL});
            }catch(error){
                res.send({ status: "Insert error" });
                console.log(error);
            }
        }
        res.send({ status : "success"});
    }

    static async verifyCode(req, res, next) {
        const { username, auth_code } = req.body;
        // console.log(req.body);

        try {
            let result = await sequelize.query(`CALL get_auth_code(?)`, {replacements:[username], type: sequelize.QueryTypes.CALL});
            // console.log(result[0]);
            if(result[0] !== undefined) {
                if(result[0]['username'] === username) {
                    if(result[0]['auth_code'] === auth_code) {
                        try {
                            await sequelize.query(`CALL student_verified(?)`, {replacements:[username], type: sequelize.QueryTypes.CALL});
                            res.send({ status: "Success" });
                        }
                        catch(error) {
                            console.log(error);
                            res.send({ status: "Student verify fail" });
                        }
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
        }
    }
}

module.exports = register;