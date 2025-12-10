import { GoogleGenAI } from "@google/genai";

export const getSmartHint = async (levelQuestion: string, currentContext: string): Promise<string> => {
  try {
    // Initialize the client inside the function to ensure the correct API key is used at runtime.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = 'gemini-2.5-flash';
    
    const prompt = `
      You are the "Game Master" for a tricky puzzle game called MindMaster. 
      The player is stuck on a level. 
      
      Level Question: "${levelQuestion}"
      Context of current state: "${currentContext}"
      
      Provide a short, witty, and sarcastic hint that nudges them in the right direction without explicitly giving the answer immediately. 
      Keep it under 20 words.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    const text = response.text;
    return text ? text.trim() : "The spirits are mumbling... try asking again.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "The spirits are silent... check your internet connection.";
  }
};