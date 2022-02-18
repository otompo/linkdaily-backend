const nodemailer = require("nodemailer");

exports.sendEmail = async (options) => {
  // 1) create a transporter
  let transporter = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "1953d6ff4c8a58",
      pass: "c1122a5e58187a",
    },
  });
  // 2)Define the email options
  const message = {
    from: `${process.env.EMAIL_FROM_NAME} < ${process.env.EMAIL_FROM}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };
  // 3) Actually send the email
  await transporter.sendMail(message);
};
