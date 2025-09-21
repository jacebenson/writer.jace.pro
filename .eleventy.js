module.exports = function(eleventyConfig) {
  // Copy CSS and JS files to output
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/js");
  
  // Copy any images or other assets
  eleventyConfig.addPassthroughCopy("src/assets");
  
  // Create thoughts collection
  eleventyConfig.addCollection("thoughts", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/thoughts/*.md");
  });
  
  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      layouts: "_layouts"
    },
    templateFormats: ["njk", "md", "html"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk"
  };
};
