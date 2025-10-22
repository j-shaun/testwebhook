import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

// ✅ POST route for WhatsApp Webhook
app.post("/", async (req, res) => {
  const timestamp = new Date().toISOString().replace("T", " ").slice(0, 19);
  console.log(`\n\n📩 Webhook received at ${timestamp}`);
  console.log(JSON.stringify(req.body, null, 2));

  try {
    // Forward to Make.com webhook
    const makeWebhookUrl = "https://hook.eu2.make.com/490soksxsf9oxkluml33g2n74km3a5p0";

    await fetch(makeWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    console.log("✅ Forwarded successfully to Make.com");
    res.sendStatus(200);
  } catch (err) {
    console.error("❌ Error forwarding webhook:", err);
    res.sendStatus(500);
  }
});

// (Optional) GET route for Meta verification
app.get("/", (req, res) => {
  const VERIFY_TOKEN = "wati1234"; // same as your Meta webhook verify token
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token && mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Webhook verified successfully by Meta");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

app.listen(3000, () => console.log("🚀 Webhook running on port 3000"));
