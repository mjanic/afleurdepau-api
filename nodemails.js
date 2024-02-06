require('dotenv').config()
const nodemailer = require('nodemailer');

function sendConfirmationEmail(userEmail, activationToken) {
    const transporter = nodemailer.createTransport({
        service: "Gmail",
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
        user: "janic.testing@gmail.com",
        pass: process.env.EMAIL_PASS,
        },
    });

    const activationLink = `http://localhost:3001/activate/${activationToken}`;
    const mailOptions = {
        from: 'janic.testing@gmail.com',
        to: userEmail,
        subject: 'Confirm your Email',
        text: `Click on the following link to activate your account: ${activationLink}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
        console.error(error);
        } else {
        console.log('Email sent: ' + info.response);
        }
    });
}

function sendPasswordResetEmail(userEmail, resetToken) {
    const transporter = nodemailer.createTransport({
        service: "Gmail",
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
        user: "janic.testing@gmail.com",
        pass: process.env.EMAIL_PASS,
        },
    });

    const resetLink = `http://localhost:3000/reset-password/${resetToken}`;
    const mailOptions = {
        from: 'janic.testing@gmail.com',
        to: userEmail,
        subject: 'Password Reset',
        text: `Click on the following link to reset your password: ${resetLink}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
        console.error(error);
        } else {
        console.log('Email sent: ' + info.response);
        }
    });
}

module.exports = { sendConfirmationEmail, sendPasswordResetEmail };