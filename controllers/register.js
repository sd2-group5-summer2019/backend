const { sequelize } = require('../models');

class register {
    static async register(req, res, next) {
        res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
        const { username, password, type, first_name, last_name, email } = req.body;

        await sequelize.query(`INSERT INTO users (username, password, type, first_name, last_name, email) VALUES (?,?,?,?,?,?);`, 
        {replacements:[username, password, type, first_name, last_name, email], type: sequelize.QueryTypes.INSERT})
            .then(result => {
                // DB will return if insert was successful and how many rows were inserted.
                if(result[0] === 0)                     
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