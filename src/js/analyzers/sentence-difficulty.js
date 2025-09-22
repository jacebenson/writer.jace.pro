// Sentence difficulty analyzer
import { getSentenceFromParagraph, calculateLevel } from '../utils/text-utils.js';
import { getAdverbs } from './adverbs.js';
import { getComplex } from './complex-words.js';
import { getPassive, getPassiveOriginal } from './passive-voice.js';
import { getQualifier } from './qualifiers.js';
import { getBrevityAnalysis } from './modes/brevity-mode.js';
import { getConversationalAnalysis } from './modes/conversational-mode.js';
import { getMarketingAnalysis } from './modes/marketing-mode.js';

/**
 * Apply mode-specific analysis to a sentence
 * @param {string} sentence - Sentence to analyze
 * @param {Object} data - Data object to update counts
 * @param {string} mode - Writing mode (brevity, conversational, marketing)
 * @param {string} fullText - Complete text for context
 * @returns {string} Sentence with mode-specific highlights
 */
function applyModeAnalysis(sentence, data, mode, fullText = '') {
  switch (mode) {
    case 'brevity':
      return getBrevityAnalysis(sentence, data, fullText);
    case 'conversational':
      return getConversationalAnalysis(sentence, data, fullText);
    case 'marketing':
      return getMarketingAnalysis(sentence, data, fullText);
    default:
      return sentence;
  }
}

/**
 * Analyze paragraph for difficult sentences and apply all text highlighting
 * @param {string} paragraph - Paragraph text to analyze
 * @param {Object} data - Data object to update counts
 * @param {Object} settings - Settings object with analysis preferences
 * @param {string} fullText - Complete text for context (needed for mode analysis)
 * @returns {string} Paragraph with highlighted difficult sentences and phrases
 */
export function getDifficultSentences(paragraph, data, settings = {}, fullText = '') {
  let sentences = getSentenceFromParagraph(paragraph + " ");
  data.sentences += sentences.length;
  
  // Choose passive voice analyzer based on settings
  const passiveAnalyzer = settings.passiveDetection === 'original' ? getPassiveOriginal : getPassive;
  
  let analyzedSentences = sentences.map(sentence => {
    let cleanSentence = sentence.replace(/[^a-z0-9. ]/gi, "") + ".";
    let words = cleanSentence.split(" ").length;
    let letters = cleanSentence.split(" ").join("").length;
    data.words += words;
    
    // Apply standard analysis first
    sentence = getAdverbs(sentence, data);
    sentence = getComplex(sentence, data);
    sentence = passiveAnalyzer(sentence, data);
    sentence = getQualifier(sentence, data);
    
    // Apply mode-specific analysis if a mode is selected
    if (settings.writingMode && settings.writingMode !== 'standard') {
      sentence = applyModeAnalysis(sentence, data, settings.writingMode, fullText);
    }
    
    // Check sentence difficulty based on readability (standard analysis)
    let level = calculateLevel(letters, words, 1);
    if (words < 14) {
      return sentence;
    } else if (level >= 10 && level < 14) {
      data.hardSentences += 1;
      // Add specific issue for hard sentence
      if (data.specificIssues) {
        data.specificIssues.push({
          type: 'hard-sentence',
          text: sentence.substring(0, 50) + (sentence.length > 50 ? '...' : ''),
          suggestion: `This sentence has ${words} words and is hard to read. Try breaking it into shorter sentences or simplifying complex phrases.`,
          icon: '📏'
        });
      }
      return `<span class="hardSentence">${sentence}</span>`;
    } else if (level >= 14) {
      data.veryHardSentences += 1;
      // Add specific issue for very hard sentence
      if (data.specificIssues) {
        data.specificIssues.push({
          type: 'very-hard-sentence',
          text: sentence.substring(0, 50) + (sentence.length > 50 ? '...' : ''),
          suggestion: `This sentence has ${words} words and is very hard to read. Consider breaking it into 2-3 shorter sentences and using simpler language.`,
          icon: '🔴'
        });
      }
      return `<span class="veryHardSentence">${sentence}</span>`;
    } else {
      return sentence;
    }
  });

  return analyzedSentences.join(" ");
}
