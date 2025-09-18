# Fake Hemingway - Writing Assistant

A self-hosted version of the Hemingway writing assistant, built with [Eleventy](https://www.11ty.dev/).

## Features

- Highlights lengthy, complex sentences
- Identifies passive voice
- Marks adverbs and weakening phrases
- Shows complex words that could be simplified
- Real-time text analysis

## Development

### Prerequisites

- Node.js (version 14 or higher)
- npm

### Installation

```bash
npm install
```

### Development Server

```bash
npm run dev
```

This will start a local development server with hot reloading.

### Build

```bash
npm run build
```

This will generate the static site in the `_site` directory.

### Serve Built Site

```bash
npm run serve
```

This will build and serve the site locally.

## Project Structure

```text
src/
├── _layouts/          # Nunjucks templates
│   └── base.njk      # Base layout
├── css/              # Stylesheets
│   └── index.css     # Main stylesheet
├── js/               # JavaScript files
│   └── index.js      # Main application logic
└── index.njk         # Homepage template
```

## Deployment

The built site in `_site/` can be deployed to any static hosting service like:

- Netlify
- Vercel
- GitHub Pages
- Any web server

## License

ISC
