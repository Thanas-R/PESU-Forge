export async function askGemini(prompt: string): Promise<string> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          { parts: [ { text: prompt } ] }
        ]
      })
    }
  );
  const data = await response.json();
  // Adjust the path to the answer depending on response shape
  const answer = data.candidates?.[0]?.content?.parts?.[0]?.text;
  return answer ?? "No response";
}
