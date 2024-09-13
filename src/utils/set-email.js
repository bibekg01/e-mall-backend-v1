import dotenv from 'dotenv'
dotenv.config()
import nodemailer from 'nodemailer';


const sendEmail = (options) => {
    const transport = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    const mailOptions = {
        from: options.from,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
    };

    transport.sendMail(mailOptions, (error, info) => {
        if(error) {
            console.log('Error occurred while sending email: ', error);            
        } else {
            console.log('Email sent: ', info.response);
        }
    });
};

export default sendEmail;