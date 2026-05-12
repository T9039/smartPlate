import { GoogleGenAI, Type } from "@google/genai";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
const model = "gemini-flash-latest";

export async function getRecipeSuggestions(ingredients: string[], allIngredients: string[]) {
    const prompt = `Based on these ingredients that are expiring soon: ${ingredients.join(", ")}, 
    recommend 3 recipes to reduce food waste.
    For each recipe, pick an appropriate Ionicons name for 'icon' (e.g., 'restaurant-outline', 'pizza-outline', 'leaf-outline').
    Here is the user's FULL inventory: ${allIngredients.join(", ")}.
    For ingredients, label status as 'expiring' (if it's in the expiring list), 'in-inventory' (ONLY if it is strictly in the full inventory list provided), or 'missing' (if the user does not have it). Do not assume they have common pantry staples unless listed.`;

    try {
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
    } catch (e) {
        console.warn("AI Generation Failed (Quota/Network). Falling back to free Trickle-Down API system...", e);
        
        try {
            // Trickle-down: query a free public JSON API without auth, get recipes, and manually calculate matches
            const res = await fetch("https://dummyjson.com/recipes?limit=50");
            const data = await res.json();
            
            const expLower = ingredients.map(i => i.toLowerCase());
            const allLower = allIngredients.map(i => i.toLowerCase());
            
            let matched = data.recipes.map((r: any) => {
                let matchCount = 0;
                
                const mappedIngredients = r.ingredients.map((ingRaw: string) => {
                    const ing = ingRaw.toLowerCase();
                    const inExp = expLower.some(e => ing.includes(e) || e.includes(ing));
                    const inAll = allLower.some(a => ing.includes(a) || a.includes(ing));
                    
                    if (inExp) matchCount++;
                    
                    return {
                        name: ingRaw,
                        status: inExp ? 'expiring' : (inAll ? 'in-inventory' : 'missing')
                    };
                });
                
                const matchPercent = expLower.length ? (matchCount / expLower.length) : 0;
                
                return {
                    id: `dummy-${r.id}`,
                    title: r.name,
                    icon: "restaurant-outline",
                    time: `${r.prepTimeMinutes + r.cookTimeMinutes} mins`,
                    difficulty: r.difficulty === 'Easy' ? 'Easy' : (r.difficulty === 'Medium' ? 'Medium' : 'Hard'),
                    matchPercent: Math.round(matchPercent * 100),
                    ingredients: mappedIngredients,
                    steps: r.instructions
                };
            });
            
            // Sort by match percentage descending
            matched.sort((a: any, b: any) => b.matchPercent - a.matchPercent);
            
            // Return top 3
            if (matched.length > 0) {
                return matched.slice(0, 3);
            }
        } catch (fallbackError) {
            console.error("Fallback API also failed", fallbackError);
        }
        
        // Final offline fallback if everything fails
        return [{
            id: "offline-1",
            title: "Everything Stir-Fry",
            icon: "flame-outline",
            time: "20 mins",
            difficulty: "Easy",
            matchPercent: 50,
            ingredients: [
                ...ingredients.map(i => ({ name: i, status: "expiring" })),
                { name: "Cooking Oil", status: "missing" },
                { name: "Soy Sauce", status: "missing" }
            ],
            steps: [
                "Chop all your expiring ingredients.",
                "Heat oil in a pan over medium-high heat.",
                "Stir-fry ingredients until cooked.",
                "Add soy sauce and serve hot."
            ]
        }];
    }
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
