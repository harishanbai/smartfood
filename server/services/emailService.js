import nodemailer from 'nodemailer';

// Do NOT read process.env at module load time — dotenv may not have run yet.
// Always read inside functions so the values are resolved at call time.

/**
 * Resolves credentials for a given sender email from the comma-separated EMAIL_USER/EMAIL_PASS config.
 */
export const getEmailCredentials = (selectedSender = null) => {
  const users = (process.env.EMAIL_USER || '').split(',').map(s => s.trim()).filter(Boolean);
  const passes = (process.env.EMAIL_PASS || '').split(',').map(s => s.trim()).filter(Boolean);

  if (users.length === 0) {
    return null;
  }

  let index = 0;
  if (selectedSender) {
    const foundIndex = users.indexOf(selectedSender.trim());
    if (foundIndex !== -1) {
      index = foundIndex;
    }
  }

  const user = users[index];
  const pass = passes[index] || passes[0];

  return { user, pass, allUsers: users };
};

/**
 * Creates a Nodemailer transporter using Gmail SMTP.
 */
const createTransporter = (selectedSender = null) => {
  const creds = getEmailCredentials(selectedSender);
  if (!creds || !creds.user || !creds.pass) {
    return null;
  }
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user: creds.user, pass: creds.pass }
  });
};

/**
 * Call this once on server startup to verify SMTP credentials.
 * Logs a clear pass/fail to the console.
 */
export const verifySmtpConnection = async () => {
  const creds = getEmailCredentials();

  console.log('\n[EmailService] 🔌 Verifying SMTP connection...');

  if (!creds) {
    console.warn('[EmailService] ⚠️  EMAIL_USER or EMAIL_PASS is not set in .env');
    console.warn('[EmailService] ⚠️  Emails will NOT be sent. Reset links will only appear in the console.\n');
    return;
  }

  const { allUsers } = creds;
  const passes = (process.env.EMAIL_PASS || '').split(',').map(s => s.trim()).filter(Boolean);

  for (let i = 0; i < allUsers.length; i++) {
    const user = allUsers[i];
    const pass = passes[i] || passes[0];

    if (!user || !pass) continue;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass }
    });

    try {
      await transporter.verify();
      console.log(`[EmailService] ✅ SMTP connection verified for index ${i}. Ready to send emails from: ${user}`);
    } catch (error) {
      console.error(`[EmailService] ❌ SMTP verification FAILED for ${user}:`, error.message);
      console.error('[EmailService] 💡 Common causes:');
      console.error('   • Wrong EMAIL_USER or EMAIL_PASS in .env');
      console.error('   • Gmail 2FA not enabled (required for App Passwords)');
      console.error('   • Using your real Gmail password instead of an App Password');
      console.error('   • Less Secure App access blocked by Google');
      console.error('   ➜  Fix: https://myaccount.google.com/apppasswords');
    }
  }
  console.log('');
};

/**
 * Sends a styled password reset email via Gmail SMTP.
 * Always prints the reset link to the console for local testing.
 *
 * @param {string} toEmail      - Recipient email address
 * @param {string} resetLink    - Full reset URL with token
 * @param {string} senderEmail  - Optional selected sender email
 * @returns {{ success: boolean, mode?: string, error?: string }}
 */
