const { sequelize } = require('../models');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const bcrypt = require('bcrypt');
const saltRounds = 10;

function tokenForUser(user) {
  const timestamp = new Date().getTime();
  var payload = { username: user };
  var token = jwt.sign(payload, config.secret, {
    expiresIn: '30 days',
    algorithm: 'HS256'
  });
  return token;
}

// Return true if oldPass is valid
// Return false if not valid.
async function changePassword(oldPass, dbHash) {
    console.log('Checking Password');
    const match = await bcrypt.compare(oldPass, dbHash);

    if(match) return true;

    return false;
}  

// ASYNC/AWAIT function to compare user input password vs the db hash
async function comparePassword(inputPassword, dbHash, res) {
    const match = await bcrypt.compare(inputPassword, dbHash)

    if(match) {
        res.send({ status: "Success" });
    } else {
        res.send({ status: "Failure: Incorrect Password" });
    }
}

// ASYNC/AWAIT function to compare user input password vs the db hash (WITH TOKEN)
async function comparePasswordSecure(inputPassword, dbHash, result, token, res) {
    const match = await bcrypt.compare(inputPassword, dbHash);
    const user_id = result.user_id;
    const type = result.type;

    if(match) {
        res.send({ 
            user_id: user_id,
            type: type,
            token: token
        });
    } else {
        res.send({ status: "Failure: Incorrect Password" });
    }
}

class login {
    static async login(req, res, next) {
        res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
        const { username, password } = req.body;

        // Only query the username in the db
        await sequelize.query(`SELECT * FROM users WHERE username = ?`, {replacements:[username], type: sequelize.QueryTypes.SELECT})
            .then(result => {
                if(result[0] !== undefined) {  
                    if (result[0]['username'] === username) {
                        // Compare user entered password to DB hashed password  
                        comparePassword(password, result[0]['password'], res);  
                    }
                }
                else {
                    res.send({ status: "Failure" });
                }
            })
            .catch(error => console.log(error));
    }

    static async login_secure(req, res, next) {
        res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
        const { username, password } = req.body;

        const token = tokenForUser(username);
    
        await sequelize.query(`SELECT * FROM users WHERE username = ?`, {replacements:[username], type: sequelize.QueryTypes.SELECT})
            .then(result => {
                if(result[0] !== undefined) {  
                    if (result[0]['username'] === username) {
                        // Compare user entered password to DB hashed password  
                        console.log(result);
                        comparePasswordSecure(password, result[0]['password'], result[0], token, res);  
                    }
                }
                else {
                    res.send({ status: "Failure" });
                }
            })
            .catch(error => console.log(error));
    }

    static async changePassword(req, res, next) {
        
        const { username, oldPass, newPass } = req.body;
        console.log(req.body);

        try {
            let result = await sequelize.query(`SELECT * FROM users WHERE username = ?`, {replacements:[username], type: sequelize.QueryTypes.SELECT});

            console.log('Got user');
            if(result[0] !== undefined) {
                if(result[0]['username'] === username) {
                    let change = await changePassword(oldPass, result[0]['password']);

                    console.log(change);
                    if(!change) {
                        res.send({ status: "Incorrect Password" });
                    }
                    else {
                        // Generate a salt and then hash the password
                        const salt = await bcrypt.genSalt(saltRounds);
                        const hash = await bcrypt.hash(newPass, salt);

                        console.log(hash);
                        // Insert "hash" as the new password for the user
                        try {
                            await sequelize.query(`UPDATE users set password = ? WHERE username = ?`, {replacements:[hash, username], type: sequelize.QueryTypes.UPDATE});
                            console.log('Inserted new hash');
                            res.send({ status: "Success" });
                        }
                        catch(error) {
                            console.log(error);
                            next;
                        }
                    }
                }
            }
        }
        catch(error) {
            console.log(error);
            res.send({ status: "MySQL Error" });
        }
    }
}

module.exports = login;
