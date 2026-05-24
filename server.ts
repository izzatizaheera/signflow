import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize Gemini client
let ai: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI | null {
  if (!ai) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("GEMINI_API_KEY is missing. AI features will fallback to client simulation.");
      return null;
    }
    ai = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return ai;
}

// 1. API: AI BIM phrase translator & rules explanation
app.post("/api/gemini/translate", async (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: "No text provided" });
  }

  const aiClient = getGemini();
  if (!aiClient) {
    // Elegant simulated fallback
    const upper = text.toUpperCase().replace(/\b(IS|AM|ARE|THE|A|AN|TO|ADALAH|IALAH|YANG)\b/g, "").replace(/\s+/g, " ").trim();
    return res.json({
      gloss: upper || "APA KHABAR",
      handshape: "Adopt neutral standard BIM sign shapes. Place both hands in the high-visibility signing space in front of your chest.",
      facialExpression: text.includes("?") ? "Blink naturally; furrow your eyebrows for inquisitive WH-questions, or raise them for verification/Yes-No questions." : "Wear a friendly, polite smile matching the community-oriented Malaysian tone.",
      linguisticTip: "BIM avoids complex auxiliary linking words and focuses on direct action, timeline placement, and high visual emphasis.",
      gamifiedFeedback: "+10 XP! Outstanding practice! Your BIM digital ally progress is climbing fast! Maintain the streak!"
    });
  }

  try {
    const response = await aiClient.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Translate this phrase to Bahasa Isyarat Malaysia (BIM) Gloss format and explain its physical hand performance, space vector, and structural BIM rules to a beginner learner from Malaysia. Text: "${text}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            gloss: { type: Type.STRING, description: "The standardized BIM Gloss in uppercase, e.g. SAYA MAHU MAKAN." },
            handshape: { type: Type.STRING, description: "Description of the dominant and non-dominant hand shapes and space placement for BIM." },
            facialExpression: { type: Type.STRING, description: "State of facial expressions and gaze required for correct BIM grammar." },
            linguisticTip: { type: Type.STRING, description: "A precise, informative beginner linguistic rule applied in Malaysian Sign Language (e.g. topic-comment style, omission of copulas)." },
            gamifiedFeedback: { type: Type.STRING, description: "Supportive streak booster phrase mentioning XP boost and praising the user. Friendly gamified tone." }
          },
          required: ["gloss", "handshape", "facialExpression", "linguisticTip", "gamifiedFeedback"]
        }
      }
    });

    const parsed = response.text ? JSON.parse(response.text.trim()) : {};
    res.json(parsed);
  } catch (err: any) {
    console.error("Gemini Translation API error:", err);
    res.status(500).json({ error: err.message || "Translation error" });
  }
});

// 2. API: AI BIM quiz validator for typed text of beginner practices
app.post("/api/gemini/evaluate", async (req, res) => {
  const { question, userAnswer } = req.body;
  if (!userAnswer) {
    return res.status(400).json({ error: "Missing userAnswer input." });
  }

  const aiClient = getGemini();
  if (!aiClient) {
    // Normal client simulation
    const isCorrect = userAnswer.trim().toUpperCase().includes("MAKAN") || userAnswer.trim().toUpperCase().includes("TERIMA KASIH") || userAnswer.length > 2;
    return res.json({
      correct: isCorrect,
      score: isCorrect ? 10 : 4,
      feedback: isCorrect 
        ? "+15 XP! Exceptional job! Daily streak maintained! Your BIM syntax alignment is magnificent! 🔥" 
        : "Not quite, but a respectable effort! Bahasa Isyarat Malaysia format relies on direct keyword order.",
      explanation: "In Bahasa Isyarat Malaysia, we prioritize the master Topic first, then outline its descriptive Details (Topic-Comment structure), dropping English and Malay auxiliary words (like 'adalah', 'ialah')."
    });
  }

  try {
    const response = await aiClient.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Evaluate the user's typed Bahasa Isyarat Malaysia (BIM) Gloss answer for the question/sentence.
Question: "${question}"
User's Answer: "${userAnswer}"
Rate correctness, score out of 10, formulate supportive game feedback (refer to streaks and XP rewards) and summarize the rule simply for Malaysian Sign Language rules.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            correct: { type: Type.BOOLEAN, description: "Whether user translated standard BIM syntax correctly or close enough." },
            score: { type: Type.INTEGER, description: "A score from 1 to 10." },
            feedback: { type: Type.STRING, description: "Highly gamified feedback celebration! (e.g., '+10 XP! Double multiplier action! Perfect streak!')" },
            explanation: { type: Type.STRING, description: "Simple, precise, non-complex beginner critique explaining standard BIM grammatical order or vocabulary." }
          },
          required: ["correct", "score", "feedback", "explanation"]
        }
      }
    });

    const parsed = response.text ? JSON.parse(response.text.trim()) : {};
    res.json(parsed);
  } catch (err: any) {
    console.error("Gemini Evaluation API error:", err);
    res.status(500).json({ error: err.message || "Evaluation error" });
  }
});

// 3. Mount Vite middleware for development or Serve static directory in production
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SignFlow Server] running on http://localhost:${PORT}`);
  });
}

start();
