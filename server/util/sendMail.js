const nodemailer = require("nodemailer");

module.exports = (options) => {
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  const mailOptions = {
    from: "adamsummak@gmail.com",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  transport.sendMail(mailOptions);
};
