import nodemailer from 'nodemailer';
import { htmlEmail } from './htmlEmail.js';

export const sendTheEmail = async (options: any) => {
const transporter = nodemailer.createTransport({
    service:"gmail",
    auth: {
      user: process.env.EMAIL_USER as any,
      pass: process.env.EMAIL_PASS as any,
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
   html: htmlEmail(options.message)
};

const info = await transporter.sendMail(messageConfig);
return info;

 

};
