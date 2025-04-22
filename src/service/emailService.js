import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: 'ledat30052002@gmail.com',
    pass: 'zcqx inuq ghlr rkkv',
  }
});

const sendEmail = async (to, subject, text) => {
  try {
    const mailOptions = {
      from: '"Admin" <ledat30052002@gmail.com>',
      to,
      subject,
      text,
    };

    await transporter.sendMail(mailOptions);
    return { success: true, message: 'Email sent successfully!' };
  } catch (error) {
    console.error('Error sending email: ', error);
    return { success: false, message: 'Failed to send email!' };
  }
};

export default { sendEmail};