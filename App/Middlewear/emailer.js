const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  port: 587,
  secure: true,
  auth: {
    user: "vishudovetail@gmail.com",
    pass: "paexwljsttmlrjyp", 
  },
  starttls: {
    minVersion: "TLSv1.2",
    enabled: true,
  },
  debug: true,
});

async function forgotPassword(email,link) {
  try {
    const info = await transporter.sendMail({
      from: '"Support Team 👨‍💻" <vishudovetail@gmail.com>',
      to: email,
      subject: "Password Reset Link",
      text: `Click the following link to reset your password${link}`,
    //   html: `<p><a href="#">Click here</a> to reset your password</p>`,
    });

    console.log("Email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  forgotPassword,
};
