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

    try {
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
    } catch (e) {
        console.warn(`AI failed for storage tips on ${itemName}. Using fallback dictionary.`, e);
        
        const lowerName = itemName.toLowerCase();
        
        // Comprehensive fallback dictionary for common groceries
        const fallbacks: Record<string, any> = {
            'tomato': { storageTip: "Store at room temperature away from direct sunlight. Do not refrigerate until cut.", shelfLife: "1-2 weeks on counter", funFact: "Refrigerating tomatoes actually destroys their flavor-producing enzymes!" },
            'bread': { storageTip: "Store in a cool, dark place in a paper bag or bread box. Freeze for long-term storage.", shelfLife: "5-7 days in pantry", funFact: "Storing bread in the fridge actually makes it go stale faster!" },
            'milk': { storageTip: "Store in the back of the fridge where it's coldest, not in the door.", shelfLife: "5-7 days after opening", funFact: "Milk can absorb flavors from other foods in the fridge." },
            'egg': { storageTip: "Keep in their original carton on an inside shelf of the fridge.", shelfLife: "3-5 weeks", funFact: "The carton prevents eggs from absorbing strong odors." },
            'chicken': { storageTip: "Store on the bottom shelf of the fridge to prevent cross-contamination.", shelfLife: "1-2 days in fridge", funFact: "You can freeze raw chicken for up to 9 months safely." },
            'spinach': { storageTip: "Wrap in a paper towel and store in a plastic bag or container in the crisper drawer.", shelfLife: "5-7 days", funFact: "Paper towels absorb excess moisture, which is the main cause of slimy spinach." },
            'avocado': { storageTip: "Leave on the counter to ripen. Once ripe, move to the fridge to pause ripening.", shelfLife: "3-4 days in fridge", funFact: "You can freeze mashed avocado with a squeeze of lemon juice." },
            'rice': { storageTip: "Store in an airtight container in a cool, dry place.", shelfLife: "Indefinite (white), 6 months (brown)", funFact: "Brown rice goes bad faster because of the natural oils in the bran layer." },
            'cheese': { storageTip: "Wrap tightly in wax or parchment paper, then loosely in plastic.", shelfLife: "3-6 weeks depending on hardness", funFact: "Cheese needs to breathe to prevent ammonia buildup." },
            'potato': { storageTip: "Store in a cool, dark, and well-ventilated place. Keep away from onions.", shelfLife: "1-2 months", funFact: "Onions release gases that make potatoes sprout faster." },
            'onion': { storageTip: "Store in a cool, dry, dark place with good ventilation.", shelfLife: "1-2 months", funFact: "Don't store onions in plastic bags; lack of air circulation reduces their shelf life." },
            'banana': { storageTip: "Keep at room temperature. Wrap the stems in plastic wrap to slow ripening.", shelfLife: "2-5 days on counter", funFact: "Bananas release ethylene gas from their stems, which causes ripening." },
            'apple': { storageTip: "Store in the crisper drawer of your fridge.", shelfLife: "1-2 months in fridge", funFact: "Apples release ethylene gas that can cause nearby vegetables to spoil faster." },
            'berry': { storageTip: "Don't wash until right before eating. Store in a breathable container.", shelfLife: "3-7 days in fridge", funFact: "A quick vinegar wash before storing can kill mold spores and double their life!" }
        };
        
        for (const [key, data] of Object.entries(fallbacks)) {
            if (lowerName.includes(key)) {
                return data;
            }
        }
        
        // Generic fallback if not in dictionary
        return {
            storageTip: "Store in a cool, dry place or refrigerate if perishable.",
            shelfLife: "Check packaging or inspect visually",
            funFact: "Proper food storage is the #1 way to reduce household food waste."
        };
    }
}
