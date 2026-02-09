

export interface CreatorBio {
  name: string;
  handle: string;
  avatarUrl: string;
  archetype: string;
  tagline: string;
  color: string;
  hex: string;
  philosophy: {
    coreBeliefs: string[];
    contentGoal: string;
  };
  voice: {
    tone: string;
    pacing: string;
    emotionalRange: string;
    vocabulary: string;
    signaturePhrases?: string[];
  };
  structure: {
    hookStyle: string;
    bodyStructure: string;
    closingStyle: string;
  };
  research: {
    methodology: string;
    bias: string;
    preferredSources: string[];
  };
}

export interface CreatorProfile {
  id: string;
  name: string;
  style: string;
  color: string; // Tailwind color class logic
  hex: string;   // For inline styles
  avatarUrl: string;
  systemPrompt: string; // Legacy field, kept for compatibility but populated from bio
  bio: CreatorBio; // New Deep Profile
  isPremium?: boolean;
  locked?: boolean;
}

export interface Citation {
  id: string;
  type: 'News' | 'Research' | 'Report' | 'Public Data' | 'Official';
  sourceName: string;
  context: string;
  url?: string;
  reliabilityScore?: 'High' | 'Medium' | 'Low';
  isVerified?: boolean;
}

export interface ScriptSegment {
  visual: string;
  audio: string;
  isWeak?: boolean;
  rewriteSuggestion?: string;
  generatedImageUrl?: string; // For Visual Preview
  isGeneratingImage?: boolean;
}

export interface HookOption {
  id: string;
  type: 'Mystery' | 'Controversy' | 'Relatable Story';
  visual: string;
  audio: string;
  score: number;
  reasoning: string;
}

export interface ScriptPackage {
  title: string;
  detectedIntent: string;
  targetAudience: string;
  segments: ScriptSegment[];
  ctas: string[];
  citations?: Citation[]; // Added citations
  retentionVersion?: ScriptSegment[];
  // Auto Creator Metadata
  autoCreatorSelection?: {
    selectedId: string;
    reason: string;
    alternatives?: string[]; // List of other creators considered
  };
  // Blend Metadata
  blendMetadata?: {
      primaryCreator: string;
      secondaryCreators: string[];
      blendRatio: string;
  };
}

export interface EnhancementLog {
  improvedFields: string[];
  summary: string;
  originalSegments?: ScriptSegment[]; // For rollback
}

// --- NEW FEATURE TYPES ---

export interface SimulationPersona {
  id: string;
  demographic: string;
  reaction: string;
  dropPointTime: string;
  emotionalTrigger: string;
}

export interface SimulationResult {
  retentionHeatmap: { second: number; score: number; comment?: string }[];
  personas: SimulationPersona[];
  microFixes: { original: string; fix: string; impact: string }[];
  predictedRetention: number;
}

export interface ProductionScene {
  id: string;
  timeStart: string;
  duration: string;
  cameraDirection: string; // Closeup, Wide, Montage
  audioCue: string; // Music mood, SFX
  visualPrompt: string;
  onScreenText: string;
}

export interface DirectorPlan {
  scenes: ProductionScene[];
  thumbnails: { description: string; textOverlay: string; score: number }[];
  editingNotes: string;
  musicMood: string;
}

export interface ExperimentVariant {
  id: string;
  type: 'Hook A/B' | 'Tone Shift' | 'Length';
  content: ScriptData;
  predictedWinner: boolean;
  confidence: number;
  reason: string;
}

export interface ScriptData extends ScriptPackage {
  id?: string;
  topic: string;
  type: 'Long Form' | 'Shorts/Reels' | 'TikTok' | 'Instagram' | 'LinkedIn' | 'YouTube Long Form' | 'YouTube Shorts' | 'Instagram Reels' | 'LinkedIn Video' | 'Podcast Intro' | string;
  duration: string; // Persisted duration for logic checks
  language?: string; // Added for language persistence
  // Flattened for easier UI access (optional, but keeping consistent with previous state)
  autoCreatorUsed?: boolean;
  autoCreatorReason?: string;
  selectedCreatorName?: string;
  enhancementLog?: EnhancementLog; // New Insight Boost Data
  
  // New Feature Data
  simulation?: SimulationResult;
  directorPlan?: DirectorPlan;
  experiments?: ExperimentVariant[];
  
  // Canvas Mode Data
  userEditedScript?: string; // Stores the flat-text version from Canvas
  lastEditedAt?: string;
}

export interface AnalysisData {
  hookScore: number;
  viralityLabel: 'Low' | 'Medium' | 'Viral';
  retentionData: { time: string; retention: number }[];
  suggestions: string[];
  dropOffPrediction?: string;
  // New Enhanced Metrics
  truthScore?: number; 
  monetizationRisks?: string[];
  safetyFlags?: { severity: 'low' | 'medium' | 'high'; reason: string }[];
}

export interface SavedScript extends ScriptData {
  id: string;
  createdAt: string;
  creatorId: string;
  creatorName: string;
  creatorStyle: string;
  analysis?: AnalysisData;
}

export interface Template {
  id: string;
  title: string;
  description: string;
  creatorId: string;
  content: string;
}

export enum AppState {
  IDLE,
  GENERATING_HOOKS,
  CHOOSING_HOOK,
  GENERATING_SCRIPT,
  ANALYZING,
  READY
}

export type UserPlan = 'free' | 'pro';
export type SidebarView = 'studio' | 'history' | 'templates';
export type WritingMode = 'manual' | 'auto' | 'blend';

export interface UsageStats {
  date: string;
  count: number;
}

export interface ReferenceImage {
  id: string;
  data: string; // base64 string
  mimeType: string;
  previewUrl: string; // object URL for UI
}

export interface BlendConfig {
    primaryCreatorId: string;
    secondaryCreatorIds: string[];
}

export interface GeneratorConfig {
  topicOrScript: string;
  duration: string;
  language: string;
  expertise: 'Beginner' | 'Intermediate' | 'Expert';
  platform: string;
  rewriteAggressiveness: 'Low' | 'Medium' | 'High';
  transformationType: 'Full Rewrite' | 'Hook Focus' | 'Retention Optimization' | 'Tone Shift' | 'Fix Weaknesses';
  
  writingMode: WritingMode; // Replaces isAutoCreator
  selectedStyleId: string; // Acts as Manual Selection OR Primary Blend Selection
  blendConfig: BlendConfig; // For Blend Mode
  
  // New Fields
  arabicDialect?: string;
  sponsorInfo?: {
      enabled: boolean;
      name: string;
      product: string;
      message: string;
  };
  referenceImages?: ReferenceImage[]; // Multimodal Support
}

export interface TopicSuggestion {
  refinedTopic: string;
  reason: string;
  type: 'Angle' | 'Clarity' | 'Depth';
}

export interface TypographyConfig {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  isCustomFont?: boolean;
  customFontUrl?: string;
}

export interface AudioConfig {
  tone: string;
  speed: string;
  deliveryStyle: string;
}

export interface AudioDialogueData {
  dialogue: string;
}

export interface CanvasHistoryState {
    past: string[];
    present: string;
    future: string[];
}

export interface YoutubeTitle {
  text: string;
  ctrScore: number;
  pattern: 'Explanation' | 'Investigation' | 'Curiosity' | 'Shock' | 'List';
  thumbnailText: string;
  reasoning: string;
}