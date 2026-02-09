import { SavedScript, ScriptData, AnalysisData, CreatorProfile, UsageStats } from "../types";

const STORAGE_KEY = 'viralscript_history_v1';
const USAGE_KEY = 'viralscript_daily_usage';

export const saveScriptToHistory = (
  script: ScriptData, 
  creator: CreatorProfile, 
  analysis?: AnalysisData
): SavedScript => {
  const history = getHistory();
  
  // If script already has an ID, we might be updating it, but for simplicity in this flow,
  // if it's a fresh generation, we create a new entry.
  // If we are updating an existing one (e.g. adding analysis), we find and update.
  
  let newEntry: SavedScript;

  const existingIndex = script.id ? history.findIndex(h => h.id === script.id) : -1;

  if (existingIndex >= 0) {
    // Update existing
    newEntry = {
      ...history[existingIndex],
      ...script,
      analysis: analysis || history[existingIndex].analysis, // Keep old analysis if not provided, or overwrite
    };
    history[existingIndex] = newEntry;
  } else {
    // Create new
    newEntry = {
      ...script,
      id: script.id || crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      creatorId: creator.id,
      creatorName: creator.name,
      creatorStyle: creator.style,
      analysis: analysis
    };
    // Add to beginning
    history.unshift(newEntry);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  return newEntry;
};

export const getHistory = (): SavedScript[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to parse history", e);
    return [];
  }
};

export const deleteScriptFromHistory = (id: string) => {
  const history = getHistory();
  const filtered = history.filter(s => s.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};

export const incrementDailyUsage = () => {
  const today = new Date().toISOString().split('T')[0];
  let stats: UsageStats = { date: today, count: 0 };
  
  try {
    const raw = localStorage.getItem(USAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.date === today) {
        stats = parsed;
      }
    }
  } catch (e) {
    // ignore
  }

  stats.count += 1;
  localStorage.setItem(USAGE_KEY, JSON.stringify(stats));
  return stats.count;
};

export const getDailyUsage = (): number => {
  const today = new Date().toISOString().split('T')[0];
  try {
    const raw = localStorage.getItem(USAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.date === today) {
        return parsed.count;
      }
    }
  } catch (e) {
    // ignore
  }
  return 0;
};

// Mock subscription check
export const checkLimit = (plan: 'free' | 'pro'): boolean => {
  if (plan === 'pro') return true;
  const count = getDailyUsage();
  return count < 3; // Free limit: 3 scripts per day
};