const nodemailer = require('nodemailer');
const config = require('../config/config');
// const sender = 'Spongebob Squarepants';
// const toEmail = 'sd2group5@gmail.com';
// const subject = 'Test email';
// const body = 'Hello, there will be free krabby patties.'

// async function mailer(toEmail, sender, subject, body) {

//     let transporter = nodemailer.createTransport({
//         service: 'gmail',
//         auth: {
//             user: config.email,
//             pass: config.password
//         }
//     });

//     let info = await transporter.sendMail({
//         from: `${sender} <${config.email}>`, 
//         to: toEmail, 
//         subject: subject, 
//         text: body
//     });

//     console.log("Message sent: %s", info.messageId);
// }

module.exports = {
    sendEmail: async function(toEmail, subject, body) {

        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: config.email,
                pass: config.password
            }
        });
    
        let info = await transporter.sendMail({
            from: `${config.sender} <${config.email}>`, 
            to: toEmail, 
            subject: subject, 
            text: body
        });
    
        console.log("Message sent: %s", info.messageId);
    }
}

// This is just for testing purposes
// mailer(toEmail, sender, subject, body).catch(console.error);