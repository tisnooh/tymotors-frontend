/* eslint-env node */
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { BeforeAfterSlider } from './BeforeAfterSlider';
import fr from '@/lib/locales/fr.json';
import en from '@/lib/locales/en.json';
import fs from 'fs';
import path from 'path';

jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key, values = {}) => {
  const text = key.split('.').reduce((value, part) => value?.[part], require('@/lib/locales/fr.json')) ?? key;
  return text.replace(/\{\{(\w+)\}\}/g, (_, name) => values[name] ?? '');
} }) }));
jest.mock('@/components/shared/Reveal', () => ({ Reveal: ({ children }) => children }));
let root, host;
beforeEach(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  host = document.createElement('div'); root = createRoot(host);
  act(() => root.render(<BeforeAfterSlider />));
});
afterEach(() => act(() => root.unmount()));
const images = () => [...host.querySelectorAll('img')];
const frame = () => host.querySelector('[data-testid="before-after-slider"]');
function loaded() { act(() => images().forEach(image => image.dispatchEvent(new Event('load')))); }
function key(value) {
  const event = new KeyboardEvent('keydown', { key: value, bubbles: true, cancelable: true });
  act(() => frame().dispatchEvent(event)); return event;
}
function pointer(type, clientX, button = 0) {
  const event = new MouseEvent(type, { clientX, button, bubbles: true });
  Object.defineProperty(event, 'pointerId', { value: 7 });
  act(() => frame().dispatchEvent(event));
}

test('uses a matched local responsive pair and identifies the simulation, never claiming a real client build', () => {
  const [after, before] = images();
  expect(before.src).toContain('/images/transformations/front-stock-v1-960.webp');
  expect(after.src).toContain('/images/transformations/front-tuned-v1-960.webp');
  expect(before.getAttribute('sizes')).toBe(after.getAttribute('sizes'));
  expect(before.getAttribute('width')).toBe(after.getAttribute('width'));
  expect(before.getAttribute('height')).toBe(after.getAttribute('height'));
  expect(before.srcset).toContain('480w'); expect(after.srcset).toContain('1672w');
  expect(before.alt).toContain('Simulation IA'); expect(after.alt).toContain('Simulation IA');
  expect(host.querySelector('[data-testid="before-after-disclaimer"]').textContent).toBe(fr.before_after.disclaimer);
  expect(fr.before_after.disclaimer).toBe('Simulation générée par IA — illustration, pas une réalisation client.');
  expect(en.before_after.disclaimer).toBe('AI-generated simulation — illustration, not a customer build.');
  expect(host.textContent).not.toContain('transformation TYMotors complète');
  expect(frame().className).toContain('aspect-[4/3] md:aspect-[16/9]');
  expect(frame().style.touchAction).toBe('pan-y pinch-zoom');
});

test('waits for both images before exposing a usable, named slider', () => {
  expect(frame().getAttribute('aria-busy')).toBe('true');
  expect(frame().getAttribute('role')).toBeNull();
  act(() => images()[0].dispatchEvent(new Event('load')));
  expect(frame().getAttribute('role')).toBeNull();
  loaded();
  expect(frame().getAttribute('role')).toBe('slider');
  expect(frame().tabIndex).toBe(0);
  expect(frame().getAttribute('aria-label')).toBe(fr.before_after.slider_label);
  expect(frame().getAttribute('aria-valuetext')).toBe('50 % avant, 50 % après');
  const ids = frame().getAttribute('aria-describedby').split(' ');
  expect(ids.every(id => host.querySelector(`[id="${id}"]`))).toBe(true);
});

test('keyboard comparison prevents page scrolling, supports endpoints and clamps values', () => {
  loaded();
  expect(key('ArrowRight').defaultPrevented).toBe(true);
  expect(frame().getAttribute('aria-valuenow')).toBe('55');
  key('ArrowLeft'); expect(frame().getAttribute('aria-valuenow')).toBe('50');
  key('Home'); key('ArrowLeft'); expect(frame().getAttribute('aria-valuenow')).toBe('0');
  key('End'); key('ArrowRight'); expect(frame().getAttribute('aria-valuenow')).toBe('100');
  expect(key('Tab').defaultPrevented).toBe(false);
});

test('pointer capture makes touch/mouse dragging local, clamped, and cancels cleanly', () => {
  loaded();
  const slider = frame();
  slider.getBoundingClientRect = () => ({ left: 100, width: 400 });
  slider.setPointerCapture = jest.fn(); slider.releasePointerCapture = jest.fn(); slider.hasPointerCapture = () => true;
  pointer('pointerdown', 200, 2);
  expect(slider.setPointerCapture).not.toHaveBeenCalled();
  pointer('pointerdown', 200);
  expect(slider.setPointerCapture).toHaveBeenCalledWith(7);
  expect(slider.getAttribute('aria-valuenow')).toBe('25');
  pointer('pointermove', 800); expect(slider.getAttribute('aria-valuenow')).toBe('100');
  pointer('pointermove', 0); expect(slider.getAttribute('aria-valuenow')).toBe('0');
  pointer('pointercancel', 0); expect(slider.releasePointerCapture).toHaveBeenCalledWith(7);
  pointer('pointermove', 300); expect(slider.getAttribute('aria-valuenow')).toBe('0');
});

test('image failure is explicit and retry resets both images without a broken comparison', () => {
  act(() => images()[0].dispatchEvent(new Event('error')));
  expect(host.querySelector('[role="alert"]').textContent).toBe(fr.before_after.error);
  expect(frame().getAttribute('role')).toBeNull();
  const previous = images()[0];
  act(() => host.querySelector('[data-testid="before-after-retry-button"]').click());
  expect(host.querySelector('[role="alert"]')).toBeNull();
  expect(images()[0]).not.toBe(previous);
  expect(frame().getAttribute('aria-busy')).toBe('true');
  loaded(); expect(frame().getAttribute('role')).toBe('slider');
});

test('all six deployable WebP assets exist, are small and have matching FR/EN copy keys', () => {
  for (const variant of ['stock', 'tuned']) for (const width of [480, 960, 1672]) {
    const bytes = fs.readFileSync(path.resolve(__dirname, `../../../public/images/transformations/front-${variant}-v1-${width}.webp`));
    expect(bytes.toString('ascii', 0, 4)).toBe('RIFF'); expect(bytes.toString('ascii', 8, 12)).toBe('WEBP');
    expect(bytes.length).toBeLessThan(125000);
  }
  expect(Object.keys(fr.before_after)).toEqual(Object.keys(en.before_after));
});
