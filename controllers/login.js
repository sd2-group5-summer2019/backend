const { sequelize } = require('../models');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

function tokenForUser(user) {
  const timestamp = new Date().getTime();
  var payload = { username: user };
  console.log('This is the username', user);
  var token = jwt.sign(payload, config.secret, {
    expiresIn: '30 days',
    algorithm: 'HS256'
  });
  return token;
}

class login {
    static async login(req, res, next) {
        res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
        const { username, password } = req.body;

        const token = tokenForUser(username);
        console.log(token);

        await sequelize.query(`SELECT * FROM users WHERE username = ? AND password = ?`, {replacements:[username, password], type: sequelize.QueryTypes.SELECT})
            .then(result => {
                if(result[0] !== undefined) {
                    if(result[0].username === username && result[0].password === password) {
                        res.send({ token });
                    }
                }
                else {
                    res.send({ status: "Failure" });
                }
            })
            .catch(error => console.log(error));
    }

    // static async getStudentName(req, res, next) {
    //     jwt.verify(req.token, 'secretkey', (error, data) => {
    //         if(error) {
    //             res.sendStatus(403);
    //         } else {
    //             res.json({ "name": "Squidward Tentacles" });
    //         }
    //     });
    // }
}

module.exports = login;
