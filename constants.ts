
import { AnalysisData, CreatorProfile, CreatorBio, ScriptData, Template, TypographyConfig } from "./types";
import { DHRUV_BIO } from "./creators/dhruv";
import { NITISH_BIO } from "./creators/nitish";
import { THYNKWHY_BIO } from "./creators/thynkwhy";
import { MRBEAST_BIO } from "./creators/mrbeast";
import { NAVAL_BIO } from "./creators/naval";
import { RAFTAR_BIO } from "./creators/raftar";
import { HORMOZI_BIO } from "./creators/hormozi";
import { PETERSON_BIO } from "./creators/peterson";
import { VERITASIUM_BIO } from "./creators/veritasium";
import { IMAN_BIO } from "./creators/iman";
import { SHARAN_BIO } from "./creators/sharan";

// --- SYSTEM EXPORT ---

const CREATOR_BIOS: CreatorBio[] = [
  DHRUV_BIO, NITISH_BIO, THYNKWHY_BIO, MRBEAST_BIO, NAVAL_BIO, RAFTAR_BIO, 
  HORMOZI_BIO, PETERSON_BIO, VERITASIUM_BIO, IMAN_BIO, SHARAN_BIO
];

export const CREATORS: CreatorProfile[] = CREATOR_BIOS.map(bio => ({
  id: bio.name.toLowerCase().replace(/\s/g, '').replace('@', ''),
  name: bio.name,
  style: bio.tagline,
  color: bio.color,
  hex: bio.hex,
  avatarUrl: bio.avatarUrl,
  bio: bio,
  systemPrompt: "DYNAMIC_LOAD" // Placeholder, fully handled by Creator Intelligence Engine
}));


// --- APP CONSTANTS ---

export const WRITING_CATEGORIES = [
  "Education",
  "Entertainment",
  "Business",
  "Tech",
  "Lifestyle",
  "Motivation",
  "News/Politics",
  "Science"
];

export const LANGUAGES = [
  "English",
  "Urdu (Proper)",
  "Urdu (Roman + Script)",
  "Arabic",
  "French",
  "German",
  "Spanish",
  "Italian",
  "Portuguese"
];

export const ARABIC_DIALECTS = [
  "Modern Standard (Fusha)",
  "Egyptian (Masri)",
  "Levantine (Shami)",
  "Gulf (Khaleeji)"
];

export const DEFAULT_TYPOGRAPHY: TypographyConfig = {
  fontFamily: 'Inter',
  fontSize: 16,
  lineHeight: 1.6,
  letterSpacing: 0
};

export const FONT_OPTIONS = [
  { label: 'Inter (Modern)', value: 'Inter' },
  { label: 'Jameel Noori (Urdu)', value: '"Jameel Noori Nastaliq"' },
  { label: 'Noto Nastaliq (Web)', value: '"Noto Nastaliq Urdu"' },
  { label: 'JetBrains Mono (Code)', value: '"JetBrains Mono"' },
  { label: 'System Serif', value: 'serif' },
  { label: 'System Sans', value: 'sans-serif' },
];

export const DURATION_MAPPING: Record<string, { minWords: number; structure: string }> = {
  "30 Seconds (Fast)": { minWords: 75, structure: "1 Act: Hook -> Rapid Value -> Punchline" },
  "60 Seconds (Shorts)": { minWords: 150, structure: "3 Acts: Hook -> The Twist/Insight -> The CTA" },
  "2 Minutes (Explainer)": { minWords: 320, structure: "Linear: Problem -> Context -> Solution -> Insight" },
  "5 Minutes (Deep Dive)": { minWords: 850, structure: "Complex: Hook -> Context/History -> The Deep Analysis (Data) -> The Counter-Point -> Synthesis" },
  "10 Minutes (Mini-Doc)": { minWords: 4000, structure: "Documentary: Chapter 1 (The Event) -> Chapter 2 (The Background) -> Chapter 3 (The Turning Point) -> Chapter 4 (The Aftermath) -> Deep Dive -> Conclusion" },
  "20 Minutes (Full Documentary)": { minWords: 7000, structure: "Epic: Multiple Narrative Arcs, Deep Historical Context, Expert Opinions, Philosophical Conclusion, Extended Case Studies" },
  "Match Original Length": { minWords: 0, structure: "Mirror input structure" }
};

