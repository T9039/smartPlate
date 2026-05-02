import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

const models = [
  "gemini-2.0-flash-lite",
  "gemini-flash-latest",
  "gemini-pro-latest"
];

async function run() {
  for (const m of models) {
    try {
      await genAI.models.generateContent({ model: m, contents: "test" });
      console.log(`✅ SUCCESS: ${m}`);
      return;
    } catch(e: any) {
      console.log(`❌ FAIL ${m}: ${e.message.substring(0, 80)}`);
    }
  }
}
run();
