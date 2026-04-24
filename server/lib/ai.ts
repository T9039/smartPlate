import { GoogleGenAI, Type } from "@google/genai";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
const model = "gemini-2.0-flash";

export async function getRecipeSuggestions(ingredients: string[]) {
    const prompt = `Based on these ingredients that are expiring soon: ${ingredients.join(", ")}, 
    recommend 3 recipes to reduce food waste. 
    Return the result as a JSON array of objects with the following structure:
    [{ "title": string, "ingredients": string[], "instructions": string[] }]`;

    const response = await genAI.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
                        instructions: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ["title", "ingredients", "instructions"]
                }
            }
        }
    });

    return JSON.parse(response.text || "[]");
}

export async function getBehavioralNudge(wasteHistory: any[]) {
    const historyStr = wasteHistory.map(h => `${h.logged_at}: ${h.action} ${h.quantity} ${h.item_name}`).join("\n");
    
    const prompt = `Analyze this food waste history and provide 3 short, actionable behavioral nudges to help the user reduce waste.
    Focus on patterns (e.g., wasting too much of one item).
    History:
    ${historyStr}
    
    Return as a JSON array of strings.`;

    const response = await genAI.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
            }
        }
    });

    return JSON.parse(response.text || "[]");
}
