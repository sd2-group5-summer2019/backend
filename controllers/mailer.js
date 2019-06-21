const nodemailer = require('nodemailer');
const email = 'sd2group5@gmail.com';
const pass = 'thatsnotmywallet!123';
const sender = 'Spongebob Squarepants';

async function mailer() {

    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: email,
            pass: pass
        }
    });

    let info = await transporter.sendMail({
        from: `${sender} <${email}>`, 
        to: 'testemail@example.com', 
        subject: "Free Krabby Patties!!", 
        text: "Hello, there will be free krabby patties.",
    });

    console.log("Message sent: %s", info.messageId);
}

mailer().catch(console.error);