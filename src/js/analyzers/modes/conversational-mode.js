// Conversational Mode Analyzer
// Promotes a natural, spoken-like tone with simple language, contractions, and familiarity

import { 
  replacePhrases, 
  highlightWords, 
  createHighlight, 
  countWords 
} from './mode-utils.js';

// Formal phrases that should use contractions
const CONTRACTION_MAP = {
  "do not": "don't",
  "will not": "won't", 
  "cannot": "can't",
  "should not": "shouldn't",
  "would not": "wouldn't",
  "could not": "couldn't",
  "have not": "haven't",
  "has not": "hasn't",
  "had not": "hadn't",
  "is not": "isn't",
  "are not": "aren't",
  "was not": "wasn't",
  "were not": "weren't",
  "does not": "doesn't",
  "did not": "didn't",
  "it is": "it's",
  "it has": "it's",
  "they are": "they're",
  "they have": "they've",
  "we are": "we're",
  "we have": "we've",
  "you are": "you're",
  "you have": "you've",
  "I am": "I'm",
  "I have": "I've",
  "I will": "I'll",
  "you will": "you'll",
  "we will": "we'll",
  "they will": "they'll"
};

// Formal words that sound stuffy in conversation
const FORMAL_WORDS = {
  "commence": "start",
  "terminate": "end", 
  "utilize": "use",
  "facilitate": "help",
  "demonstrate": "show",
  "subsequently": "then",
  "aforementioned": "this",
  "endeavor": "try",
  "purchase": "buy",
  "assist": "help",
  "advise": "tell",
  "regarding": "about",
  "concerning": "about",
  "pertaining": "about",
  "additional": "extra",
  "numerous": "many",
  "obtain": "get",
  "acquire": "get",
  "possess": "have",
  "residence": "home",
  "automobile": "car",
  "beverage": "drink",
  "employment": "job",
  "sufficient": "enough",
  "remainder": "rest",
  "individuals": "people",
  "persons": "people",
  "construct": "build",
  "establish": "set up",
  "indicate": "show",
  "require": "need",
  "accomplish": "do",
  "attempt": "try",
  "component": "part",
  "participate": "take part",
  "implement": "carry out"
};

// Impersonal phrases that should be more direct
const IMPERSONAL_PHRASES = {
  "the user": "you",
  "the customer": "you", 
  "the applicant": "you",
  "the client": "you",
  "the individual": "you",
  "one should": "you should",
  "one must": "you must", 
  "one can": "you can",
  "it is recommended": "we recommend",
  "it is suggested": "we suggest",
  "individuals must": "you must",
  "persons should": "you should",
  "users need to": "you need to",
  "customers should": "you should",
  "people need to": "you need to"
};

// Complex conjunctions that are rarely used in speech
const COMPLEX_CONJUNCTIONS = {
  "furthermore": "also",
  "nevertheless": "but",
  "consequently": "so", 
  "moreover": "also",
  "therefore": "so",
  "however": "but",
  "thus": "so",
  "hence": "so",
  "accordingly": "so",
  "nonetheless": "still",
  "notwithstanding": "despite",
  "inasmuch as": "since",
  "whereas": "while",
  "whereby": "where"
};

// Overly formal transitions
const FORMAL_TRANSITIONS = {
  "in conclusion": "to sum up",
  "in summary": "to sum up",
  "to summarize": "in short",
  "in addition": "also",
  "additionally": "also",
  "alternatively": "or",
  "conversely": "on the other hand",
  "subsequently": "then",
  "ultimately": "in the end",
  "initially": "first",
  "finally": "last"
};

/**
 * Analyze sentence for conversational tone issues
 * @param {string} sentence - Sentence to analyze
 * @param {Object} data - Data object to update counts
 * @param {string} fullText - Complete text for context
 * @returns {string} Sentence with conversational highlights
 */
export function getConversationalAnalysis(sentence, data, fullText = '') {
  let result = sentence;
  
  // Check for missing contractions
  const contractionResult = replacePhrases(result, CONTRACTION_MAP, 'conversational-missing-contraction');
  if (contractionResult !== result) {
    data.conversational.missingContractions += countMatches(result, CONTRACTION_MAP);
    result = contractionResult;
  }
  
  // Highlight formal words
  const formalResult = replacePhrases(result, FORMAL_WORDS, 'conversational-formal');
  if (formalResult !== result) {
    data.conversational.formalWords += countMatches(result, FORMAL_WORDS);
    result = formalResult;
  }
  
  // Replace impersonal language
  const impersonalResult = replacePhrases(result, IMPERSONAL_PHRASES, 'conversational-impersonal');
  if (impersonalResult !== result) {
    data.conversational.impersonalLanguage += countMatches(result, IMPERSONAL_PHRASES);
    result = impersonalResult;
  }
  
  // Highlight complex conjunctions
  const conjunctionResult = replacePhrases(result, COMPLEX_CONJUNCTIONS, 'conversational-complex');
  if (conjunctionResult !== result) {
    data.conversational.complexConjunctions += countMatches(result, COMPLEX_CONJUNCTIONS);
    result = conjunctionResult;
  }
  
  // Replace formal transitions
  const transitionResult = replacePhrases(result, FORMAL_TRANSITIONS, 'conversational-transition');
  if (transitionResult !== result) {
    data.conversational.formalTransitions += countMatches(result, FORMAL_TRANSITIONS);
    result = transitionResult;
  }
  
  // Check for overly complex sentences (more than 2 clauses)
  if (hasComplexStructure(sentence)) {
    data.conversational.complexSentences += 1;
    result = createHighlight(result, 'conversational-complex-sentence', 
      'Simplify this sentence', 'Break this into simpler sentences for better conversation flow');
  }
  
  return result;
}

