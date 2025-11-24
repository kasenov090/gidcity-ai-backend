import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();

// --- middleware ---
app.use(cors());
app.use(express.json());

// --- OpenAI client ---
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

if (!process.env.OPENAI_API_KEY) {
  console.warn(
    "WARNING: OPENAI_API_KEY is not set. Requests to /ask will fail."
  );
}

// --- API ---

// основной endpoint для мини-приложения
app.post("/ask", async (req, res) => {
  const question = (req.body?.question || "").toString().trim();

  if (!question) {
    return res.status(400).json({
      answer: "Вопрос не получен. Отправьте текст вопроса в поле question."
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
            "обязательно помечай это как оценку."
        },
        {
          role: "user",
          content: question
        }
      ]
    });

    const answer =
      completion.choices?.[0]?.message?.content?.trim() ||
      "Нет ответа от модели.";

    res.json({ answer });
  } catch (error) {
    console.error("OpenAI error:", error);

    // немного подробностей в лог, но не в ответ пользователю
    res.status(500).json({
      answer:
        "При обращении к ИИ произошла ошибка. Попробуйте ещё раз или обратитесь к администратору."
    });
  }
});

// простой health-check
app.get("/", (req, res) => {
  res.send("GiDCity AI backend работает.");
});

// --- start server ---
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`AI backend listening on port ${PORT}`);
});