export const getLanguageClass = (language?: string) => {
  if (!language) return "font-sans";
  const lowerLang = language.toLowerCase();
  
  if (lowerLang === 'urdu (proper)') {
     return "font-jameel text-right leading-[2.5] text-xl md:text-2xl tracking-normal";
  }
  
  if (lowerLang === 'urdu (roman + script)') {
     // Mixed mode: LTR base but with Jameel font available for the script parts
     return "font-jameel text-left leading-[2.0] text-lg md:text-xl";
  }

  if (lowerLang.includes("arabic")) {
    return "font-urdu text-right leading-[2.5] text-lg md:text-xl tracking-wide";
  }
  
  return "font-sans text-base leading-relaxed";
};

export const DURATIONS = [
  "Match Original Length",
  "30 Seconds (Fast)",
  "60 Seconds (Shorts)",
  "2 Minutes (Explainer)",
  "5 Minutes (Deep Dive)",
  "10 Minutes (Mini-Doc)",
  "20 Minutes (Full Documentary)"
];

export const PLATFORMS = [
  "YouTube Shorts",
  "Instagram Reels",
  "TikTok",
  "YouTube Long Form",
  "LinkedIn Video",
  "Podcast Intro"
];

export const EXPERTISE_LEVELS = ["Beginner", "Intermediate", "Expert"];

export const TRANSFORMATION_TYPES = [
  { id: 'Full Rewrite', label: 'Full Rewrite', desc: 'Complete overhaul in creator style' },
  { id: 'Hook Focus', label: 'Improve Hook Only', desc: 'Fix the first 10 seconds' },
  { id: 'Retention Optimization', label: 'Fix Retention', desc: 'Add loops & pattern interrupts' },
  { id: 'Tone Shift', label: 'Change Tone', desc: 'Make it punchy or serious' },
  { id: 'Fix Weaknesses', label: 'Auto-Fix Weakness', desc: 'Remove fluff & gaps' }
];

export const AUDIO_TONES = [
  "Neutral",
  "Energetic",
  "Serious",
  "Warm",
  "Authoritative",
  "Empathetic",
  "Sarcastic"
];

export const AUDIO_SPEEDS = [
  "Very Slow",
  "Slow",
  "Normal",
  "Fast",
  "Very Fast"
];

export const AUDIO_STYLES = [
  "Narrator",
  "Conversational",
  "Broadcast",
  "ASMR",
  "Hype",
  "Storytelling"
];

