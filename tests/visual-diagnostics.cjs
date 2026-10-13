// Expose normally swallowed animation errors in the isolated visual fixture only.
module.exports = function (source) {
  if (!this.resourcePath.endsWith('StorytellingSection.jsx')) return source;
  return source.replace("initialize().catch(() => { /* Horizontal scrolling remains available as a fallback. */ });", "initialize().catch(error => { console.error('[visual fixture] storytelling enhancement', error); });");
};
