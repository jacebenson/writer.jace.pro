// Passive voice analyzer

// Set of common irregular past participles
const irregularPastParticiples = new Set([
  'written', 'taken', 'eaten', 'broken', 'spoken', 'driven', 'given',
  'gone', 'seen', 'done', 'begun', 'known', 'chosen', 'thrown', 'frozen',
  'bought', 'brought', 'caught', 'taught', 'thought', 'fought', 'sought',
  'made', 'paid', 'said', 'laid', 'heard', 'told', 'sold', 'held',
  'built', 'sent', 'spent', 'lent', 'bent', 'meant', 'kept', 'wept',
  'slept', 'swept', 'crept', 'left', 'felt', 'dealt', 'lost', 'cost',
  'cut', 'hit', 'hurt', 'put', 'shut', 'set', 'let', 'bet', 'split',
  'read', 'led', 'fed', 'bled', 'fled', 'shed', 'spread', 'bred',
  'found', 'bound', 'wound', 'ground', 'hung', 'sung', 'rung', 'swung',
  'struck', 'stuck', 'drawn', 'grown', 'shown', 'blown', 'flown', 'known',
  'worn', 'torn', 'born', 'sworn', 'fallen', 'stolen', 'forgotten',
  'gotten', 'rotten', 'hidden', 'ridden', 'forbidden', 'bitten', 'smitten'
]);

/**
 * Enhanced passive voice detection with irregular verbs and windowed checking
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
  
  // Find potential past participles (both regular -ed and irregular)
  let participles = words.filter(word => 
    word.endsWith('ed') || irregularPastParticiples.has(word)
  );
  
  if (participles.length > 0) {
    participles.forEach(match => {
      originalWords = checkPrewordsWindowed(words, originalWords, match, data);
    });
  }
  return originalWords.join(" ");
}

/**
 * Original passive voice detection (legacy)
 * @param {string} sentence - Text to analyze
 * @param {Object} data - Data object to update counts
 * @returns {string} Text with passive voice highlighted
 */
export function getPassiveOriginal(sentence, data) {
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
 * Enhanced check for helping verbs within a window (handles adverbs)
 * @param {string[]} words - Cleaned word array
 * @param {string[]} originalWords - Original word array with punctuation
 * @param {string} match - Past participle to check
 * @param {Object} data - Data object to update counts
 * @returns {string[]} Modified word array with highlighting
 */
function checkPrewordsWindowed(words, originalWords, match, data) {
  let helpingVerbs = ["is", "are", "was", "were", "be", "been", "being", 
                     "am", "will", "would", "could", "should", "might", 
                     "may", "must", "have", "has", "had"];
  let index = words.indexOf(match);
  let found = false;
  let helpingVerbIndex = -1;
  
  // Check up to 4 words before the participle for helping verbs
  for (let i = 1; i <= 4; i++) {
    if (index - i < 0) break;
    if (helpingVerbs.includes(words[index - i])) {
      helpingVerbIndex = index - i;
      found = true;
      break;
    }
  }
  
  if (found) {
    // Optional: Check for "by" phrase after participle for additional confidence
    let hasBy = false;
    for (let i = 1; i <= 3; i++) {
      if (index + i >= words.length) break;
      if (words[index + i] === 'by') {
        hasBy = true;
        break;
      }
    }
    
    // Count as passive voice
    data.passiveVoice += 1;
    
    // Highlight from helping verb to participle
    originalWords[helpingVerbIndex] = '<span class="passive">' + originalWords[helpingVerbIndex];
    originalWords[index] = originalWords[index] + "</span>";
    
    return originalWords;
  } else {
    return originalWords;
  }
}

/**
 * Original check for helping verbs (legacy)
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
