// Test cases for passive voice detection
// Run this in the browser console to test both methods

import { getPassive, getPassiveOriginal } from '/js/analyzers/passive-voice.js';

const testSentences = [
  // Basic regular past participles with helping verbs
  "The ball was kicked by John.",
  "The document is being reviewed by the team.",
  "The cake was eaten quickly.",
  
  // Irregular past participles
  "The book was written by Shakespeare.",
  "The car was driven to the store.",
  "The song was sung beautifully.",
  "The truth was spoken clearly.",
  "The window was broken yesterday.",
  
  // With adverbs (windowed detection)
  "The report was carefully written.",
  "The meeting was quickly organized.",
  "The proposal was thoroughly reviewed.",
  
  // Active voice (should not be detected)
  "John kicked the ball.",
  "The team reviewed the document.",
  "Shakespeare wrote the book.",
  "We organized the meeting.",
  
  // Edge cases
  "I have written a letter.", // Perfect tense, not passive
  "The edited version is better.", // Past participle as adjective
  "He is excited about the trip.", // Past participle as adjective
];

function testPassiveDetection() {
  console.log("Testing Enhanced vs Original Passive Voice Detection");
  console.log("=" .repeat(60));
  
  testSentences.forEach((sentence, index) => {
    let dataEnhanced = { passiveVoice: 0 };
    let dataOriginal = { passiveVoice: 0 };
    
    let enhancedResult = getPassive(sentence, dataEnhanced);
    let originalResult = getPassiveOriginal(sentence, dataOriginal);
    
    console.log(`\nTest ${index + 1}: "${sentence}"`);
    console.log(`Enhanced: ${dataEnhanced.passiveVoice > 0 ? 'PASSIVE' : 'ACTIVE'} (${dataEnhanced.passiveVoice})`);
    console.log(`Original: ${dataOriginal.passiveVoice > 0 ? 'PASSIVE' : 'ACTIVE'} (${dataOriginal.passiveVoice})`);
    
    if (dataEnhanced.passiveVoice !== dataOriginal.passiveVoice) {
      console.log("🔍 DIFFERENCE DETECTED");
    }
  });
}

// Export for browser testing
window.testPassiveDetection = testPassiveDetection;
