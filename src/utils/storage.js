import { DEFAULT_QUESTIONS } from '../data/defaultQuestions';

const QUESTIONS_KEY = 'preguntados_scout_questions';
const STATS_KEY = 'preguntados_scout_stats';

// Load questions from localStorage or fallback to default
export function getStoredQuestions() {
  try {
    const raw = localStorage.getItem(QUESTIONS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading questions from storage:', e);
  }
  return DEFAULT_QUESTIONS;
}

// Save questions to localStorage
export function saveQuestions(questions) {
  try {
    localStorage.setItem(QUESTIONS_KEY, JSON.stringify(questions));
  } catch (e) {
    console.error('Error saving questions:', e);
  }
}

// Reset questions to original default set
export function resetQuestionsToDefault() {
  try {
    localStorage.removeItem(QUESTIONS_KEY);
  } catch (e) {
    console.error('Error resetting questions:', e);
  }
  return DEFAULT_QUESTIONS;
}

// Game statistics
export function getStoredStats() {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading stats:', e);
  }
  return {
    gamesPlayed: 0,
    questionsAnswered: 0,
    correctAnswers: 0,
    badgesEarned: 0,
    patrolWins: {}
  };
}

export function updateStats(updater) {
  try {
    const current = getStoredStats();
    const updated = updater(current);
    localStorage.setItem(STATS_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Error updating stats:', e);
  }
}

