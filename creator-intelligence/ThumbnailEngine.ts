
import { CreatorProfile } from "../types";

export interface ThumbnailProfile {
    visualDNA: string;
    promptStructure: string;
    dominantColors: string;
    composition: string;
    elements: string[];
}

export const CREATOR_THUMBNAIL_STYLES: Record<string, ThumbnailProfile> = {
    "dhruvrathee": {
        visualDNA: "Rational, Documentary, Trustworthy",
        promptStructure: "high-contrast split-screen composition, 8k resolution, photorealistic lighting",
        dominantColors: "Electric Blue (#3b82f6) and Red (#ef4444)",
        composition: "Subject centered or slightly off-center, split screen with map or document",
        elements: ["circular magnifier lens highlighting a map or document", "serious subject pointing at data", "large sans-serif text in Yellow or White"]
    },
    "nitishrajput": {
        visualDNA: "Cinematic, Investigative, Noir",
        promptStructure: "Cinematic Noir aesthetic, deep blacks, gold accents, spotlight lighting",
        dominantColors: "Black, Gold, Deep Grey",
        composition: "Dramatic chiaroscuro lighting, subject in shadow or silhouette against a lit background",
        elements: ["gritty industrial scenes", "courtrooms", "newspaper montages", "serif font family (like Cinzel)"]
    },
    "mrbeast": {
        visualDNA: "Hyper-Viral, Spectacle, High Saturation",
        promptStructure: "Hyper-realistic, 8k, wide angle lens, explosive energy",
        dominantColors: "Cyan, Magenta, Bright Yellow",
        composition: "Extreme close-up of shocked face (Rule of Thirds), massive scale background object",
        elements: ["thick white outlines around subject", "money flying", "fire or explosions", "red arrows"]
    },
    "raftar": {
        visualDNA: "Aggressive, Breaking News, Roast",
        promptStructure: "Gritty news report style, high contrast, urgent atmosphere",
        dominantColors: "Blood Red, Black, White",
        composition: "Subject laughing or shouting, cutout style against chaotic background",
        elements: ["news ticker overlays", "exposed documents", "bold blocky impact font"]
    },
    "thynkwhy": {
        visualDNA: "Conceptual, Modern, Abstract",
        promptStructure: "Clean 3D render style, isometric or surreal composition, soft studio lighting",
        dominantColors: "Lime Green, Black, Matrix Code Green",
        composition: "Minimalist, floating elements, subject looking thoughtful",
        elements: ["3D icons", "floating question marks", "abstract geometric shapes", "glitch effects"]
    },
    "hormozi": {
        visualDNA: "Bold, Gym, Business",
        promptStructure: "High contrast gym-bro business aesthetic, gritty textures, bold typography",
        dominantColors: "High-Vis Orange, Black, White",
        composition: "Subject flexed or commanding, simple background, massive text",
        elements: ["bold sans-serif font (The Bold Font)", "flannel texture", "whiteboard sketches"]
    },
    "imangadzhi": {
        visualDNA: "Luxury, Monk Mode, Cinematic",
        promptStructure: "Old Money aesthetic, film grain, moody lighting, desaturated",
        dominantColors: "Silver, Charcoal, Deep Navy",
        composition: "Subject in suit or robe, looking out window or at camera, symmetric",
        elements: ["chess pieces", "luxury interiors", "vintage film effects"]
    },
    "default": {
        visualDNA: "High Quality YouTube Standard",
        promptStructure: "Professional 4k YouTube thumbnail, crisp lighting, high detail",
        dominantColors: "Vibrant contrasting colors",
        composition: "Clear subject in foreground, relevant background",
        elements: ["Expressive face", "Clear text overlay"]
    }
};

export class ThumbnailEngine {
    static getProfile(creatorId: string): ThumbnailProfile {
        // Fallback to default if creator not found, or use rudimentary matching
        const key = Object.keys(CREATOR_THUMBNAIL_STYLES).find(k => creatorId.includes(k)) || "default";
        return CREATOR_THUMBNAIL_STYLES[key];
    }

    static constructPrompt(
        creator: CreatorProfile, 
        topic: string, 
        textOverlay: string, 
        languageMode: string,
        aspectRatio: string = "16:9"
    ): string {
        const profile = this.getProfile(creator.id);
        
        // Subject Matter Injection
        // We inject the topic into the template slots
        const subjectInjection = `Include imagery related to: "${topic}" (e.g., if economic, show graphs/currency; if tech, show circuits/devices).`;

        // Language & Font Logic
        let fontInstruction = "";
        if (languageMode === 'Urdu/Hindi' || languageMode === 'Urdu') {
            fontInstruction = "Render the text overlay in a bold, calligraphic Nastaliq-style font or Devanagari script. Ensure cultural authenticity.";
        } else {
            fontInstruction = creator.id.includes('nitish') 
                ? "Render text in a cinematic Serif font (like Cinzel)." 
                : "Render text in a bold, impactful Sans-Serif font (like Impact or Montserrat).";
        }

        // Construct the final engineered prompt
        const prompt = `
            Create a professional YouTube thumbnail.
            
            [STYLE DNA]
            Creator Style: ${creator.name}
            Aesthetic: ${profile.promptStructure}
            Color Palette: ${profile.dominantColors}
            Composition: ${profile.composition}
            Mandatory Elements: ${profile.elements.join(", ")}.
            
            [SUBJECT MATTER]
            Core Topic: ${topic}
            ${subjectInjection}
            Integrate these visual metaphors into the creator's typical composition (e.g. inside the magnifier or background).
            
            [TEXT OVERLAY]
            Text: "${textOverlay}"
            Font Rule: ${fontInstruction}
            Text Visibility: Large, legible, high contrast against background.
            
            [TECHNICAL]
            Aspect Ratio: ${aspectRatio}
            Quality: 8k, Unreal Engine 5 render style, sharp focus, no blur.
        `;

        return prompt.trim();
    }
}
