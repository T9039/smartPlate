import { GoogleGenAI, Type } from "@google/genai";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
const model = "gemini-flash-latest";

export async function getRecipeSuggestions(ingredients: string[]) {
    const prompt = `Based on these ingredients that are expiring soon: ${ingredients.join(", ")}, 
    recommend 3 recipes to reduce food waste.
    For each recipe, pick an appropriate Ionicons name for 'icon' (e.g., 'restaurant-outline', 'pizza-outline', 'leaf-outline').
    For ingredients, label status as 'expiring' (if it's in the list above), 'in-inventory' (if it's a common pantry staple), or 'missing'.`;

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
                        id: { type: Type.STRING },
                        title: { type: Type.STRING },
                        icon: { type: Type.STRING },
                        time: { type: Type.STRING },
                        difficulty: { type: Type.STRING },
                        matchPercent: { type: Type.NUMBER },
                        ingredients: { 
                            type: Type.ARRAY, 
                            items: { 
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING },
                                    status: { type: Type.STRING }
                                },
                                required: ["name", "status"]
                            } 
                        },
                        steps: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ["id", "title", "icon", "time", "difficulty", "matchPercent", "ingredients", "steps"]
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

export async function getFoodPreservationTips(itemName: string) {
    const prompt = `Provide concise storage and preservation tips for "${itemName}".
    Return the result as a JSON object with the following structure:
    {
      "storageTip": string, // Actionable tip on how to store it best
      "shelfLife": string, // Estimated shelf life (e.g., "1-2 weeks in fridge")
      "funFact": string // A very short fun fact about preserving this food
    }`;

    const response = await genAI.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    storageTip: { type: Type.STRING },
                    shelfLife: { type: Type.STRING },
                    funFact: { type: Type.STRING }
                },
                required: ["storageTip", "shelfLife", "funFact"]
            }
        }
    });

    return JSON.parse(response.text || "{}");
}
