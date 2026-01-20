const nodemailer = require('nodemailer');
const dns = require('dns');

// 1. FORCE IPv4 (Fixes the Timeout/Network Crash on Render)
// Node.js defaults to IPv6, which often fails on cloud servers connecting to Gmail.
try {
  dns.setDefaultResultOrder('ipv4first');
} catch (e) {
  console.log("Could not set IPv4 preference (Node version too old?), proceeding anyway...");
}

const sendEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', 
    port: 587,              // 2. Use Port 587 (Standard Submission)
    secure: false,          // 3. Must be FALSE for Port 587
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false, // 4. Accept self-signed certs (prevents handshake errors)
      ciphers: 'SSLv3'           // 5. Force compatibility
    },
    connectionTimeout: 10000,    // 6. Fail after 10 seconds (don't hang forever)
  });

  const mailOptions = {
    from: `"TaskFlow" <${process.env.EMAIL_USER}>`,
    to: to,
    subject: subject,
    html: html,
  };

  try {
    console.log(`Attempting to send email to ${to} via Port 587 (IPv4)...`);
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);
    return info;
  } catch (error) {
    console.error("FINAL EMAIL ERROR:", error);
    throw error;
  }
};

module.exports = sendEmail;