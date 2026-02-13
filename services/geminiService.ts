
import { GoogleGenAI, Type, Schema, GenerateContentResponse, Part } from "@google/genai";
import { CreatorProfile, ScriptData, AnalysisData, GeneratorConfig, Citation, HookOption, TopicSuggestion, SimulationResult, DirectorPlan, ExperimentVariant, YoutubeTitle, ReferenceImage, EnhancementLog } from "../types";
import { CREATORS, DURATION_MAPPING } from "../constants";
import { AutoChooser } from "../creator-intelligence/AutoChooser";
import { CreatorBlender } from "../creator-intelligence/CreatorBlender";

// Helper for delay
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper for JSON Parsing
const parseJSON = (text: string) => {
    if (!text) return {};
    
    // 1. Remove Markdown code blocks if present (greedy match)
    // Matches ```json ... ``` or just ``` ... ```
    const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    let clean = match ? match[1] : text;
    clean = clean.trim();

    // 2. Attempt direct parse
    try {
        return JSON.parse(clean);
    } catch (e) {
        // 3. Fallback: Find the outermost JSON object
        const firstBrace = text.indexOf('{');
        const lastBrace = text.lastIndexOf('}');
        
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
             const substring = text.substring(firstBrace, lastBrace + 1);
             try { 
                 return JSON.parse(substring); 
             } catch (e2) {
                 console.warn("Failed to parse extracted JSON substring:", e2);
             }
        }
        
        // 4. If we are here, the JSON is likely truncated or malformed.
        console.error("JSON Parse Error. Raw Text Length:", text.length, "Raw Text Start:", text.substring(0, 100));
        throw new Error("The AI response was incomplete or invalid JSON. Please try again.");
    }
};

// Retry Utility
const isRetryableError = (error: any) => {
    const msg = (error.message || JSON.stringify(error)).toLowerCase();
    const status = error.status || 0;
    return (
        msg.includes("429") || msg.includes("resource_exhausted") || msg.includes("quota") ||
        msg.includes("503") || msg.includes("500") || msg.includes("overloaded") ||
        status === 429 || status === 503 || status === 500
    );
};

async function retryWithBackoff<T>(operation: () => Promise<T>, retries = 3, baseDelay = 2000): Promise<T> {
    let lastError: any;
    for (let i = 0; i < retries; i++) {
        try { return await operation(); } 
        catch (error: any) {
            lastError = error;
            if (!isRetryableError(error)) throw error;
            if (i < retries - 1) await wait(baseDelay * Math.pow(2, i));
        }
    }
    throw lastError;
}

// --- SCHEMAS ---

const scriptPackageSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    detectedIntent: { type: Type.STRING },
    targetAudience: { type: Type.STRING },
    segments: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          visual: { type: Type.STRING },
          audio: { type: Type.STRING },
          isWeak: { type: Type.BOOLEAN },
          rewriteSuggestion: { type: Type.STRING }
        }
      }
    },
    ctas: { type: Type.ARRAY, items: { type: Type.STRING } },
    citations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          type: { type: Type.STRING, enum: ['News', 'Research', 'Report', 'Public Data', 'Official'] },
          sourceName: { type: Type.STRING },
          context: { type: Type.STRING },
          reliabilityScore: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
          isVerified: { type: Type.BOOLEAN },
          url: { type: Type.STRING }
        }
      }
    },
    autoCreatorSelection: {
      type: Type.OBJECT,
      properties: { selectedId: { type: Type.STRING }, reason: { type: Type.STRING }, alternatives: { type: Type.ARRAY, items: { type: Type.STRING } } }
    },
    blendMetadata: {
        type: Type.OBJECT,
        properties: { primaryCreator: { type: Type.STRING }, secondaryCreators: { type: Type.ARRAY, items: { type: Type.STRING } }, blendRatio: { type: Type.STRING } }
    }
  }
};

const partialScriptSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    segments: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          visual: { type: Type.STRING },
          audio: { type: Type.STRING },
          isWeak: { type: Type.BOOLEAN },
          rewriteSuggestion: { type: Type.STRING }
        }
      }
    }
  }
};

const topicSuggestionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    suggestions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          refinedTopic: { type: Type.STRING },
          reason: { type: Type.STRING },
          type: { type: Type.STRING, enum: ['Angle', 'Clarity', 'Depth'] }
        }
      }
    }
  }
};

const viralTitlesSchema: Schema = {
    type: Type.OBJECT,
    properties: {
        titles: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    text: { type: Type.STRING },
                    ctrScore: { type: Type.NUMBER },
                    pattern: { type: Type.STRING, enum: ['Explanation', 'Investigation', 'Curiosity', 'Shock', 'List'] },
                    reasoning: { type: Type.STRING }
                }
            }
        }
    }
};

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    hookScore: { type: Type.NUMBER },
    viralityLabel: { type: Type.STRING, enum: ['Low', 'Medium', 'Viral'] },
    retentionData: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: { time: { type: Type.STRING }, retention: { type: Type.NUMBER } }
      }
    },
    suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
    dropOffPrediction: { type: Type.STRING },
    truthScore: { type: Type.NUMBER },
    monetizationRisks: { type: Type.ARRAY, items: { type: Type.STRING } },
    safetyFlags: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: { severity: { type: Type.STRING, enum: ['low', 'medium', 'high'] }, reason: { type: Type.STRING } }
      }
    }
  }
};

const hooksSchema: Schema = {
    type: Type.OBJECT,
    properties: {
        hooks: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING },
                    type: { type: Type.STRING, enum: ['Mystery', 'Controversy', 'Relatable Story'] },
                    visual: { type: Type.STRING },
                    audio: { type: Type.STRING },
                    score: { type: Type.NUMBER },
                    reasoning: { type: Type.STRING }
                }
            }
        }
    }
};

const simulationSchema: Schema = {
    type: Type.OBJECT,
    properties: {
        retentionHeatmap: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { second: { type: Type.NUMBER }, score: { type: Type.NUMBER }, comment: { type: Type.STRING } } } },
        personas: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, demographic: { type: Type.STRING }, reaction: { type: Type.STRING }, dropPointTime: { type: Type.STRING }, emotionalTrigger: { type: Type.STRING } } } },
        microFixes: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { original: { type: Type.STRING }, fix: { type: Type.STRING }, impact: { type: Type.STRING } } } },
        predictedRetention: { type: Type.NUMBER }
    }
};

const directorPlanSchema: Schema = {
    type: Type.OBJECT,
    properties: {
        scenes: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, timeStart: { type: Type.STRING }, duration: { type: Type.STRING }, cameraDirection: { type: Type.STRING }, audioCue: { type: Type.STRING }, visualPrompt: { type: Type.STRING }, onScreenText: { type: Type.STRING } } } },
        editingNotes: { type: Type.STRING },
        musicMood: { type: Type.STRING }
    }
};

const citationsSchema: Schema = {
    type: Type.OBJECT,
    properties: {
        citations: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING },
                    type: { type: Type.STRING },
                    sourceName: { type: Type.STRING },
                    context: { type: Type.STRING },
                    url: { type: Type.STRING },
                    reliabilityScore: { type: Type.STRING },
                    isVerified: { type: Type.BOOLEAN }
                }
            }
        }
    }
};

const experimentVariantsSchema: Schema = {
    type: Type.OBJECT,
    properties: {
        variants: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING },
                    type: { type: Type.STRING },
                    predictedWinner: { type: Type.BOOLEAN },
                    confidence: { type: Type.NUMBER },
                    reason: { type: Type.STRING }
                }
            }
        }
    }
};

const enhancementLogSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    improvedFields: { type: Type.ARRAY, items: { type: Type.STRING } },
    summary: { type: Type.STRING }
  }
};

// --- CORE SERVICES ---

