
import { GoogleGenerativeAI, Part } from "@google/generative-ai";

// Use process.env for API key
const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

if (!apiKey) {
  console.warn("Warning: GEMINI_API_KEY is not set. AI features will fail.");
}

const genAI = new GoogleGenerativeAI(apiKey!);

// Models
const TEXT_MODEL = "gemini-1.5-pro"; // Fallback if 3-pro-preview fails
// Note: @google/generative-ai usually handles text. For Image generation specifically,
// we might need a different approach or model if it's not unified yet in this SDK version for all endpoints.
// But for now, we will focus on text. I'll stub image gen.

export interface GenerationResult {
  text?: string;
  imageBuffer?: ArrayBuffer;
}

export const aiService = {
  async generateText(prompt: string, systemInstruction?: string): Promise<string> {
    try {
      const model = genAI.getGenerativeModel({
        model: TEXT_MODEL,
        systemInstruction: systemInstruction
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("AI Text Generation Error:", error);
      throw new Error("Failed to generate text.");
    }
  },

  async generateJSON<T>(prompt: string, schemaDescription: string): Promise<T> {
     try {
      const model = genAI.getGenerativeModel({
        model: TEXT_MODEL,
        generationConfig: { responseMimeType: "application/json" }
      });

      const result = await model.generateContent(prompt + "\n\nReturn strictly valid JSON matching this structure: " + schemaDescription);
      const response = await result.response;
      return JSON.parse(response.text());
    } catch (error) {
      console.error("AI JSON Generation Error:", error);
      throw new Error("Failed to generate structured data.");
    }
  }
};
