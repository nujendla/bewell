export async function ai(
  prompt: string,
  image?: { mime: string; data: string },
) {
  const key = process.env.GEMINI_API_KEY;
  if (!key)
    throw new Error("Gemini is not configured. Your saved plan is unchanged.");
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL || "gemini-2.5-flash"}:generateContent`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              ...(image
                ? [{ inlineData: { mimeType: image.mime, data: image.data } }]
                : []),
            ],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.3,
        },
      }),
      signal: AbortSignal.timeout(60000),
    },
  );
  if (!response.ok)
    throw new Error("AI service is temporarily unavailable. Please retry.");
  const result = await response.json();
  return JSON.parse(
    result.candidates?.[0]?.content?.parts
      ?.map((p: { text?: string }) => p.text || "")
      .join("") || "null",
  );
}
