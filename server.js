import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();

// =======================
//   ПРАВИЛЬНЫЙ CORS
// =======================
app.use(
  cors({
    origin: "*", // Разрешаем запросы с GitHub Pages и любых доменов
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Для совместимости с OPTIONS-запросами (preflight)
app.options("*", cors());

// =======================
//   JSON middleware
// =======================
app.use(express.json());

// =======================
//   OpenAI клиент
// =======================
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

if (!process.env.OPENAI_API_KEY) {
  console.warn("WARNING: OPENAI_API_KEY is not set. Requests to /ask will fail.");
}

// =======================
//   ENDPOINT: POST /ask
// =======================
app.post("/ask", async (req, res) => {
  const question = (req.body?.question || "").toString().trim();

  if (!question) {
    return res.status(400).json({
      answer: "Вопрос не получен. Отправьте текст вопроса в поле question.",
    });
  }

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Ты — официальный ИИ-ассистент Управления физической культуры " +
            "и спорта Карагандинской области. Отвечай кратко, по делу, " +
            "в официально-деловом стиле. Если даёшь оценку или предположение, " +
            "обязательно помечай это как оценку.",
        },
        {
          role: "user",
          content: question,
        },
      ],
    });

    const answer =
      completion.choices?.[0]?.message?.content?.trim() ||
      "Нет ответа от модели.";

    res.json({ answer });
  } catch (err) {
    console.error("OpenAI error:", err);

    res.status(500).json({
      answer:
        "Ошибка при обращении к ИИ. Попробуйте снова или обратитесь к администратору.",
    });
  }
});

// =======================
//   HEALTH CHECK
// =======================
app.get("/", (req, res) => {
  res.send("GiDCity AI backend работает.");
});

// =======================
//   START SERVER
// =======================
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`AI backend listening on port ${PORT}`);
});
