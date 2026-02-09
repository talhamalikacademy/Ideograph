
import { CreatorProfile } from "../types";

export class AutoChooser {
  /**
   * Generates the system instruction for Auto Match Mode.
   * This logic is deterministic in its instructions to the AI, forcing a deep semantic analysis step.
   */
  static generateSelectionPrompt(topic: string, availableCreators: CreatorProfile[]): string {
    // We map only essential bio data to save token context and focus the decision
    const creatorList = availableCreators.map(c => 
      `- ${c.name} (ID: ${c.id})
       Tagline: ${c.style}
       Archetype: ${c.bio.archetype}
       Core Beliefs: ${c.bio.philosophy.coreBeliefs.slice(0, 2).join(", ")}
       Research Method: ${c.bio.research.methodology}
      `
    ).join('\n');

    return `
    *** AUTO MATCH INTELLIGENCE ENGINE ACTIVE ***
    
    [OBJECTIVE]
    You are an autonomous Creator Intelligence System. Your goal is to select the single best creator persona to write a script about the topic: "${topic}".
    
    [PHASE 1: TOPIC DECODING]
    Analyze the Input Topic for:
    - Factual Intensity (Does it need rigorous citation?)
    - Emotional Resonance (Does it need empathy or anger?)
    - Complexity (Does it need simplification or deep philosophy?)
    - Narrative Shape (Is it a story, a roast, or a lecture?)
    
    [PHASE 2: PROFILE MATCHING]
    Compare the topic against these profiles:
    
    ${creatorList}
    
    [SELECTION WEIGHTING RULES]
    1. Geopolitics / Policy / Debunking -> Dhruv Rathee or ThynkWhy.
    2. Human Suffering / Society / Justice -> Nitish Rajput.
    3. Wealth / Business / Systems -> Alex Hormozi or Iman Gadzhi.
    4. Science / Paradox / Physics -> Veritasium.
    5. Psychology / Meaning / Order -> Jordan Peterson.
    6. Spectacle / Money Challenges -> MrBeast.
    7. Political Satire / Aggression -> Raftar.
    
    [CONSTRAINTS]
    - DEFAULT: Dhruv Rathee is the default for general educational topics, but ONLY if they rely on logic/data.
    - NO RANDOMNESS: Do not rotate creators for variety. Choose the absolute best fit.
    - STRICT ISOLATION: Once a creator is chosen, ignore all others. Do not blend.
    
    [OUTPUT REQUIREMENT]
    You must populate the 'autoCreatorSelection' field in the JSON response:
    - selectedId: The ID of the chosen creator.
    - reason: A public-facing disclosure sentence (e.g., "Chosen for this topic due to its focus on [X] which aligns with [Creator]'s analytical style.").
    - alternatives: List 1-2 runners-up.
    
    [EXECUTION PHASE]
    After selection, proceed to write the script. You must activate these 4 ENHANCEMENT LAYERS:
    
    1. STYLE LOCK: Strictly adhere to the selected creator's bio, tone, and philosophy. Do not drift into generic AI voice.
    2. DYNAMIC HOOK: Ensure the first segment is a high-retention hook (Pattern Interrupt or Curiosity Gap).
    3. DEEP RESEARCH: Use deep reasoning to provide context and nuance.
    4. CLARITY & QUALITY: Monitor pacing, remove filler, and ensure logical flow.
    
    Write the full script package now.
    `;
  }
}
