// Marketing Copy Mode Analyzer  
// Optimizes persuasive, action-oriented writing for landing pages and marketing campaigns

import { 
  replacePhrases, 
  highlightWords, 
  createHighlight, 
  countWords,
  isHeadlineOrOpening,
  extractCTAs,
  analyzeSocialProof
} from './mode-utils.js';

// Weak CTA phrases that should be more benefit-focused
const WEAK_CTAS = [
  "get started", "sign up", "learn more", "click here", "submit", 
  "register", "continue", "proceed", "next", "go", "enter",
  "join now", "try now", "see more", "find out", "discover"
];

// Strong CTA examples (for suggestions)
const STRONG_CTA_EXAMPLES = [
  "Get your free analysis", "Start saving money now", "Boost your sales today",
  "Download your guide", "Claim your discount", "Access your dashboard",
  "Get instant results", "Unlock your potential", "Transform your business",
  "See immediate improvements", "Start your free trial", "Get results now"
];

// Power words for headlines and marketing copy
const POWER_WORDS = [
  "guaranteed", "proven", "instant", "exclusive", "limited", "free",
  "boost", "increase", "maximize", "transform", "unlock", "breakthrough",
  "secret", "revealed", "ultimate", "complete", "step-by-step", "easy",
  "fast", "quick", "simple", "effortless", "powerful", "effective",
  "results", "success", "profit", "save", "discover", "amazing"
];

// Weak headline starters that lack impact
const WEAK_HEADLINE_STARTERS = [
  "welcome to", "about us", "our company", "we are", "we provide",
  "our service", "this is", "here is", "check out", "take a look",
  "the best", "great solution", "awesome product", "nice tool"
];

// Words that indicate feature-focused rather than benefit-focused copy
const FEATURE_WORDS = [
  "includes", "contains", "has", "features", "built with", "powered by",
  "offers", "provides", "comes with", "equipped with", "supports",
  "enables", "allows", "consists of", "comprises", "incorporates"
];

// Benefit-focused alternatives
const BENEFIT_WORDS = [
  "helps you", "saves you", "increases your", "reduces your", "gives you",
  "lets you", "allows you to", "enables you to", "makes you", "gets you"
];

// Vague claims that need specificity
const VAGUE_CLAIMS = [
  "saves time", "makes money", "improves efficiency", "increases productivity",
  "boosts performance", "enhances results", "optimizes workflow", "streamlines process",
  "reduces costs", "maximizes roi", "drives growth", "scales business"
];

// Urgency and scarcity words
const URGENCY_WORDS = [
  "now", "today", "immediately", "instantly", "limited time", "hurry",
  "don't wait", "act fast", "before it's too late", "last chance",
  "deadline", "expires", "while supplies last", "limited spots",
  "few left", "almost gone", "final hours", "ends soon"
];

/**
 * Analyze sentence for marketing copy effectiveness
 * @param {string} sentence - Sentence to analyze
 * @param {Object} data - Data object to update counts
 * @param {string} fullText - Complete text for context
 * @returns {string} Sentence with marketing highlights
 */
export function getMarketingAnalysis(sentence, data, fullText = '') {
  let result = sentence;
  
  // Check if this is a headline or opening
  if (isHeadlineOrOpening(fullText, sentence)) {
    const headlineIssues = analyzeHeadline(sentence);
    if (headlineIssues.length > 0) {
      data.marketing.weakHeadlines += 1;
      result = createHighlight(result, 'marketing-weak-headline', 
        'Strengthen headline', `Improve with: ${headlineIssues.join(', ')}`);
    }
  }
  
  // Check for weak CTAs
  const ctaCheck = checkForWeakCTA(sentence);
  if (ctaCheck.isWeak) {
    data.marketing.weakCTAs += 1;
    result = createHighlight(result, 'marketing-weak-cta',
      ctaCheck.suggestion, 'Use Verb + Benefit formula for stronger CTAs');
  }
  
  // Highlight feature-focused language
  const featureResult = highlightFeatureFocus(result);
  if (featureResult !== result) {
    data.marketing.featureFocused += countFeatureWords(result);
    result = featureResult;
  }
  
  // Check for vague claims
  const vagueResult = highlightVagueClaims(result);
  if (vagueResult !== result) {
    data.marketing.vagueClaims += countVagueClaims(result);
    result = vagueResult;
  }
  
  // Check for missing urgency in CTAs or important statements
  if (isCallToAction(sentence) && !hasUrgency(sentence)) {
    data.marketing.missingUrgency += 1;
    result = createHighlight(result, 'marketing-missing-urgency',
      'Add urgency', 'Consider adding urgency words like "now", "today", or "limited time"');
  }
  
  return result;
}

/**
 * Analyze headline effectiveness
 * @param {string} headline - Headline text
 * @returns {Array} Array of issues found
 */
