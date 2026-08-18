import nodemailer from 'nodemailer';

// Do NOT read process.env at module load time — dotenv may not have run yet.
// Always read inside functions so the values are resolved dynamically at call time.

// ─────────────────────────────────────────────────────────────────────────────
// Utility & Sanitization Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Strips accidental wrapping quotes (single or double) and trims whitespace.
 */
export const cleanEnv = (val) => {
  if (val === undefined || val === null) return '';
  let str = String(val).trim();
  if ((str.startsWith('"') && str.endsWith('"')) || (str.startsWith("'") && str.endsWith("'"))) {
    str = str.slice(1, -1).trim();
  }
  return str;
};

/**
 * Sanitizes password/secret string by removing outer quotes and internal whitespace
 * (especially helpful for Google 16-character App Passwords generated with spaces).
 */
export const cleanPassword = (val) => {
  if (val === undefined || val === null) return '';
  let str = cleanEnv(val);
  return str.replace(/\s+/g, '');
};

// ─────────────────────────────────────────────────────────────────────────────
// Credential & Config Resolvers (100% dynamic from Environment Variables)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Resolves SMTP configuration options dynamically from environment variables.
 */
export const getSmtpConfig = () => {
  const host = cleanEnv(process.env.SMTP_HOST) || 'smtp.gmail.com';
  const rawPort = cleanEnv(process.env.SMTP_PORT);
  const port = rawPort ? parseInt(rawPort, 10) : 587;

  let secure;
  const rawSecure = cleanEnv(process.env.SMTP_SECURE);
  if (rawSecure !== '') {
    secure = rawSecure === 'true';
  } else {
    secure = port === 465;
  }

  const rawUser = cleanEnv(process.env.SMTP_USER || process.env.EMAIL_USER);
  const rawPass = cleanPassword(process.env.SMTP_PASS || process.env.EMAIL_PASS);
  const rawFrom = cleanEnv(process.env.EMAIL_FROM || process.env.SMTP_FROM || process.env.MAIL_FROM);

  return {
    host,
    port,
    secure,
    user: rawUser,
    pass: rawPass,
    from: rawFrom
  };
};

/**
 * Resolves SMTP credentials with support for multiple fallback accounts if configured.
 */
