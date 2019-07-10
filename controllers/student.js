const { sequelize } = require('../models');

// This class at the moment contains the basic API requests for each of the columns in the student table (currently just hardcoded JSON)
class studentInfo {

    static async getAllStudents(req, res, next) {
        res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');

        await sequelize.query('CALL get_all_students();', {type: sequelize.QueryTypes.CALL})
            .then(result => res.send(result))
            .catch(error => {
                console.log(error);
                res.send({ status: "Request failed" });
            });            
    }   
}

module.exports = studentInfo;
