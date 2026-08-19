import nodemailer from 'nodemailer';
import dns from 'dns';

// 1. Force global DNS resolution to IPv4 first
if (dns.setDefaultResultOrder) {
  try {
    dns.setDefaultResultOrder('ipv4first');
  } catch (e) {
    // Ignore if not supported in runtime
  }
}

// 2. Custom DNS lookup handler to strictly enforce IPv4 resolution for Nodemailer sockets
export const forceIpv4Lookup = (hostname, options, callback) => {
  return dns.lookup(hostname, { family: 4, all: false }, callback);
};

// ─────────────────────────────────────────────────────────────────────────────
// Utility & Sanitization Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Strips accidental wrapping quotes (single or double) and trims whitespace.
 */
export const cleanEnv = (val) => {
  if (val === undefined || val === null) return '';
  let str = String(val).trim();
  return str.replace(/^["']|["']$/g, '').trim();
};

/**
 * Sanitizes password/secret string by removing outer quotes and all whitespace
 * (handles Google 16-character App Passwords generated with spaces).
 */
export const cleanPassword = (val) => {
  if (val === undefined || val === null) return '';
  return String(val).replace(/\s+/g, '').replace(/^["']|["']$/g, '').trim();
};

// ─────────────────────────────────────────────────────────────────────────────
// Resolved Credentials & Transporter Setup
// ─────────────────────────────────────────────────────────────────────────────

// 3. Sanitize environment credentials (strip whitespace/quotes)
const user = (process.env.SMTP_USER || process.env.EMAIL_USER || '').trim();
const pass = (process.env.SMTP_PASS || process.env.EMAIL_PASS || '').replace(/\s+/g, '').replace(/^["']|["']$/g, '');

export const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // Standard STARTTLS
  lookup: forceIpv4Lookup, // Enforces strict IPv4 addressing
  auth: {
    user: user,
    pass: pass,
  },
  tls: {
    rejectUnauthorized: true,
    minVersion: 'TLSv1.2',
  },
  connectionTimeout: 20000,
  greetingTimeout: 20000,
  socketTimeout: 20000,
});

// Startup verification check
transporter.verify((error, success) => {
  if (error) {
    console.error('[EmailService] ❌ Nodemailer verification failed:', error.message);
  } else {
    console.log('[EmailService] ✅ Nodemailer successfully connected to Gmail via IPv4 (Port 587)');
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// SMTP Config & Credentials Resolvers
// ─────────────────────────────────────────────────────────────────────────────

export const getSmtpConfig = () => {
  const u = cleanEnv(process.env.SMTP_USER || process.env.EMAIL_USER);
  const p = cleanPassword(process.env.SMTP_PASS || process.env.EMAIL_PASS);
  const from = cleanEnv(process.env.EMAIL_FROM || process.env.SMTP_FROM || process.env.MAIL_FROM);

  return {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    lookup: forceIpv4Lookup,
    user: u,
    pass: p,
    from: from
  };
};

export const getEmailCredentials = (selectedSender = null) => {
  const config = getSmtpConfig();
  const smtpUser = config.user;
  const smtpPass = config.pass;

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

export const logSmtpDiagnostics = () => {
  const config = getSmtpConfig();
  console.log('[EmailService] 📋 Gmail SMTP Environment Diagnostics:');
  console.log(`   • Host       : ${config.host}:${config.port} (secure: ${config.secure})`);
  console.log(`   • SMTP_USER  : ${config.user ? 'configured (' + config.user + ')' : 'NOT CONFIGURED (missing SMTP_USER / EMAIL_USER)'}`);
  console.log(`   • SMTP_PASS  : ${config.pass ? 'configured (' + config.pass.length + ' chars, sanitized)' : 'NOT CONFIGURED (missing SMTP_PASS / EMAIL_PASS)'}`);
  console.log(`   • EMAIL_FROM : ${config.from ? 'configured' : 'NOT CONFIGURED (will default to Smart Lunch Generator <user>)'}`);
};

export const logSafeSmtpError = (prefix, err) => {
  if (!err) return;
  console.error(`[EmailService] ❌ ${prefix}`);
  if (err.message) console.error(`   • Message     : ${err.message}`);
  if (err.code) console.error(`   • Error Code  : ${err.code}`);
  if (err.command) console.error(`   • Command     : ${err.command}`);
  if (err.responseCode) console.error(`   • ResponseCode: ${err.responseCode}`);
  if (err.response) console.error(`   • Response    : ${err.response}`);
};

export const createTransporter = (customUser = null, customPass = null, customPort = null, customSecure = null) => {
  const config = getSmtpConfig();
  const u = customUser ? cleanEnv(customUser) : config.user;
  const p = customPass ? cleanPassword(customPass) : config.pass;
  const prt = customPort !== null && customPort !== undefined ? customPort : config.port;
  const sec = customSecure !== null && customSecure !== undefined ? customSecure : config.secure;

  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: prt,
    secure: sec,
    lookup: forceIpv4Lookup, // Strict IPv4 socket enforcement
    auth: {
      user: u,
      pass: p,
    },
    tls: {
      rejectUnauthorized: true,
      minVersion: 'TLSv1.2',
    },
    connectionTimeout: 20000,
    greetingTimeout: 20000,
    socketTimeout: 20000,
  });
};

export const verifySmtpConnection = async () => {
  return new Promise((resolve) => {
    transporter.verify((error, success) => {
      if (error) {
        console.error('[EmailService] ❌ Nodemailer verification failed:', error.message);
        resolve(false);
      } else {
        console.log('[EmailService] ✅ Nodemailer successfully connected to Gmail via IPv4 (Port 587)');
        resolve(true);
      }
    });
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// Email HTML & Text Templates
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
          <tr>
            <td style="padding:32px 32px 24px;">
              <p style="margin:0 0 16px;color:#334155;font-size:15px;line-height:1.6;">Hello,</p>
              <p style="margin:0 0 24px;color:#334155;font-size:15px;line-height:1.6;">
                We received a request to reset your password. Click the button below to choose a new password. This link will expire in <strong>15 minutes</strong>.
              </p>
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
// Main Send Function — Gmail SMTP via Nodemailer
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Sends a password reset email via Gmail SMTP to any recipient email address.
 *
 * @param {string} toEmail      - Recipient email address
 * @param {string} resetLink    - Secure reset URL containing the token
 * @param {string} senderEmail  - Optional specific sender email
 * @returns {Promise<{ success: boolean, mode?: string, messageId?: string, accepted?: string[], rejected?: string[], response?: string, sender?: string, error?: string, code?: string }>}
 */
export const sendPasswordResetEmail = async (toEmail, resetLink, senderEmail = null) => {
  const htmlBody = buildEmailHtml(resetLink);
  const textBody = buildEmailText(resetLink);
  const emailSubject = 'Password Reset Request - Smart Lunch Generator';

  const u = cleanEnv(senderEmail || process.env.SMTP_USER || process.env.EMAIL_USER);
  const p = cleanPassword(process.env.SMTP_PASS || process.env.EMAIL_PASS);
  const fromAddress = cleanEnv(process.env.EMAIL_FROM || process.env.SMTP_FROM || process.env.MAIL_FROM) || `Smart Lunch Generator <${u}>`;

  if (!u || !p) {
    console.error('[EmailService] ❌ No SMTP credentials configured. Please set SMTP_USER / EMAIL_USER and SMTP_PASS / EMAIL_PASS in environment variables.');
    return {
      success: false,
      error: 'Email service is not configured. Please contact the administrator.'
    };
  }

  console.log(`[EmailService] 📤 Dispatching reset email to: ${toEmail} via Gmail SMTP (${u}) [IPv4, Port 587]`);

  try {
    const activeTransporter = (senderEmail && senderEmail !== (process.env.SMTP_USER || process.env.EMAIL_USER))
      ? createTransporter(u, p)
      : transporter;

    const info = await activeTransporter.sendMail({
      from: fromAddress,
      to: toEmail,
      replyTo: u,
      subject: emailSubject,
      text: textBody,
      html: htmlBody,
      headers: {
        'X-Priority': '3',
        'X-Mailer': 'Smart Lunch Generator Mailer'
      }
    });

    console.log(`[EmailService] ✅ Gmail SMTP server accepted the email`);
    console.log(`[EmailService]    • Message ID : ${info.messageId}`);
    console.log(`[EmailService]    • Recipient  : ${toEmail}`);
    console.log(`[EmailService]    • Accepted   : ${JSON.stringify(info.accepted)}`);
    console.log(`[EmailService]    • Rejected   : ${JSON.stringify(info.rejected)}`);
    console.log(`[EmailService]    • Response   : ${info.response}`);

    const wasAccepted = Array.isArray(info.accepted) && info.accepted.length > 0;
    const wasRejected = Array.isArray(info.rejected) && info.rejected.length > 0 && info.rejected.includes(toEmail);

    if (wasRejected && !wasAccepted) {
      console.warn(`[EmailService] ❌ Gmail SMTP server explicitly rejected recipient: ${toEmail}`);
      return {
        success: false,
        mode: 'smtp',
        messageId: info.messageId,
        sender: u,
        accepted: info.accepted,
        rejected: info.rejected,
        response: info.response,
        error: `Gmail SMTP server rejected recipient: ${toEmail}`
      };
    }

    return {
      success: true,
      mode: 'smtp',
      messageId: info.messageId,
      sender: u,
      accepted: info.accepted,
      rejected: info.rejected,
      response: info.response
    };
  } catch (err) {
    logSafeSmtpError(`Gmail SMTP submission failed for ${u} -> ${toEmail}`, err);

    let friendlyError = 'Failed to send reset email. Please try again later.';
    const code = err.code;
    const resp = err.responseCode;
    if (code === 'EAUTH' || resp === 535 || (err.message || '').includes('Invalid login') || (err.message || '').includes('BadCredentials')) {
      friendlyError = 'Gmail SMTP Authentication failed (535 BadCredentials). Please ensure 2-Step Verification is enabled on your Google Account and generate a new 16-letter App Password at https://myaccount.google.com/apppasswords.';
    } else if (code === 'ETIMEDOUT' || code === 'ESOCKET') {
      friendlyError = 'Gmail SMTP connection timed out. Please try again later.';
    } else if (code === 'ECONNREFUSED') {
      friendlyError = 'Could not connect to Gmail SMTP server. Please try again later.';
    } else if (code === 'ENETUNREACH') {
      friendlyError = 'Gmail SMTP network unreachable. Please try again later.';
    }

    return {
      success: false,
      error: friendlyError,
      code: err?.code,
      command: err?.command,
      responseCode: err?.responseCode
    };
  }
};

export default transporter;
