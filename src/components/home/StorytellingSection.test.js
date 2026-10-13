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

test('the portrait image fills the entire mobile scene without letterboxing', () => {
  const [rule] = rulesFor('.storytelling-mobile-layout .storytelling-image-window');
  expect(rule.parent.params).toBe('(max-width: 767px)');
  expect(rule.nodes.find(node => node.prop === 'inset').value).toBe('0');
  expect(rule.nodes.some(node => ['top', 'bottom'].includes(node.prop))).toBe(false);
  for (const index of [2, 6]) {
    const [image] = rulesFor(`.storytelling-mobile-layout .storytelling-image-${index} > img`);
    expect(image.nodes.find(node => node.prop === 'object-fit').value).toBe('cover');
  }
  const [card] = rulesFor('.storytelling-touch-active .storytelling-card');
  expect(card.nodes.find(node => node.prop === 'background').value).toBe('#050608');
});

test('the introduction does not cover the subjects in the pinned viewport', () => {
  const [header] = rulesFor('.storytelling-touch-active .storytelling-header');
  expect(header.nodes.find(node => node.prop === 'position').value).toBe('relative');
  expect(header.nodes.some(node => node.prop === 'top')).toBe(false);
});

test.each(['.storytelling-mobile-layout .storytelling-card', '.storytelling-touch-active .storytelling-viewport'])('%s uses stable full-screen mobile height', selector => {
  const [rule] = rulesFor(selector);
  expect(rule.nodes.some(node => node.prop === 'height' && node.value === '100svh')).toBe(true);
});
