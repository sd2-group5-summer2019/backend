const { sequelize } = require('../models');

class login {
    static async login(req, res, next) {
        const { id, passwd } = req.body;
        
        await sequelize.query(`SELECT * FROM student WHERE NID = ? AND passwd = ?`, {replacements:[id, passwd], type: sequelize.QueryTypes.SELECT})
            .then(result => {
                console.log(result[0]);
                if(result[0].NID === id && result[0].passwd === passwd) {
                    console.log('Match!'); // Temporary placeholder, still trying to figure out how exactly to do this part
                }
            })
            .catch(error => console.log(error));

        res.send({ "status": "Success" });
    }
}

module.exports = login;