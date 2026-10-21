import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import LoadedImage from './LoadedImage';
global.IS_REACT_ACT_ENVIRONMENT = true;
let root, host;
beforeEach(() => { host = document.createElement('div'); root = createRoot(host); });
afterEach(() => { act(() => root.unmount()); });
test('loading, failure, retry and changing selection are independent', () => {
  act(() => root.render(<LoadedImage src="/first.jpg" alt="First"/>));
  expect(host.textContent).toContain('Chargement');
  act(() => host.querySelector('img').dispatchEvent(new Event('error')));
  expect(host.textContent).toContain('ne peut pas être chargée');
  act(() => host.querySelector('button').click());
  expect(host.textContent).toContain('Chargement');
  act(() => host.querySelector('img').dispatchEvent(new Event('load')));
  expect(host.textContent).not.toContain('Chargement');
  act(() => root.render(<LoadedImage src="/next.jpg" alt="Next"/>));
  expect(host.querySelector('img').getAttribute('src')).toBe('/next.jpg');
  expect(host.textContent).toContain('Chargement');
});

test.each([[800, 800, false], [600, 900, true], [1200, 800, true]])('optional edge fill handles %sx%s without replacing the actual image', (width, height, backdrop) => {
  act(() => root.render(<LoadedImage src="/real.jpg" alt="Pièce" imageClassName="object-contain" fillBackground/>));
  expect(host.querySelector('[data-testid="photo-backdrop"]')).toBeNull();
  const photo = host.querySelector('img');
  Object.defineProperties(photo, { naturalWidth: { value: width }, naturalHeight: { value: height } });
  act(() => photo.dispatchEvent(new Event('load')));
  expect(Boolean(host.querySelector('[data-testid="photo-backdrop"]'))).toBe(backdrop);
  expect(host.querySelectorAll('img')).toHaveLength(1);
  expect(photo.getAttribute('src')).toBe('/real.jpg');
  expect(photo.className).toContain('relative object-contain');
  act(() => root.render(<LoadedImage src="/next.jpg" alt="Autre pièce" fillBackground/>));
  expect(host.querySelector('[data-testid="photo-backdrop"]')).toBeNull();
});

test('edge fill remains opt-in and an image failure never leaves an old backdrop', () => {
  act(() => root.render(<LoadedImage src="/real.jpg" alt="Pièce"/>));
  const photo = host.querySelector('img');
  Object.defineProperties(photo, { naturalWidth: { value: 600 }, naturalHeight: { value: 900 } });
  act(() => photo.dispatchEvent(new Event('load')));
  expect(host.querySelector('[data-testid="photo-backdrop"]')).toBeNull();
  act(() => root.render(<LoadedImage src="/real.jpg" alt="Pièce" fillBackground/>));
  expect(host.querySelector('[data-testid="photo-backdrop"]')).not.toBeNull();
  act(() => photo.dispatchEvent(new Event('error')));
  expect(host.querySelector('[data-testid="photo-backdrop"]')).toBeNull();
  expect(host.textContent).toContain('ne peut pas être chargée');
});
