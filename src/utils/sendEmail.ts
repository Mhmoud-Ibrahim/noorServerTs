import nodemailer from 'nodemailer';
import { emailTemlate } from './emailtemplate.js';

export const sendEmail = async (options: any) => {
const transporter = nodemailer.createTransport({
    service:"gmail",

    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
   
    tls: {
        rejectUnauthorized: false
    }
});


// كود صحيح
const messageConfig = {
   from: `Noor Store <${process.env.EMAIL_USER}>`,
   to: options.email,
   subject: options.subject,
   html: emailTemlate(options.message)
};

const info = await transporter.sendMail(messageConfig);
return info;

 

};
