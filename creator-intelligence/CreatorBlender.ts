
import { CreatorProfile } from "../types";

export class CreatorBlender {
  /**
   * Generates the system instruction for Creator Blend Studio.
   * Defines strict hierarchy between Primary Voice and Secondary Influences.
   */
  static generateBlendPrompt(primaryCreator: CreatorProfile, secondaryCreators: CreatorProfile[]): string {
    const secondaryContexts = secondaryCreators.map(c => `
      [SECONDARY INFLUENCE: ${c.name}]
      - Contribution: Inject their ${c.bio.voice.tone} tone and ${c.bio.voice.vocabulary} vocabulary.
      - Constraint: Do NOT override the primary narrative structure. Use as 'spice', not 'base'.
    `).join('\n');

    return `
    *** CREATOR BLEND STUDIO ACTIVE ***
    
    [CONFIGURATION]
    PRIMARY VOICE: ${primaryCreator.name} (${primaryCreator.bio.archetype})
    SECONDARY LAYERS: ${secondaryCreators.map(c => c.name).join(', ')}
    
    [BLENDING ARCHITECTURE]
    
    1. THE BACKBONE (70% Influence - ${primaryCreator.name})
       - The script structure, hook style, and logical flow MUST follow ${primaryCreator.name}.
       - Use ${primaryCreator.name}'s closing style.
       
    2. THE INFUSION (30% Influence - Secondary Creators)
       ${secondaryContexts}
       
    3. CONFLICT RESOLUTION
       - If Primary is 'Calm' and Secondary is 'Hype', maintain Calm pacing but use Hype vocabulary at peak moments only.
       - Do not allow contradictory ideologies to break the narrative flow.
       - URDU/HINDI PURITY: If the output language is Urdu/Hindi, ensure the blending does not result in broken 'Hinglish' unless the Primary Creator's style explicitly allows it (e.g., Raftar). If Primary is Nitish Rajput, maintain pure, poetic Hindustani.
       
    [OUTPUT REQUIREMENT]
    You must populate the 'blendMetadata' field in the JSON response:
    - primaryCreator: Name of primary.
    - secondaryCreators: List of names.
    - blendRatio: Description of how the styles were mixed (e.g., "Dhruv Rathee's logic with Nitish Rajput's emotional vocabulary").
    
    [INTELLIGENCE LAYERS]
    Apply these concurrent optimizations during generation:
    1. DYNAMIC HOOK: The opening must be potent and style-aligned.
    2. DEEP RESEARCH: Inject high-resolution context and facts.
    3. QUALITY MONITOR: Ensure zero fluff and high signal-to-noise ratio.
    4. CLARITY: Ground abstract concepts with concrete examples.
    
    Proceed to write the blended script now.
    `;
  }
}
