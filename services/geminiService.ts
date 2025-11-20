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
    Act as a strict logic engine for genealogy.
    
    Input:
    - Speaker Gender: ${userGender}
    - Relation Chain: ${chainString}
    - Target Language: ${targetLang}
    
    ALGORITHMIC RULES (Apply in order):
    
    RULE #1: CHAIN REDUCTION (Step-by-Step)
    You must calculate the identity at each step before moving to the next.
    
    Example: "mother -> younger_bro -> daughter"
    1. [Start]: Self
    2. + [mother]: Mother
    3. Mother + [younger_bro]: Maternal Uncle (NOT Brother)
    4. Maternal Uncle + [daughter]: Maternal Cousin (表姐/表妹) (NOT Niece)
    
    RULE #2: GENERATIONAL MATH
    - Parent (+1)
    - Sibling/Cousin (0)
    - Child (-1)
    
    Calculate the Net Generation:
    - If Net Generation is 0 (e.g., +1 +0 -1): It MUST be a Sibling, Cousin, or Spouse. It CANNOT be a Niece/Nephew.
    - If Net Generation is -1 (e.g., 0 -1): It is a Nephew/Niece or Child.
    
    RULE #3: SPECIFIC PATTERN OVERRIDES (Highest Priority)
    - [Parent] -> [Sibling] -> [Child] === COUSIN (Generation 0).
      (e.g. mother -> younger_bro -> daughter = 表妹/表姐)
      (e.g. father -> elder_bro -> son = 堂哥)
    - [Sibling] -> [Child] === NEPHEW/NIECE (Generation -1).
    
    Task:
    1. Perform the Chain Reduction.
    2. Verify with Generational Math.
    3. Provide the final title in ${targetLang}.
    
    Output JSON:
    - title (Formal)
    - colloquial (Address term)
    - description (Explain the path: e.g. "Mother's Brother's Daughter")
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