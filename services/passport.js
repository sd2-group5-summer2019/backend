const { sequelize } = require('../models/');
const config = require('../config/config');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;


// Setup options for JWT Strategy - Get the Token in FormHeader to Authenticate the endpoint.
var jwtOptions = {};
jwtOptions.jwtFromRequest =  ExtractJwt.fromHeader('authorization');
jwtOptions.secretOrKey = config.secret;
jwtOptions.algorithms = 'HS256';
//jwtOptions.ignoreExpiration = false; // default is false.. no need to say explicitly.
console.log('Test -1 ');
//jwtOptions.audience = 'localhost'; // eventually this come from configfile
//jwtOptions.issuer = 'localhost'; // this comes from config file

// Create JWT strategy
const jwtLogin = new JwtStrategy(jwtOptions, function(jwt_payload, done) {
    // See if the user ID in the payload exists in our database
    // If it does, call 'done' with that other
    // otherwise, call done without a user object

    //console.log('payload received', jwt_payload);
    var username = jwt_payload.username;
   // console.log(email);

    sequelize.query(`SELECT * FROM users WHERE username = ?`,
        { replacements: [username], type: sequelize.QueryTypes.SELECT }
    )
        .then(function(results) {
            console.log(results);
            if (results[0]['username'] === username) {
                done(null, username);
            } else {
                done(null, false);
            }
        })

});

// Tell passport to use this strategy
passport.use(jwtLogin);
