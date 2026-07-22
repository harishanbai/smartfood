import Menu from '../models/Menu.js';

const getTodayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const getTomorrowStr = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const sendMenuNotification = async (req, res) => {
  try {
    const { target } = req.body; // 'today' or 'tomorrow'
    const dateStr = target === 'tomorrow' ? getTomorrowStr() : getTodayStr();
    const label = target === 'tomorrow' ? "Tomorrow's" : "Today's";

    // Retrieve active menu
    const menu = await Menu.findOne({ date: dateStr, status: 'active' }).populate('foodId');
    if (!menu || !menu.foodId) {
      return res.status(404).json({
        message: `No active menu scheduled for ${label.toLowerCase()} (${dateStr}) yet.`
      });
    }

    const food = menu.foodId;
    const typeEmoji = food.foodType === 'non-veg' ? '🍗' : '🌿';

    // Construct formatted message
    let messageText = `🍱 *Smart Lunch - ${label} Menu* (${dateStr}) 🍱\n\n`;
    messageText += `${typeEmoji} *Dish:* ${food.name}\n`;
    messageText += `📁 *Category:* ${food.category}\n`;
    messageText += `📝 *Description:* ${food.description}\n`;
    if (menu.ruleApplied) {
      messageText += `⚙️ *Rule Applied:* ${menu.ruleApplied}\n`;
    }
    messageText += `\nSent via Smart Lunch Generator 🚀`;

    // Check credentials
    const {
      TWILIO_ACCOUNT_SID,
      TWILIO_AUTH_TOKEN,
      TWILIO_WHATSAPP_FROM,
      WHATSAPP_TO
    } = process.env;

    const credentialsConfigured = !!(
      TWILIO_ACCOUNT_SID &&
      TWILIO_AUTH_TOKEN &&
      TWILIO_WHATSAPP_FROM &&
      WHATSAPP_TO
    );

    if (credentialsConfigured) {
      console.log(`[WhatsApp] Sending automated notification using Twilio to ${WHATSAPP_TO}...`);
      
      const basicAuth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');
      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${basicAuth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            From: `whatsapp:${TWILIO_WHATSAPP_FROM}`,
            To: `whatsapp:${WHATSAPP_TO}`,
            Body: messageText
          })
        }
      );

      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.message || 'Twilio send failed');
      }

      return res.json({
        success: true,
        mode: 'live',
        message: 'WhatsApp notification sent successfully via Twilio!',
        sid: responseData.sid,
        preview: messageText
      });
    } else {
      console.log('\n======================================================');
      console.log(`[WhatsApp SIMULATION] Target: ${WHATSAPP_TO || 'Not Configured'}`);
      console.log('--- Message Content ---');
      console.log(messageText);
      console.log('======================================================\n');

      return res.json({
        success: true,
        mode: 'simulation',
        message: 'WhatsApp notification simulation printed to server logs.',
        preview: messageText
      });
    }
  } catch (error) {
    console.error('WhatsApp Error:', error);
    res.status(500).json({
      message: 'Failed to send WhatsApp notification.',
      error: error.message
    });
  }
};
