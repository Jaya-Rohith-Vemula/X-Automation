import fetch from "node-fetch";
import "dotenv/config";

// Helper: delay in ms
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getTweetFromGroq(
  prompt: string = "Give me something fun to tweet today.",
  systemPersona: string = "You are a witty Twitter bot. Generate exactly one short, interesting tweet about Tech news under 280 characters. Do not wrap the tweet in quotation marks or any special characters. Just return the tweet as plain text.",
  retries: number = 3,
  waitMs: number = 2000
): Promise<string | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY not set in environment");

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "llama-3.1-8b-instant",
            messages: [
              { role: "system", content: systemPersona },
              { role: "user", content: prompt },
            ],
            temperature: 0.8,
            max_tokens: 200,
          }),
        }
      );

      const data = (await response.json()) as any;

      if (!data.choices || !data.choices[0]?.message?.content) {
        throw new Error(data?.error?.message || "No valid content returned");
      }

      const tweet = data.choices[0].message.content.trim();
      console.log("✅ AI-generated tweet:", tweet);
      return tweet.replace(/^["'\-•\d.\s]+/, "").replace(/["']$/, "");
    } catch (error: any) {
      console.error(`Groq API failed (attempt ${attempt}):`, error.message);
      if (attempt < retries) {
        console.log(`🔁 Retrying in ${waitMs / 1000} seconds...`);
        await delay(waitMs);
      }
    }
  }

  console.warn("❌ All Groq attempts failed.");
  return null;
}
