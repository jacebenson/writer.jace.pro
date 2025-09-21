# Copilot Instructions for Fake Hemingway Writing Assistant

## Architecture Overview

This is an **Eleventy static site** that builds a client-side writing analysis tool. The app analyzes text in real-time using modular ES6 modules and highlights writing issues with color-coded spans.

### Key Components

- **`src/js/app.js`** - Main application entry point, handles UI events and coordinates analysis
- **`src/js/analyzers/`** - Modular text analysis components (adverbs, passive voice, complex words, etc.)
- **`src/js/utils/`** - Shared utilities for text processing and word lists
- **`src/_layouts/base.njk`** - Nunjucks template with HTML structure
- **`src/css/index.css`** - Styling with highlight color definitions

## Development Workflow

### Commands
```bash
npm run dev        # Start development server with watch mode
npm run build      # Build static site to _site/
npm run serve      # Serve built site locally
```

### File Structure Pattern
- Source files in `src/` directory
- Built output in `_site/` (auto-generated)
- CSS and JS are pass-through copied by Eleventy (see `.eleventy.js`)

## Code Patterns

### Analyzer Module Pattern
Each analyzer in `src/js/analyzers/` follows this signature:
```javascript
export function getAnalyzerName(sentence, data) {
  // Modify sentence with highlighting spans
  // Update data object counts
  return modifiedSentence;
}
```

### Text Analysis Flow
1. **Input** - User types in textarea (`#text-area`)
2. **Split** - Paragraphs → sentences using `getSentenceFromParagraph()`
3. **Analyze** - Each sentence passed through all analyzers in `sentence-difficulty.js`
4. **Highlight** - Spans added with CSS classes: `.adverb`, `.passive`, `.complex`, etc.
5. **Update** - Statistics counters updated via `updateCounters()`

### Highlighting System
- **Blue** (`.adverb`, `.qualifier`) - Adverbs and weakening phrases
- **Green** (`.passive`) - Passive voice constructions
- **Purple** (`.complex`) - Complex words with simpler alternatives
- **Yellow** (`.hardSentence`) - Difficult sentences (Flesch-Kincaid 10-14)
- **Red** (`.veryHardSentence`) - Very difficult sentences (Flesch-Kincaid 14+)

## Important Conventions

### Word Lists in `word-lists.js`
Return objects with key-value pairs for word mappings:
```javascript
export function getComplexWords() {
  return {
    "complex-word": ["simple", "alternative"],
    // ...
  };
}
```

### Data Object Structure
The `data` object tracks counts across all analyzers:
```javascript
{
  paragraphs: 0, sentences: 0, words: 0,
  hardSentences: 0, veryHardSentences: 0,
  adverbs: 0, passiveVoice: 0, complex: 0
}
```

### Text Processing
- Clean text with regex: `sentence.replace(/[^a-z0-9. ]/gi, "")`
- Split words: `sentence.split(" ")`
- Wrap highlights: `<span class="type">${text}</span>`

## Deployment Notes

- Static site builds to `_site/` directory
- No server-side dependencies - pure client-side JavaScript
- Deployable to any static hosting (Netlify, Vercel, GitHub Pages)
- ES6 modules work directly in modern browsers (no bundling needed)
