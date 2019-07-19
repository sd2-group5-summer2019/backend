const { sequelize } = require('../models');

// This class at the moment contains the basic API requests for each of the columns in the student table (currently just hardcoded JSON)
class studentInfo {

    static async getAllStudents(req, res, next) {

        // Get all students based on user type.
        // Return the first, last, and user_id.

        const { type, user_id } = req.body;

        if(type === 'coordinator')
        {
            try
            {
                let studentList = await sequelize.query('CALL get_all_students_coordinator(?);', 
                {replacements:[ user_id ], type: sequelize.QueryTypes.CALL});
                
                res.send(studentList);
            }
            catch(error)
            {
                console.log(error);
                res.send({ status : "Get Students Failed" });
            }
        }

        if(type === 'advisor')
        {
            try
            {
                let studentList = await sequelize.query('CALL get_all_students_advisor(?);', 
                {replacements:[ user_id ], type: sequelize.QueryTypes.CALL});
                
                res.send(studentList);
            }
            catch(error)
            {
                console.log(error);
                res.send({ status : "Get Students Failed" });
            }
        }          
    }   
}

module.exports = studentInfo;
