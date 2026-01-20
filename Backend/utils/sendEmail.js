const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', // 1. Use the actual host, not the service alias
    port: 465,              // 2. Force Port 465 (Secure SSL)
    secure: true,           // 3. This MUST be true for Port 465 to work
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      // 4. This prevents "Self-Signed Certificate" errors on Render
      rejectUnauthorized: false 
    }
  });

  const mailOptions = {
    from: `"TaskFlow" <${process.env.EMAIL_USER}>`,
    to: to,
    subject: subject,
    html: html,
  };

  try {
    console.log(`Attempting to send email to ${to} via Port 465...`);
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);
    return info;
  } catch (error) {
    console.error("Nodemailer Error:", error);
    throw error;
  }
};

module.exports = sendEmail;