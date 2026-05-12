// const { OpenAI } = require('openai');
const { Groq } = require('groq-sdk');
require('dotenv').config();

// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function generateStudyPack(transcript) {
  const prompt = `
You are an expert educational AI. Analyze the following video transcript and generate a study pack in strictly valid JSON format.

Structure required:
{
  "summary": ["point 1", "point 2", "point 3"],
  "questions": [
    {
      "question_text": "...",
      "option_a": "...", "option_b": "...", "option_c": "...", "option_d": "...",
      "correct_option": "a", 
      "explanation": "..."
    }
  ],
  "flashcards": [
    { "front": "...", "back": "..." }
  ]
}

Rules:
- Generate 5-8 summary points.
- Generate exactly 5 highly accurate MCQ questions testing core concepts. "correct_option" must strictly be "a", "b", "c", or "d".
- Generate exactly 10 flashcards for key terms/concepts.
- Ensure pure JSON, no markdown blocks.

Transcript (truncated if too long):
${transcript.substring(0, 15000)}
`;

  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.3,
  });

  return JSON.parse(response.choices[0].message.content);
}

module.exports = { generateStudyPack };