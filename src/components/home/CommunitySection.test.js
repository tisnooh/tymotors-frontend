/** @jest-environment node */
const fs = require('fs');
const path = require('path');
const postcss = require('postcss');

const community = postcss.parse(fs.readFileSync(path.join(__dirname, 'CommunitySection.css'), 'utf8'));
const shared = postcss.parse(fs.readFileSync(path.join(__dirname, 'HomeEditorial.css'), 'utf8'));
function find(sheet, selector) {
  const rules = [];
  sheet.walkRules(selector, rule => rules.push(rule));
  return rules;
}
const value = (rule, property) => rule.nodes.find(node => node.prop === property)?.value;

test('desktop inspiration images fill the frame regardless of shared stylesheet import order', () => {
  const rule = find(community, '.universe-image-frame .universe-photo img').find(item => item.parent.type === 'root');
  expect(rule).toBeDefined();
  expect(value(rule, 'object-fit')).toBe('cover');
  expect(value(rule, 'object-position')).toBe('50% 50%');
  expect(value(rule, 'width')).toBe('100%');
  expect(value(rule, 'height')).toBe('100%');
  // Two scoped classes beat the shared .home-editorial-photo img rule;
  // no global fit override is needed for category or product photography.
  expect(value(find(shared, '.home-editorial-photo img')[0], 'object-fit')).toBe('contain');
});

test('desktop BMW crop retains the low vehicle rather than centring the empty wall', () => {
  const rule = find(community, '.universe-card[data-project="gathering"] .universe-photo img')
    .find(item => item.parent.type === 'root');
  expect(value(rule, 'object-position')).toBe('50% 70%');
});

test('mobile carousel sizing, crop and selection remain restricted to the mobile breakpoint', () => {
  const mobile = community.nodes.find(node => node.type === 'atrule' && node.params === '(max-width: 767px)');
  expect(mobile).toBeDefined();
  const rules = [];
  mobile.walkRules(rule => rules.push(rule));
  expect(value(rules.find(rule => rule.selector === '.universe-grid'), 'overflow-x')).toBe('auto');
  expect(value(rules.find(rule => rule.selector === '.universe-card.is-selected'), 'transform')).toBe('scale(1.035)');
  expect(value(rules.find(rule => rule.selector === '.universe-image-frame .universe-photo img'), 'object-fit')).toBe('cover');
});
