import nodemailer from 'nodemailer';
import dns from 'dns';

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
 * Custom DNS lookup that explicitly queries IPv4 A records via dns.resolve4.
 * Guarantees that Node/Nodemailer connects to a literal IPv4 address on Linux/Render containers,
 * completely bypassing glibc getaddrinfo IPv6 dual-stack resolution.
 */
const customIPv4Lookup = (hostname, options, callback) => {
  dns.resolve4(hostname, (err, addresses) => {
    if (err || !addresses || !addresses.length) {
      return dns.lookup(hostname, { family: 4, hints: 0 }, callback);
    }
    const ip = addresses[Math.floor(Math.random() * addresses.length)];
    callback(null, ip, 4);
  });
};

/**
 * Creates a Nodemailer transporter using dynamic environment settings (defaults to port 587 STARTTLS for cloud compatibility like Render).
 * Explicitly forces IPv4 resolution via dns.resolve4 and family: 4.
 */
export const createTransporter = (user, pass, customPort = null) => {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = customPort || (process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587);
  const secure = process.env.SMTP_SECURE !== undefined ? process.env.SMTP_SECURE === 'true' : port === 465;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    family: 4, // Force IPv4 socket family
    lookup: customIPv4Lookup,
    tls: {
      servername: host
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 15000
  });
};

/**
 * Call this once on server startup to verify SMTP credentials.
 * Logs a clear pass/fail to the console without logging sensitive passwords.
 */