function analyzeHeadline(headline) {
  const issues = [];
  const lowerHeadline = headline.toLowerCase();
  
  // Check for promise (power words or benefit indicators)
  const hasPromise = POWER_WORDS.some(word => lowerHeadline.includes(word)) ||
                    /\b(save|get|boost|increase|reduce|improve|grow|win|earn|gain)\b/.test(lowerHeadline);
  
  // Check for action verb
  const hasActionVerb = /\b(get|save|boost|increase|create|build|grow|win|discover|unlock|transform|start|stop|avoid|prevent|achieve|reach)\b/i.test(headline);
  
  // Check for direct address ("you")
  const hasYou = /\byou\b/i.test(headline);
  
  // Check for weak starters
  const hasWeakStarter = WEAK_HEADLINE_STARTERS.some(starter => 
    lowerHeadline.startsWith(starter));
  
  if (!hasPromise) issues.push("add a promise or benefit");
  if (!hasActionVerb) issues.push("include an action verb");
  if (!hasYou) issues.push("address the reader directly with 'you'");
  if (hasWeakStarter) issues.push("avoid weak opening phrases");
  
  return issues;
}

/**
 * Check if sentence contains a weak CTA
 * @param {string} sentence - Sentence to check
 * @returns {Object} CTA analysis result
 */
function checkForWeakCTA(sentence) {
  const lowerSentence = sentence.toLowerCase();
  
  for (const weakCta of WEAK_CTAS) {
    if (lowerSentence.includes(weakCta)) {
      const randomExample = STRONG_CTA_EXAMPLES[Math.floor(Math.random() * STRONG_CTA_EXAMPLES.length)];
      return {
        isWeak: true,
        weakCta: weakCta,
        suggestion: `Try "${randomExample}" instead of "${weakCta}"`
      };
    }
  }
  
  return { isWeak: false };
}

/**
 * Highlight feature-focused language
 * @param {string} sentence - Sentence to process
 * @returns {string} Sentence with feature highlights
 */
function highlightFeatureFocus(sentence) {
  let result = sentence;
  
  for (const featureWord of FEATURE_WORDS) {
    const regex = new RegExp(`\\b${featureWord}\\b`, 'gi');
    if (regex.test(result)) {
      const benefitAlternative = BENEFIT_WORDS[Math.floor(Math.random() * BENEFIT_WORDS.length)];
      result = result.replace(regex, 
        createHighlight(featureWord, 'marketing-feature-focused', benefitAlternative,
          `Focus on benefits: "${benefitAlternative}" instead of "${featureWord}"`));
    }
  }
  
  return result;
}

/**
 * Highlight vague claims that need specificity
 * @param {string} sentence - Sentence to process  
 * @returns {string} Sentence with vague claim highlights
 */
