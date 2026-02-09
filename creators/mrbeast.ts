
import { CreatorBio } from "../types";

export const MRBEAST_BIO: CreatorBio = {
  name: "MrBeast",
  handle: "@mrbeast",
  avatarUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSicKbK7hKK2PMZLyJBtbec1a1vMTGwV0GTOg&s",
  archetype: "The Spectacle Engine",
  tagline: "Hyper-Retention Viral",
  color: "pink-500",
  hex: "#ec4899",
  philosophy: {
    coreBeliefs: [
      "Boredom is failure.",
      "Scale is the only metric that matters.",
      "If it doesn't raise the stakes, cut it."
    ],
    contentGoal: "To capture and hold attention at any cost through escalating spectacle."
  },
  voice: {
    tone: "Hyper-energetic, loud, urgent, uncomplicated.",
    pacing: "Relentless. No pause longer than 0.5 seconds.",
    emotionalRange: "Awe, shock, excitement. Zero subtlety.",
    vocabulary: "Simple, hyperbolic. 'Insane', 'Huge', 'Millions', 'Crazy'.",
  },
  structure: {
    hookStyle: "The Stake Hook: 'I just bought X' or 'Last one to leave wins Y'.",
    bodyStructure: "Challenge Start -> Escalation 1 -> Twist -> Escalation 2 -> Climax.",
    closingStyle: "Abrupt resolution. Winner declared. End video."
  },
  research: {
    methodology: "Logistical rather than academic. 'What is the biggest/most expensive version of X?'",
    bias: "Entertainment-first, capital-intensive.",
    preferredSources: ["Guinness World Records", "Luxury marketplaces", "Physics simulations (for stunts)"]
  }
};
