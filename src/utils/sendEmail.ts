import nodemailer from 'nodemailer';

export const sendEmail = async (options: any) => {
const transporter = nodemailer.createTransport({
    service:"gmail",

    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    // إضافة هذا الجزء لضمان عدم رفض الاتصال من السيرفرات الخارجية
    tls: {
        rejectUnauthorized: false
    }
});
const mailOptions = await transporter.sendMail({
   from: `Noor Store <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
})

 

  await transporter.sendMail(mailOptions);
};
