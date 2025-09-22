import postcss from 'postcss';
import tailwindcss from '@tailwindcss/postcss';
import cssnano from 'cssnano';
import { readFile, writeFile, mkdir } from 'fs/promises';

export default function(eleventyConfig) {
  
  eleventyConfig.on('eleventy.before', async () => {
    console.log('Processing CSS with Tailwind...');
    
    try {
      // Read the CSS file
      const css = await readFile('src/assets/styles/index.css', 'utf8');
      
      // Process with PostCSS
      const result = await postcss([
        tailwindcss(),
        cssnano({ preset: 'default' })
      ]).process(css, { 
        from: 'src/assets/styles/index.css',
        to: '_site/assets/styles/index.css'
      });
      
      // Ensure output directory exists
      await mkdir('_site/assets/styles', { recursive: true });
      
      // Write the processed CSS
      await writeFile('_site/assets/styles/index.css', result.css);
      
      console.log('CSS processed successfully!');
    } catch (error) {
      console.error('Error processing CSS:', error);
    }
  });

  // Copy JavaScript files
  eleventyConfig.addPassthroughCopy("src/js");

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_layouts"
    }
  };
}