export const TEMPLATES: Template[] = [
  // --- EXISTING ---
  {
    id: 'dhruv-hidden-truth',
    title: 'The Hidden Truth',
    description: 'Investigative structure for revealing facts.',
    creatorId: 'dhruvrathee',
    content: `TOPIC: The Secret History of [Topic]
    
1. Hello Friends. What if I told you everything you know about [Subject] is a lie?
2. Let's look at the data from 1990 vs today.
3. The media won't show you this graph...
4. But the real question is: Who benefits from this silence?`
  },
  {
    id: 'iman-monk-mode',
    title: 'Monk Mode Protocol',
    description: 'High-discipline success framework.',
    creatorId: 'imangadzhi',
    content: `TOPIC: How to fix your life in 6 months

1. You are distracted. You are weak. The System wants you to fail.
2. I used to be just like you, until I discovered "Monk Mode".
3. Step 1: Isolation. Cut the noise.
4. Step 2: Deep Work. 4 hours of pure focus.
5. Do this, and you won't recognize yourself next year.`
  },
  {
    id: 'sharan-loophole',
    title: 'Financial Loophole',
    description: 'Comedy skit about saving money.',
    creatorId: 'sharanhegde',
    content: `TOPIC: How to save tax on [Expense]

[Me]: I have to pay tax again! I hate this.
[Banker]: Actually sir, you don't.
[Me]: What? How?
[Banker]: Have you heard of Section [Number]? It allows you to claim...
[Me]: Wait, why didn't you tell me this before?`
  },
  // --- NEW ADDITIONS ---
  {
    id: 'dhruv-geopolitics',
    title: 'The Dictator\'s Playbook',
    description: 'Deep dive into political strategy & history.',
    creatorId: 'dhruvrathee',
    content: `TOPIC: How [Country] is Collapsing

1. [Hook] Look at this map. In 2010, this region was thriving. Today, it's a war zone. What happened?
2. [History] To understand this, we need to go back to [Year].
3. [The Catalyst] A single decision by [Leader] changed everything.
4. [Data] Inflation rose by 400%. Unemployment hit 25%.
5. [Conclusion] This is a warning for the rest of the world.`
  },
  {
    id: 'dhruv-environment',
    title: 'The Green Lie',
    description: 'Debunking environmental myths with data.',
    creatorId: 'dhruvrathee',
    content: `TOPIC: Is [Technology] Actually Green?

1. [Hook] You think [Product] is saving the planet? Think again.
2. [The Data] Let's look at the lifecycle emissions.
3. [Comparison] Compared to traditional methods, it's actually worse in the short term.
4. [The Reality] Corporations are using "Greenwashing" to fool you.
5. [Solution] Here is what the science actually suggests we do.`
  },
  {
    id: 'nitish-farmer-crisis',
    title: 'The Forgotten Citizen',
    description: 'Emotional storytelling about systemic failure.',
    creatorId: 'nitishrajput',
    content: `TOPIC: The Plight of [Group]

1. [Visual Hook] Look at the tears in this old man's eyes. This isn't just one person; this is the story of millions.
2. [The System] We call ourselves a superpower, yet our backbone is breaking.
3. [The Reality] I visited this village yesterday. There is no water, no electricity.
4. [The Question] Where did the funds go? Who is responsible?
5. [Closing] Before you sleep tonight, ask yourself: Is this the India we dreamed of?`
  },
  {
    id: 'nitish-education',
    title: 'Degrees Without Future',
    description: 'Critique of the education system.',
    creatorId: 'nitishrajput',
    content: `TOPIC: The Unemployment Crisis

1. [Hook] Every year, 10 million engineers graduate. How many get jobs?
2. [The Scam] Colleges are selling degrees like products in a supermarket.
3. [Ground Reality] I met a PhD student driving a taxi. This is his reality.
4. [Root Cause] It's not a lack of talent; it's a lack of vision in our policy.
5. [Call to Action] We need skills, not just certificates.`
  },
  {
    id: 'thynkwhy-dopamine',
    title: 'The Dopamine Trap',
    description: 'Explaining addiction loops.',
    creatorId: 'thynkwhy',
    content: `TOPIC: Why You Can't Focus

1. [The Glitch] You picked up your phone to check the time. 30 minutes later, you're still scrolling. Why?
2. [The Mechanism] It's called a Variable Reward Schedule.
3. [The Matrix] Apps are designed like slot machines. They hack your biology.
4. [The Cost] You aren't losing time; you are losing agency.
5. [The Escape] Break the loop. Turn off grayscale. Reclaim your mind.`
  },
  {
    id: 'thynkwhy-ai-future',
    title: 'The AI Replacement',
    description: 'Futuristic outlook on technology.',
    creatorId: 'thynkwhy',
    content: `TOPIC: Will AI Replace You?

1. [The Paradox] Comfort is the enemy. AI is the ultimate comfort.
2. [The Shift] We are moving from the Information Age to the Synthesis Age.
3. [The Prediction] Coding is dead. Writing is dead. Thinking is the only skill left.
4. [The Strategy] Don't compete with the machine. Become the architect.
5. [Closing] Adapt or become obsolete.`
  },
  {
    id: 'mrbeast-survival',
    title: '7 Days Stranded',
    description: 'High-stakes survival challenge.',
    creatorId: 'mrbeast',
    content: `TOPIC: I Survived a Desert Island

1. [Scream Hook] I JUST STRANDED MYSELF ON THIS ISLAND WITH NOTHING BUT A SPOON!
2. [The Stakes] If I survive 7 days, I give $100,000 to this subscriber.
3. [Day 1] It's getting dark and I hear wolves. I need a shelter NOW.
4. [Escalation] A storm is hitting the island! My tent is flying away!
5. [Climax] The boat is here... but I lost the spoon.`
  },
  {
    id: 'mrbeast-giveaway',
    title: 'Last To Leave Circle',
    description: 'Classic endurance challenge.',
    creatorId: 'mrbeast',
    content: `TOPIC: Last To Leave Wins Lamborghini

1. [Hook] I put 100 people in this red circle. The last one standing wins this Lamborghini!
2. [Rule] If your foot touches the line, you are OUT.
3. [Twist] I just offered them $10,000 to leave right now. 10 people took it!
4. [Escalation] It's been 24 hours. I'm bringing in a marching band to annoy them.
5. [Ending] And the winner is...!`
  },
  {
    id: 'naval-happiness',
    title: 'The Happiness Equation',
    description: 'Philosophical breakdown of happiness.',
    creatorId: 'navalravikant',
    content: `TOPIC: Happiness is a Choice

1. [Aphorism] Happiness is not something you achieve. It is something you do.
2. [The Trap] We think "I will be happy when I get that car." That is a contract you make with yourself to be unhappy until you get what you want.
3. [The Truth] Desire is suffering.
4. [The Solution] Peace is happiness at rest. Happiness is peace in motion.
5. [Closing] Be present.`
  },
  {
    id: 'naval-wealth',
    title: 'Specific Knowledge',
    description: 'How to build wealth without luck.',
    creatorId: 'navalravikant',
    content: `TOPIC: How to Get Rich

1. [Hook] Seek wealth, not money or status. Wealth is having assets that earn while you sleep.
2. [Mechanism] You will not get rich renting out your time. You must own equity.
3. [Leverage] Code and media are permissionless leverage. They work for you while you sleep.
4. [Specific Knowledge] Figure out what you were doing as a kid that looked like play to you, but looks like work to others.
5. [Closing] Productize yourself.`
  },
  {
    id: 'raftar-roast',
    title: 'Influencer Scam Roast',
    description: 'Aggressive takedown of a scam.',
    creatorId: 'raftar',
    content: `TOPIC: The [Course Name] Scam

1. [Attack] This guy promises you $1M in 30 days. Are you stupid?
2. [The Roast] Look at his rented Lambo. The tag is still on the key!
3. [The Evidence] I checked his company filings. He made $0 last year.
4. [Comparison] Real businessmen don't sell courses; they sell products.
5. [Verdict] Stop feeding these clowns. It's a pyramid scheme.`
  },
  {
    id: 'raftar-hypocrisy',
    title: 'Political Hypocrisy',
    description: 'Calling out double standards.',
    creatorId: 'raftar',
    content: `TOPIC: [Leader]'s Double Standard

1. [Hook] He says "Save Water" while washing his 10 cars! The audacity!
2. [The Clip] Play the clip of him preaching. Now look at reality.
3. [The Rant] Do they think we are blind?
4. [The Callout] If you vote for this, you deserve it.
5. [Closing] Wake up.`
  },
  {
    id: 'hormozi-offer',
    title: 'The Grand Slam Offer',
    description: 'Business framework for sales.',
    creatorId: 'alexhormozi',
    content: `TOPIC: Make An Offer They Can't Refuse

1. [Hook] If you aren't making money, your offer sucks. Period.
2. [The Equation] Value = (Dream Outcome x Likelihood of Achievement) / (Time Delay x Effort).
3. [The Fix] Decrease the effort. Make it instant.
4. [Example] Don't sell "Weight Loss". Sell "Liposuction in a pill".
5. [Directive] Go fix your offer.`
  },
  {
    id: 'hormozi-ego',
    title: 'Kill Your Ego',
    description: 'Mindset shift for entrepreneurs.',
    creatorId: 'alexhormozi',
    content: `TOPIC: Why You Are Poor

1. [Hard Truth] You are poor because you suck.
2. [The Data] The market doesn't care about your feelings. It cares about value.
3. [The Action] You need to do the boring work. Cold calls. Emails.
4. [The volume] Do it 100 times a day.
5. [Closing] You don't have a strategy problem. You have a volume problem.`
  },
  {
    id: 'peterson-men',
    title: 'The Burden of Men',
    description: 'Psychological advice for young men.',
    creatorId: 'jordanpeterson',
    content: `TOPIC: Why You Need Responsibility

1. [The Crisis] Young men are lost. They have no burden to carry.
2. [The Archetype] Pinocchio remained a puppet until he rescued his father from the whale.
3. [The Meaning] Meaning is found in the adoption of maximal responsibility.
4. [The Warning] If you don't grow up, you become bitter. And a bitter man is dangerous.
5. [Closing] Pick up your cross and walk.`
  },
  {
    id: 'peterson-shadow',
    title: 'Integrate The Shadow',
    description: 'Jungian psychology explainer.',
    creatorId: 'jordanpeterson',
    content: `TOPIC: Why You Should Be Dangerous

1. [Hook] You should be a monster. And then you should learn to control it.
2. [The Reason] A harmless man is not a good man. He is just weak.
3. [The Shadow] Jung called this the Shadow. The part of you that is capable of malevolence.
4. [Integration] If you know you can bite, you don't have to. That is true virtue.
5. [Closing] Be dangerous, but disciplined.`
  },
  {
    id: 'veritasium-light',
    title: 'Speed of Light Paradox',
    description: 'Physics thought experiment.',
    creatorId: 'veritasium',
    content: `TOPIC: Is the Speed of Light Infinite?

1. [The Hook] We think we know the speed of light. But we've never actually measured it.
2. [The Problem] To measure speed, you need a round trip.
3. [The Twist] What if light moves instantly in one direction and at half speed in the other?
4. [The Experiment] Einstein assumed it was the same. But it's just a convention.
5. [Conclusion] We might be living in a universe where we see things instantly.`
  },
  {
    id: 'veritasium-math',
    title: 'The $1M Math Riddle',
    description: 'Explaining the Collatz Conjecture.',
    creatorId: 'veritasium',
    content: `TOPIC: The Simplest Impossible Problem

1. [Hook] Here is a problem a 5-year-old can understand, but no mathematician can solve.
2. [The Rule] Pick a number. If even, divide by 2. If odd, 3n+1.
3. [The Pattern] It always goes to 1. Or does it?
4. [The Scale] We have checked numbers up to 2 to the 68th power.
5. [The Mystery] Mathematics may not be ready for such problems.`
  },
  {
    id: 'iman-agency',
    title: 'The SMMA Model',
    description: 'Business model breakdown.',
    creatorId: 'imangadzhi',
    content: `TOPIC: The Best Business for Beginners

1. [Hook] Dropshipping is dead. Crypto is gambling. You need cash flow.
2. [The Model] Service. Marketing. Agency.
3. [The Logic] Businesses have money. They need customers. You bridge the gap.
4. [The Path] You don't need money to start. You need a phone and a brain.
5. [Closing] Stop consuming. Start creating.`
  },
  {
    id: 'sharan-credit',
    title: 'Credit Card Infinite Loop',
    description: 'Finance hack sketch.',
    creatorId: 'sharanhegde',
    content: `TOPIC: Unlimited Airport Lounge Access

1. [Skit] *At airport* "Sir, your card is rejected."
2. [The Flex] "Try this one." *Pulls out metal card*
3. [The Hack] Most people pay for this card. I get it for free.
4. [Explanation] If you spend [Amount] in the first 90 days, the points cover the fee.
5. [Closing] Follow for more money hacks!`
  }
];

