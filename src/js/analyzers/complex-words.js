// Complex words analyzer
import { getComplexWords } from '../utils/word-lists.js';
import { findAndSpan } from '../utils/text-utils.js';

/**
 * Analyze text for complex words that could be simplified
 * @param {string} sentence - Text to analyze
 * @param {Object} data - Data object to update counts
 * @returns {string} Text with complex words highlighted
 */
export function getComplex(sentence, data) {
  let words = getComplexWords();
  let wordList = Object.keys(words);
  wordList.forEach(key => {
    sentence = findAndSpan(sentence, key, "complex", data);
  });
  return sentence;
}
