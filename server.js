import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

if (!process.env.OPENAI_API_KEY) {
  console.error("OPENAI_API_KEY missing in .env");
  process.exit(1);
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.use(express.json({ limit: "10mb" }));
app.use(express.static("public"));

app.post("/api/chat", async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        error: "Message required."
      });
    }

    const safeHistory = Array.isArray(history)
      ? history
          .filter(
            item =>
              item &&
              (item.role === "user" || item.role === "assistant") &&
              typeof item.content === "string"
          )
          .slice(-20)
      : [];

    const response = await openai.responses.create({
      model: "gpt-5.6-luna",
      instructions: `
You are X-BRAIN, a friendly AI assistant.

Personality:
- Friendly and natural.
- Give direct, useful answers.
- Do not waste words or repeat yourself.
- Match the user's language when possible.
- Explain difficult things simply.
- Be honest when you are unsure.
- Never claim you completed an action that you did not actually complete.
- Follow applicable safety rules.
      `,
      input: [
        ...safeHistory,
        {
          role: "user",
          content: message
        }
      ],
      max_output_tokens: 1200
    });

    res.json({
      reply: response.output_text || "Sorry, I couldn't generate a response."
    });

  } catch (error) {
    console.error("X-BRAIN error:", error);

    res.status(500).json({
      error: "X-BRAIN is temporarily unavailable."
    });
  }
});

app.get("*", (req, res) => {
  res.sendFile("index.html", { root: "public" });
});

app.listen(PORT, () => {
  console.log(`X-BRAIN running on port ${PORT}`);
});
