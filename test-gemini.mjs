// test-gemini.mjs
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

async function rewriteSearchQuery(userInput) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
  const prompt = `
  For "${userInput}", create a search query that finds PRACTICAL, hands-on learning resources appropriate for this specific topic:

  If it's programming/tech: Include coding projects, exercises, practice problems
  If it's creative (art, cooking, music): Include step-by-step tutorials, practice exercises, challenges
  If it's business/finance: Include case studies, simulations, practical examples
  If it's health/wellness: Include routines, practices, actionable tips
  If it's academic: Include problem sets, examples, practice materials

  Always emphasize: practical application, hands-on learning, things to actually DO and practice.

  Search query:`;

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash"});
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text().trim();
}

async function testGeminiRewrite() {
  const testInputs = [
    "I want to learn Python programming",
    "How can I get started with stock market investing?",
    "I want to learn how to cook Italian food",
    "Beginner guide to understanding cryptocurrencies",
    "Tips for improving mental health",
    "I want to learn watercolor painting techniques"
  ];

  console.log("🧪 Testing Gemini Query Rewriting...\n");

  for (const input of testInputs) {
    try {
      const rewritten = await rewriteSearchQuery(input);
      console.log("User input:   ", input);
      console.log("Gemini query: ", rewritten);
      console.log("---------------------------------------------------");
    } catch (error) {
      console.error("Error processing:", input);
      console.error("Error details:", error.message);
      console.log("---------------------------------------------------");
    }
  }
}

testGeminiRewrite().catch(console.error);