const constructAdvancedSystemPrompt = (creator: CreatorProfile, customInstruction: string = ""): string => {
  return `
    *** ADVANCED SYSTEM-LEVEL INTELLIGENCE ACTIVE ***
    
    You are operating with 5 active parallel enhancement layers. You must satisfy all of them simultaneously without creating friction.

    1. [SCRIPT QUALITY ANALYZER]
    - ACT AS an invisible editor monitoring logic, flow, and density in real-time.
    - ELIMINATE filler, circular reasoning, and low-value sentences immediately.
    - FORCE every segment to advance the narrative or deepen the argument.

    2. [REAL-TIME CLARITY ENHANCER]
    - DETECT abstract or complex ideas and immediately ground them with concrete examples.
    - ENSURE transitions are invisible and frictionless.
    - NEVER dumb down; clarify upwards.

    3. [STYLE AUTHENTICITY LOCK]
    - TARGET PERSONA: ${creator.name}
    - ARCHETYPE: ${creator.bio.archetype}
    - CORE PHILOSOPHY: ${JSON.stringify(creator.bio.philosophy.coreBeliefs)}
    - TONE & PACING: ${creator.bio.voice.tone} | ${creator.bio.voice.pacing}
    - VOCABULARY MATRIX: ${creator.bio.voice.vocabulary}
    - STRICT CONSTRAINT: Do not drift into "AI neutral" voice. You must embody this persona's worldview and rhythm explicitly.

    4. [DYNAMIC HOOK GENERATOR]
    - The first segment MUST be a calculated "Hook" optimized for the target platform.
    - STRATEGY: Use a Pattern Interrupt, High-Stakes Question, or Counter-Intuitive Statement.
    - GOAL: 100% retention in the first 5 seconds.

    5. [DEEP RESEARCH MODE]
    - USE internal knowledge to provide deep context, historical causality, and nuance.
    - SYNTHESIZE disparate facts into cohesive insights.
    - PRIORITIZE "Why" and "How" over simple "What".

    [USER OVERRIDE]
    ${customInstruction}
  `;
};

export const generateScriptWithGemini = async (
  config: GeneratorConfig,
  creator: CreatorProfile, 
  apiKey?: string,
  customSystemPrompt?: string
): Promise<ScriptData> => {
  const key = apiKey || process.env.API_KEY;
  if (!key) throw new Error("No API Key configured");
  
  const genAI = new GoogleGenAI({ apiKey: key });
  
  // 1. System Instruction
  let systemInstruction = "";
  if (config.writingMode === 'auto') {
      // Truncate topic to prevent token overflow for selection logic
      const truncatedTopic = config.topicOrScript.length > 30000 
          ? config.topicOrScript.substring(0, 30000) + "...[TRUNCATED]" 
          : config.topicOrScript;
      systemInstruction = AutoChooser.generateSelectionPrompt(truncatedTopic, CREATORS);
  } else if (config.writingMode === 'blend') {
      const secondaryCreators = CREATORS.filter(c => config.blendConfig.secondaryCreatorIds.includes(c.id));
      systemInstruction = CreatorBlender.generateBlendPrompt(creator, secondaryCreators);
  } else {
      systemInstruction = constructAdvancedSystemPrompt(creator, customSystemPrompt);
  }

  // 2. Multimodal Inputs
  const contents: Part[] = [];
  
  // Determine language prompt rules
  let languageInstruction = `LANGUAGE: ${config.language} ${config.arabicDialect ? `(Dialect: ${config.arabicDialect})` : ''}`;
  
  if (config.language === 'Urdu (Proper)') {
      languageInstruction = "LANGUAGE: Pure Urdu (Nastaliq Script). Do NOT use English/Roman characters.";
  } else if (config.language === 'Urdu (Roman + Script)') {
      languageInstruction = "LANGUAGE: Roman Urdu (English alphabet) FOLLOWED BY the actual Urdu Script in brackets [ ] for each sentence. Example: 'Main ja raha hoon [میں جا رہا ہوں]'.";
  }

  const durationInfo = DURATION_MAPPING[config.duration] || DURATION_MAPPING["60 Seconds (Shorts)"];
  
  // Truncate topic in prompt if necessary to stay safely within limits, though current models handle 1M
  // We double check to be safe against extremely large imports
  const processedTopic = config.topicOrScript.length > 500000 
      ? config.topicOrScript.substring(0, 500000) + "...[TRUNCATED FOR LENGTH]" 
      : config.topicOrScript;

  const textPrompt = `
    TOPIC: ${processedTopic}
    PLATFORM: ${config.platform}
    DURATION: ${config.duration} (~${durationInfo.minWords} words)
    ${languageInstruction}
    STRUCTURE: ${durationInfo.structure}
    ${config.sponsorInfo?.enabled ? `SPONSOR: ${config.sponsorInfo.name} (${config.sponsorInfo.product}) - ${config.sponsorInfo.message}` : ''}
    
    [TASK]
    Write a complete script package JSON. If images are provided, analyze them and incorporate their details into the script visual descriptions.
  `;
  contents.push({ text: textPrompt });

  // Add Images if present
  if (config.referenceImages && config.referenceImages.length > 0) {
      config.referenceImages.forEach(img => {
          contents.push({
              inlineData: {
                  mimeType: img.mimeType,
                  data: img.data
              }
          });
      });
  }

  const operation = () => genAI.models.generateContent({
      model: "gemini-3-flash-preview", // Flash for fast responses
      contents: contents,
      config: {
          systemInstruction: systemInstruction,
          responseMimeType: "application/json",
          responseSchema: scriptPackageSchema,
          temperature: 0.8
      }
  });

  const response = await retryWithBackoff<GenerateContentResponse>(operation, 2, 3000);
  const jsonResponse = parseJSON(response.text || "{}");
  
  return {
    ...jsonResponse,
    segments: jsonResponse.segments || [], // GUARD
    ctas: jsonResponse.ctas || [], // GUARD
    citations: jsonResponse.citations || [], // GUARD
    id: crypto.randomUUID(),
    topic: config.topicOrScript,
    type: config.platform,
    duration: config.duration,
    language: config.language,
    createdAt: new Date().toISOString(),
    creatorId: config.writingMode === 'auto' ? (jsonResponse.autoCreatorSelection?.selectedId || creator.id) : creator.id,
    creatorName: config.writingMode === 'auto' ? (CREATORS.find(c => c.id === jsonResponse.autoCreatorSelection?.selectedId)?.name || creator.name) : creator.name,
    creatorStyle: creator.style
  } as ScriptData;
};

