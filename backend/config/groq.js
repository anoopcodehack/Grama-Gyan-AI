export const groqConfig = {
  apiKey: process.env.GROQ_API_KEY || "",
  baseURL: "https://api.groq.com/openai/v1",
  modelName: "llama3-8b-8192", // Low latency model for poor offline edge connections
};

export async function queryGroq(messages, temperature = 0.2) {
  if (!groqConfig.apiKey) {
    throw new Error("GROQ_API_KEY environment variable is required.");
  }
  
  const response = await fetch(`${groqConfig.baseURL}/chat/completions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${groqConfig.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: groqConfig.modelName,
      messages,
      temperature,
      max_tokens: 1024,
    }),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API failure: ${response.status} - ${errorText}`);
  }
  
  const data = await response.json();
  return data.choices[0].message.content;
}
