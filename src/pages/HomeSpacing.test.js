/** @jest-environment node */
const fs = require('fs');
const path = require('path');
const postcss = require('postcss');

const source = filename => fs.readFileSync(path.join(__dirname, filename), 'utf8');
const stylesheet = postcss.parse(source('Home.css'));
const rules = selector => {
  const result = [];
  stylesheet.walkRules(selector, rule => result.push(rule));
  return result;
};
const value = (rule, prop) => rule.nodes.find(node => node.prop === prop)?.value;

test('home owns a responsive shared spacing scale without parent gaps', () => {
  const scale = rules('.home-page');
  expect(scale.map(rule => value(rule, '--home-section-space'))).toEqual(['2rem', '3rem', '4rem']);
  expect(scale.map(rule => value(rule, '--home-heading-space'))).toEqual(['1.5rem', '2rem', '2.5rem']);
  expect(scale.slice(1).map(rule => rule.parent.params)).toEqual(['(min-width: 640px)', '(min-width: 1024px)']);
  expect(scale.every(rule => !rule.nodes.some(node => node.prop === 'gap'))).toBe(true);
  expect(source('Home.jsx')).toContain("import './Home.css'");
  expect(source('Home.jsx')).toContain('className="home-page"');
});

test('section rhythm excludes the Hero and retains real heights instead of 900px placeholders', () => {
  const [section] = rules('.home-page > section:not([data-testid="hero-section"])');
  expect(value(section, 'padding-block')).toBe('var(--home-section-space)');
  expect(value(section, 'content-visibility')).toBe('visible');
  expect(value(section, 'contain-intrinsic-size')).toBe('none');
  expect(source('../App.css')).not.toContain('contain-intrinsic-size: auto 900px');
});

test('all four commercial headers share the title-to-content spacing', () => {
  for (const filename of ['BrandsSection', 'CategoriesSection', 'FeaturedProducts', 'BeforeAfterSlider']) {
    const component = source(`../components/home/${filename}.jsx`);
    expect(component).toContain('<Reveal className="home-section-heading">');
    expect(component).not.toMatch(/<Reveal className="mb-(10|12)">/);
  }
  expect(value(rules('.home-page .home-section-heading')[0], 'margin-bottom')).toBe('var(--home-heading-space)');
});

test('mobile storytelling spacing stays outside the full-height GSAP viewport and spacer', () => {
  // Include the section element so this exception can override the base rule.
  const [section] = rules('.home-page > section.storytelling-mobile-layout');
  expect(section.parent.params).toBe('(max-width: 767px)');
  expect(value(section, 'padding-top')).toBe('0');
  expect(value(section, 'padding-bottom')).toBe('var(--home-section-space)');
  const [intro] = rules('.home-page .storytelling-mobile-layout .storytelling-header');
  expect(value(intro, 'padding-top')).toBe('var(--home-section-space)');
  expect(value(intro, 'padding-bottom')).toBe('var(--home-heading-space)');
  stylesheet.walkRules(rule => expect(rule.selector).not.toMatch(/pin-spacer|storytelling-viewport|storytelling-card/));
  stylesheet.walkDecls(declaration => expect(declaration.prop).not.toMatch(/^(height|min-height|max-height|position|transform)$/));
});
