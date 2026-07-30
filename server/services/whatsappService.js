import WhatsAppLog from '../models/WhatsAppLog.js';

/**
 * whatsappService.js
 * Sends OTP via Meta WhatsApp Cloud API using the approved "gowhats_otp"
 * Authentication template (CATEGORY: AUTHENTICATION, Type: Standard).
 *
 * Template: gowhats_otp
 *   BODY  : *{{1}}* is your verification code. For your security, do not share this code.
 *   BUTTON: Copy code  →  https://www.whatsapp.com/otp/code/?otp_type=COPY_CODE&code=otp{{1}}
 */

/**
 * Return sanitised headers for logging (token value never exposed)
 */
const getSanitizedHeaders = (token) => {
  const sanitized = token
    ? `${token.substring(0, 8)}...${token.substring(token.length - 4)}`
    : 'MISSING';
  return {
    'Authorization': `Bearer ${sanitized}`,
    'Content-Type': 'application/json'
  };
};

/**
 * POST one request to Meta Graph API and log everything.
 */
const postToMetaApi = async (endpoint, token, payload) => {
  console.log('\n[Meta API Request Log] ═══════════════════════════════════════════');
  console.log(`  🌐  Method         : POST`);
  console.log(`  🌐  Request URL    : ${endpoint}`);
  console.log(`  🔒  Headers        :`, JSON.stringify(getSanitizedHeaders(token), null, 2));
  console.log(`  📤  Payload        :`, JSON.stringify(payload, null, 2));

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const responseData = await response.json().catch(() => ({}));

  console.log(`  📥  HTTP Status    : ${response.status} ${response.statusText}`);
  console.log(`  📄  Response Body  :`, JSON.stringify(responseData, null, 2));
  console.log('[Meta API Request Log] ═══════════════════════════════════════════\n');

  return { response, responseData };
};

/**
 * Build the correct Meta Cloud API payload for the `gowhats_otp` template.
 *
 * Template inspection (from Meta dashboard):
 *   - Category : AUTHENTICATION
 *   - Type     : Standard
 *   - BODY     : *{{1}}* is your verification code. For your security, do not share this code.
 *   - BUTTON   : "Copy code" — sub_type URL
 *                URL = https://www.whatsapp.com/otp/code/?otp_type=COPY_CODE&code=otp{{1}}
 *                      The {{1}} here is a URL suffix variable → must be passed as { type: "text", text: otp }
 *
 * WHY error 132018 occurred with copy_code payload:
 *   sub_type:"copy_code" + type:"coupon_code" is for Meta native Authentication templates
 *   created through WhatsApp Manager's "Authentication" category with a built-in OTP button.
 *   The gowhats_otp template uses a regular URL button (via GoWhats), so the correct
 *   sub_type is "url" with a plain text parameter filling the URL suffix {{1}}.
 */
const buildOtpTemplatePayload = (recipientDigits, otp) => {
  const templateName = process.env.WHATSAPP_TEMPLATE_NAME || 'gowhats_otp';
  const templateLang = process.env.WHATSAPP_TEMPLATE_LANG || 'en';

  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: recipientDigits,
    type: 'template',
    template: {
      name: templateName,
      language: {
        code: templateLang
      },
      components: [
        // BODY component — {{1}} = OTP digits
        {
          type: 'body',
          parameters: [
            { type: 'text', text: otp }
          ]
        },
        // BUTTON component — sub_type "url" fills the {{1}} URL suffix
        // URL becomes: ...?otp_type=COPY_CODE&code=otp507000 (for OTP 507000)
        {
          type: 'button',
          sub_type: 'url',
          index: '0',
          parameters: [
            { type: 'text', text: otp }
          ]
        }
      ]
    }
  };

  console.log('[WhatsApp OTP Service] 📦 Built template payload:');
  console.log(`   Template  : ${templateName} (lang: ${templateLang})`);
  console.log(`   Body {{1}}: ${otp}`);
  console.log(`   Button URL suffix: ${otp}  (sub_type: url)`);

  return payload;
};

/**
 * Send a 6-digit OTP via the approved gowhats_otp WhatsApp Authentication template.
 *
 * @param {string} recipientPhone  E.164 format, e.g. "+919360377386"
 * @param {string} otp             6-digit OTP string
 * @returns {Promise<{ success: boolean, messageId?: string, error?: string, data?: any }>}
 */
