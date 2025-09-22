// Main application logic
import { getDifficultSentences } from './analyzers/sentence-difficulty.js';

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
    
    // Escape to exit focus mode
    if (e.key === 'Escape' && appState.focusMode) {
      e.preventDefault();
      toggleFocusMode();
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

  // Make functions globally available
  window.analyzeText = analyzeText;
  window.toggleFocusMode = toggleFocusMode;
  window.toggleView = toggleView;
  window.toggleSettings = toggleSettings;
  window.clearText = clearText;
  window.format = analyzeText; // Backwards compatibility

  // Initial setup
  updateWordCount();
  analyzeText();
  updateModeUI();
}