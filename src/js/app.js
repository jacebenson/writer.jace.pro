// Main application logic
import { getDifficultSentences } from './analyzers/sentence-difficulty.js';
import { getAdverbs } from './analyzers/adverbs.js';
import { getComplex } from './analyzers/complex-words.js';
import { getPassive, getPassiveOriginal } from './analyzers/passive-voice.js';
import { getQualifier } from './analyzers/qualifiers.js';
import { calculateLevel } from './utils/text-utils.js';

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
});

function initializeApp() {
  const inputArea = document.getElementById("text-area");
  const defaultText = [
    'The app highlights lengthy, complex sentences and common errors; if you see a yellow sentence, shorten or split it. If you see a red highlight, your sentence is so dense and complicated that your readers will get lost trying to follow its meandering, splitting logic - try editing this sentence to remove the red.',
    'You can utilize a shorter word in place of a purple one. Mouse over them for hints.',
    'Adverbs and weakening phrases are helpfully shown in blue. Get rid of them and pick words with force, perhaps.',
    'Phrases in green have been marked to show passive voice.',
    'Choose a writing mode above to get specific feedback for your writing goals.'].join('\n\n');
  
  if (inputArea) {
    inputArea.value = defaultText;
  }

  // App state
  let appState = {
    focusMode: false,
    currentView: 'split', // 'split', 'editor', 'preview'
    settings: {
      passiveDetection: 'enhanced',
      writingMode: 'standard'
    }
  };

  // Data object for analysis results
  let data = {
    paragraphs: 0,
    sentences: 0,
    words: 0,
    characters: 0,
    hardSentences: 0,
    veryHardSentences: 0,
    adverbs: 0,
    passiveVoice: 0,
    complex: 0,
    brevity: {
      longSentences: 0,
      wordyPhrases: 0,
      redundantPhrases: 0,
      fillerWords: 0,
      weakQualifiers: 0
    },
    conversational: {
      missingContractions: 0,
      formalWords: 0,
      impersonalLanguage: 0,
      complexConjunctions: 0,
      formalTransitions: 0,
      complexSentences: 0
    },
    marketing: {
      weakHeadlines: 0,
      weakCTAs: 0,
      featureFocused: 0,
      vagueClaims: 0,
      missingUrgency: 0
    },
    specificIssues: []  // Array to track individual sentence/phrase issues
  };

  // Event Listeners
  if (inputArea) {
    // Add real-time analysis with debouncing
    let analysisTimeout;
    inputArea.addEventListener('input', function() {
      clearTimeout(analysisTimeout);
      analysisTimeout = setTimeout(() => {
        analyzeText();
        updateWordCount();
      }, 300);
    });
  }

  // Keyboard shortcuts
  document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + Enter to analyze
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      analyzeText();
    }
    
    // Ctrl/Cmd + Shift + V for voice input
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'V') {
      e.preventDefault();
      toggleSpeechToText();
    }
    
    // F key for focus mode (when not typing in textarea)
    if (e.key === 'f' && !e.ctrlKey && !e.metaKey && !e.altKey && document.activeElement !== inputArea) {
      e.preventDefault();
      toggleFocusMode();
    }
    
    // Tab to toggle view (when not in textarea)
    if (e.key === 'Tab' && document.activeElement !== inputArea) {
      e.preventDefault();
      toggleView();
    }
    
    // Escape to exit focus mode or stop recording
    if (e.key === 'Escape') {
      e.preventDefault();
      if (isRecording) {
        toggleSpeechToText();
      } else if (appState.focusMode) {
        toggleFocusMode();
      }
    }
  });

  // Settings handlers
  setupSettingsHandlers();

  function setupSettingsHandlers() {
    // Passive detection radio buttons
    const radios = document.querySelectorAll('input[name="passiveDetection"]');
    radios.forEach(radio => {
      radio.addEventListener('change', function() {
        appState.settings.passiveDetection = this.value;
        analyzeText();
      });
    });

    // Writing mode selection
    const writingModeSelect = document.getElementById('writing-mode-select');
    if (writingModeSelect) {
      writingModeSelect.addEventListener('change', function() {
        appState.settings.writingMode = this.value;
        analyzeText();
        updateModeUI();
      });
    }

    // Click outside to close settings
    document.addEventListener('click', function(event) {
      const settingsDropdown = document.getElementById('settings-dropdown');
      const settingsBtn = document.getElementById('settings-btn');
      
      if (settingsDropdown && settingsBtn && 
          !settingsDropdown.contains(event.target) && 
          !settingsBtn.contains(event.target)) {
        settingsDropdown.classList.remove('show');
      }
    });
  }

  function analyzeText() {
    if (!inputArea) return;

    // Reset data
    data = {
      paragraphs: 0,
      sentences: 0,
      words: 0,
      characters: 0,
      hardSentences: 0,
      veryHardSentences: 0,
      adverbs: 0,
      passiveVoice: 0,
      complex: 0,
      brevity: {
        longSentences: 0,
        wordyPhrases: 0,
        redundantPhrases: 0,
        fillerWords: 0,
        weakQualifiers: 0
      },
      conversational: {
        missingContractions: 0,
        formalWords: 0,
        impersonalLanguage: 0,
        complexConjunctions: 0,
        formalTransitions: 0,
        complexSentences: 0
      },
      marketing: {
        weakHeadlines: 0,
        weakCTAs: 0,
        featureFocused: 0,
        vagueClaims: 0,
        missingUrgency: 0
      },
      specificIssues: []  // Reset specific issues array
    };
    
    const text = inputArea.value;
    const paragraphs = text.split("\n").filter(p => p.trim().length > 0);
    const outputArea = document.getElementById("output");
    
    if (!outputArea) return;
    
    if (!text.trim()) {
      outputArea.innerHTML = '<p class="placeholder-text">Your analyzed text will appear here with color-coded highlights for different writing issues.</p>';
      updateMetrics();
      updateWordCount();
      return;
    }
    
    // Calculate basic stats
    data.characters = text.length;
    data.words = text.trim() ? text.trim().split(/\s+/).length : 0;
    
    // Analyze each paragraph
    const analyzedParagraphs = paragraphs.map(p => getDifficultSentences(p, data, appState.settings, text));
    const formattedParagraphs = analyzedParagraphs.map(para => `<p>${para}</p>`);
    
    data.paragraphs = paragraphs.length;
    
    updateMetrics();
    updateWordCount();
    updateWritingTips();
    outputArea.innerHTML = formattedParagraphs.join("");
    
    // Add click handlers to sentences
    setupSentenceClickHandlers();
  }

  /**
   * Set up click handlers for all sentences in the output
   */
  function setupSentenceClickHandlers() {
    const outputArea = document.getElementById("output");
    if (!outputArea) return;
    
    // Remove existing listeners first
    const existingClickables = outputArea.querySelectorAll('.clickable-sentence');
    existingClickables.forEach(el => {
      el.removeEventListener('click', handleSentenceClick);
    });
    
    // Add new listeners
    const clickableSentences = outputArea.querySelectorAll('.clickable-sentence');
    clickableSentences.forEach(sentenceEl => {
      sentenceEl.addEventListener('click', handleSentenceClick);
    });
  }

  /**
   * Handle click on a sentence
   * @param {Event} event - Click event
   */
  function handleSentenceClick(event) {
    event.preventDefault();
    event.stopPropagation();
    
    const sentenceEl = event.currentTarget;
    const originalSentence = sentenceEl.getAttribute('data-original-sentence');
    
    if (!originalSentence) return;
    
    // Strip HTML tags from the original sentence to get clean text
    const cleanSentence = originalSentence.replace(/<[^>]*>/g, '');
    
    // Analyze the sentence
    const issues = analyzeSingleSentence(cleanSentence);
    
    // Show the dialog
    showSentenceDialog(issues);
  }

  /**
   * Show the sentence issues dialog
   * @param {Array} issues - Array of issue objects
   */
  function showSentenceDialog(issues) {
    const dialog = document.getElementById('sentence-dialog');
    const content = document.getElementById('sentence-dialog-content');
    
    if (!dialog || !content) return;
    
    // Clear existing content
    content.innerHTML = '';
    
    if (issues.length === 0) {
      content.innerHTML = `
        <div class="text-center py-8 text-gray-500">
          <div class="text-3xl mb-2">✅</div>
          <div>No issues found in this sentence!</div>
        </div>
      `;
    } else {
      issues.forEach(issue => {
        const issueEl = document.createElement('div');
        issueEl.className = 'flex gap-3 py-3 border-b border-gray-100 last:border-b-0';
        issueEl.innerHTML = `
          <div class="text-lg flex-shrink-0">${issue.icon}</div>
          <div class="flex-1">
            <div class="font-medium text-gray-900 mb-1">${issue.title}</div>
            <div class="text-sm text-gray-600 mb-2">${issue.description}</div>
            <div class="text-xs text-gray-500 italic">${issue.suggestion}</div>
          </div>
        `;
        content.appendChild(issueEl);
      });
    }
    
    // Show the dialog
    dialog.showModal();
    
    // Add event listener for ESC key and backdrop click
    dialog.addEventListener('click', handleDialogBackdropClick);
    dialog.addEventListener('cancel', closeSentenceDialog);
  }

  /**
   * Handle clicking on dialog backdrop to close
   * @param {Event} event - Click event
   */
  function handleDialogBackdropClick(event) {
    const dialog = event.currentTarget;
    const rect = dialog.getBoundingClientRect();
    
    // Check if click is on backdrop (outside dialog content)
    if (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    ) {
      closeSentenceDialog();
    }
  }

  /**
   * Close the sentence dialog
   */
  function closeSentenceDialog() {
    const dialog = document.getElementById('sentence-dialog');
    if (dialog) {
      dialog.close();
      dialog.removeEventListener('click', handleDialogBackdropClick);
      dialog.removeEventListener('cancel', closeSentenceDialog);
    }
  }

  function updateMetrics() {
    const metricsContainer = document.getElementById('analysis-metrics');
    if (!metricsContainer) return;
    
    metricsContainer.innerHTML = '';
    
    // Add mode-specific metrics first
    if (appState.settings.writingMode === 'brevity') {
      addMetric('Wordy Phrases', data.brevity.wordyPhrases, 'brevity');
      addMetric('Redundant Phrases', data.brevity.redundantPhrases, 'brevity');
      addMetric('Filler Words', data.brevity.fillerWords, 'brevity');
      addMetric('Long Sentences', data.brevity.longSentences, 'brevity');
    } else if (appState.settings.writingMode === 'conversational') {
      addMetric('Missing Contractions', data.conversational.missingContractions, 'conversational');
      addMetric('Formal Words', data.conversational.formalWords, 'conversational');
      addMetric('Impersonal Language', data.conversational.impersonalLanguage, 'conversational');
      addMetric('Complex Sentences', data.conversational.complexSentences, 'conversational');
    } else if (appState.settings.writingMode === 'marketing') {
      addMetric('Weak Headlines', data.marketing.weakHeadlines, 'marketing');
      addMetric('Weak CTAs', data.marketing.weakCTAs, 'marketing');
      addMetric('Feature-Focused', data.marketing.featureFocused, 'marketing');
      addMetric('Vague Claims', data.marketing.vagueClaims, 'marketing');
    }
    
    // Always show standard metrics
    addMetric('Adverbs', data.adverbs, 'adverb');
    addMetric('Passive Voice', data.passiveVoice, 'passive');
    addMetric('Complex Phrases', data.complex, 'complex');
    addMetric('Hard Sentences', data.hardSentences, 'hard-sentence');
    addMetric('Very Hard Sentences', data.veryHardSentences, 'very-hard-sentence');
  }

  function addMetric(label, value, type) {
    const metricsContainer = document.getElementById('analysis-metrics');
    if (!metricsContainer) return;
    
    // Map types to Tailwind colors
    const colorMap = {
      'adverb': 'border-l-blue-500 bg-blue-50',
      'passive': 'border-l-green-500 bg-green-50',
      'complex': 'border-l-purple-500 bg-purple-50',
      'hard-sentence': 'border-l-yellow-500 bg-yellow-50',
      'very-hard-sentence': 'border-l-red-500 bg-red-50'
    };
    
    const colorClass = colorMap[type] || 'border-l-slate-500 bg-slate-50';
    
    const metricCard = document.createElement('div');
    metricCard.className = `bg-white border border-slate-200 border-l-4 ${colorClass} rounded-lg p-4 flex flex-col gap-1`;
    
    metricCard.innerHTML = `
      <span class="text-sm font-medium text-slate-600">${label}</span>
      <span class="text-2xl font-bold text-slate-900">${value}</span>
    `;
    
    metricsContainer.appendChild(metricCard);
  }

  function updateWordCount() {
    if (!inputArea) return;
    
    const text = inputArea.value;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const characters = text.length;
    const sentences = text.trim() ? text.split(/[.!?]+/).filter(s => s.trim().length > 0).length : 0;
    
    const wordCountEl = document.getElementById('word-count');
    const charCountEl = document.getElementById('char-count');
    const sentenceCountEl = document.getElementById('sentence-count');
    
    if (wordCountEl) wordCountEl.textContent = `${words} word${words !== 1 ? 's' : ''}`;
    if (charCountEl) charCountEl.textContent = `${characters} character${characters !== 1 ? 's' : ''}`;
    if (sentenceCountEl) sentenceCountEl.textContent = `${sentences} sentence${sentences !== 1 ? 's' : ''}`;
  }

  /**
   * Analyze a single sentence and return all detected issues
   * @param {string} originalSentence - The raw sentence text to analyze
   * @returns {Array} Array of issue objects with type, description, and suggestions
   */
  function analyzeSingleSentence(originalSentence) {
    const issues = [];
    let sentence = originalSentence;
    
    // Clean sentence for analysis
    let cleanSentence = sentence.replace(/[^a-z0-9. ]/gi, "") + ".";
    let words = cleanSentence.split(" ").length;
    let letters = cleanSentence.split(" ").join("").length;
    
    // Create temporary data object to track issues
    const tempData = {
      adverbs: 0,
      passiveVoice: 0,
      complex: 0
    };
    
    // Check for adverbs
    const adverbResult = getAdverbs(sentence, tempData);
    if (tempData.adverbs > 0) {
      issues.push({
        type: 'adverb',
        icon: '📘',
        title: 'Adverbs',
        description: `Found ${tempData.adverbs} adverb${tempData.adverbs > 1 ? 's' : ''} that may weaken your writing.`,
        suggestion: 'Consider replacing adverbs with stronger, more specific verbs or adjectives.'
      });
    }
    
    // Reset for next check
    tempData.complex = 0;
    const complexResult = getComplex(sentence, tempData);
    if (tempData.complex > 0) {
      issues.push({
        type: 'complex',
        icon: '🟣',
        title: 'Complex Words',
        description: `Found ${tempData.complex} complex word${tempData.complex > 1 ? 's' : ''} that could be simplified.`,
        suggestion: 'Try using simpler alternatives that your readers will understand more easily.'
      });
    }
    
    // Reset for passive voice check
    tempData.passiveVoice = 0;
    const passiveAnalyzer = appState.settings.passiveDetection === 'original' ? getPassiveOriginal : getPassive;
    const passiveResult = passiveAnalyzer(sentence, tempData);
    if (tempData.passiveVoice > 0) {
      issues.push({
        type: 'passive',
        icon: '🟢',
        title: 'Passive Voice',
        description: `Found ${tempData.passiveVoice} instance${tempData.passiveVoice > 1 ? 's' : ''} of passive voice.`,
        suggestion: 'Consider rewriting in active voice to make your writing more direct and engaging.'
      });
    }
    
    // Reset for qualifiers check (note: qualifier analysis updates 'adverbs' count in data)
    const beforeAdverbs = tempData.adverbs;
    const qualifierResult = getQualifier(sentence, tempData);
    const qualifiersFound = tempData.adverbs - beforeAdverbs;
    if (qualifiersFound > 0) {
      issues.push({
        type: 'qualifier',
        icon: '🔵',
        title: 'Weak Qualifiers',
        // lets address the qualifer  and how it can be improved
        description: `${qualifierResult} Found ${qualifiersFound} weakening phrase${qualifiersFound > 1 ? 's' : ''}.`,
        suggestion: 'Remove qualifying words to make your statements more confident and direct.'
      });
    }
    
    // Check sentence difficulty
    if (words >= 14) {
      let level = calculateLevel(letters, words, 1);
      if (level >= 14) {
        issues.push({
          type: 'very-hard-sentence',
          icon: '🔴',
          title: 'Very Hard Sentence',
          description: `This sentence has ${words} words and is very difficult to read.`,
          suggestion: 'Consider breaking it into 2-3 shorter sentences and using simpler language.'
        });
      } else if (level >= 10) {
        issues.push({
          type: 'hard-sentence',
          icon: '🟡',
          title: 'Hard Sentence',
          description: `This sentence has ${words} words and is hard to read.`,
          suggestion: 'Try breaking it into shorter sentences or simplifying complex phrases.'
        });
      }
    }
    
    return issues;
  }

  function updateWritingTips() {
    const tipsContainer = document.getElementById('writing-tips');
    if (!tipsContainer) return;
    
    const tips = generateWritingTips();
    
    if (tips.length === 0) {
      tipsContainer.innerHTML = '<div class="text-sm text-slate-600">Choose a writing mode above to get specific feedback for your writing goals.</div>';
      return;
    }
    
    tipsContainer.innerHTML = `
      <ul class="space-y-2 text-sm">
        ${tips.map(tip => `
          <li class="flex items-start gap-2">
            <span class="flex-shrink-0 mt-0.5">${tip.icon}</span>
            <div class="flex-1">
              ${tip.snippet ? `<div class="font-mono text-xs bg-slate-100 px-2 py-1 rounded mb-1 text-slate-600">"${tip.snippet}"</div>` : ''}
              <span class="text-slate-700">${tip.text}</span>
            </div>
          </li>
        `).join('')}
      </ul>
    `;
  }

  function generateWritingTips() {
    const tips = [];
    const mode = appState.settings.writingMode;
    
    if (mode === 'brevity') {
      if (data.brevity.wordyPhrases > 0) {
        tips.push({
          icon: '✂️',
          text: `Found ${data.brevity.wordyPhrases} wordy phrase${data.brevity.wordyPhrases > 1 ? 's' : ''}. Try shorter alternatives like "to" instead of "in order to".`
        });
      }
      if (data.brevity.longSentences > 0) {
        tips.push({
          icon: '📏',
          text: `${data.brevity.longSentences} sentence${data.brevity.longSentences > 1 ? 's are' : ' is'} too long. Aim for 15 words or fewer per sentence.`
        });
      }
    } else if (mode === 'conversational') {
      if (data.conversational.missingContractions > 0) {
        tips.push({
          icon: '🗣️',
          text: `Use contractions like "don't" and "can't" to sound more natural and conversational.`
        });
      }
      if (data.conversational.formalWords > 0) {
        tips.push({
          icon: '👥',
          text: `Replace formal words with simpler alternatives. Use "start" instead of "commence".`
        });
      }
    } else if (mode === 'marketing') {
      if (data.marketing.weakCTAs > 0) {
        tips.push({
          icon: '📢',
          text: `Strengthen your calls-to-action with the Verb + Benefit formula. Try "Get your free report" instead of "Learn more".`
        });
      }
      if (data.marketing.featureFocused > 0) {
        tips.push({
          icon: '🎯',
          text: `Focus on benefits (what it does for customers) rather than features (what it has).`
        });
      }
    }
    
    // Add specific sentence issues (limit to 2 most recent)
    if (data.specificIssues && data.specificIssues.length > 0) {
      const recentIssues = data.specificIssues.slice(-2); // Get 2 most recent issues
      recentIssues.forEach(issue => {
        tips.push({
          icon: issue.icon,
          text: issue.suggestion,
          type: 'specific-issue',
          snippet: issue.text
        });
      });
    }
    
    // General tips
    if (data.passiveVoice > data.sentences * 0.2) {
      tips.push({
        icon: '⚡',
        text: 'Try using more active voice for stronger, more direct writing.'
      });
    }
    
    if (tips.length === 0) {
      tips.push({
        icon: '✨',
        text: 'Great job! Your writing looks good. Keep writing to get more insights.'
      });
    }
    
    return tips.slice(0, 4); // Increased to 4 tips to accommodate specific issues
  }

  function updateModeUI() {
    updateLegend();
  }

  function updateLegend() {
    const legend = document.getElementById('legend');
    if (!legend) return;
    
    const mode = appState.settings.writingMode;
    
    let modeItems = '';
    if (mode === 'brevity') {
      modeItems = '<span class="flex items-center gap-2 text-sm text-slate-700"><span class="w-4 h-4 rounded" style="background: var(--color-brevity);"></span>Brevity Issues</span>';
    } else if (mode === 'conversational') {
      modeItems = '<span class="flex items-center gap-2 text-sm text-slate-700"><span class="w-4 h-4 rounded" style="background: var(--color-conversational);"></span>Conversation Issues</span>';
    } else if (mode === 'marketing') {
      modeItems = '<span class="flex items-center gap-2 text-sm text-slate-700"><span class="w-4 h-4 rounded" style="background: var(--color-marketing);"></span>Marketing Issues</span>';
    }
    
    legend.innerHTML = `
      <h4 class="text-sm font-semibold text-slate-900 mb-3">Highlight Legend</h4>
      <div class="flex flex-wrap gap-6">
        ${modeItems}
        <span class="flex items-center gap-2 text-sm text-slate-700">
          <span class="w-4 h-4 rounded adverb-color"></span>Adverbs
        </span>
        <span class="flex items-center gap-2 text-sm text-slate-700">
          <span class="w-4 h-4 rounded passive-color"></span>Passive Voice
        </span>
        <span class="flex items-center gap-2 text-sm text-slate-700">
          <span class="w-4 h-4 rounded complex-color"></span>Complex Words
        </span>
        <span class="flex items-center gap-2 text-sm text-slate-700">
          <span class="w-4 h-4 rounded hard-sentence-color"></span>Hard Sentences
        </span>
        <span class="flex items-center gap-2 text-sm text-slate-700">
          <span class="w-4 h-4 rounded very-hard-sentence-color"></span>Very Hard
        </span>
      </div>
    `;
  }

  function toggleFocusMode() {
    appState.focusMode = !appState.focusMode;
    const mainContent = document.getElementById('main-content');
    const focusBtn = document.getElementById('focus-mode-btn');
    
    if (mainContent && focusBtn) {
      if (appState.focusMode) {
        mainContent.classList.add('focus-mode');
        focusBtn.classList.add('active');
        const focusText = focusBtn.querySelector('span:not(.icon)');
        if (focusText) focusText.textContent = 'Exit Focus';
        if (inputArea) inputArea.focus();
      } else {
        mainContent.classList.remove('focus-mode');
        focusBtn.classList.remove('active');
        const focusText = focusBtn.querySelector('span:not(.icon)');
        if (focusText) focusText.textContent = 'Focus';
      }
    }
  }

  function toggleView() {
    const views = ['split', 'editor', 'preview'];
    const currentIndex = views.indexOf(appState.currentView);
    const nextIndex = (currentIndex + 1) % views.length;
    appState.currentView = views[nextIndex];
    
    const mainContent = document.getElementById('main-content');
    const toggleBtn = document.getElementById('view-toggle-btn');
    const toggleText = document.getElementById('view-toggle-text');
    
    if (mainContent && toggleBtn && toggleText) {
      // Remove all view classes
      mainContent.classList.remove('editor-only', 'preview-only');
      
      switch (appState.currentView) {
        case 'editor':
          mainContent.classList.add('editor-only');
          toggleText.textContent = 'Preview';
          break;
        case 'preview':
          mainContent.classList.add('preview-only');
          toggleText.textContent = 'Split';
          break;
        case 'split':
          toggleText.textContent = 'Editor';
          break;
      }
    }
  }

  function toggleSettings() {
    const dropdown = document.getElementById('settings-dropdown');
    if (dropdown) {
      dropdown.classList.toggle('show');
    }
  }

  function clearText() {
    if (inputArea && confirm('Clear all text?')) {
      inputArea.value = '';
      analyzeText();
      inputArea.focus();
    }
  }

  // Speech to Text functionality
  let isRecording = false;
  let recognition = null;

  function initializeSpeechRecognition() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('Speech recognition not supported in this browser');
      const micBtn = document.getElementById('mic-btn');
      if (micBtn) {
        micBtn.style.display = 'none';
      }
      return false;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = function() {
      isRecording = true;
      updateMicButton();
    };

    recognition.onresult = function(event) {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      // Add final transcript to the textarea
      if (finalTranscript) {
        const currentText = inputArea.value;
        const cursorPosition = inputArea.selectionStart;
        const textBefore = currentText.substring(0, cursorPosition);
        const textAfter = currentText.substring(cursorPosition);
        
        // Add a space before the new text if needed
        const needsSpace = textBefore.length > 0 && !textBefore.endsWith(' ') && !textBefore.endsWith('\n');
        const newText = textBefore + (needsSpace ? ' ' : '') + finalTranscript + textAfter;
        
        inputArea.value = newText;
        
        // Move cursor to end of inserted text
        const newCursorPosition = cursorPosition + (needsSpace ? 1 : 0) + finalTranscript.length;
        inputArea.setSelectionRange(newCursorPosition, newCursorPosition);
        
        // Trigger analysis
        analyzeText();
        updateWordCount();
      }
    };

    recognition.onerror = function(event) {
      console.error('Speech recognition error:', event.error);
      isRecording = false;
      updateMicButton();
      
      if (event.error === 'not-allowed') {
        alert('Microphone access denied. Please allow microphone access and try again.');
      } else if (event.error === 'no-speech') {
        // This is common and expected, don't show an error
      } else {
        alert('Speech recognition error: ' + event.error);
      }
    };

    recognition.onend = function() {
      isRecording = false;
      updateMicButton();
    };

    return true;
  }

  function toggleSpeechToText() {
    if (!recognition) {
      if (!initializeSpeechRecognition()) {
        alert('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
        return;
      }
    }

    if (isRecording) {
      recognition.stop();
    } else {
      try {
        recognition.start();
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        alert('Could not start speech recognition. Please try again.');
      }
    }
  }

  function updateMicButton() {
    const micIcon = document.getElementById('mic-icon');
    const micText = document.getElementById('mic-text');
    const micBtn = document.getElementById('mic-btn');
    
    if (isRecording) {
      micIcon.textContent = '🔴';
      micText.textContent = 'Stop';
      micBtn.classList.remove('hover:border-blue-500', 'hover:text-blue-600');
      micBtn.classList.add('border-red-500', 'text-red-600', 'bg-red-50', 'recording');
      micBtn.title = 'Stop Voice Input (Esc)';
    } else {
      micIcon.textContent = '🎤';
      micText.textContent = 'Voice';
      micBtn.classList.remove('border-red-500', 'text-red-600', 'bg-red-50', 'recording');
      micBtn.classList.add('hover:border-blue-500', 'hover:text-blue-600');
      micBtn.title = 'Voice Input (Ctrl+Shift+V)';
    }
  }

  // Initialize speech recognition on app start
  initializeSpeechRecognition();

  // Make functions globally available
  window.analyzeText = analyzeText;
  window.toggleFocusMode = toggleFocusMode;
  window.toggleView = toggleView;
  window.toggleSettings = toggleSettings;
  window.clearText = clearText;
  window.toggleSpeechToText = toggleSpeechToText;
  window.closeSentenceDialog = closeSentenceDialog;
  window.format = analyzeText; // Backwards compatibility

  // Initial setup
  updateWordCount();
  analyzeText();
  updateModeUI();
}