export const sendWhatsAppOTP = async (recipientPhone, otp) => {
  console.log('\n[WhatsApp OTP Service] ════════════════════════════════════════════════');
  console.log(`[WhatsApp OTP Service] 📱 Recipient Phone : ${recipientPhone}`);
  console.log(`[WhatsApp OTP Service] 📋 Template        : ${process.env.WHATSAPP_TEMPLATE_NAME || 'gowhats_otp'}`);

  // ── 1. Credential checks (with mock mode fallback) ───────────────────────
  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !token.trim() || !phoneNumberId || !phoneNumberId.trim()) {
    console.log('\n[WhatsApp OTP Service] ════════════════════════════════════════════════');
    console.warn('[WhatsApp OTP Service] ⚠️  Missing WhatsApp Cloud API credentials in .env');
    console.warn(`[WhatsApp OTP Service] 🔑  MOCK MODE BYPASS: Your OTP code is [ ${otp} ]`);
    console.log('[WhatsApp OTP Service] ════════════════════════════════════════════════\n');
    
    // Save mock log in DB so webhook log pages don't crash
    try {
      await WhatsAppLog.create({
        messageId: `mock_wamid_${Date.now()}`,
        phone: recipientPhone,
        status: 'delivered',
        templateName: process.env.WHATSAPP_TEMPLATE_NAME || 'gowhats_otp',
        rawStatusEvent: { mock: true, otp }
      });
    } catch (logErr) {
      console.warn('[WhatsApp OTP Service] ⚠️  MongoDB log save warning:', logErr.message);
    }
    
    return { success: true, messageId: `mock_wamid_${Date.now()}`, mockOtp: otp };
  }

  // ── 2. Format phone → E.164 digits without '+' ────────────────────────────
  const recipientDigits = recipientPhone.replace(/\D/g, '');
  if (!recipientDigits || recipientDigits.length < 8) {
    const err = `Invalid recipient number "${recipientPhone}" — could not extract E.164 digits.`;
    console.error(`[WhatsApp OTP Service] ❌ ${err}`);
    return { success: false, error: err };
  }
  console.log(`[WhatsApp OTP Service] 📞 E.164 Digits     : ${recipientDigits}`);

  // ── 3. Build template payload ─────────────────────────────────────────────
  const endpoint = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;
  const payload = buildOtpTemplatePayload(recipientDigits, otp);

  // ── 4. Call Meta Graph API ────────────────────────────────────────────────
  try {
    const { response, responseData } = await postToMetaApi(endpoint, token, payload);

    // ── 5. Evaluate response ───────────────────────────────────────────────
    if (
      response.ok &&
      responseData.messages &&
      Array.isArray(responseData.messages) &&
      responseData.messages.length > 0
    ) {
      const messageId = responseData.messages[0].id;
      console.log(`[WhatsApp OTP Service] ✅ Message accepted by Meta!`);
      console.log(`[WhatsApp OTP Service]    WAMID : ${messageId}`);

      // Persist initial log document in MongoDB
      try {
        await WhatsAppLog.create({
          messageId,
          phone: recipientPhone,
          status: 'accepted',
          templateName: process.env.WHATSAPP_TEMPLATE_NAME || 'gowhats_otp',
          rawStatusEvent: responseData
        });
        console.log('[WhatsApp OTP Service] 💾 MongoDB log created (status: accepted)');
      } catch (logErr) {
        console.warn('[WhatsApp OTP Service] ⚠️  MongoDB log save warning:', logErr.message);
      }

      console.log('[WhatsApp OTP Service] ════════════════════════════════════════════════\n');
      return { success: true, messageId, data: responseData };
    }

    // ── 6. Handle Meta error response ─────────────────────────────────────
    const metaErr = responseData?.error || {};
    let detail = metaErr.message || 'Unknown Meta WhatsApp Cloud API error';
    if (metaErr.error_data?.details) {
      detail += ` — ${metaErr.error_data.details}`;
    }
    const fullError = metaErr.code ? `Meta API Error (${metaErr.code}): ${detail}` : detail;

    console.error(`[WhatsApp OTP Service] ❌ Meta returned error:`);
    console.error(`   Code      : ${metaErr.code || 'N/A'}`);
    console.error(`   Type      : ${metaErr.type || 'N/A'}`);
    console.error(`   Message   : ${detail}`);
    console.error(`   FBTrace   : ${metaErr.fbtrace_id || 'N/A'}`);
    console.log('[WhatsApp OTP Service] ════════════════════════════════════════════════\n');

    return { success: false, error: fullError, data: responseData };

  } catch (fetchErr) {
    const networkError = `Network error reaching Meta Graph API: ${fetchErr.message}`;
    console.error(`[WhatsApp OTP Service] 💥 ${networkError}`);
    console.log('[WhatsApp OTP Service] ════════════════════════════════════════════════\n');
    return { success: false, error: networkError };
  }
};
