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

// Weak CTA phrases categorized by weakness type
const WEAK_CTAS = {
  // Very weak - vague and passive
  veryWeak: [
    "click here", "submit", "continue", "proceed", "next", "go", "enter",
    "see more", "find out", "read more", "view more", "more info"
  ],
  
  // Weak - generic but has some action
  weak: [
    "get started", "sign up", "learn more", "register", "join now", 
    "try now", "discover", "explore", "check out", "take a look"
  ],
  
  // Missing benefit - action word but no clear value
  missingBenefit: [
    "download", "subscribe", "follow", "contact us", "get access",
    "join", "start", "begin", "try", "test", "use"
  ],
  
  // Passive language - weak verbs
  passive: [
    "we'll help", "let us", "allow us", "we can", "we will",
    "it helps", "this enables", "you can", "feel free to"
  ]
};

// Context-aware strong CTA templates by category
const STRONG_CTA_TEMPLATES = {
  lead_generation: [
    "Get your free {benefit}", "Download your {benefit}", "Claim your {benefit}",
    "Access your {benefit}", "Start your {benefit}", "Unlock your {benefit}"
  ],
  
  trial_signup: [
    "Start your free trial", "Try {product} free", "Get {timeframe} free",
    "Start saving {benefit} today", "Begin your {benefit} journey"
  ],
  
  purchase: [
    "Get {product} now", "Buy {product} today", "Order your {product}",
    "Claim your {discount}", "Save {amount} today", "Get {percentage} off"
  ],
  
  content: [
    "Download the guide", "Get the checklist", "Access the template",
    "Read the report", "View the case study", "Get the blueprint"
  ],
  
  consultation: [
    "Book your free consultation", "Schedule your audit", "Get your assessment",
    "Claim your strategy session", "Reserve your spot"
  ]
};

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
  const ctaCheck = checkForWeakCTA(sentence, fullText);
  if (ctaCheck.isWeak) {
    data.marketing.weakCTAs += 1;
    
    // Create more detailed highlight based on strength and category
    const strengthClass = ctaCheck.strength <= 3 ? 'marketing-very-weak-cta' : 'marketing-weak-cta';
    const detailedSuggestion = `${ctaCheck.suggestion} | Strength: ${ctaCheck.strength}/10`;
    const reason = ctaCheck.issues ? `Issues: ${ctaCheck.issues.join(', ')}` : 'Use Verb + Benefit formula for stronger CTAs';
    
    result = createHighlight(result, strengthClass, detailedSuggestion, reason);
    
    // Add positioning feedback if available
    if (ctaCheck.positioning) {
      data.marketing.ctaPositioning = ctaCheck.positioning;
    }
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
 * Check if sentence contains a weak CTA with enhanced detection
 * @param {string} sentence - Sentence to check
 * @param {string} fullText - Complete text for context
 * @returns {Object} Enhanced CTA analysis result
 */
function checkForWeakCTA(sentence, fullText = '') {
  const lowerSentence = sentence.toLowerCase().trim();
  
  // Check for different types of weak CTAs
  for (const [category, phrases] of Object.entries(WEAK_CTAS)) {
    for (const phrase of phrases) {
      if (lowerSentence.includes(phrase)) {
        const ctaAnalysis = analyzeCTAStrength(sentence, fullText);
        return {
          isWeak: true,
          weakCta: phrase,
          category: category,
          strength: ctaAnalysis.strength,
          issues: ctaAnalysis.issues,
          suggestion: generateContextualCTASuggestion(sentence, category, fullText),
          positioning: analyzeCTAPositioning(sentence, fullText)
        };
      }
    }
  }
  
  // Check for other weak patterns
  const weakPatterns = [
    { pattern: /^(we|our|this|it) (will|can|helps?|enables?)/i, issue: "starts with company focus instead of customer benefit" },
    { pattern: /\b(maybe|perhaps|consider|might want to)\b/i, issue: "uses tentative language instead of confident direction" },
    { pattern: /\b(feel free to|if you want|you can)\b/i, issue: "lacks urgency and commitment" },
    { pattern: /\?\s*$/, issue: "ends with question instead of clear direction" }
  ];
  
  for (const { pattern, issue } of weakPatterns) {
    if (pattern.test(sentence)) {
      return {
        isWeak: true,
        weakCta: sentence.match(pattern)[0],
        category: 'pattern',
        issue: issue,
        suggestion: `Make it more direct and benefit-focused`,
        strength: 2 // out of 10
      };
    }
  }
  
  return { isWeak: false };
}

/**
 * Analyze the overall strength of a CTA
 * @param {string} cta - The CTA text
 * @param {string} context - Surrounding text context
 * @returns {Object} Strength analysis
 */
function analyzeCTAStrength(cta, context) {
  let score = 5; // Start at neutral
  const issues = [];
  const strengths = [];
  
  const lowerCTA = cta.toLowerCase();
  
  // Check for action verbs (positive)
  const actionVerbs = ['get', 'start', 'download', 'claim', 'access', 'unlock', 'boost', 'save', 'earn', 'win'];
  if (actionVerbs.some(verb => lowerCTA.includes(verb))) {
    score += 2;
    strengths.push("has action verb");
  } else {
    score -= 2;
    issues.push("missing strong action verb");
  }
  
  // Check for benefit indicators (positive)
  const benefitWords = ['free', 'save', 'boost', 'increase', 'improve', 'results', 'instant', 'immediate'];
  if (benefitWords.some(word => lowerCTA.includes(word))) {
    score += 2;
    strengths.push("includes clear benefit");
  } else {
    score -= 1;
    issues.push("missing clear benefit");
  }
  
  // Check for urgency (positive)
  const urgencyWords = ['now', 'today', 'instant', 'immediate', 'limited', 'hurry'];
  if (urgencyWords.some(word => lowerCTA.includes(word))) {
    score += 1;
    strengths.push("creates urgency");
  }
  
  // Check for weak words (negative)
  const weakWords = ['maybe', 'perhaps', 'try', 'consider', 'might'];
  if (weakWords.some(word => lowerCTA.includes(word))) {
    score -= 2;
    issues.push("uses weak/tentative language");
  }
  
  // Check for specificity (positive)
  if (/\b(free|[\d%]+\s*(off|discount)|[\d]+\s*(minutes?|hours?|days?))\b/i.test(lowerCTA)) {
    score += 1;
    strengths.push("includes specific offer/timeframe");
  }
  
  // Check length (optimal is 2-5 words)
  const wordCount = cta.trim().split(/\s+/).length;
  if (wordCount >= 2 && wordCount <= 5) {
    score += 1;
    strengths.push("appropriate length");
  } else if (wordCount > 7) {
    score -= 1;
    issues.push("too long");
  } else if (wordCount < 2) {
    score -= 1;
    issues.push("too short");
  }
  
  return {
    strength: Math.max(1, Math.min(10, score)),
    issues: issues,
    strengths: strengths
  };
}

/**
 * Generate contextual CTA suggestions based on weakness category
 * @param {string} originalCTA - Original CTA text
 * @param {string} category - Weakness category
 * @param {string} fullText - Complete text for context
 * @returns {string} Contextual suggestion
 */
function generateContextualCTASuggestion(originalCTA, category, fullText) {
  const context = detectContentContext(fullText);
  const templates = STRONG_CTA_TEMPLATES[context] || STRONG_CTA_TEMPLATES.lead_generation;
  
  switch (category) {
    case 'veryWeak':
      return `Replace with benefit-focused action: "${templates[0].replace('{benefit}', 'free guide')}"`;
    
    case 'weak':
      return `Add specific benefit: "${templates[1].replace('{product}', 'our tool').replace('{timeframe}', '30 days')}"`;
    
    case 'missingBenefit':
      const benefit = extractPossibleBenefit(fullText) || 'instant access';
      return `Add clear value: "${templates[0].replace('{benefit}', benefit)}"`;
    
    case 'passive':
      return `Make it direct and customer-focused: "${templates[0].replace('{benefit}', 'results')}"`;
    
    default:
      return `Strengthen with: Verb + Specific Benefit + Urgency (e.g., "${templates[0]}")`;
  }
}

/**
 * Detect the context/purpose of the content to suggest appropriate CTAs
 * @param {string} text - Full text content
 * @returns {string} Context category
 */
function detectContentContext(text) {
  const lowerText = text.toLowerCase();
  
  if (/\b(trial|demo|test|try)\b/.test(lowerText)) return 'trial_signup';
  if (/\b(buy|purchase|price|cost|\$|order)\b/.test(lowerText)) return 'purchase';
  if (/\b(guide|ebook|checklist|template|report)\b/.test(lowerText)) return 'content';
  if (/\b(consultation|call|meeting|audit|assessment)\b/.test(lowerText)) return 'consultation';
  
  return 'lead_generation';
}

/**
 * Extract possible benefits from the surrounding text
 * @param {string} text - Text to analyze for benefits
 * @returns {string|null} Detected benefit or null
 */
function extractPossibleBenefit(text) {
  const benefitPatterns = [
    /\b(save|saving)\s+(\w+)/i,
    /\b(increase|boost|improve|grow)\s+(\w+)/i,
    /\b(free|instant|immediate)\s+(\w+)/i,
    /\b(\d+%)\s+(more|less|faster)/i
  ];
  
  for (const pattern of benefitPatterns) {
    const match = text.match(pattern);
    if (match) {
      return match[0].toLowerCase();
    }
  }
  
  return null;
}

/**
 * Analyze CTA positioning within the content
 * @param {string} cta - The CTA sentence
 * @param {string} fullText - Complete text
 * @returns {Object} Positioning analysis
 */
function analyzeCTAPositioning(cta, fullText) {
  const sentences = fullText.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const ctaIndex = sentences.findIndex(s => s.includes(cta.replace(/<[^>]*>/g, '')));
  
  if (ctaIndex === -1) return { position: 'unknown', score: 5 };
  
  const totalSentences = sentences.length;
  const positionRatio = ctaIndex / totalSentences;
  
  let position, score;
  
  if (positionRatio < 0.1) {
    position = 'very_early';
    score = 6; // Can work for headlines but may be premature
  } else if (positionRatio < 0.3) {
    position = 'early';
    score = 8; // Good positioning after some value
  } else if (positionRatio < 0.7) {
    position = 'middle';
    score = 7; // Decent but not optimal
  } else if (positionRatio < 0.9) {
    position = 'late';
    score = 9; // Good positioning after value delivery
  } else {
    position = 'very_late';
    score = 10; // Excellent positioning at the end
  }
  
  return {
    position: position,
    score: score,
    index: ctaIndex,
    total: totalSentences,
    recommendation: getPositioningRecommendation(position, score)
  };
}

/**
 * Get positioning recommendations
 * @param {string} position - Position category
 * @param {number} score - Position score
 * @returns {string} Recommendation
 */
function getPositioningRecommendation(position, score) {
  switch (position) {
    case 'very_early':
      return 'Consider providing more value before the CTA';
    case 'early':
      return 'Good early positioning - ensure you\'ve established value';
    case 'middle':
      return 'Consider moving closer to the end after delivering value';
    case 'late':
      return 'Excellent positioning after value delivery';
    case 'very_late':
      return 'Perfect positioning - readers are convinced and ready to act';
    default:
      return 'Position after establishing clear value and benefits';
  }
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
  const weakCTAs = ctas.filter(cta => {
    const lowerCTA = cta.toLowerCase();
    return Object.values(WEAK_CTAS).flat().some(weak => lowerCTA.includes(weak));
  });
  
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
  STRONG_CTA_TEMPLATES, 
  POWER_WORDS, 
  FEATURE_WORDS, 
  BENEFIT_WORDS,
  URGENCY_WORDS,
  VAGUE_CLAIMS
};