export const verifySmtpConnection = async () => {
  const creds = getEmailCredentials();
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const defaultPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;

  console.log(`\n[EmailService] 🔌 Verifying SMTP connection (${host}:${defaultPort})...`);

  if (!creds) {
    console.warn('[EmailService] ⚠️  EMAIL_USER or EMAIL_PASS environment variables are not set.');
    console.warn('[EmailService] ⚠️  Emails will NOT be sent. Reset links will only appear in logs.\n');
    return;
  }

  const { allUsers } = creds;
  const passes = (process.env.EMAIL_PASS || '').split(',').map(s => s.trim()).filter(Boolean);

  for (let i = 0; i < allUsers.length; i++) {
    const user = allUsers[i];
    const pass = passes[i] || passes[0];

    if (!user || !pass) continue;

    let transporter = createTransporter(user, pass, defaultPort);

    try {
      await transporter.verify();
      console.log(`[EmailService] ✅ SMTP connection verified for index ${i}. Ready to send emails from: ${user} via ${host}:${defaultPort} (IPv4)`);
    } catch (error) {
      console.warn(`[EmailService] ⚠️  Port ${defaultPort} failed for ${user}: ${error.message}. Attempting fallback port...`);
      const fallbackPort = defaultPort === 587 ? 465 : 587;
      transporter = createTransporter(user, pass, fallbackPort);
      try {
        await transporter.verify();
        console.log(`[EmailService] ✅ SMTP connection verified on fallback port ${fallbackPort} for index ${i}. Ready to send emails from: ${user} (IPv4)`);
      } catch (fallbackErr) {
        console.error(`[EmailService] ❌ SMTP verification FAILED for ${user} on both ports (${defaultPort} & ${fallbackPort}):`, fallbackErr.message);
        console.error('[EmailService] 💡 Diagnostic Info:');
        if (fallbackErr.code === 'ENETUNREACH' || fallbackErr.message?.includes('ENETUNREACH')) {
          console.error('   • Network Route Unreachable (ENETUNREACH / IPv6 network error). Ensured family: 4 option forces IPv4 connection.');
        } else if (fallbackErr.code === 'EAUTH' || fallbackErr.responseCode === 535 || fallbackErr.message?.includes('Invalid login')) {
          console.error('   • SMTP Authentication Failed: Verify EMAIL_USER and EMAIL_PASS App Password in Render configuration.');
          console.error('   ➜ Fix: https://myaccount.google.com/apppasswords');
        } else if (fallbackErr.code === 'ETIMEDOUT' || fallbackErr.code === 'ESOCKET') {
          console.error('   • Connection Timeout: Cloud provider blocked outbound SMTP ports (587 & 465).');
        } else {
          console.error(`   • Details: ${fallbackErr.message}`);
        }
      }
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
  const users = (process.env.EMAIL_USER || '').split(',').map(s => s.trim()).filter(Boolean);
  const passes = (process.env.EMAIL_PASS || '').split(',').map(s => s.trim()).filter(Boolean);

  if (users.length === 0) {
    console.error('[EmailService] ❌ SMTP not configured. EMAIL_USER and EMAIL_PASS must be set in server/.env to send emails.');
    return {
      success: false,
      error: 'Email service is not configured. Please contact the administrator.'
    };
  }

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

  const textBody = `Hi there 👋,\n\nWe received a request to reset the password for your Smart Lunch Generator account.\n\nPlease click or copy and paste the following link into your browser to reset your password (link expires in 15 minutes):\n\n${resetLink}\n\nIf you did not request a password reset, you can safely ignore this email.\n\nBest regards,\nSmart Lunch Generator Team`;

  let lastError = null;
  for (let i = 0; i < users.length; i++) {
    const emailUser = users[i];
    const emailPass = passes[i] || passes[0];

    console.log(`[EmailService] 📤 Attempting to send email (${i + 1}/${users.length}) to: ${toEmail} via SMTP (${emailUser})...`);

    const defaultPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
    let transporter = createTransporter(emailUser, emailPass, defaultPort);

    try {
      const info = await transporter.sendMail({
        from: `"Smart Lunch Generator" <${emailUser}>`,
        to: toEmail,
        replyTo: emailUser,
        subject: '🔐 Reset Your Smart Lunch Generator Password',
        text: textBody,
        html: htmlBody,
        headers: {
          'X-Priority': '1',
          'X-MSMail-Priority': 'High',
          'Importance': 'High'
        }
      });

      console.log(`[EmailService] ✅ Email sent successfully via ${emailUser}!`);
      console.log(`[EmailService]    Message ID : ${info.messageId}`);
      console.log(`[EmailService]    Accepted   : ${info.accepted?.join(', ')}`);
      console.log(`[EmailService]    Rejected   : ${info.rejected?.join(', ') || 'none'}\n`);

      return { success: true, mode: 'smtp', messageId: info.messageId, sender: emailUser };
    } catch (error) {
      console.warn(`[EmailService] ⚠️  sendMail port ${defaultPort} failed for ${emailUser}: ${error.message}. Retrying on fallback port...`);
      const fallbackPort = defaultPort === 587 ? 465 : 587;
      transporter = createTransporter(emailUser, emailPass, fallbackPort);
      try {
        const info = await transporter.sendMail({
          from: `"Smart Lunch Generator" <${emailUser}>`,
          to: toEmail,
          replyTo: emailUser,
          subject: '🔐 Reset Your Smart Lunch Generator Password',
          text: textBody,
          html: htmlBody,
          headers: {
            'X-Priority': '1',
            'X-MSMail-Priority': 'High',
            'Importance': 'High'
          }
        });

        console.log(`[EmailService] ✅ Email sent successfully via ${emailUser} on fallback port ${fallbackPort}!`);
        console.log(`[EmailService]    Message ID : ${info.messageId}`);
        console.log(`[EmailService]    Accepted   : ${info.accepted?.join(', ')}`);
        return { success: true, mode: 'smtp', messageId: info.messageId, sender: emailUser };
      } catch (fallbackErr) {
        console.error(`[EmailService] ❌ sendMail FAILED for sender ${emailUser} on both ports:`, fallbackErr.message);
        lastError = fallbackErr;
      }
    }
  }

  let friendlyError = lastError?.message || 'Failed to send reset email. Please check server SMTP configuration.';
  if (lastError?.code === 'ENETUNREACH' || lastError?.message?.includes('ENETUNREACH')) {
    friendlyError = 'Mail server network route unreachable. Please verify server SMTP and network configuration.';
  } else if (lastError?.code === 'EAUTH' || lastError?.responseCode === 535 || lastError?.message?.includes('Invalid login')) {
    friendlyError = 'SMTP Authentication failed. Please verify EMAIL_USER and EMAIL_PASS App Password in server configuration.';
  } else if (lastError?.code === 'ESOCKET' || lastError?.code === 'ETIMEDOUT') {
    friendlyError = 'Mail server connection timed out. Please try again later.';
  }

  return { success: false, error: friendlyError, code: lastError?.code };
};
