/** @jest-environment node */
const fs = require('fs');
const path = require('path');
const postcss = require('postcss');

const stylesheet = postcss.parse(fs.readFileSync(path.join(__dirname, 'StorytellingSection.css'), 'utf8'));
const mobileSection = '[data-testid="page-home"] > .storytelling-section.storytelling-mobile-layout';
const mobileSpacer = '.storytelling-touch-active > .pin-spacer';

function rulesFor(selector) {
  const rules = [];
  stylesheet.walkRules(selector, (rule) => rules.push(rule));
  return rules;
}

test('the mobile storytelling section does not contain its fixed ScrollTrigger viewport', () => {
  const [rule] = rulesFor(mobileSection);
  expect(rule).toBeDefined();
  expect(rule.nodes.find((node) => node.prop === 'content-visibility').value).toBe('visible');
  expect(rule.nodes.find((node) => node.prop === 'contain-intrinsic-size').value).toBe('none');
});

test('only the mobile storytelling pin spacer lets the fixed scene remain visible', () => {
  const [rule] = rulesFor(mobileSpacer);
  const overflow = rule.nodes.find((node) => node.prop === 'overflow');
  expect(overflow.value).toBe('visible');
  expect(overflow.important).toBe(true);
});

test.each([mobileSection, mobileSpacer])('%s remains restricted to the mobile breakpoint', (selector) => {
  const rules = rulesFor(selector);
  expect(rules).toHaveLength(1);
  expect(rules[0].parent.type).toBe('atrule');
  expect(rules[0].parent.name).toBe('media');
  expect(rules[0].parent.params).toBe('(max-width: 767px)');
});
