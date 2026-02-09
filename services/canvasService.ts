

import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { CreatorProfile } from "../types";

// --- SHARED UTILS ---
const initAI = (apiKey?: string) => {
  const key = apiKey || process.env.API_KEY;
  if (!key) throw new Error("API Key missing. Please configure in settings.");
  return new GoogleGenAI({ apiKey: key });
};

// Retry Utility
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const isRetryableError = (error: any) => {
    const msg = (error.message || JSON.stringify(error)).toLowerCase();
    const status = error.status || 0;
    return (
        msg.includes("429") || 
        msg.includes("resource_exhausted") || 
        msg.includes("quota") ||
        msg.includes("503") || 
        msg.includes("500") ||
        msg.includes("overloaded") ||
        status === 429 ||
        status === 503 ||
        status === 500
    );
};

async function retryWithBackoff<T>(
    operation: () => Promise<T>,
    retries = 3,
    baseDelay = 2000
): Promise<T> {
    let lastError: any;
    for (let i = 0; i < retries; i++) {
        try {
            return await operation();
        } catch (error: any) {
            lastError = error;
            if (!isRetryableError(error)) {
                throw error;
            }
            if (i < retries - 1) {
                const delay = baseDelay * Math.pow(2, i); // 2s, 4s, 8s
                console.warn(`Canvas Action Attempt ${i + 1} failed (${error.status || 'Quota/Server'}). Retrying in ${delay}ms...`);
                await wait(delay);
            }
        }
    }
    throw lastError;
}

const RUN_CONFIG = {
  model: "gemini-3-flash-preview", // High intelligence model for editorial tasks
  config: {
    temperature: 0.7,
    thinkingConfig: { thinkingBudget: 2048 } // Force reasoning for transformations
  }
};

// --- MODULE 1: CHANGE TONE ---
export const changeScriptTone = async (
  scriptText: string, 
  targetTone: string, 
  apiKey?: string
): Promise<string> => {
  const ai = initAI(apiKey);
  
  const prompt = `
    ROLE: Master Script Editor.
    TASK: Rewrite the following script to have a "${targetTone}" tone.
    
    [ALGORITHMIC RULES]
    1. ANALYZE the current emotional weight and rhythm.
    2. TRANSFORM the vocabulary and sentence structure to match "${targetTone}".
    3. CONSTRAINT: You MUST preserve the original paragraph structure, argument order, and factual details. Do not summarize. Do not add new facts.
    4. GOAL: The output must feel like the exact same script, just spoken by someone with a different emotional intent.
    
    INPUT SCRIPT:
    """
    ${scriptText}
    """
    
    OUTPUT:
    Return ONLY the rewritten script text. No meta-commentary.
  `;

  const operation = () => ai.models.generateContent({
    ...RUN_CONFIG,
    contents: prompt
  });

  const response = await retryWithBackoff<GenerateContentResponse>(operation);
  return response.text || scriptText;
};

// --- MODULE 2: CHANGE STYLE ---
export const changeScriptStyle = async (
  scriptText: string, 
  targetCreator: CreatorProfile, 
  apiKey?: string
): Promise<string> => {
  const ai = initAI(apiKey);

  const prompt = `
    ROLE: Ghostwriter for ${targetCreator.name}.
    TASK: Rewrite the provided script to match the specific stylistic framework of ${targetCreator.name}.
    
    [CREATOR PROFILE]
    - Archetype: ${targetCreator.bio.archetype}
    - Tone: ${targetCreator.bio.voice.tone}
    - Vocabulary: ${targetCreator.bio.voice.vocabulary}
    - Structural Signature: ${targetCreator.bio.structure.bodyStructure}
    
    [EXECUTION RULES]
    1. ABSORB the input script's topic and key arguments.
    2. REWRITE it as if ${targetCreator.name} is speaking it. Use their metaphors, sentence length, and rhetorical devices.
    3. INTEGRATE their signature phrases naturally if appropriate (e.g., "${targetCreator.bio.voice.signaturePhrases?.join('", "') || ''}").
    4. PRESERVE the core truth. Do not hallucinate new data points, but you may reframe existing ones through their lens.
    
    INPUT SCRIPT:
    """
    ${scriptText}
    """
    
    OUTPUT:
    Return ONLY the rewritten script text.
  `;

  const operation = () => ai.models.generateContent({
    ...RUN_CONFIG,
    contents: prompt
  });

  const response = await retryWithBackoff<GenerateContentResponse>(operation);
  return response.text || scriptText;
};

// --- MODULE 3: SUMMARIZE SCRIPT ---
export const summarizeScript = async (
  scriptText: string, 
  length: 'Short' | 'Medium' | 'Detailed', 
  apiKey?: string
): Promise<string> => {
  const ai = initAI(apiKey);

  const lengthInstructions = {
    'Short': "Condense to the absolute core hook and conclusion. Max 150 words.",
    'Medium': "Retain main arguments but remove examples and fluff. Approx 50% of original.",
    'Detailed': "Keep all distinct points but tighten phrasing. Approx 80% of original."
  };

  const prompt = `
    ROLE: Executive Script Editor.
    TASK: Condense the script based on the following constraint: ${lengthInstructions[length]}
    
    [LOGIC]
    1. IDENTIFY the narrative arc (Beginning -> Middle -> End).
    2. STRIP away repetition, filler words, and secondary elaborations.
    3. PRESERVE narrative continuity. The output must be a coherent, read-aloud script, NOT a bulleted list.
    4. TONE: Keep the original intent, just sharper.
    
    INPUT SCRIPT:
    """
    ${scriptText}
    """
    
    OUTPUT:
    Return ONLY the condensed script text.
  `;

  const operation = () => ai.models.generateContent({
    ...RUN_CONFIG,
    contents: prompt
  });

  const response = await retryWithBackoff<GenerateContentResponse>(operation);
  return response.text || scriptText;
};

// --- MODULE 4: EXTEND WITH QUESTIONS ---
export const extendScriptWithQuestions = async (
  scriptText: string, 
  apiKey?: string
): Promise<string> => {
  const ai = initAI(apiKey);

  const prompt = `
    ROLE: Socratic Engagement Engine.
    TASK: Deepen the following script by appending or weaving in 3-4 profound, relevant questions.
    
    [BEHAVIOR]
    1. ANALYZE the script's central theme and conclusion.
    2. GENERATE questions that:
       - Challenge the viewer's assumptions.
       - Encourage self-reflection.
       - Open a "loop" for future thought.
    3. INTEGRATION: Add these questions naturally, either as a new "Reflection" section at the end, or woven into the conclusion if it fits seamlessly.
    4. Do NOT change the original text substantially, primarily ADD to it.
    
    INPUT SCRIPT:
    """
    ${scriptText}
    """
    
    OUTPUT:
    Return the full script with the new questions integrated.
  `;

  const operation = () => ai.models.generateContent({
    ...RUN_CONFIG,
    contents: prompt
  });

  const response = await retryWithBackoff<GenerateContentResponse>(operation);
  return response.text || scriptText;
};