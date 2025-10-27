// Import Express.js
const express = require('express');
const fetch = require('node-fetch'); // Needed for HTTP requests (npm install node-fetch)

// Create an Express app
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Set port and verify_token
const port = process.env.PORT || 3000;
const verifyToken = process.env.VERIFY_TOKEN;
const makeWebhookUrl = 'https://hook.eu2.make.com/blilusszh7pf72gl751rb86e7f69hs3f'; // your Make webhook

// Route for GET requests (Verification)
app.get('/', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('✅ WEBHOOK VERIFIED');
    res.status(200).send(challenge);
  } else {
    console.log('❌ VERIFICATION FAILED');
    res.sendStatus(403);
  }
});

// Route for POST requests (WhatsApp messages)
app.post('/', async (req, res) => {
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
  console.log(`\n📩 Webhook received at ${timestamp}\n`);
  console.log(JSON.stringify(req.body, null, 2));

  // ✅ Forward to Make webhook
  try {
    const response = await fetch(makeWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });

    console.log(`Forwarded to Make: ${response.status}`);
  } catch (err) {
    console.error('❌ Error forwarding to Make:', err.message);
  }

  // Respond to Meta
  res.sendStatus(200);
});

// Start the server
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
