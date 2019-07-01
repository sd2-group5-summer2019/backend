const { sequelize } = require('../models');
const bcrypt = require('bcrypt');
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
}

module.exports = register;