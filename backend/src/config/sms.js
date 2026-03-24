const axios = require('axios');

// ── SMS Templates — Hindi + English + Santhali ──
const SMS_TEMPLATES = {
  complaint_registered: (name, id, block) =>
    `[Deoghar Rajaswa] Priya ${name}, aapki bhumi shikayat ${id} (${block} block) darj ho gayi hai. Track karein: localhost:3000/track | Helpline: 06432-XXXXXX`,

  officer_assigned: (name, id, officerName, officerMobile) =>
    `[Deoghar Rajaswa] Shikayat ${id}: Adhikari ${officerName} niyukt kiye gaye hain. Sampark: ${officerMobile}. Track: localhost:3000/track`,

  status_update: (name, id, status) =>
    `[Deoghar Rajaswa] Shikayat ${id} ka status update: ${status}. Poori jaankari ke liye: localhost:3000/track`,

  resolved: (name, id) =>
    `[Deoghar Rajaswa] Priya ${name}, aapki shikayat ${id} ka safaltapurvak nipatara ho gaya. Koi problem ho toh: 06432-XXXXXX`,

  hearing_scheduled: (name, id, date, location) =>
    `[Deoghar Rajaswa] Shikayat ${id} ki sunavayi ${date} ko ${location} mein nirdharit hai. Samay par pahunchen.`,
};

// ── Send SMS via MSG91 ──
async function sendViaMSG91(mobile, message) {
  const authKey    = process.env.MSG91_AUTH_KEY;
  const templateId = process.env.MSG91_TEMPLATE_ID;

  const cleanMobile = mobile.replace(/[^0-9]/g, '');
  const fullMobile  = cleanMobile.startsWith('91') ? cleanMobile : `91${cleanMobile}`;

  const { data } = await axios.post('https://api.msg91.com/api/v5/flow/', {
    template_id: templateId,
    short_url: '0',
    mobiles: fullMobile,
    VAR1: message
  }, {
    headers: { authkey: authKey, 'content-type': 'application/json' },
    timeout: 8000
  });

  return data.type === 'success';
}

// ── Send SMS via Textlocal (alternative) ──
async function sendViaTextlocal(mobile, message) {
  const apiKey = process.env.TEXTLOCAL_API_KEY;
  const sender = process.env.SMS_SENDER || 'DEORAJ';

  const cleanMobile = mobile.replace(/[^0-9]/g, '');
  const fullMobile  = cleanMobile.startsWith('91') ? cleanMobile : `91${cleanMobile}`;

  const params = new URLSearchParams({
    apikey: apiKey,
    numbers: fullMobile,
    message: message,
    sender: sender
  });

  const { data } = await axios.post('https://api.textlocal.in/send/', params.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    timeout: 8000
  });

  return data.status === 'success';
}

// ── Main sendSMS function ──
async function sendSMS(mobile, message, templateKey = null) {
  if (!mobile) return { success: false, reason: 'Mobile number nahi diya' };

  // Use template if provided
  const finalMsg = message;

  // Check which service is configured
  const provider = process.env.SMS_PROVIDER || 'mock';

  console.log(`📱 SMS [${provider}] → ${mobile}: ${finalMsg.slice(0, 50)}...`);

  if (provider === 'mock' || (!process.env.MSG91_AUTH_KEY && !process.env.TEXTLOCAL_API_KEY)) {
    // Mock mode — log only, don't fail
    console.log(`📱 [SMS MOCK] To: ${mobile}`);
    console.log(`   Message: ${finalMsg}`);
    return { success: true, mode: 'mock' };
  }

  try {
    let success = false;

    if (provider === 'msg91' && process.env.MSG91_AUTH_KEY) {
      success = await sendViaMSG91(mobile, finalMsg);
    } else if (provider === 'textlocal' && process.env.TEXTLOCAL_API_KEY) {
      success = await sendViaTextlocal(mobile, finalMsg);
    }

    if (success) {
      console.log(`✅ SMS sent to ${mobile}`);
      return { success: true, mode: provider };
    } else {
      throw new Error('SMS provider returned failure');
    }
  } catch (err) {
    console.error(`❌ SMS error: ${err.message}`);
    // Don't throw — SMS failure should not break the main flow
    return { success: false, error: err.message };
  }
}

// ── Exported helper functions ──
const smsService = {
  sendSMS,

  async complaintRegistered(mobile, name, id, block) {
    return sendSMS(mobile, SMS_TEMPLATES.complaint_registered(name, id, block));
  },

  async officerAssigned(mobile, name, id, officerName, officerMobile) {
    return sendSMS(mobile, SMS_TEMPLATES.officer_assigned(name, id, officerName, officerMobile));
  },

  async statusUpdate(mobile, name, id, status) {
    return sendSMS(mobile, SMS_TEMPLATES.status_update(name, id, status));
  },

  async resolved(mobile, name, id) {
    return sendSMS(mobile, SMS_TEMPLATES.resolved(name, id));
  },

  async hearingScheduled(mobile, name, id, date, location) {
    return sendSMS(mobile, SMS_TEMPLATES.hearing_scheduled(name, id, date, location));
  },

  templates: SMS_TEMPLATES
};

module.exports = smsService;
