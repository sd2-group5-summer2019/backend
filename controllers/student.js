const { sequelize } = require('../models');

// This class at the moment contains the basic API requests for each of the columns in the student table (currently just hardcoded JSON)
class studentInfo {

    static async getAllStudents(req, res, next) {

        // Get all students based on user type.
        // Return the first, last, and user_id.

<<<<<<< HEAD
        const { type, user_id } = req.body;

        if (type === 'coordinator') {
            try {
                let studentList = await sequelize.query('CALL get_all_students_coordinator(?)', { replacements: [user_id], type: sequelize.QueryTypes.CALL });
=======
        const { user_id, type } = req.body;
        
        if(type == 'coordinator')
        {
            try
            {
                let studentList = await sequelize.query('CALL get_all_students_coordinator(?)', 
                {replacements:[ user_id ], type: sequelize.QueryTypes.CALL});
>>>>>>> 0e08e661a7610450759b821107c2988c4b27ea0f
                console.log(studentList);
                res.send(studentList);
            } catch (error) {
                console.log(error);
                res.send({ status: "Get Students Failed" });
            }
        }

        if (type === 'advisor') {
            try {
                let studentList = await sequelize.query('CALL get_all_students_advisor(?);', { replacements: [user_id], type: sequelize.QueryTypes.CALL });

                res.send(studentList);
            } catch (error) {
                console.log(error);
                res.send({ status: "Get Students Failed" });
            }
        }
    }

    // Students will be inactive and not verified.
    // Will return the new student id if inserted.
    static async insertStudent(res, req, next) {
        const { degree_id, sd1_term, sd1_year, sd2_term, sd2_year, team_id, user_id } = req.body;

        let lastInsertID;

        try {
            lastInsertID = await sequelize.query('CALL insert_student(?,?,?,?,?,?,?)', {
                replacements: [degree_id, sd1_term, sd1_year, sd2_term, sd2_year, team_id, user_id],
                type: sequelize.QueryTypes.CALL
            });
        } catch (error) {
            console.log("insert student failed");
            res.send({ status: "insert student failed" });
        }
        res.send({ status: "insert student success", newStudentID: lastInsertID });
    }

    static async updateStudent() {

        const { degree_id, sd1_term, sd1_year, sd2_term, sd2_year, team_id, user_id } = req.body;

        try {
            await sequelize.query('CALL update_student(?,?,?,?,?,?)', {
                replacements: [degree_id, sd1_term, sd1_year, sd2_term, sd2_year, team_id, user_id],
                types: sequelize.QueryTypes.CALL
            });
        } catch (error) {
            console.log("update student failed");
            res.send({ status: "update student failed" });
        }
        res.send({ status: "update student success" });
    }
}

module.exports = studentInfo;