const { sequelize } = require('../models');

class frontendTest {
    static async frontendTest(req, res, next) {

        let assignments = [
            {title:'title1', form_id:'1', complete:'true'},
            {title:'title2', form_id:'6', complete:'true'},
            {title:'title3', form_id:'7', complete:'true'}
        ]
        res.send(assignments);
        
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