// NEW: Decoupled Visual Extension
export const extendVisualSequence = async (script: ScriptData, apiKey?: string): Promise<ScriptData> => {
    const key = apiKey || process.env.API_KEY;
    if (!key) throw new Error("No API Key");
    const genAI = new GoogleGenAI({ apiKey: key });

    const prompt = `
        Read the following script segments. 
        TASK: Generate 2 NEW additional segments that purely extend the visual narrative sequence. 
        Focus on B-Roll, cinematics, or data visualizations that could follow the current ending.
        Keep the audio narration minimal or silence/music only.
        
        Current Script: ${JSON.stringify(script.segments)}
        
        Return JSON with key 'segments' containing ONLY the new added segments.
    `;

    const operation = () => genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: partialScriptSchema // Use partial schema to avoid confusion
        }
    });

    const response = await retryWithBackoff<GenerateContentResponse>(operation);
    const json = parseJSON(response.text || "{}");
    
    return {
        ...script,
        segments: [...(script.segments || []), ...(json.segments || [])]
    };
};

export const extendScriptWithGemini = async (
  currentScript: ScriptData,
  creator: CreatorProfile,
  apiKey?: string
): Promise<ScriptData> => {
    const key = apiKey || process.env.API_KEY;
    if (!key) throw new Error("No API Key");
    const genAI = new GoogleGenAI({ apiKey: key });
    
    const prompt = `
      Continue this script for another 30 seconds matching the style of ${creator.name}.
      Script so far: ${JSON.stringify(currentScript.segments)}
      
      Return JSON with key 'segments' containing ONLY the new added segments.
    `;

    const operation = () => genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: partialScriptSchema // Use partial schema
        }
    });
    
    const response = await retryWithBackoff<GenerateContentResponse>(operation, 2, 2000);
    const json = parseJSON(response.text || "{}");
    // Append segments
    if (json.segments) {
        currentScript.segments = [...(currentScript.segments || []), ...json.segments];
    }
    return currentScript;
};

export const generateVisualPreview = async (prompt: string, apiKey?: string): Promise<string> => {
    const key = apiKey || process.env.API_KEY;
    if (!key) throw new Error("No API Key");
    const genAI = new GoogleGenAI({ apiKey: key });

    const operation = async () => {
        const response = await genAI.models.generateContent({
            model: "gemini-2.5-flash-image", // Nano banana / fast image
            contents: { parts: [{ text: prompt }] }
        });
        const parts = response.candidates?.[0]?.content?.parts;
        if (parts) {
            for (const part of parts) {
                if (part.inlineData && part.inlineData.data) {
                    return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
                }
            }
        }
        throw new Error("No image generated.");
    };
    return await retryWithBackoff(operation);
};

