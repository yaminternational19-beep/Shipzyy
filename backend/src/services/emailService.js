import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const sendEmail = async (to, subject, text) => {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      text
    });

    console.log("Email sent to:", to);
  } catch (error) {
    console.error("Email sending failed:", error);
  }
};

const sendLoginOtp = async (email, otp) => {
  const subject = "Your Login OTP - DELIVERY APP";

  const text = `
Dear User,

Your One-Time Password (OTP) for logging in to your DELIVERY APP account is:

OTP: ${otp}

This OTP is valid for the next 5 minutes.

For security reasons, please do not share this OTP with anyone. Our team will never ask you for your OTP or password.

If you did not attempt to log in, please ignore this email or contact our support team immediately.

Regards,
DELIVERY APP Team
`;

  await sendEmail(email, subject, text);
};

const sendForgotPasswordOtp = async (email, otp) => {

  const subject = "Password Reset OTP - DELIVERY APP";

  const text = `
Dear User,

We received a request to reset the password for your DELIVERY APP account.

Your One-Time Password (OTP) for password reset is:

OTP: ${otp}

This OTP is valid for the next 5 minutes.

For security reasons, please do not share this OTP with anyone. Our team will never ask for your OTP or password.

If you did not request a password reset, please ignore this email or contact our support team immediately.

Regards,
DELIVERY APP Team
`;

  await sendEmail(email, subject, text);

};


const sendSubAdminWelcomeMail = async (email, password, name) => {
  // const adminUrl = process.env.ADMIN_URL || 'http://localhost:5173';
  const subject = "Welcome to DELIVERY APP - Sub-Admin Account Created";

  const text = `
Dear ${name},

Welcome to the DELIVERY APP team! Your Sub-Admin account has been successfully created by the Super Administrator.

You can now log in to the Admin Dashboard using the following credentials:

Admin Portal: ${adminUrl} Soon
Email: ${email}
Temporary Password: ${password}

Please log in and change your password immediately for security purposes.

If you have any questions or need assistance, please contact the system administrator.

Regards,
DELIVERY APP Team
`;

  await sendEmail(email, subject, text);
};

const sendVendorStaffWelcomeMail = async (email, password, name, vendorName) => {
  // const adminUrl = process.env.ADMIN_URL || 'http://localhost:5173';
  const subject = `Invitation to join ${vendorName} on DELIVERY APP`;

  const text = `
Dear ${name},

You have been added as a staff member for ${vendorName} on the DELIVERY APP Vendor Portal.

You can now access your vendor dashboard and manage operations using the credentials below:

Vendor Portal: ${adminUrl} soon
Email: ${email}
Temporary Password: ${password}

Please log in and change your password once you access the portal.

If you were not expecting this invitation, please contact your store manager or our support team.

Regards,
DELIVERY APP Team
`;

  await sendEmail(email, subject, text);
};


export default {
  sendEmail,
  sendLoginOtp,
  sendForgotPasswordOtp,
  sendSubAdminWelcomeMail,
  sendVendorStaffWelcomeMail
};