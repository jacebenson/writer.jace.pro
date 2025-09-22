/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,js,njk,md}",
    "./_site/**/*.{html,js}"
  ],
  theme: {
    extend: {
      colors: {
        // Analysis colors matching our existing design
        'analysis-adverb': '#3b82f6',
        'analysis-passive': '#10b981', 
        'analysis-complex': '#8b5cf6',
        'analysis-hard': '#f59e0b',
        'analysis-very-hard': '#ef4444',
        
        // Mode colors
        'mode-brevity': '#f59e0b',
        'mode-conversational': '#06b6d4',
        'mode-marketing': '#ec4899',
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