export const DUMMY_SCRIPT: ScriptData = {
  topic: "Why Electric Cars are the Future",
  type: "Shorts/Reels",
  title: "The EV Lie You Believe",
  detectedIntent: "Controversy/Education",
  targetAudience: "Gen Z",
  language: "English",
  duration: "60 Seconds (Shorts)",
  segments: [
    {
      visual: "[Fast Cut] Chaos of city traffic, honking noise, smoke coming from exhaust pipe.",
      audio: "Do you think this smoke is just killing the environment? Wrong. It is killing us. Hello Friends."
    },
    {
      visual: "[Map Animation] Zoom into city map, turning red to represent rising temperatures.",
      audio: "Look at the data. In the last 5 years, lung diseases have increased by 30%. And the main culprit? Our old cars."
    }
  ],
  ctas: [
    "Share this with a petrol-head.",
    "Subscribe for the future of tech."
  ],
  citations: [
    {
      id: '1',
      type: 'Research',
      sourceName: 'The Lancet Respiratory Medicine',
      context: 'Used for lung disease statistics.'
    },
    {
      id: '2',
      type: 'Report',
      sourceName: 'Ministry of Road Transport',
      context: 'Vehicle emission data.'
    }
  ]
};

export const DUMMY_ANALYSIS: AnalysisData = {
  hookScore: 88,
  viralityLabel: 'Viral',
  retentionData: [
    { time: '0s', retention: 100 },
    { time: '10s', retention: 92 },
    { time: '20s', retention: 85 },
    { time: '30s', retention: 88 },
    { time: '40s', retention: 75 },
    { time: 'End', retention: 70 },
  ],
  suggestions: [
    "Pattern Interrupt needed at 0:20 - Audience attention dips.",
    "The hook uses a fear-based trigger which is highly effective.",
    "Try adding a sound effect or 'Question Overlay' at segment 3."
  ],
  dropOffPrediction: "Viewer drop likely at 0:12 due to complex data explanation."
};
