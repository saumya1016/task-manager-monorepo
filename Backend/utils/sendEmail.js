const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',  // Use the direct Gmail host
    port: 465,               // Force Port 465 (Secure SSL)
    secure: true,            // Force Secure Connection
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"TaskFlow" <${process.env.EMAIL_USER}>`,
    to: to,
    subject: subject,
    html: html,
  };

  // Keep this log to confirm your variables are being read
  console.log("Debugging Email:", process.env.EMAIL_USER ? "User is set" : "User is MISSING", process.env.EMAIL_PASS ? "Pass is set" : "Pass is MISSING");
  
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;