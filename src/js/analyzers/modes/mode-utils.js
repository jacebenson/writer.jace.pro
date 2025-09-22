// Mode utilities for writing mode analysis
// Common functions used across different writing modes

/**
 * Count words in a sentence, excluding punctuation
 * @param {string} sentence - The sentence to count words in
 * @returns {number} Word count
 */
export function countWords(sentence) {
  return sentence.trim().split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Create a highlighted span with replacement suggestion
 * @param {string} text - Text to highlight
 * @param {string} className - CSS class for the span
 * @param {string} suggestion - Suggested replacement
 * @param {string} reason - Reason for the suggestion
 * @returns {string} HTML span element
 */
export function createHighlight(text, className, suggestion = '', reason = '') {
  let attributes = `class="${className}"`;
  if (suggestion) {
    attributes += ` data-suggestion="${suggestion}"`;
  }
  if (reason) {
    attributes += ` data-reason="${reason}"`;
  }
  return `<span ${attributes}>${text}</span>`;
}

/**
 * Replace phrases in text with highlighted versions
 * @param {string} sentence - Sentence to process
 * @param {Object} phraseMap - Map of phrases to replacements
 * @param {string} className - CSS class for highlights
 * @returns {string} Processed sentence with highlights
 */
export function replacePhrases(sentence, phraseMap, className) {
  let result = sentence;
  
  for (const [phrase, replacement] of Object.entries(phraseMap)) {
    const regex = new RegExp(`\\b${escapeRegex(phrase)}\\b`, 'gi');
    if (regex.test(result)) {
      const highlighted = createHighlight(phrase, className, replacement, 
        `Consider using "${replacement}" instead of "${phrase}"`);
      result = result.replace(regex, highlighted);
    }
  }
  
  return result;
}

/**
 * Escape special regex characters in a string
 * @param {string} string - String to escape
 * @returns {string} Escaped string
 */
function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Check if sentence length exceeds threshold
 * @param {string} sentence - Sentence to check
 * @param {number} maxWords - Maximum word count
 * @returns {Object} Result with issue flag and details
 */
export function checkSentenceLength(sentence, maxWords = 15) {
  const wordCount = countWords(sentence);
  
  if (wordCount > maxWords) {
    return {
      issue: true,
      wordCount: wordCount,
      suggestion: `This sentence has ${wordCount} words. Consider breaking it into shorter sentences (aim for ${maxWords} words or fewer).`,
      severity: wordCount > maxWords * 1.5 ? 'high' : 'medium'
    };
  }
  
  return { issue: false, wordCount: wordCount };
}

/**
 * Highlight words from a list in the sentence
 * @param {string} sentence - Sentence to process
 * @param {Array} wordList - Array of words to highlight
 * @param {string} className - CSS class for highlights
 * @param {string} suggestion - General suggestion for all highlighted words
 * @returns {string} Processed sentence with highlights
 */
export function highlightWords(sentence, wordList, className, suggestion = '') {
  let result = sentence;
  
  for (const word of wordList) {
    const regex = new RegExp(`\\b${escapeRegex(word)}\\b`, 'gi');
    if (regex.test(result)) {
      const highlighted = createHighlight(word, className, '', suggestion);
      result = result.replace(regex, highlighted);
    }
  }
  
  return result;
}

/**
 * Check for patterns that indicate the start of text (headlines, first sentences)
 * @param {string} text - Full text to analyze
 * @param {string} sentence - Current sentence
 * @returns {boolean} True if this appears to be a headline or opening
 */
export function isHeadlineOrOpening(text, sentence) {
  const textStart = text.trim().substring(0, 200);
  const sentenceClean = sentence.trim();
  
  // Check if this sentence appears near the beginning
  const sentencePosition = textStart.indexOf(sentenceClean);
  
  // Consider it a headline/opening if:
  // 1. It's in the first 100 characters
  // 2. It's the first sentence
  // 3. It's short and appears early
  return sentencePosition >= 0 && sentencePosition < 100 || 
         textStart.startsWith(sentenceClean) ||
         (sentenceClean.length < 60 && sentencePosition < 50);
}

/**
 * Count occurrences of passive voice markers
 * @param {string} sentence - Sentence to analyze
 * @returns {number} Count of passive voice indicators
 */
export function countPassiveMarkers(sentence) {
  const passiveMarkers = /\b(was|were|been|being|be)\s+\w+ed\b/gi;
  const matches = sentence.match(passiveMarkers);
  return matches ? matches.length : 0;
}

/**
 * Calculate percentage of passive voice in text
 * @param {string} text - Text to analyze
 * @returns {number} Percentage of passive voice (0-100)
 */
export function calculatePassivePercentage(text) {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  if (sentences.length === 0) return 0;
  
  const passiveSentences = sentences.filter(sentence => 
    countPassiveMarkers(sentence) > 0
  ).length;
  
  return Math.round((passiveSentences / sentences.length) * 100);
}

/**
 * Extract sentences that appear to be CTAs (Call to Actions)
 * @param {string} text - Text to analyze
 * @returns {Array} Array of sentences that appear to be CTAs
 */
export function extractCTAs(text) {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const ctaPatterns = [
    /\b(get|start|try|download|sign up|subscribe|buy|purchase|order|click|join|learn|discover|explore|see|view|watch|read)\b/i,
    /\b(free|now|today|instant|immediately)\b/i,
    /\bbutton\b/i,
    /^(get|start|try|download|sign|buy|click|join)/i
  ];
  
  return sentences.filter(sentence => {
    const trimmed = sentence.trim();
    return ctaPatterns.some(pattern => pattern.test(trimmed)) && 
           trimmed.length < 100; // CTAs are usually short
  });
}

/**
 * Check if text contains social proof elements
 * @param {string} text - Text to analyze
 * @returns {Object} Analysis of social proof elements
 */
export function analyzeSocialProof(text) {
  const proofPatterns = {
    testimonials: /\b(testimonial|review|says|".*")\b/i,
    numbers: /\b(\d+[kmb]?[\+]?\s*(customers?|users?|companies?|people)|\d+%)\b/i,
    companies: /\b(trusted by|used by|featured in|clients include)\b/i,
    ratings: /\b(\d+\.\d+\s*stars?|\d+\/\d+|rated)\b/i
  };
  
  const found = {};
  let totalCount = 0;
  
  for (const [type, pattern] of Object.entries(proofPatterns)) {
    const matches = text.match(pattern);
    found[type] = matches ? matches.length : 0;
    totalCount += found[type];
  }
  
  return {
    types: found,
    total: totalCount,
    hasProof: totalCount > 0
  };
}
