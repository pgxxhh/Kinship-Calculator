import { GoogleGenAI, Type } from "@google/genai";
import { KinshipResponse, Language, Gender } from "../types";

// Optimization 1: In-memory cache to store results of previous calculations.
// This makes repeat queries (or undo/redo actions) instant.
const calculationCache = new Map<string, KinshipResponse>();

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY environment variable is not set.");
  }
  return new GoogleGenAI({ apiKey });
};

const LANGUAGE_MAP: Record<Language, string> = {
  zh: 'Simplified Chinese',
  en: 'English',
  th: 'Thai',
  id: 'Indonesian',
  ms: 'Malay'
};

export const calculateRelationship = async (
  chain: string[], 
  userGender: Gender, 
  language: Language
): Promise<KinshipResponse> => {
  // 1. Check Cache before API Call
  // Create a unique key based on all input parameters
  const cacheKey = `${language}:${userGender}:${chain.join('>')}`;
  
  if (calculationCache.has(cacheKey)) {
    return calculationCache.get(cacheKey)!;
  }

  const ai = getClient();
  
  const chainString = chain.join(" -> ");
  const targetLang = LANGUAGE_MAP[language];
  
  // 2. Streamlined Prompt for Faster Processing
  const prompt = `
    Act as a genealogy API.
    
    Input:
    - Speaker Gender: ${userGender}
    - Relation Chain: ${chainString}
    - Output Language: ${targetLang}
    
    Requirements:
    1. Calculate the kinship title. If invalid, state it.
    2. Use correct honorifics for ${targetLang} (e.g. elder vs younger distinctions).
    3. Select ONE emoji that best fits the relative's gender/age (e.g. 👴, 👧).
    
    Output JSON:
    - title (Formal)
    - colloquial (Address term)
    - description (Brief 1 sentence)
    - emoji
    - relationPath
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      // Optimization 3: Disable Thinking Budget
      // This ensures the model generates tokens immediately without an internal reasoning chain,
      // which is ideal for low-latency lookup tasks.
      thinkingConfig: { thinkingBudget: 0 }, 
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          colloquial: { type: Type.STRING },
          relationPath: { type: Type.STRING },
          description: { type: Type.STRING },
          emoji: { type: Type.STRING },
        },
        required: ["title", "colloquial", "description", "emoji"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from Gemini");
  
  const result = JSON.parse(text) as KinshipResponse;

  // 4. Store Result in Cache
  calculationCache.set(cacheKey, result);
  
  return result;
};