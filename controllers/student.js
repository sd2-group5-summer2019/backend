const { sequelize } = require('../models');

// This class at the moment contains the basic API requests for each of the columns in the student table (currently just hardcoded JSON)
class studentInfo {

    static async getStudentName(req, res, next) {
        res.send({ "name": "Spongebob Squarepants" });
    }

    static async getStudentID(req, res, next) {
        res.send({ "ID": "sp12345" });
    }
}

module.exports = studentInfo;