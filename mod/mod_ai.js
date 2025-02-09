import { GoogleGenerativeAI } from "@google/generative-ai";
import { load } from "https://deno.land/std@0.224.0/dotenv/mod.ts";

const env = await load();

const FLASH_MODEL = "gemini-1.5-flash-latest";
const PRO_MODEL = "gemini-1.5-pro-latest";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") || env["GEMINI_API_KEY"];

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export const gemini = async (prompt, use_pro = false) => {
  const model = genAI.getGenerativeModel({
    model: use_pro? PRO_MODEL : FLASH_MODEL
  });
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  return text;
}
