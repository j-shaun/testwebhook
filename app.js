// Import Express
const express = require('express');
const fetch = require('node-fetch'); // add this dependency in package.json if not already
const app = express();

app.use(express.json());

const port = process.env.PORT || 3000;
const verifyToken = process.env.VERIFY_TOKEN;
const makeWebhookUrl = 'https://hook.eu2.make.com/blilusszh7pf72gl751rb86e7f69hs3f'; // replace with yours

// Verification route (GET)
app.get('/', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('✅ WEBHOOK VERIFIED');
    res.status(200).send(challenge);
  } else {
    console.error('❌ Verification failed');
    res.sendStatus(403);
  }
});

// Message webhook (POST)
app.post('/', async (req, res) => {
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
  console.log(`\n📨 Webhook received ${timestamp}`);
  console.log(JSON.stringify(req.body, null, 2));

  try {
    // Forward to Make.com webhook
    const response = await fetch(makeWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });

    console.log(`➡️ Forwarded to Make: ${response.status}`);
  } catch (error) {
    console.error('❌ Error forwarding to Make:', error);
  }

  // Respond immediately to Meta
  res.sendStatus(200);
});

// Start the server
app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
