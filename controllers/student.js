const { sequelize } = require('../models');

// This class at the moment contains the basic API requests for each of the columns in the student table (currently just hardcoded JSON)
class studentInfo {

    static async getStudentName(req, res, next) {
        console.log('InsideGetStudent');
        res.json({ "name": "Squidward Tentacles" });
    }

    static async getStudentID(req, res, next) {
        res.send({ "ID": "sp12345" });
    }
}

module.exports = studentInfo;