export const editGeneratedImage = async (base64Image: string, prompt: string, apiKey?: string): Promise<string> => {
    const key = apiKey || process.env.API_KEY;
    if (!key) throw new Error("No API Key");
    const genAI = new GoogleGenAI({ apiKey: key });
    const cleanBase64 = base64Image.split(',')[1] || base64Image;

    const operation = async () => {
        const response = await genAI.models.generateContent({
            model: "gemini-2.5-flash-image", // Nano banana functionality
            contents: {
                parts: [
                    { inlineData: { data: cleanBase64, mimeType: "image/png" } },
                    { text: "Generate an edited version of this image. " + prompt }
                ]
            }
        });
         const parts = response.candidates?.[0]?.content?.parts;
        if (parts) {
            for (const part of parts) {
                if (part.inlineData && part.inlineData.data) {
                    return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
                } else if (part.text) {
                     // Model might return text explanation instead of image
                     console.warn("Model returned text instead of image:", part.text);
                }
            }
        }
        throw new Error("No edited image generated. The model may have refused the request.");
    };
    return await retryWithBackoff(operation);
};

export const analyzeTopicWithGemini = async (topic: string, platform: string, apiKey?: string): Promise<TopicSuggestion[]> => {
    const key = apiKey || process.env.API_KEY;
    if (!key) throw new Error("No API Key");
    const genAI = new GoogleGenAI({ apiKey: key });

    const prompt = `
        User wants to make a video about "${topic}" for ${platform}.
        Use Google Search to find trending angles and recent news related to this topic.
        Suggest 3 refined angles likely to go viral.
    `;

    const operation = () => genAI.models.generateContent({
        model: "gemini-3-flash-preview", // Fast with grounding
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }], // Search Grounding
            responseMimeType: "application/json",
            responseSchema: topicSuggestionSchema
        }
    });

    const response = await retryWithBackoff<GenerateContentResponse>(operation);
    const json = parseJSON(response.text || "{}");
    return json.suggestions || [];
};

export const runGrammarCheck = async (text: string, styleName: string, apiKey?: string): Promise<string> => {
    const key = apiKey || process.env.API_KEY;
    if (!key) throw new Error("No API Key");
    const genAI = new GoogleGenAI({ apiKey: key });

    const prompt = `Correct grammar/spelling. Preserve ${styleName}'s voice. Text: ${text}`;

    const operation = () => genAI.models.generateContent({
        model: "gemini-3-flash-preview", // Updated to valid model
        contents: prompt
    });

    const response = await retryWithBackoff<GenerateContentResponse>(operation);
    return response.text || text;
};

export const generateViralTitles = async (
    script: ScriptData, 
    creator: CreatorProfile, 
    languageMode: string,
    apiKey?: string
): Promise<YoutubeTitle[]> => {
    const key = apiKey || process.env.API_KEY;
    if (!key) throw new Error("No API Key");
    const genAI = new GoogleGenAI({ apiKey: key });

    const prompt = `
        Generate 10 high-CTR video titles for a video about "${script.topic}".
        Creator Style: ${creator.name}.
        Script Snippet: "${script.segments[0]?.audio.substring(0, 100)}..."
        
        LANGUAGE REQUIREMENT: ${languageMode}
        - If 'Hinglish', mix Hindi grammar with strong English keywords.
        - If 'Urdu/Hindi', use script or Romanized as appropriate for viral reach.
        
        Optimize for Curiosity Gaps and Negativity Bias.
    `;

    const operation = () => genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: viralTitlesSchema,
            temperature: 0.9,
        }
    });

    const response = await retryWithBackoff<GenerateContentResponse>(operation, 2, 2000);
    const json = parseJSON(response.text || "{}");
    return json.titles || [];
};

