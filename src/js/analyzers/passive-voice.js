// Passive voice analyzer

/**
 * Analyze text for passive voice usage
 * @param {string} sentence - Text to analyze
 * @param {Object} data - Data object to update counts
 * @returns {string} Text with passive voice highlighted
 */
export function getPassive(sentence, data) {
  let originalWords = sentence.split(" ");
  let words = sentence
    .replace(/[^a-z0-9. ]/gi, "")
    .toLowerCase()
    .split(" ");
  let ed = words.filter(word => word.match(/ed$/));
  if (ed.length > 0) {
    ed.forEach(match => {
      originalWords = checkPrewords(words, originalWords, match, data);
    });
  }
  return originalWords.join(" ");
}

/**
 * Check for helping verbs before past participles
 * @param {string[]} words - Cleaned word array
 * @param {string[]} originalWords - Original word array with punctuation
 * @param {string} match - Past participle to check
 * @param {Object} data - Data object to update counts
 * @returns {string[]} Modified word array with highlighting
 */
function checkPrewords(words, originalWords, match, data) {
  let preWords = ["is", "are", "was", "were", "be", "been", "being"];
  let index = words.indexOf(match);
  if (preWords.indexOf(words[index - 1]) >= 0) {
    data.passiveVoice += 1;
    originalWords[index - 1] =
      '<span class="passive">' + originalWords[index - 1];
    originalWords[index] = originalWords[index] + "</span>";
    let next = checkPrewords(
      words.slice(index + 1),
      originalWords.slice(index + 1),
      match,
      data
    );
    return [...originalWords.slice(0, index + 1), ...next];
  } else {
    return originalWords;
  }
}
