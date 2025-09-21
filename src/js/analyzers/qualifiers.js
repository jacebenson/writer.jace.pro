// Qualifier/weakening phrases analyzer
import { getQualifyingWords } from '../utils/word-lists.js';
import { findAndSpan } from '../utils/text-utils.js';

/**
 * Analyze text for qualifying/weakening phrases
 * @param {string} sentence - Text to analyze
 * @param {Object} data - Data object to update counts
 * @returns {string} Text with qualifiers highlighted
 */
export function getQualifier(sentence, data) {
  let qualifiers = getQualifyingWords();
  let wordList = Object.keys(qualifiers);
  wordList.forEach(key => {
    sentence = findAndSpan(sentence, key, "qualifier", data);
  });
  return sentence;
}
