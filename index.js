// Daily Research Agent
// Reads topics from config/topics.json, asks Claude (with web search) to research
// each one, then sends the summary to your Telegram chat.

const fs = require("fs");
const path = require("path");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const GEMINI_MODEL = "gemini-2.5-flash"; // free tier: 1500 requests/day, plenty for this

if (!GEMINI_API_KEY || !TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
  console.error(
    "Missing one of: GEMINI_API_KEY, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID (set these as GitHub Secrets)"
  );
  process.exit(1);
}

const topicsPath = path.join(__dirname, "config", "topics.json");
const topics = JSON.parse(fs.readFileSync(topicsPath, "utf-8"));

// Ask Gemini to research one topic, using its built-in Google Search grounding tool
async function researchTopic(topic) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `${topic.prompt}\n\nGive me a concise, practical summary formatted for a Telegram message: short bullet points, no long paragraphs, include links where useful. Keep it under 300 words.`,
            },
          ],
        },
      ],
      tools: [{ google_search: {} }],
    }),
  });

  const data = await response.json();

  if (data.error) {
    return `⚠️ Error researching "${topic.title}": ${data.error.message}`;
  }

  const text =
    data.candidates?.[0]?.content?.parts?.map((p) => p.text).join("\n") || "";

  return text || `⚠️ No result for "${topic.title}"`;
}

async function sendTelegramMessage(text) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text,
      parse_mode: "Markdown",
      disable_web_page_preview: true,
    }),
  });
  const data = await res.json();
  if (!data.ok) {
    console.error("Telegram send failed:", data);
  }
}

// Telegram messages have a ~4096 char limit, so split long summaries
function splitMessage(text, maxLen = 3500) {
  const chunks = [];
  let remaining = text;
  while (remaining.length > maxLen) {
    let idx = remaining.lastIndexOf("\n", maxLen);
    if (idx === -1) idx = maxLen;
    chunks.push(remaining.slice(0, idx));
    remaining = remaining.slice(idx);
  }
  chunks.push(remaining);
  return chunks;
}

async function main() {
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  await sendTelegramMessage(`🔎 *Daily Research Agent* — ${today}`);

  for (const topic of topics) {
    console.log(`Researching: ${topic.title}`);
    const summary = await researchTopic(topic);
    const message = `*${topic.title}*\n\n${summary}`;
    for (const chunk of splitMessage(message)) {
      await sendTelegramMessage(chunk);
    }
  }

  console.log("Done. All topics researched and sent.");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
