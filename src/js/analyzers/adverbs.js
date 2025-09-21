// Adverb analyzer
import { getLyWords } from '../utils/word-lists.js';

/**
 * Analyze text for adverb usage
 * @param {string} sentence - Text to analyze
 * @param {Object} data - Data object to update counts
 * @returns {string} Text with adverbs highlighted
 */
export function getAdverbs(sentence, data) {
  let lyWords = getLyWords();
  return sentence
    .split(" ")
    .map(word => {
      if (
        word.replace(/[^a-z0-9. ]/gi, "").match(/ly$/) &&
        lyWords[word.replace(/[^a-z0-9. ]/gi, "").toLowerCase()] === undefined
      ) {
        data.adverbs += 1;
        return `<span class="adverb">${word}</span>`;
      } else {
        return word;
      }
    })
    .join(" ");
}