export const getEmailCredentials = (selectedSender = null) => {
  const config = getSmtpConfig();
  const smtpUser = config.user;
  const smtpPass = config.pass;

  // Support legacy comma-separated lists if multiple accounts are configured
  const users = (cleanEnv(process.env.EMAIL_USER) || '').split(',').map(s => cleanEnv(s)).filter(Boolean);
  const passes = (cleanEnv(process.env.EMAIL_PASS) || '').split(',').map(s => cleanPassword(s)).filter(Boolean);

  const allUsers = smtpUser ? [smtpUser, ...users.filter(u => u !== smtpUser)] : users;
  const allPasses = smtpUser ? [smtpPass, ...passes] : passes;

  if (allUsers.length === 0) return null;

  let index = 0;
  if (selectedSender) {
    const foundIndex = allUsers.indexOf(cleanEnv(selectedSender));
    if (foundIndex !== -1) index = foundIndex;
  }

  return {
    user: allUsers[index],
    pass: allPasses[index] || allPasses[0] || '',
    allUsers,
    allPasses,
    config
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// Safe Diagnostic Logger (Never logs passwords or secrets)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Safe startup diagnostics that show whether each required SMTP variable exists.
 * NEVER prints the actual SMTP password or secret.
 */
export const logSmtpDiagnostics = () => {
  const config = getSmtpConfig();
  console.log('[EmailService] 📋 SMTP Environment Diagnostics:');
  console.log(`   • SMTP_HOST  : ${config.host ? 'configured (' + config.host + ')' : 'NOT CONFIGURED (defaulting to smtp.gmail.com)'}`);
  console.log(`   • SMTP_PORT  : ${process.env.SMTP_PORT ? 'configured (' + config.port + ')' : 'NOT CONFIGURED (defaulting to 587)'}`);
  console.log(`   • SMTP_SECURE: ${process.env.SMTP_SECURE ? 'configured (' + config.secure + ')' : 'derived (' + config.secure + ')'}`);
  console.log(`   • SMTP_USER  : ${config.user ? 'configured' : 'NOT CONFIGURED (missing SMTP_USER / EMAIL_USER)'}`);
  console.log(`   • SMTP_PASS  : ${config.pass ? 'configured (' + config.pass.length + ' chars)' : 'NOT CONFIGURED (missing SMTP_PASS / EMAIL_PASS)'}`);
  console.log(`   • EMAIL_FROM : ${config.from ? 'configured' : 'NOT CONFIGURED (will default to Smart Lunch Generator <user>)'}`);
};

/**
 * Logs real Nodemailer error details safely without leaking sensitive tokens or passwords.
 */
export const logSafeSmtpError = (prefix, err) => {
  if (!err) return;
  console.error(`[EmailService] ❌ ${prefix}`);
  if (err.message) console.error(`   • Message     : ${err.message}`);
  if (err.code) console.error(`   • Error Code  : ${err.code}`);
  if (err.command) console.error(`   • Command     : ${err.command}`);
  if (err.responseCode) console.error(`   • ResponseCode: ${err.responseCode}`);
  if (err.response) console.error(`   • Response    : ${err.response}`);
};

// ─────────────────────────────────────────────────────────────────────────────
// Transporter Factory (100% Pure Nodemailer SMTP)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Creates a production-safe Nodemailer SMTP transporter.
 * Supports Port 587 (STARTTLS, secure: false) and Port 465 (SMTPS, secure: true).
 * Explicitly sets family: 4 (IPv4) to prevent cloud hosting (Render/AWS) IPv6 timeout hangs.
 */
export const createTransporter = (user, pass, customPort = null) => {
  const config = getSmtpConfig();
  const host = config.host;
  const port = customPort !== null && customPort !== undefined ? customPort : config.port;
  
  let secure;
  if (process.env.SMTP_SECURE !== undefined && process.env.SMTP_SECURE !== '') {
    secure = cleanEnv(process.env.SMTP_SECURE) === 'true';
  } else {
    secure = port === 465;
  }

  const transportOptions = {
    host,
    port,
    secure,
    auth: { user, pass },
    family: 4, // Force IPv4 — critical for Render/cloud environments
    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 45000,
    tls: {
      rejectUnauthorized: true,
      minVersion: 'TLSv1.2'
    }
  };

  if (!secure && port === 587) {
    transportOptions.requireTLS = true;
  }

  return nodemailer.createTransport(transportOptions);
};

// ─────────────────────────────────────────────────────────────────────────────
// Startup SMTP Verification
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Safe startup test: verifies SMTP credentials without exposing secrets.
 */
export const verifySmtpConnection = async () => {
  logSmtpDiagnostics();

  const creds = getEmailCredentials();
  const config = getSmtpConfig();
  const host = config.host;
  const port = config.port;

  console.log(`\n[EmailService] 🔌 Verifying SMTP connection → ${host}:${port} (secure: ${config.secure})...`);

  if (!creds || !creds.user || !creds.pass) {
    console.warn('[EmailService] ⚠️  Incomplete SMTP credentials.');
    console.warn('[EmailService] ⚠️  Please ensure SMTP_USER and SMTP_PASS are set in Render Environment Variables.');
    return;
  }

  const { allUsers, allPasses } = creds;

  for (let i = 0; i < allUsers.length; i++) {
    const user = allUsers[i];
    const pass = allPasses[i] || allPasses[0];

    if (!user || !pass) continue;

    const transporter = createTransporter(user, pass, port);

    try {
      await transporter.verify();
      console.log(`[EmailService] ✅ SMTP connection verified for: ${user} via ${host}:${port}`);
    } catch (err) {
      logSafeSmtpError(`SMTP verification failed for: ${user} (${host}:${port})`, err);
    }
  }
  console.log('');
};

// ─────────────────────────────────────────────────────────────────────────────
// Email HTML Template
// ─────────────────────────────────────────────────────────────────────────────

const buildEmailHtml = (resetLink) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Reset Your Password</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1e293b;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0"
          style="background-color:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;max-width:540px;width:100%;box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">

          <!-- Brand Header -->
          <tr>
            <td style="background-color:#059669;padding:28px 32px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:700;letter-spacing:-0.2px;">
                Smart Lunch Generator
              </h1>
              <p style="margin:4px 0 0;color:#d1fae5;font-size:13px;font-weight:500;">
                Password Reset Request
              </p>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding:32px 32px 24px;">
              <p style="margin:0 0 16px;color:#334155;font-size:15px;line-height:1.6;">
                Hello,
              </p>
              <p style="margin:0 0 24px;color:#334155;font-size:15px;line-height:1.6;">
                We received a request to reset your password. Click the button below to choose a new password. This link will expire in <strong>15 minutes</strong>.
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:8px 0 24px;">
                    <a href="${resetLink}"
                       target="_blank"
                       rel="noopener noreferrer"
                       style="display:inline-block;background-color:#059669;color:#ffffff;
                              text-decoration:none;font-size:15px;font-weight:600;padding:13px 32px;
                              border-radius:8px;letter-spacing:0.2px;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 8px;color:#64748b;font-size:13px;line-height:1.5;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              <div style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:12px 14px;word-break:break-all;">
                <a href="${resetLink}" target="_blank" rel="noopener noreferrer" style="color:#059669;font-size:12px;text-decoration:underline;">${resetLink}</a>
              </div>

              <p style="margin:24px 0 0;color:#64748b;font-size:13px;line-height:1.5;">
                If you did not request this password reset, please disregard this email. Your password will remain unchanged.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f8fafc;padding:16px 32px;text-align:center;border-top:1px solid #e2e8f0;">
              <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.4;">
                &copy; ${new Date().getFullYear()} Smart Lunch Generator. All rights reserved.
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

const buildEmailText = (resetLink) =>
  `Hello,\n\nWe received a request to reset your password for Smart Lunch Generator.\n\nPlease open the link below in your browser to set a new password (valid for 15 minutes):\n\n${resetLink}\n\nIf you did not request a password reset, you can safely ignore this email.\n\nBest regards,\nSmart Lunch Generator Team`;

// ─────────────────────────────────────────────────────────────────────────────
// Main Send Function — 100% Pure Nodemailer SMTP
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Sends a password reset email via Nodemailer SMTP to ANY recipient email address.
 *
 * @param {string} toEmail      - Recipient email address (any user)
 * @param {string} resetLink    - Secure reset URL containing the token
 * @param {string} senderEmail  - Optional specific sender email
 * @returns {{ success: boolean, mode: string, messageId?: string, accepted?: string[], rejected?: string[], response?: string, sender?: string, error?: string, code?: string }}
 */
export const sendPasswordResetEmail = async (toEmail, resetLink, senderEmail = null) => {
  const htmlBody = buildEmailHtml(resetLink);
  const textBody = buildEmailText(resetLink);
  const emailSubject = 'Password Reset Request - Smart Lunch Generator';

  const creds = getEmailCredentials(senderEmail);

  if (!creds || !creds.user || !creds.pass) {
    console.error('[EmailService] ❌ No SMTP credentials configured. Please set SMTP_USER and SMTP_PASS in environment variables.');
    return {
      success: false,
      error: 'Email service is not configured. Please contact the administrator.'
    };
  }

  const { allUsers, allPasses, config } = creds;
  const customFrom = config.from;
  let lastError = null;

  for (let i = 0; i < allUsers.length; i++) {
    const emailUser = allUsers[i];
    const emailPass = allPasses[i] || allPasses[0];
    const fromAddress = customFrom || `Smart Lunch Generator <${emailUser}>`;

    if (!emailUser || !emailPass) continue;

    console.log(`[EmailService] 📤 Dispatching reset email to: ${toEmail} via SMTP (${emailUser}) [Host: ${config.host}:${config.port}, Secure: ${config.secure}]`);

    const transporter = createTransporter(emailUser, emailPass, config.port);
    try {
      const info = await transporter.sendMail({
        from: fromAddress,
        to: toEmail,
        replyTo: emailUser,
        subject: emailSubject,
        text: textBody,
        html: htmlBody,
        headers: {
          'X-Priority': '3',
          'X-Mailer': 'Smart Lunch Generator Mailer'
        }
      });

      console.log(`[EmailService] ✅ SMTP server accepted the email`);
      console.log(`[EmailService]    • Message ID : ${info.messageId}`);
      console.log(`[EmailService]    • Recipient  : ${toEmail}`);
      console.log(`[EmailService]    • Accepted   : ${JSON.stringify(info.accepted)}`);
      console.log(`[EmailService]    • Rejected   : ${JSON.stringify(info.rejected)}`);
      console.log(`[EmailService]    • Response   : ${info.response}`);

      const wasAccepted = Array.isArray(info.accepted) && info.accepted.length > 0;
      const wasRejected = Array.isArray(info.rejected) && info.rejected.length > 0 && info.rejected.includes(toEmail);

      if (wasRejected && !wasAccepted) {
        console.warn(`[EmailService] ❌ SMTP server explicitly rejected recipient: ${toEmail}`);
        return {
          success: false,
          mode: 'smtp',
          messageId: info.messageId,
          sender: emailUser,
          accepted: info.accepted,
          rejected: info.rejected,
          response: info.response,
          error: `SMTP server rejected recipient: ${toEmail}`
        };
      }

      return {
        success: true,
        mode: 'smtp',
        messageId: info.messageId,
        sender: emailUser,
        accepted: info.accepted,
        rejected: info.rejected,
        response: info.response
      };
    } catch (err) {
      logSafeSmtpError(`SMTP submission failed for ${emailUser} -> ${toEmail}`, err);
      lastError = err;
    }
  }

  let friendlyError = 'Failed to send reset email. Please try again later.';
  if (lastError) {
    const code = lastError.code;
    const resp = lastError.responseCode;
    if (code === 'EAUTH' || resp === 535 || (lastError.message || '').includes('Invalid login')) {
      friendlyError = 'SMTP Authentication failed. Please verify credentials.';
    } else if (code === 'ETIMEDOUT' || code === 'ESOCKET') {
      friendlyError = 'Mail server connection timed out. Please try again later.';
    } else if (code === 'ECONNREFUSED') {
      friendlyError = 'Could not connect to mail server. Please try again later.';
    } else if (code === 'ENETUNREACH') {
      friendlyError = 'Mail server network unreachable. Please try again later.';
    }
  }

  return { 
    success: false, 
    error: friendlyError, 
    code: lastError?.code,
    command: lastError?.command,
    responseCode: lastError?.responseCode
  };
};