export const analyzeScriptWithGemini = async (script: ScriptData, apiKey?: string): Promise<AnalysisData> => {
    const key = apiKey || process.env.API_KEY;
    if (!key) throw new Error("No API Key");
    const genAI = new GoogleGenAI({ apiKey: key });

    const prompt = `Analyze this script for viral potential, retention risks, and factual integrity. Script: ${JSON.stringify(script.segments)}`;

    const operation = () => genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: analysisSchema
        }
    });

    const response = await retryWithBackoff<GenerateContentResponse>(operation);
    const json = parseJSON(response.text || "{}");
    return json as AnalysisData;
};

export const generateViralHooksWithGemini = async (script: ScriptData, creator: CreatorProfile, apiKey?: string): Promise<HookOption[]> => {
    const key = apiKey || process.env.API_KEY;
    if (!key) throw new Error("No API Key");
    const genAI = new GoogleGenAI({ apiKey: key });

    const prompt = `Generate 3 viral hook options for this script. Script Context: ${JSON.stringify(script.segments.slice(0, 2))}`;

    const operation = () => genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: hooksSchema
        }
    });

    const response = await retryWithBackoff<GenerateContentResponse>(operation);
    const json = parseJSON(response.text || "{}");
    return json.hooks || [];
};

export const enhanceScriptWithGemini = async (script: ScriptData, creator: CreatorProfile, apiKey?: string): Promise<EnhancementLog> => {
    const key = apiKey || process.env.API_KEY;
    if (!key) throw new Error("No API Key");
    const genAI = new GoogleGenAI({ apiKey: key });

    const prompt = `Enhance the following script to maximize retention and engagement. Script: ${JSON.stringify(script.segments)}`;

    const operation = () => genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: enhancementLogSchema
        }
    });

    const response = await retryWithBackoff<GenerateContentResponse>(operation);
    const json = parseJSON(response.text || "{}");
    return json as EnhancementLog;
};

export const simulateAudienceResponse = async (script: ScriptData, apiKey?: string): Promise<SimulationResult> => {
    const key = apiKey || process.env.API_KEY;
    if (!key) throw new Error("No API Key");
    const genAI = new GoogleGenAI({ apiKey: key });

    const prompt = `Simulate audience reaction for this script. Script: ${JSON.stringify(script.segments)}`;

    const operation = () => genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: simulationSchema
        }
    });

    const response = await retryWithBackoff<GenerateContentResponse>(operation);
    const json = parseJSON(response.text || "{}");
    return json as SimulationResult;
};

export const generateDirectorPlan = async (script: ScriptData, apiKey?: string): Promise<DirectorPlan> => {
    const key = apiKey || process.env.API_KEY;
    if (!key) throw new Error("No API Key");
    const genAI = new GoogleGenAI({ apiKey: key });

    const prompt = `Create a director's plan for this script. Script: ${JSON.stringify(script.segments)}`;

    const operation = () => genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: directorPlanSchema
        }
    });

    const response = await retryWithBackoff<GenerateContentResponse>(operation);
    const json = parseJSON(response.text || "{}");
    return json as DirectorPlan;
};

export const generateEvidenceMap = async (script: ScriptData, apiKey?: string): Promise<Citation[]> => {
    const key = apiKey || process.env.API_KEY;
    if (!key) throw new Error("No API Key");
    const genAI = new GoogleGenAI({ apiKey: key });

    const prompt = `Identify claims in the script and provide citations. Script: ${JSON.stringify(script.segments)}`;

    const operation = () => genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: citationsSchema
        }
    });

    const response = await retryWithBackoff<GenerateContentResponse>(operation);
    const json = parseJSON(response.text || "{}");
    return json.citations || [];
};

export const generateExperimentVariants = async (script: ScriptData, creator: CreatorProfile, apiKey?: string): Promise<ExperimentVariant[]> => {
    const key = apiKey || process.env.API_KEY;
    if (!key) throw new Error("No API Key");
    const genAI = new GoogleGenAI({ apiKey: key });

    const prompt = `Propose A/B testing variants for this script. Script: ${JSON.stringify(script.segments)}`;

    const operation = () => genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: experimentVariantsSchema
        }
    });

    const response = await retryWithBackoff<GenerateContentResponse>(operation);
    const json = parseJSON(response.text || "{}");
    return json.variants || [];
};
