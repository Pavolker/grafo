import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load env vars manually since we are running with node
const envPath = path.resolve(process.cwd(), '.env.local');
const envConfig = dotenv.parse(fs.readFileSync(envPath));
const apiKey = envConfig.API_KEY;

console.log("Testing Gemini API with key:", apiKey ? "FOUND" : "MISSING");

const ai = new GoogleGenAI({ apiKey });

const prompt = "List 3 fruits.";

async function test() {
  try {
    console.log("Listing models...");
    const models = await ai.models.list();
    console.log("Available models:");
    for await (const model of models) {
      console.log(`- ${model.name}`);
    }
  } catch (error) {
    console.error("Error testing Gemini:", error);
  }
}

test();
