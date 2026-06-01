import { GoogleGenAI } from '@google/genai';

let ai: GoogleGenAI | null = null;

export function getGemini() {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      ai = new GoogleGenAI({ apiKey });
    }
  }
  return ai;
}

export async function validateSignal(setupJson: any): Promise<{ verdict: 'HIGH_QUALITY' | 'LOW_QUALITY', reason: string }> {
  try {
    const gemini = getGemini();
    if (!gemini) throw new Error("Gemini API not configured");

    const prompt = `You are an expert SMC (Smart Money Concept) algorithmic trading validator.
Analyze the following trading setup and determine if it is HIGH_QUALITY or LOW_QUALITY.
Respond in strict JSON format: { "verdict": "HIGH_QUALITY" | "LOW_QUALITY", "reason": "Short explanation" }

SETUP DATA:
${JSON.stringify(setupJson, null, 2)}`;

    const response = await gemini.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
      config: {
         responseMimeType: 'application/json',
      }
    });

    const resultText = response.text() || '{}';
    const result = JSON.parse(resultText);
    
    if (result.verdict !== 'HIGH_QUALITY' && result.verdict !== 'LOW_QUALITY') {
      return { verdict: 'LOW_QUALITY', reason: 'Invalid AI response format' };
    }

    return result as { verdict: 'HIGH_QUALITY' | 'LOW_QUALITY', reason: string };

  } catch (error: any) {
    console.error('Gemini Validation Error:', error);
    return { verdict: 'LOW_QUALITY', reason: `AI Error: ${error.message}` };
  }
}
