import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../config/env";

// Initialize Gemini client with your API key
const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

export async function rewriteSearchQuery(userInput: string): Promise<string> {
  const prompt = `
You are an AI assistant helping learners find the best resources for any skill or topic (not just technology—this could be finance, health, science, art, sports, cooking, languages, etc.).
Given the user's input, write a single, detailed search query that requests:
- Free Medium articles
- GitHub repositories (if relevant)
- YouTube videos
- Blogs
- Official docs and websites

The query should help a search engine (like Exa) find a diverse set of beginner-friendly resources. Only output the search query.

User input: "${userInput}"
`;

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text().trim();
}
