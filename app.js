// Import Express.js
const express = require('express');
const app = express();

app.use(express.json());

const port = process.env.PORT || 3000;
const verifyToken = process.env.VERIFY_TOKEN;

app.get('/', (req, res) => {
  const { 'hub.mode': mode, 'hub.challenge': challenge, 'hub.verify_token': token } = req.query;
  if (mode === 'subscribe' && token === verifyToken) {
    console.log('✅ WEBHOOK VERIFIED');
    res.status(200).send(challenge);
  } else {
    res.status(403).end();
  }
});

app.post('/', async (req, res) => {
  console.log('📩 Webhook received:');
  console.log(JSON.stringify(req.body, null, 2));

  // forward to Make webhook
  await fetch('https://hook.eu2.make.com/blilusszh7pf72gl751rb86e7f69hs3f', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req.body)
  });

  res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