export const sendPasswordResetEmail = async (toEmail, resetLink, senderEmail = null) => {
  const creds = getEmailCredentials(senderEmail);
  // ── Always log the link so you can copy-paste it for local testing ──
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🔗 TEST RESET LINK for ${toEmail}:`);
  console.log(`   ${resetLink}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (!creds || !creds.user || !creds.pass) {
    console.warn('[EmailService] ⚠️  SMTP not configured. Running in console-only mode.');
    return { success: true, mode: 'console' };
  }

  const { user: emailUser, pass: emailPass } = creds;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: emailUser, pass: emailPass }
  });

  const htmlBody = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>Password Reset</title>
    </head>
    <body style="margin:0;padding:0;background-color:#0f172a;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 0;">
        <tr>
          <td align="center">
            <table width="560" cellpadding="0" cellspacing="0"
              style="background:#1e293b;border-radius:16px;overflow:hidden;border:1px solid #334155;max-width:560px;width:100%;">

              <!-- Header -->
              <tr>
                <td style="background:linear-gradient(135deg,#059669,#0d9488);padding:36px 40px;text-align:center;">
                  <div style="font-size:28px;margin-bottom:8px;">🍱</div>
                  <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.5px;">
                    Smart Lunch Generator
                  </h1>
                  <p style="margin:6px 0 0;color:#d1fae5;font-size:13px;font-weight:500;letter-spacing:1px;text-transform:uppercase;">
                    Password Reset Request
                  </p>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding:40px;">
                  <p style="margin:0 0 16px;color:#94a3b8;font-size:14px;line-height:1.6;">
                    Hi there 👋,
                  </p>
                  <p style="margin:0 0 24px;color:#cbd5e1;font-size:15px;line-height:1.7;">
                    We received a request to reset the password for your Smart Lunch Generator account.
                    Click the button below to set a new password. This link will expire in
                    <strong style="color:#34d399;">15 minutes</strong>.
                  </p>

                  <!-- CTA Button -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="padding:8px 0 32px;">
                        <a href="${resetLink}"
                           style="display:inline-block;background:linear-gradient(135deg,#059669,#0d9488);color:#ffffff;
                                  text-decoration:none;font-size:15px;font-weight:700;padding:14px 36px;
                                  border-radius:10px;letter-spacing:0.3px;box-shadow:0 4px 14px rgba(5,150,105,0.4);">
                          🔐 Reset My Password
                        </a>
                      </td>
                    </tr>
                  </table>

                  <p style="margin:0 0 12px;color:#64748b;font-size:13px;line-height:1.6;">
                    If the button doesn't work, copy and paste this link into your browser:
                  </p>
                  <div style="background:#0f172a;border:1px solid #334155;border-radius:8px;padding:12px 16px;word-break:break-all;">
                    <a href="${resetLink}" style="color:#34d399;font-size:12px;text-decoration:none;">${resetLink}</a>
                  </div>

                  <p style="margin:28px 0 0;color:#475569;font-size:13px;line-height:1.6;">
                    If you did not request a password reset, you can safely ignore this email.
                    Your account will remain secure.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background:#0f172a;padding:20px 40px;text-align:center;border-top:1px solid #1e293b;">
                  <p style="margin:0;color:#334155;font-size:12px;">
                    © ${new Date().getFullYear()} Smart Lunch Generator. All rights reserved.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  console.log(`[EmailService] 📤 Attempting to send email to: ${toEmail} via SMTP (${emailUser})...`);

  try {
    const info = await transporter.sendMail({
      from: `"Smart Lunch Generator" <${emailUser}>`,
      to: toEmail,
      subject: '🔐 Reset Your Smart Lunch Generator Password',
      html: htmlBody
    });

    console.log(`[EmailService] ✅ Email sent successfully!`);
    console.log(`[EmailService]    Message ID : ${info.messageId}`);
    console.log(`[EmailService]    Accepted   : ${info.accepted?.join(', ')}`);
    console.log(`[EmailService]    Rejected   : ${info.rejected?.join(', ') || 'none'}\n`);

    return { success: true, mode: 'smtp', messageId: info.messageId };
  } catch (error) {
    console.error('\n[EmailService] ❌ sendMail FAILED!');
    console.error(`[EmailService]    Error Code   : ${error.code}`);
    console.error(`[EmailService]    Error Message: ${error.message}`);
    console.error(`[EmailService]    Response     : ${error.response || 'N/A'}\n`);
    return { success: false, error: error.message, code: error.code };
  }
};
