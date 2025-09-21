# ✍️ Fake Hemingway - Writing Assistant

A self-hosted, modular version of the Hemingway writing assistant that helps improve your writing by highlighting issues like passive voice, complex sentences, adverbs, and more. Built with [Eleventy](https://www.11ty.dev/) and modern ES6 modules.

## 🎯 Features

- **📊 Real-time Analysis** - Instant feedback as you type
- **🟡 Complex Sentences** - Highlights hard-to-read sentences in yellow
- **🔴 Very Hard Sentences** - Marks extremely difficult sentences in red
- **🟢 Passive Voice Detection** - Identifies "was/were + past participle" patterns
- **🔵 Adverb Highlighting** - Shows unnecessary -ly adverbs
- **🟣 Complex Words** - Suggests simpler alternatives for complex terms
- **🔵 Weakening Phrases** - Identifies qualifier words that weaken your writing
- **📈 Writing Statistics** - Tracks readability metrics and suggestions

## 🚀 Quick Start

### Prerequisites

- Node.js (version 14 or higher)
- npm

### Installation

```bash
git clone https://github.com/jacebenson/writer.jace.pro.git
cd writer.jace.pro
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:8080](http://localhost:8080) to view the application.

### Build for Production

```bash
npm run build
```

Generates static files in the `_site/` directory.

### Serve Built Site

```bash
npm run serve
```

Builds and serves the production site locally.

## 📁 Project Structure

```text
src/
├── _layouts/                 # Nunjucks templates
│   └── base.njk             # Base HTML layout
├── css/
│   └── index.css            # Styling and highlighting colors
├── js/
│   ├── analyzers/           # Modular text analysis components
│   │   ├── adverbs.js       # Adverb detection
│   │   ├── complex-words.js # Complex word identification
│   │   ├── passive-voice.js # Passive voice detection
│   │   ├── qualifiers.js    # Weakening phrase detection
│   │   └── sentence-difficulty.js # Readability analysis
│   ├── utils/               # Shared utilities
│   │   ├── text-utils.js    # Text processing functions
│   │   └── word-lists.js    # Word dictionaries
│   └── app.js               # Main application logic
└── index.njk                # Homepage template
```

## 🔧 Architecture

### Modular Design

The application is built with a modular architecture where each type of writing analysis is handled by a separate module:

#### Analyzers

- **`adverbs.js`** - Detects unnecessary -ly adverbs using a whitelist approach
- **`passive-voice.js`** - Identifies passive voice by looking for helping verbs + past participles
- **`complex-words.js`** - Highlights complex words with simpler alternatives
- **`qualifiers.js`** - Finds weakening phrases like "I think", "maybe", etc.
- **`sentence-difficulty.js`** - Coordinates all analysis and calculates readability

#### Utils

- **`text-utils.js`** - Core functions for sentence splitting, readability calculation
- **`word-lists.js`** - Comprehensive dictionaries of words and phrases

#### Main App

- **`app.js`** - Handles UI interactions, event listeners, and display updates

### Text Analysis Process

1. **Text Input** - User types in textarea
2. **Sentence Splitting** - Text divided into sentences using punctuation
3. **Multi-pass Analysis** - Each sentence analyzed by all modules:
   - Adverb detection
   - Complex word identification
   - Passive voice detection
   - Qualifier phrase detection
4. **Readability Calculation** - Flesch-Kincaid readability formula applied
5. **Highlighting Applied** - HTML spans added with appropriate CSS classes
6. **Statistics Updated** - Counter displays updated with new metrics

## 🎨 Highlighting System

| Color | Type | Description |
|-------|------|-------------|
| 🔵 Blue | Adverbs & Qualifiers | Remove for stronger writing |
| 🟢 Green | Passive Voice | Rewrite in active voice |
| 🟣 Purple | Complex Words | Use simpler alternatives |
| 🟡 Yellow | Hard Sentences | Consider shortening |
| 🔴 Red | Very Hard Sentences | Break into multiple sentences |

## 📊 Writing Metrics

- **Adverbs** - Target: ≤ paragraphs ÷ 3
- **Passive Voice** - Target: ≤ sentences ÷ 5
- **Complex Words** - Highlighted with suggestions
- **Hard Sentences** - Based on Flesch-Kincaid readability
- **Very Hard Sentences** - Extremely difficult to read

## 🛠️ Customization

### Adding New Word Lists

Edit `src/js/utils/word-lists.js`:

```javascript
export function getComplexWords() {
  return {
    "your-complex-word": ["simpler", "alternative"],
    // ... more words
  };
}
```

### Creating New Analyzers

1. Create new file in `src/js/analyzers/`
2. Export analysis function
3. Import and use in `sentence-difficulty.js`

Example:
```javascript
// src/js/analyzers/my-analyzer.js
export function getMyAnalysis(sentence, data) {
  // Your analysis logic
  return sentence; // with highlighting applied
}
```

### Modifying Highlighting

Update CSS classes in `src/css/index.css`:

```css
.my-highlight {
  background: #your-color;
  padding: 2px 4px;
  border-radius: 4px;
}
```

## 🚀 Deployment

The built site can be deployed to any static hosting service:

### Netlify

```bash
npm run build
# Deploy _site/ directory
```

### Vercel

```bash
npm run build
# Deploy _site/ directory
```

### GitHub Pages

```bash
npm run build
# Push _site/ contents to gh-pages branch
```

### Traditional Web Server

```bash
npm run build
# Copy _site/ contents to web server
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

ISC

## 🙏 Acknowledgments

- Inspired by the [Hemingway Editor](http://www.hemingwayapp.com/)
- Original concept from [Sam Williams' Fake Hemingway](https://samwsoftware.github.io/Projects/hemingway/)
- Built with [Eleventy](https://www.11ty.dev/) static site generator
