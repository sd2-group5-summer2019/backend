const { sequelize } = require('../models');

class login {
    static async login(req, res, next) {
        res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
        const { id, passwd } = req.body;

        await sequelize.query(`SELECT * FROM student WHERE username = ? AND password = ?`, {replacements:[id, passwd], type: sequelize.QueryTypes.SELECT})
            .then(result => {
                if(result[0] !== undefined) {
                    if(result[0].username === id && result[0].password === passwd) {
                        res.send({ status: "Success" });
                    }
                }
                else {
                    res.send({ status: "Failure" });
                }
            })
            .catch(error => console.log(error));
    }
}

module.exports = login;