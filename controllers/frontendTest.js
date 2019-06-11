const { sequelize } = require('../models');

class frontendTest {
    static async frontendTest(req, res, next) {
        res.send(req.body);
        
        /*
        res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
        const { username, password } = req.body;

        await sequelize.query(`CALL login(?,?)`, {replacements:[username, password], type: sequelize.QueryTypes.CALL})
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
            */
    }
}

module.exports = frontendTest;