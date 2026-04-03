import { NextResponse } from "next/server";

async function complete(provider: string, apiKey: string, model: string, prompt: string) {
  if (provider === "anthropic") {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": apiKey, "anthropic-version": "2024-06-01", "content-type": "application/json" },
      body: JSON.stringify({ model, max_tokens: 700, messages: [{ role: "user", content: prompt }] }),
    });
    if (!res.ok) {
      const errBody = await res.text();
      console.error(`Anthropic error ${res.status}:`, errBody);
      throw new Error(`Anthropic request failed (${res.status})`);
    }
    const data = await res.json();
    return data.content?.map((c: { text?: string }) => c.text ?? "").join("");
  }
  const baseUrl = provider === "xai" ? "https://api.x.ai/v1/chat/completions" : "https://api.openai.com/v1/chat/completions";
  const res = await fetch(baseUrl, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model, messages: [{ role: "user", content: prompt }] }),
  });
  if (!res.ok) {
    const errBody = await res.text();
    console.error(`${provider === "xai" ? "xAI" : "OpenAI"} error ${res.status}:`, errBody);
    throw new Error(`${provider === "xai" ? "xAI" : "OpenAI"} request failed (${res.status})`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

export async function POST(req: Request) {
  const { provider, apiKey, model, story, character } = await req.json();
  const prompt = `Update the character sheet based on the story. Return JSON with keys character and inconsistencies. Preserve established facts unless the story clearly changes them. Update the memory field so it captures what the story has learned about this character.\n\nCharacter:\n${JSON.stringify(character)}\n\nStory:\n${story}`;
  const raw = await complete(provider, apiKey, model, prompt);
  try {
    return NextResponse.json(JSON.parse(raw));
  } catch {
    return NextResponse.json({ character, inconsistencies: [], raw });
  }
}
