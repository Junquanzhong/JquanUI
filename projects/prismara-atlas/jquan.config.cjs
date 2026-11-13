const config = require('./design-system/tokens/prismara-jquan.config.js');
module.exports = {
  ...config,
  blocklist: ['ph', /^ph-/, 'light', 'dark'],
  content: ['./pages/**/*.html', './scripts/prismara-interactions.js', './scripts/prismara-theme.js'],
  safelist: ['hidden', 'animation-paused']
};
