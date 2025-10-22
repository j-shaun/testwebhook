// app.js
const express = require('express');
const fetch = require('node-fetch'); // v2 or compatible
const app = express();
app.use(express.json());

const VERIFY_TOKEN = 'Homeone123';
const MAKE_WEBHOOK_URL = 'https://hook.eu2.make.com/ho65dx1jfmekqft4o398u4tlkfon3082';

const port = process.env.PORT || 3000;
const verifyToken = process.env.VERIFY_TOKEN;
const makeWebhook = process.env.MAKE_WEBHOOK_URL;

app.get('/', (req, res) => {
  const { 'hub.mode': mode, 'hub.challenge': challenge, 'hub.verify_token': token } = req.query;
  if (mode === 'subscribe' && token === verifyToken) {
    console.log('WEBHOOK VERIFIED');
    return res.status(200).send(challenge);
  }
  return res.status(403).end();
});

app.post('/', async (req, res) => {
  try {
    console.log('Incoming payload:', JSON.stringify(req.body, null, 2));
    const messages = req.body.entry?.[0]?.changes?.[0]?.value?.messages
                  || req.body.value?.messages;
    if (messages && messages.length > 0) {
      const msg = messages[0];
      const payload = {
        phone: msg.from, // e.g. "60186694781" or "16315551181" depending on source
        message: msg.text?.body || '',
        timestamp: new Date().toISOString(),
        meta: {
          message_id: msg.id || null,
          type: msg.type || 'text'
        }
      };

      await fetch(makeWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      console.log('Forwarded to Make:', payload);
    } else {
      console.log('No message object in payload');
    }
    res.sendStatus(200);
  } catch (err) {
    console.error('Error in POST / :', err);
    res.sendStatus(500);
  }
});

app.listen(port, () => console.log(`Listening on ${port}`));
