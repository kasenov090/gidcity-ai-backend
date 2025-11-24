import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();
app.use(cors());
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post("/ask", async (req, res) => {
  const question = req.body.question || "";
  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Ты — официальный ИИ-ассистент Управления физической культуры и спорта Карагандинской области. " +
            "Отвечай кратко, по делу, в официально-деловом стиле."
        },
        { role: "user", content: question }
      ]
    });
    const answer = completion.choices?.[0]?.message?.content || "Нет ответа.";
    res.json({ answer });
  } catch (e) {
    console.error(e);
    res.status(500).json({ answer: "Ошибка при обращении к ИИ." });
  }
});

app.get("/", (req, res) => {
  res.send("GiDCity AI backend работает.");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("AI backend listening on port", PORT);
});
