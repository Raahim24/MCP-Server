import { rewriteSearchQuery } from "./geminiClient.js";

async function testGeminiRewrite() {
  const testInputs = [
    "I want to learn Python programming",
    "How can I get started with stock market investing?",
    "I want to learn how to cook Italian food",
    "Beginner guide to understanding cryptocurrencies",
    "Tips for improving mental health",
    "I want to learn watercolor painting techniques"
  ];

  for (const input of testInputs) {
    const rewritten = await rewriteSearchQuery(input);
    console.log("\nUser input:   ", input);
    console.log("Gemini query: ", rewritten);
    console.log("---------------------------------------------------");
  }
}

testGeminiRewrite();
