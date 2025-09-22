// Brevity Mode Analyzer
// Encourages concise writing by reducing wordiness, redundancy, and unnecessary phrases

import { 
  checkSentenceLength, 
  replacePhrases, 
  highlightWords, 
  createHighlight, 
  countWords,
  calculatePassivePercentage 
} from './mode-utils.js';

// Wordy phrases that can be shortened
const WORDY_PHRASES = {
  "in order to": "to",
  "due to the fact that": "because",
  "at this point in time": "now",
  "in the event of": "if",
  "with regard to": "about",
  "in accordance with": "under",
  "prior to": "before",
  "on receipt": "when we get",
  "should you wish": "if you want",
  "in respect of": "for",
  "in excess of": "more than",
  "with the exception of": "except",
  "for the purpose of": "to",
  "in spite of the fact that": "although",
  "until such time as": "until",
  "during the course of": "during",
  "in the near future": "soon",
  "at the present time": "now",
  "in view of the fact that": "because",
  "on the grounds that": "because"
};

// Redundant phrases where one word is sufficient
const REDUNDANT_PHRASES = {
  "advance planning": "planning",
  "basic fundamentals": "fundamentals", 
  "completely eliminate": "eliminate",
  "end result": "result",
  "final outcome": "outcome",
  "future plans": "plans",
  "past history": "history",
  "repeat again": "repeat",
  "absolutely essential": "essential",
  "totally unique": "unique",
  "general consensus": "consensus",
  "personal opinion": "opinion",
  "brief summary": "summary",
  "exact same": "same",
  "close proximity": "proximity",
  "each individual": "each",
  "first priority": "priority",
  "serious crisis": "crisis",
  "true facts": "facts",
  "unexpected surprise": "surprise"
};

// Filler words that add no value
const FILLER_WORDS = [
  "really", "very", "quite", "rather", "somewhat", "actually", 
  "basically", "literally", "obviously", "certainly", "definitely",
  "absolutely", "totally", "completely", "entirely", "extremely",
  "incredibly", "remarkably", "particularly", "especially", "particularly"
];

// Weak qualifiers that reduce impact
const WEAK_QUALIFIERS = [
  "kind of", "sort of", "a bit", "a little", "somewhat", "fairly",
  "pretty much", "more or less", "I think", "I believe", "I feel",
  "it seems", "appears to be", "tends to", "might be"
];

/**
 * Analyze sentence for brevity issues
 * @param {string} sentence - Sentence to analyze
 * @param {Object} data - Data object to update counts
 * @param {string} fullText - Complete text for context
 * @returns {string} Sentence with brevity highlights
 */
export function getBrevityAnalysis(sentence, data, fullText = '') {
  let result = sentence;
  
  // Check sentence length (stricter for brevity mode)
  const lengthCheck = checkSentenceLength(sentence, 15);
  if (lengthCheck.issue) {
    data.brevity.longSentences += 1;
    result = createHighlight(result, 'brevity-long-sentence', 
      'Break into shorter sentences', lengthCheck.suggestion);
  }
  
  // Replace wordy phrases
  const wordyResult = replacePhrases(result, WORDY_PHRASES, 'brevity-wordy');
  if (wordyResult !== result) {
    data.brevity.wordyPhrases += countMatches(result, WORDY_PHRASES);
    result = wordyResult;
  }
  
  // Replace redundant phrases
  const redundantResult = replacePhrases(result, REDUNDANT_PHRASES, 'brevity-redundant');
  if (redundantResult !== result) {
    data.brevity.redundantPhrases += countMatches(result, REDUNDANT_PHRASES);
    result = redundantResult;
  }
  
  // Highlight filler words
  const fillerResult = highlightWords(result, FILLER_WORDS, 'brevity-filler', 
    'Remove this filler word for more impact');
  if (fillerResult !== result) {
    data.brevity.fillerWords += countMatches(result, FILLER_WORDS);
    result = fillerResult;
  }
  
  // Highlight weak qualifiers
  const qualifierResult = highlightWords(result, WEAK_QUALIFIERS, 'brevity-qualifier',
    'Consider removing this qualifier for stronger writing');
  if (qualifierResult !== result) {
    data.brevity.weakQualifiers += countMatches(result, WEAK_QUALIFIERS);
    result = qualifierResult;
  }
  
  return result;
}

