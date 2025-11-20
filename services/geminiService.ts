import { GoogleGenAI, Type } from "@google/genai";
import { KinshipResponse, Language, Gender, RelationType } from "../types";

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
  chain: RelationType[], 
  userGender: Gender, 
  language: Language
): Promise<KinshipResponse> => {
  
  const cacheKey = `${language}:${userGender}:${chain.join('>')}`;
  
  if (calculationCache.has(cacheKey)) {
    return calculationCache.get(cacheKey)!;
  }

  const ai = getClient();
  
  const chainString = chain.join(" -> ");
  const targetLang = LANGUAGE_MAP[language];
  
  const prompt = `
    Act as a strict genealogy engine.
    
    Input:
    - Speaker Gender: ${userGender}
    - Relation Chain (IDs): ${chainString}
    - Output Language: ${targetLang}
    
    STRICT LOGIC & REDUCTION RULES (Apply in Order):
    
    RULE #0: PURE SIBLING CHAIN (HIGHEST PRIORITY)
    - IF the chain consists ONLY of ('elder_bro', 'younger_bro', 'elder_sis', 'younger_sis'), AND contains NO 'son' or 'daughter':
    - The result MUST be a Sibling (Brother/Sister) or Self.
    - IT CANNOT BE A NEPHEW/NIECE.
    - Example: "elder_bro -> elder_sis -> younger_bro" = Brother.

    RULE #1: NEPHEW / NIECE (Generation -1)
    - [Sibling] -> [Child] = NEPHEW / NIECE.
    - 'elder_sis' -> 'son' = Nephew (外甥).
    
    RULE #2: COUSIN (Generation 0)
    - [Parent] -> [Sibling] -> [Child] = COUSIN.
    - THIS IS CRITICAL. IT IS NEVER A NIECE/NEPHEW.
    - 'mother' -> 'younger_bro' (Uncle) -> 'daughter' = Maternal Cousin (表姐/表妹).
    - 'father' -> 'younger_bro' (Uncle) -> 'son' = Paternal Cousin (堂弟).

    RULE #3: PARENTS
    - [Sibling] -> [Parent] = PARENT.
       - 'elder_bro' -> 'father' = Father.
       - 'elder_bro' -> 'mother' = Mother.
    
    RULE #4: UNCLES / AUNTS
    - [Cousin] -> [Parent] = UNCLE / AUNT.
       - 'cousin_elder_male' (Paternal) -> 'father' = Paternal Uncle.

    Task:
    1. Check Rule #0 first.
    2. Apply reduction logic.
    3. Translate final title to ${targetLang}.
    4. Choose appropriate emoji.
    
    Output JSON:
    - title (Formal)
    - colloquial (Address term)
    - description (1 sentence explanation)
    - emoji
    - relationPath
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
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
  calculationCache.set(cacheKey, result);
  
  return result;
};