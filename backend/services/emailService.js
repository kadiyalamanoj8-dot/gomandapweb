const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', // You can change this to your Google Workspace SMTP
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_EMAIL || 'admin@gomandap.com',
    pass: process.env.SMTP_PASSWORD || 'your_app_password'
  }
});

const sendEmail = async (to, subject, htmlContent) => {
  try {
    const info = await transporter.sendMail({
      from: `"Gomandap Leads" <${process.env.SMTP_EMAIL || 'admin@gomandap.com'}>`,
      to,
      subject,
      html: htmlContent
    });
    console.log('Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    // We don't throw error to prevent breaking the main flow
    return false;
  }
};

module.exports = { sendEmail };
