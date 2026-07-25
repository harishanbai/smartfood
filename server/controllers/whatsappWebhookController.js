import WhatsAppLog from '../models/WhatsAppLog.js';

/**
 * @desc    Meta Webhook Verification Endpoint
 * @route   GET /api/webhook/whatsapp
 * @access  Public (Called by Meta Developer Portal)
 */
export const verifyWebhook = (req, res) => {
  console.log('\n[WhatsApp Webhook] ════════════════════════════════════════════════════');
  console.log('[WhatsApp Webhook] 🔍 Received GET Verification Challenge from Meta');
  console.log(`[WhatsApp Webhook] Query Params:`, JSON.stringify(req.query, null, 2));

  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const expectedToken = process.env.WHATSAPP_VERIFY_TOKEN;

  if (mode === 'subscribe' && token === expectedToken) {
    console.log('[WhatsApp Webhook] ✅ Verification SUCCESS! Token matches WHATSAPP_VERIFY_TOKEN.');
    console.log(`[WhatsApp Webhook] Returning Hub Challenge: ${challenge}`);
    console.log('[WhatsApp Webhook] ════════════════════════════════════════════════════\n');
    return res.status(200).send(challenge);
  }

  console.error('[WhatsApp Webhook] ❌ Verification FAILED! Token mismatch or invalid mode.');
  console.error(`[WhatsApp Webhook]   Received Token : "${token}"`);
  console.error(`[WhatsApp Webhook]   Expected Token : "${expectedToken}"`);
  console.log('[WhatsApp Webhook] ════════════════════════════════════════════════════\n');
  return res.sendStatus(403);
};

/**
 * @desc    Meta Status Events Webhook Endpoint
 * @route   POST /api/webhook/whatsapp
 * @access  Public (Called by Meta Webhook Service)
 */
export const handleWebhook = async (req, res) => {
  console.log('\n[WhatsApp Webhook Event] ════════════════════════════════════════════════════');
  console.log('[WhatsApp Webhook Event] 📩 Received POST Status Update Event from Meta');
  console.log(`[WhatsApp Webhook Event] Payload:`, JSON.stringify(req.body, null, 2));

  try {
    const entry = req.body?.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;

    if (value && value.statuses && Array.isArray(value.statuses)) {
      for (const statusObj of value.statuses) {
        const messageId = statusObj.id;
        const status = statusObj.status; // 'sent' | 'delivered' | 'read' | 'failed'
        const recipientId = statusObj.recipient_id;
        const errors = statusObj.errors;

        let failureReason = '';
        let errorCode = null;

        if (errors && errors.length > 0) {
          errorCode = errors[0].code;
          failureReason = errors[0].message || errors[0].title || errors[0].details || `Error Code ${errorCode}`;
          if (errors[0].error_data?.details) {
            failureReason += ` (${errors[0].error_data.details})`;
          }
        }

        console.log(`\n---------------------------------------------------------`);
        console.log(`📌 Message ID     : ${messageId}`);
        console.log(`📱 Recipient      : +${recipientId}`);
        console.log(`🚦 Delivery Status: ${status.toUpperCase()}`);

        if (status === 'failed') {
          console.error(`❌ FAILURE REASON: ${failureReason} (Error Code: ${errorCode})`);
        } else if (status === 'delivered') {
          console.log(`✅ DELIVERED: Message was successfully received on recipient handset!`);
        } else if (status === 'read') {
          console.log(`👀 READ: Recipient opened the WhatsApp message!`);
        }
        console.log(`---------------------------------------------------------\n`);

        // Update MongoDB log record
        const logDoc = await WhatsAppLog.findOneAndUpdate(
          { messageId },
          {
            $set: {
              status,
              failureReason,
              errorCode,
              rawStatusEvent: statusObj
            }
          },
          { new: true, upsert: true }
        );

        console.log(`[WhatsApp Webhook Event] 💾 Updated MongoDB Log (ID: ${logDoc._id}, Status: ${status})`);
      }
    }

    console.log('[WhatsApp Webhook Event] ════════════════════════════════════════════════════\n');
    // Must return 200 OK to Meta to acknowledge receipt
    return res.status(200).send('EVENT_RECEIVED');
  } catch (error) {
    console.error('[WhatsApp Webhook Event] 💥 Error processing webhook:', error);
    return res.status(200).send('EVENT_RECEIVED');
  }
};