/**
 * Count how many phrases from a list appear in the sentence
 * @param {string} sentence - Sentence to check
 * @param {Object|Array} phraseList - List of phrases to count
 * @returns {number} Count of matches
 */
function countMatches(sentence, phraseList) {
  const phrases = Array.isArray(phraseList) ? phraseList : Object.keys(phraseList);
  let count = 0;
  
  for (const phrase of phrases) {
    const regex = new RegExp(`\\b${phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    const matches = sentence.match(regex);
    if (matches) count += matches.length;
  }
  
  return count;
}

/**
 * Analyze entire text for brevity metrics
 * @param {string} text - Full text to analyze
 * @returns {Object} Brevity analysis results
 */
export function analyzeBrevityMetrics(text) {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const totalWords = countWords(text);
  const averageWordsPerSentence = sentences.length > 0 ? totalWords / sentences.length : 0;
  
  // Count long sentences
  const longSentences = sentences.filter(s => countWords(s) > 15).length;
  const longSentencePercentage = sentences.length > 0 ? (longSentences / sentences.length) * 100 : 0;
  
  // Calculate passive voice percentage
  const passivePercentage = calculatePassivePercentage(text);
  
  // Count total wordy phrases
  let totalWordyPhrases = 0;
  const allWordyPhrases = {...WORDY_PHRASES, ...REDUNDANT_PHRASES};
  for (const phrase of Object.keys(allWordyPhrases)) {
    const regex = new RegExp(`\\b${phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    const matches = text.match(regex);
    if (matches) totalWordyPhrases += matches.length;
  }
  
  // Calculate brevity score (0-100, higher is better)
  let score = 100;
  
  // Deduct for long sentences
  score -= Math.min(longSentencePercentage * 0.5, 25);
  
  // Deduct for excessive passive voice (should be under 10% for brevity)
  if (passivePercentage > 10) {
    score -= Math.min((passivePercentage - 10) * 2, 20);
  }
  
  // Deduct for wordy phrases
  score -= Math.min(totalWordyPhrases * 3, 20);
  
  // Deduct for overly long average sentence length
  if (averageWordsPerSentence > 15) {
    score -= Math.min((averageWordsPerSentence - 15) * 2, 15);
  }
  
  return {
    score: Math.max(0, Math.round(score)),
    averageWordsPerSentence: Math.round(averageWordsPerSentence * 10) / 10,
    longSentencePercentage: Math.round(longSentencePercentage),
    passivePercentage: passivePercentage,
    totalWordyPhrases: totalWordyPhrases,
    recommendations: generateBrevityRecommendations(score, {
      longSentencePercentage,
      passivePercentage, 
      totalWordyPhrases,
      averageWordsPerSentence
    })
  };
}

/**
 * Generate specific recommendations for improving brevity
 * @param {number} score - Current brevity score
 * @param {Object} metrics - Analysis metrics
 * @returns {Array} Array of recommendation strings
 */
function generateBrevityRecommendations(score, metrics) {
  const recommendations = [];
  
  if (metrics.longSentencePercentage > 30) {
    recommendations.push("Break up long sentences - aim for 15 words or fewer per sentence.");
  }
  
  if (metrics.passivePercentage > 15) {
    recommendations.push("Use more active voice - replace passive constructions with active ones.");
  }
  
  if (metrics.totalWordyPhrases > 3) {
    recommendations.push("Replace wordy phrases with shorter alternatives (e.g., 'in order to' → 'to').");
  }
  
  if (metrics.averageWordsPerSentence > 20) {
    recommendations.push("Reduce average sentence length for better readability.");
  }
  
  if (score > 80) {
    recommendations.push("Excellent brevity! Your writing is concise and impactful.");
  } else if (score > 60) {
    recommendations.push("Good brevity with room for improvement.");
  } else {
    recommendations.push("Focus on cutting unnecessary words and phrases.");
  }
  
  return recommendations;
}

// Export phrase lists for use in other modules
export { WORDY_PHRASES, REDUNDANT_PHRASES, FILLER_WORDS, WEAK_QUALIFIERS };
