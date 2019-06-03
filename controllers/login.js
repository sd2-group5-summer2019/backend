const { sequelize } = require('../models');

class login {
    static async login(req, res, next) {
        res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
        const { username, password } = req.body;

        await sequelize.query(`SELECT * FROM users WHERE username = ? AND password = ?`, {replacements:[username, password], type: sequelize.QueryTypes.SELECT})
            .then(result => {
                if(result[0] !== undefined) {
                    if(result[0].username === username && result[0].password === password) {
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