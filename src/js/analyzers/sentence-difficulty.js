// Sentence difficulty analyzer
import { getSentenceFromParagraph, calculateLevel } from '../utils/text-utils.js';
import { getAdverbs } from './adverbs.js';
import { getComplex } from './complex-words.js';
import { getPassive, getPassiveOriginal } from './passive-voice.js';
import { getQualifier } from './qualifiers.js';

/**
 * Analyze paragraph for difficult sentences and apply all text highlighting
 * @param {string} paragraph - Paragraph text to analyze
 * @param {Object} data - Data object to update counts
 * @param {Object} settings - Settings object with analysis preferences
 * @returns {string} Paragraph with highlighted difficult sentences and phrases
 */
export function getDifficultSentences(paragraph, data, settings = {}) {
  let sentences = getSentenceFromParagraph(paragraph + " ");
  data.sentences += sentences.length;
  
  // Choose passive voice analyzer based on settings
  const passiveAnalyzer = settings.passiveDetection === 'original' ? getPassiveOriginal : getPassive;
  
  let analyzedSentences = sentences.map(sentence => {
    let cleanSentence = sentence.replace(/[^a-z0-9. ]/gi, "") + ".";
    let words = cleanSentence.split(" ").length;
    let letters = cleanSentence.split(" ").join("").length;
    data.words += words;
    
    // Apply all text analysis
    sentence = getAdverbs(sentence, data);
    sentence = getComplex(sentence, data);
    sentence = passiveAnalyzer(sentence, data);
    sentence = getQualifier(sentence, data);
    
    // Check sentence difficulty based on readability
    let level = calculateLevel(letters, words, 1);
    if (words < 14) {
      return sentence;
    } else if (level >= 10 && level < 14) {
      data.hardSentences += 1;
      return `<span class="hardSentence">${sentence}</span>`;
    } else if (level >= 14) {
      data.veryHardSentences += 1;
      return `<span class="veryHardSentence">${sentence}</span>`;
    } else {
      return sentence;
    }
  });

  return analyzedSentences.join(" ");
}
