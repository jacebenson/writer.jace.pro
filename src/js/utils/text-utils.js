// Text processing utilities

/**
 * Split paragraph into sentences
 * @param {string} p - Paragraph text
 * @returns {string[]} Array of sentences
 */
export function getSentenceFromParagraph(p) {
  let sentences = p
    .split(". ")
    .filter(s => s.length > 0)
    .map(s => s + ".");
  return sentences;
}

/**
 * Calculate readability level using Flesch-Kincaid formula
 * @param {number} letters - Number of letters
 * @param {number} words - Number of words
 * @param {number} sentences - Number of sentences
 * @returns {number} Readability level
 */
export function calculateLevel(letters, words, sentences) {
  if (words === 0 || sentences === 0) {
    return 0;
  }
  let level = Math.round(
    4.71 * (letters / words) + 0.5 * words / sentences - 21.43
  );
  return level <= 0 ? 0 : level;
}

/**
 * Find and wrap text with span
 * @param {string} sentence - Text to search in
 * @param {string} string - Text to find
 * @param {string} type - CSS class type
 * @param {Object} data - Data object to update counts
 * @returns {string} Modified sentence with spans
 */
export function findAndSpan(sentence, string, type, data) {
  let index = sentence.toLowerCase().indexOf(string);
  let a = { complex: "complex", qualifier: "adverbs" };
  if (index >= 0) {
    data[a[type]] += 1;
    sentence =
      sentence.slice(0, index) +
      `<span class="${type}">` +
      sentence.slice(index, index + string.length) +
      "</span>" +
      findAndSpan(sentence.slice(index + string.length), string, type, data);
  }
  return sentence;
}