function highlightVagueClaims(sentence) {
  let result = sentence;
  
  for (const vagueClaim of VAGUE_CLAIMS) {
    const regex = new RegExp(`\\b${vagueClaim.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    if (regex.test(result)) {
      result = result.replace(regex,
        createHighlight(vagueClaim, 'marketing-vague-claim', 'be specific',
          `Be specific: How much time/money? Include numbers, percentages, or timeframes.`));
    }
  }
  
  return result;
}

/**
 * Check if sentence appears to be a call-to-action
 * @param {string} sentence - Sentence to check
 * @returns {boolean} True if appears to be a CTA
 */
function isCallToAction(sentence) {
  const ctaPatterns = [
    /\b(click|get|start|try|download|sign|buy|order|subscribe|join)\b/i,
    /\b(button|link)\b/i,
    /^(get|start|try|download|sign|buy|click|join)/i
  ];
  
  return ctaPatterns.some(pattern => pattern.test(sentence)) && 
         sentence.length < 100; // CTAs are usually short
}

/**
 * Check if sentence has urgency words
 * @param {string} sentence - Sentence to check
 * @returns {boolean} True if has urgency
 */
function hasUrgency(sentence) {
  const lowerSentence = sentence.toLowerCase();
  return URGENCY_WORDS.some(urgencyWord => lowerSentence.includes(urgencyWord));
}

/**
 * Count feature-focused words in sentence
 * @param {string} sentence - Sentence to count
 * @returns {number} Count of feature words
 */
function countFeatureWords(sentence) {
  let count = 0;
  for (const word of FEATURE_WORDS) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = sentence.match(regex);
    if (matches) count += matches.length;
  }
  return count;
}

/**
 * Count vague claims in sentence  
 * @param {string} sentence - Sentence to count
 * @returns {number} Count of vague claims
 */
function countVagueClaims(sentence) {
  let count = 0;
  for (const claim of VAGUE_CLAIMS) {
    const regex = new RegExp(`\\b${claim.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    const matches = sentence.match(regex);
    if (matches) count += matches.length;
  }
  return count;
}

/**
 * Analyze entire text for marketing effectiveness
 * @param {string} text - Full text to analyze
 * @returns {Object} Marketing analysis results
 */
export function analyzeMarketingEffectiveness(text) {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  // Analyze CTAs
  const ctas = extractCTAs(text);
  const weakCTAs = ctas.filter(cta => 
    WEAK_CTAS.some(weak => cta.toLowerCase().includes(weak))
  );
  
  // Analyze social proof
  const socialProof = analyzeSocialProof(text);
  
  // Count power words
  let powerWordCount = 0;
  for (const powerWord of POWER_WORDS) {
    const regex = new RegExp(`\\b${powerWord}\\b`, 'gi');
    const matches = text.match(regex);
    if (matches) powerWordCount += matches.length;
  }
  
  // Count urgency words
  let urgencyWordCount = 0;
  for (const urgencyWord of URGENCY_WORDS) {
    const regex = new RegExp(`\\b${urgencyWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    const matches = text.match(regex);
    if (matches) urgencyWordCount += matches.length;
  }
  
  // Count feature vs benefit language
  let featureWordCount = 0;
  let benefitWordCount = 0;
  
  for (const featureWord of FEATURE_WORDS) {
    const regex = new RegExp(`\\b${featureWord}\\b`, 'gi');
    const matches = text.match(regex);
    if (matches) featureWordCount += matches.length;
  }
  
  for (const benefitWord of BENEFIT_WORDS) {
    const regex = new RegExp(`\\b${benefitWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    const matches = text.match(regex);
    if (matches) benefitWordCount += matches.length;
  }
  
  // Calculate marketing score (0-100, higher is better)
  let score = 50; // Start at middle
  
  // Add points for good marketing elements
  score += Math.min(powerWordCount * 3, 20); // Power words are good
  score += Math.min(urgencyWordCount * 4, 15); // Urgency drives action
  score += socialProof.hasProof ? 15 : 0; // Social proof builds trust
  score += Math.min(benefitWordCount * 2, 10); // Benefit-focused language
  
  // Subtract points for weak elements
  score -= Math.min(weakCTAs.length * 8, 20); // Weak CTAs hurt conversion
  score -= Math.min(featureWordCount * 2, 15); // Feature-focused language is weaker
  
  // Bonus for having CTAs at all
  if (ctas.length > 0) score += 5;
  
  return {
    score: Math.max(0, Math.min(100, Math.round(score))),
    ctaCount: ctas.length,
    weakCTACount: weakCTAs.length,
    powerWordCount: powerWordCount,
    urgencyWordCount: urgencyWordCount,
    socialProofScore: socialProof.total,
    featureWordCount: featureWordCount,
    benefitWordCount: benefitWordCount,
    recommendations: generateMarketingRecommendations(score, {
      ctaCount: ctas.length,
      weakCTACount: weakCTAs.length,
      powerWordCount,
      urgencyWordCount,
      socialProof,
      featureWordCount,
      benefitWordCount
    })
  };
}

/**
 * Generate specific recommendations for improving marketing copy
 * @param {number} score - Current marketing score
 * @param {Object} metrics - Analysis metrics
 * @returns {Array} Array of recommendation strings
 */
function generateMarketingRecommendations(score, metrics) {
  const recommendations = [];
  
  if (metrics.ctaCount === 0) {
    recommendations.push("Add clear calls-to-action to guide readers toward conversion.");
  } else if (metrics.weakCTACount > 0) {
    recommendations.push("Strengthen CTAs with Verb + Benefit formula (e.g., 'Get your free report').");
  }
  
  if (metrics.powerWordCount < 2) {
    recommendations.push("Add power words like 'guaranteed', 'proven', 'instant' for more impact.");
  }
  
  if (metrics.urgencyWordCount === 0) {
    recommendations.push("Create urgency with words like 'now', 'today', 'limited time'.");
  }
  
  if (!metrics.socialProof.hasProof) {
    recommendations.push("Add social proof: testimonials, customer counts, or press mentions.");
  }
  
  if (metrics.featureWordCount > metrics.benefitWordCount) {
    recommendations.push("Focus more on benefits (what it does for customers) than features (what it has).");
  }
  
  if (score > 80) {
    recommendations.push("Excellent marketing copy! Your writing is persuasive and action-oriented.");
  } else if (score > 60) {
    recommendations.push("Good marketing copy with room for more persuasive elements.");
  } else if (score > 40) {
    recommendations.push("Add more persuasive elements: CTAs, urgency, social proof.");
  } else {
    recommendations.push("Focus on clear benefits, strong CTAs, and trust-building elements.");
  }
  
  return recommendations;
}

// Export constants for use in other modules
export { 
  WEAK_CTAS, 
  STRONG_CTA_EXAMPLES, 
  POWER_WORDS, 
  FEATURE_WORDS, 
  BENEFIT_WORDS,
  URGENCY_WORDS,
  VAGUE_CLAIMS
};
