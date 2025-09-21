// Main application logic
import { getDifficultSentences } from './analyzers/sentence-difficulty.js';

(function() {
  let inputArea = document.getElementById("text-area");
  let text = `The app highlights lengthy, complex sentences and common errors; if you see a yellow sentence, shorten or split it. If you see a red highlight, your sentence is so dense and complicated that your readers will get lost trying to follow its meandering, splitting logic - try editing this sentence to remove the red.
You can utilize a shorter word in place of a purple one. Mouse over them for hints.
Adverbs and weakening phrases are helpfully shown in blue. Get rid of them and pick words with force, perhaps.
Phrases in green have been marked to show passive voice.
You can format your text with the toolbar.
Paste in something you're working on and edit away. Or, click the Write button and compose something new.`;
  inputArea.value = text;

  // Settings state
  let settings = {
    passiveDetection: 'enhanced' // Default to enhanced detection
  };

  // Add real-time analysis on keyup
  inputArea.addEventListener('keyup', function() {
    format();
  });

  // Add settings event listeners
  document.addEventListener('DOMContentLoaded', function() {
    setupSettingsHandlers();
  });
  
  // If DOM is already loaded, setup immediately
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupSettingsHandlers);
  } else {
    setupSettingsHandlers();
  }

  function setupSettingsHandlers() {
    // Settings radio buttons
    const radios = document.querySelectorAll('input[name="passiveDetection"]');
    radios.forEach(radio => {
      radio.addEventListener('change', function() {
        settings.passiveDetection = this.value;
        format(); // Re-analyze with new settings
      });
    });

    // Click outside to close settings
    document.addEventListener('click', function(event) {
      const settingsDropdown = document.getElementById('settings-dropdown');
      const settingsBtn = document.getElementById('settings-btn');
      
      if (!settingsDropdown.contains(event.target) && !settingsBtn.contains(event.target)) {
        settingsDropdown.classList.remove('show');
      }
    });
  }

  let data = {
    paragraphs: 0,
    sentences: 0,
    words: 0,
    hardSentences: 0,
    veryHardSentences: 0,
    adverbs: 0,
    passiveVoice: 0,
    complex: 0
  };

  function format() {
    // Reset data
    data = {
      paragraphs: 0,
      sentences: 0,
      words: 0,
      hardSentences: 0,
      veryHardSentences: 0,
      adverbs: 0,
      passiveVoice: 0,
      complex: 0
    };
    
    let inputArea = document.getElementById("text-area");
    let text = inputArea.value;
    let paragraphs = text.split("\n");
    let outputArea = document.getElementById("output");
    
    // Analyze each paragraph with current settings
    let analyzedParagraphs = paragraphs.map(p => getDifficultSentences(p, data, settings));
    let formattedParagraphs = analyzedParagraphs.map(para => `<p>${para}</p>`);
    
    data.paragraphs = paragraphs.length;
    console.log(data);
    updateCounters();
    outputArea.innerHTML = formattedParagraphs.join(" ");
  }

  function updateCounters() {
    document.querySelector("#adverb").innerHTML = `You have used ${
      data.adverbs
    } adverb${data.adverbs > 1 ? "s" : ""}. Try to use ${Math.round(
      data.paragraphs / 3
    )} or less`;
    
    document.querySelector("#passive").innerHTML = `You have used passive voice ${data.passiveVoice} time${
      data.passiveVoice > 1 ? "s" : ""
    }. Aim for ${Math.round(data.sentences / 5)} or less.`;
    
    document.querySelector("#complex").innerHTML = `${data.complex} phrase${
      data.complex > 1 ? "s" : ""
    } could be simplified.`;
    
    document.querySelector("#hardSentence").innerHTML = `${
      data.hardSentences
    } of ${data.sentences} sentence${
      data.sentences > 1 ? "s are" : " is"
    } hard to read`;
    
    document.querySelector("#veryHardSentence").innerHTML = `${
      data.veryHardSentences
    } of ${data.sentences} sentence${
      data.sentences > 1 ? "s are" : " is"
    } very hard to read`;
  }

  // Make functions globally available
  window.format = format;
  window.toggleSettings = function() {
    const dropdown = document.getElementById('settings-dropdown');
    dropdown.classList.toggle('show');
  };
  
  // Initial format
  format();
})();