/**
 * Check if sentence has overly complex structure for conversation
 * @param {string} sentence - Sentence to analyze
 * @returns {boolean} True if sentence is too complex
 */
function hasComplexStructure(sentence) {
  // Count clause indicators (rough approximation)
  const clauseIndicators = /[,;:]\s*(?:and|but|or|which|that|who|where|when|while|although|because|since|if|unless|until|after|before)/gi;
  const matches = sentence.match(clauseIndicators);
  
  // Also check for long sentences with multiple ideas
  const wordCount = countWords(sentence);
  const clauseCount = matches ? matches.length : 0;
  
  // Consider complex if:
  // 1. More than 2 clauses, OR
  // 2. More than 25 words with any clauses
  return clauseCount > 2 || (wordCount > 25 && clauseCount > 0);
}

/**
 * Count how many phrases from a list appear in the sentence
 * @param {string} sentence - Sentence to check
 * @param {Object} phraseList - Object with phrases as keys
 * @returns {number} Count of matches
 */
function countMatches(sentence, phraseList) {
  let count = 0;
  
  for (const phrase of Object.keys(phraseList)) {
    const regex = new RegExp(`\\b${phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    const matches = sentence.match(regex);
    if (matches) count += matches.length;
  }
  
  return count;
}

/**
 * Analyze entire text for conversational tone
 * @param {string} text - Full text to analyze
 * @returns {Object} Conversational analysis results
 */
export function analyzeConversationalTone(text) {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  // Count questions (good for engagement)
  const questionCount = (text.match(/\?/g) || []).length;
  const questionPercentage = sentences.length > 0 ? (questionCount / sentences.length) * 100 : 0;
  
  // Count contractions (good for conversational tone)
  const contractionPatterns = /'(t|s|re|ve|ll|d|m)\b/gi;
  const contractionMatches = text.match(contractionPatterns) || [];
  const contractionCount = contractionMatches.length;
  
  // Count formal words
  let formalWordCount = 0;
  for (const formalWord of Object.keys(FORMAL_WORDS)) {
    const regex = new RegExp(`\\b${formalWord}\\b`, 'gi');
    const matches = text.match(regex);
    if (matches) formalWordCount += matches.length;
  }
  
  // Count personal pronouns (you, we, I)
  const personalPronouns = /\b(you|we|I|us|me|our|your)\b/gi;
  const personalPronounMatches = text.match(personalPronouns) || [];
  const personalPronounCount = personalPronounMatches.length;
  
  // Calculate conversational score (0-100, higher is better)
  let score = 50; // Start at middle
  
  // Add points for good conversational elements
  score += Math.min(contractionCount * 2, 15); // Contractions are good
  score += Math.min(questionPercentage * 0.5, 10); // Questions engage readers
  score += Math.min(personalPronounCount * 0.5, 15); // Personal pronouns create connection
  
  // Subtract points for formal elements
  score -= Math.min(formalWordCount * 3, 25); // Formal words reduce conversational tone
  
  // Check average sentence length (conversational writing tends to vary)
  const totalWords = countWords(text);
  const averageWordsPerSentence = sentences.length > 0 ? totalWords / sentences.length : 0;
  if (averageWordsPerSentence > 20) {
    score -= Math.min((averageWordsPerSentence - 20) * 1.5, 15);
  }
  
  return {
    score: Math.max(0, Math.min(100, Math.round(score))),
    questionPercentage: Math.round(questionPercentage),
    contractionCount: contractionCount,
    formalWordCount: formalWordCount,
    personalPronounCount: personalPronounCount,
    averageWordsPerSentence: Math.round(averageWordsPerSentence * 10) / 10,
    recommendations: generateConversationalRecommendations(score, {
      questionPercentage,
      contractionCount,
      formalWordCount,
      personalPronounCount,
      totalWords
    })
  };
}

/**
 * Generate specific recommendations for improving conversational tone
 * @param {number} score - Current conversational score
 * @param {Object} metrics - Analysis metrics
 * @returns {Array} Array of recommendation strings
 */
function generateConversationalRecommendations(score, metrics) {
  const recommendations = [];
  
  if (metrics.contractionCount === 0 && metrics.totalWords > 50) {
    recommendations.push("Use contractions (don't, can't, you're) to sound more natural.");
  }
  
  if (metrics.formalWordCount > 5) {
    recommendations.push("Replace formal words with simpler alternatives (use 'start' instead of 'commence').");
  }
  
  if (metrics.personalPronounCount < 3 && metrics.totalWords > 100) {
    recommendations.push("Use more personal pronouns (you, we, I) to connect with readers.");
  }
  
  if (metrics.questionPercentage === 0 && metrics.totalWords > 100) {
    recommendations.push("Add questions to engage your readers (What does this mean? How does this help?).");
  }
  
  if (score > 80) {
    recommendations.push("Excellent conversational tone! Your writing feels natural and engaging.");
  } else if (score > 60) {
    recommendations.push("Good conversational tone with room to be more natural.");
  } else if (score > 40) {
    recommendations.push("Your writing could be more conversational - try reading it out loud.");
  } else {
    recommendations.push("Focus on writing like you talk - use simple words and direct language.");
  }
  
  return recommendations;
}

// Export mappings for use in other modules
export { 
  CONTRACTION_MAP, 
  FORMAL_WORDS, 
  IMPERSONAL_PHRASES, 
  COMPLEX_CONJUNCTIONS, 
  FORMAL_TRANSITIONS 
};
