// Import Express.js
const express = require('express');
const fetch = require('node-fetch'); // make sure to install node-fetch

// Create an Express app
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Set port and verify_token
const port = process.env.PORT || 3000;
const verifyToken = process.env.VERIFY_TOKEN;

// Route for GET requests (Webhook verification)
app.get('/', (req, res) => {
  const { 'hub.mode': mode, 'hub.challenge': challenge, 'hub.verify_token': token } = req.query;

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('WEBHOOK VERIFIED');
    res.status(200).send(challenge);
  } else {
    res.status(403).end();
  }
});

// Route for POST requests (Incoming messages)
app.post("/", async (req, res) => {
  const timestamp = new Date().toISOString().replace("T", " ").slice(0, 19);
  console.log(`\n\n📩 Webhook received at ${timestamp}`);
  console.log(JSON.stringify(req.body, null, 2));

  try {
    // Extract WhatsApp message text and sender
    const messages = req.body.entry?.[0]?.changes?.[0]?.value?.messages;
    if (messages && messages.length > 0) {
      const msgObj = messages[0];
      const phone = msgObj.from;
      const message = msgObj.text?.body || ""; // Ensure message text is not empty

      // Prepare payload for Make.com
      const payload = {
        phone,
        message
      };

      // Forward to Make.com webhook
      const makeWebhookUrl = "https://hook.eu2.make.com/ho65dx1jfmekqft4o398u4tlkfon3082";

      await fetch(makeWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log("✅ Forwarded successfully to Make.com:", payload);
    } else {
      console.log("⚠️ No messages found in webhook payload");
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("❌ Error forwarding webhook:", err);
    res.sendStatus(500);
  }
});

// Start the server
app.listen(port, () => {
  console.log(`\nListening on port ${port}\n`);
});
