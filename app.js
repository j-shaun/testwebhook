// Import Express.js
const express = require('express');
const app = express();

app.use(express.json());

const port = process.env.PORT || 3000;
const verifyToken = process.env.VERIFY_TOKEN;

// ====== 1️⃣ Verification endpoint (Meta webhook verification) ======
app.get('/', (req, res) => {
  const { 'hub.mode': mode, 'hub.challenge': challenge, 'hub.verify_token': token } = req.query;

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('✅ WEBHOOK VERIFIED');
    res.status(200).send(challenge);
  } else {
    console.log('❌ Verification failed');
    res.status(403).end();
  }
});

// ====== 2️⃣ Webhook receiver ======
app.post('/', async (req, res) => {
  console.log('📩 Incoming webhook:');
  console.log(JSON.stringify(req.body, null, 2));

  // Prepare Make webhook URL
 const makeWebhookUrl = 'https://hook.eu2.make.com/blilusszh7pf72gl751rb86e7f69hs3f';
//const makeWebhookUrl = 'https://hook.eu2.make.com/z5sp1379x25t8qv3c4o7bsagakqlx2p4'; 
  try {
    const body = req.body;
    let payload = {};

    // 🧩 Case 1: WATI/Meta style (field + value.messages)
    if (body.field === 'messages' && body.value?.messages?.length) {
      const msg = body.value.messages[0];
      payload = {
        event: 'conversation.new_message',
        data: {
          waId: msg.from,
          message: {
            text: msg.text?.body || '',
            timestamp: msg.timestamp,
            threadId: msg.id || ''
          },
          contact: {
            fullName: msg.profile?.name || 'Unknown',
            whatsapp: msg.from,
            email: msg.email || '',
            address: '',
            note: msg.text?.body || '',
            status: 'New',
            preferredWindowStart: '',
            preferredWindowEnd: '',
            exactSlot: '',
            pdpaConsent: '',
            attachments: msg.image ? [msg.image] : [],
            bookings: []
          }
        }
      };
    }

    // 🧩 Case 2: Already in event/data format (from test or Make)
    else if (body.event && body.data) {
      payload = body; // forward as is
    }

    // 🧩 Case 3: Fallback - unknown structure
    else {
      console.log('⚠️ Unrecognized payload structure.');
      payload = { event: 'unknown', data: body };
    }

    // Forward to Make
    const response = await fetch(makeWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      console.log('✅ Forwarded to Make successfully');
    } else {
      console.error('❌ Failed to forward to Make:', response.statusText);
    }

    res.status(200).send('Webhook processed');
  } catch (error) {
    console.error('🚨 Error handling webhook:', error);
    res.status(500).send('Internal Server Error');
  }
});

// ====== 3️⃣ Start server ======
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
