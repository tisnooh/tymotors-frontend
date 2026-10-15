import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import Customize from './Customize';
import { Brands, Compatibility, Products } from '@/lib/api';
import { readVehicleSelection, saveVehicleSelection } from '@/lib/vehicleSelection';
import { REVIEWED_VEHICLES } from './customize/vehicleViews';

jest.mock('@/lib/api', () => ({ Brands: { list: jest.fn() }, Compatibility: { list: jest.fn() }, Products: { list: jest.fn(), checkCompatibility: jest.fn() } }));
jest.mock('@/contexts/AppContext', () => ({ useApp: () => ({ addToCart: jest.fn() }) }));
jest.mock('react-router-dom', () => ({ Link: ({ to, state, ...props }) => <a href={to} data-project-request={Boolean(state)} {...props} /> }), { virtual: true });
jest.mock('react-i18next', () => ({ useTranslation: () => ({ i18n: { language: 'fr' }, t: (key, options = {}) => {
  const value = key.split('.').reduce((item, part) => item?.[part], require('@/lib/locales/fr.json')) || key;
  return value.replace(/{{(\w+)}}/g, (_, field) => String(options[field] ?? ''));
} }) }));
jest.mock('@/components/shared/Reveal', () => ({ Reveal: ({ children }) => children }));
jest.mock('./customize/ConfiguratorSelect', () => ({ ConfiguratorSelect: ({ value, onValueChange, placeholder, options, disabled, testId }) => <select data-testid={testId} value={value} disabled={disabled} onChange={event => onValueChange(event.target.value)}><option value="">{placeholder}</option>{options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select> }));
const vehicleModels = [{ name: 'Classe A', generations: ['W177', 'W176'], generation_records: ['W177', 'W176'].map(name => ({ name, stage_image_url: `/${name}.jpg`, hotspots: [], body_types: ['Berline'], trims: ['AMG Line'] })) }];
let root, host;
beforeEach(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  localStorage.clear(); host = document.createElement('div'); root = createRoot(host);
  Brands.list.mockResolvedValue([{ slug: 'mercedes-benz', name: 'Mercedes-Benz' }]);
  Compatibility.list.mockResolvedValue(vehicleModels);
  Products.list.mockResolvedValue({ items: [{ id: 'part', slug: 'part', name: 'Pièce', images: [], price: 99, status: 'draft' }], total: 1 });
  Products.checkCompatibility.mockResolvedValue({ status: 'unknown' });
});
afterEach(() => { act(() => root.unmount()); jest.clearAllMocks(); });
async function change(selector, value) {
  const input = host.querySelector(selector);
  await act(async () => {
    Object.getOwnPropertyDescriptor(input.tagName === 'SELECT' ? HTMLSelectElement.prototype : HTMLInputElement.prototype, 'value').set.call(input, value);
    input.dispatchEvent(new Event(input.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true }));
  });
}

test('vehicle selection opens equipment without hotspots and persists precise details', async () => {
  await act(async () => root.render(<Customize />));
  expect(host.querySelector('[data-testid="customize-project"]')).toBeNull();
  await change('[data-testid="compatibility-brand-select"]', 'mercedes-benz');
  await change('[data-testid="compatibility-model-select"]', 'Classe A');
  await change('[data-testid="compatibility-generation-select"]', 'W177');
  expect(host.querySelector('[data-testid="customize-project"]')).not.toBeNull();
  expect(host.querySelector('[data-testid="customize-hotspot"]')).toBeNull();
  expect(host.textContent).toContain('Illustration IA');
  await change('[data-testid="customize-year"]', '2020');
  await change('[data-testid="customize-trim"]', 'AMG Line');
  expect(readVehicleSelection()).toMatchObject({ brand: 'mercedes-benz', model: 'Classe A', generation: 'W177', year: '2020', trim: 'AMG Line' });
  expect(Products.list.mock.calls.at(-1)[0]).toMatchObject({ brand: 'mercedes-benz', model: 'Classe A', chassis: 'W177', year: 2020 });
  await act(async () => host.querySelector('.customize-select-part').click());
  expect(host.querySelector('.customize-summary li')).not.toBeNull();
  await change('[data-testid="compatibility-generation-select"]', 'W176');
  expect(host.querySelector('.customize-summary li')).toBeNull();
  expect(readVehicleSelection()).toMatchObject({ generation: 'W176', year: '', trim: '' });
});

test('saved generation and year restore without substituting another vehicle', async () => {
  saveVehicleSelection({ brand: 'mercedes-benz', model: 'Classe A', generation: 'W177', year: '2021', has_camera: false, has_parking_sensors: true });
  await act(async () => root.render(<Customize />));
  expect(host.querySelector('[data-testid="customize-year"]').value).toBe('2021');
  expect(host.querySelector('img[src="/images/customize/w177/exterior-v1.webp"]')).not.toBeNull();
  expect(readVehicleSelection()).toMatchObject({ has_camera: false, has_parking_sensors: true });
  expect(host.querySelector('[data-testid="customize-project"]')).not.toBeNull();
});

test('stage tabs and catalogue filters change the same W177 view without losing selected parts', async () => {
  saveVehicleSelection({ brand: 'mercedes-benz', model: 'Classe A', generation: 'W177', year: '2020' });
  await act(async () => root.render(<Customize />));
  const stage = () => host.querySelector('[data-testid="customize-stage"]');
  await act(async () => stage().querySelectorAll('.customize-view-controls button')[1].click());
  expect(stage().querySelector('img').getAttribute('src')).toBe('/images/customize/w177/interior-v2.webp');
  expect(stage().querySelector('img').className).toContain('object-contain');
  expect(Products.list.mock.calls.at(-1)[0].category).toBe('interior');
  expect(host.querySelectorAll('.customize-filters button')[2].getAttribute('aria-pressed')).toBe('true');
  await act(async () => host.querySelector('.customize-select-part').click());
  await act(async () => host.querySelectorAll('.customize-filters button')[3].click());
  expect(stage().querySelector('img').getAttribute('src')).toBe('/images/customize/w177/technology-v1.webp');
  expect(stage().querySelectorAll('.customize-view-controls button')[2].getAttribute('aria-pressed')).toBe('true');
  expect(Products.list.mock.calls.at(-1)[0].category).toBe('technology');
  expect(host.querySelectorAll('.customize-summary li')).toHaveLength(1);
  await act(async () => stage().querySelectorAll('.customize-view-controls button')[0].click());
  expect(Products.list.mock.calls.at(-1)[0].category).toBe('performance');
  await change('[data-testid="compatibility-generation-select"]', 'W176');
  expect(stage().querySelector('img').getAttribute('src')).toBe('/W176.jpg');
  await act(async () => stage().querySelectorAll('.customize-view-controls button')[1].click());
  expect(stage().querySelector('img').getAttribute('src')).toBe('/W176.jpg');
  expect(stage().textContent).toContain('vue dédiée');
  expect(host.querySelector('.customize-summary li')).toBeNull();
});

test('a known later year or different trim removes the pre-facelift illustration', async () => {
  saveVehicleSelection({ brand: 'mercedes-benz', model: 'Classe A', generation: 'W177', year: '2020' });
  await act(async () => root.render(<Customize />));
  await change('[data-testid="customize-year"]', '2024');
  expect(host.querySelector('[data-testid="customize-stage"] img').getAttribute('src')).toBe('/W177.jpg');
  await change('[data-testid="customize-year"]', '2020');
  await change('[data-testid="customize-trim"]', 'Progressive');
  expect(host.querySelector('[data-testid="customize-stage"] img').getAttribute('src')).toBe('/W177.jpg');
});

test.each(REVIEWED_VEHICLES)('$vehicle switches its own three views and real catalogue query together', async entry => {
  Brands.list.mockResolvedValue([{ slug: entry.brand, name: entry.brand }]);
  Compatibility.list.mockResolvedValue([{ name: entry.model, generations: [entry.generation], generation_records: [{ name: entry.generation, stage_image_url: '/original-generation.jpg', hotspots: [] }] }]);
  saveVehicleSelection({ brand: entry.brand, model: entry.model, generation: entry.generation });
  await act(async () => root.render(<Customize />));
  const stage = () => host.querySelector('[data-testid="customize-stage"]');
  expect(stage().querySelector('img').getAttribute('src')).toBe(`/images/customize/${entry.id}/exterior-v1.webp`);
  for (const [index, category] of ['performance', 'interior', 'technology'].entries()) {
    await act(async () => stage().querySelectorAll('.customize-view-controls button')[index].click());
    expect(stage().querySelector('img').getAttribute('src')).toBe(`/images/customize/${entry.id}/${category === 'performance' ? 'exterior' : category}-v1.webp`);
    expect(stage().querySelector('img').getAttribute('alt')).toContain(entry.vehicle);
    expect(Products.list.mock.calls.at(-1)[0]).toMatchObject({ brand: entry.brand, model: entry.model, chassis: entry.generation, category });
    expect(stage().querySelectorAll('.customize-view-controls button')[index].getAttribute('aria-pressed')).toBe('true');
  }
  await change('[data-testid="customize-year"]', String(entry.years[1] + 1));
  expect(stage().querySelector('img').getAttribute('src')).toBe('/original-generation.jpg');
  expect(stage().textContent).toContain('vue dédiée');
});

test('a saved unsupported model cannot render reviewed images without a real generation record', async () => {
  saveVehicleSelection({ brand: 'bmw', model: 'Série 3', generation: 'G20' });
  Compatibility.list.mockResolvedValue([]);
  await act(async () => root.render(<Customize />));
  expect(host.querySelector('.customize-view-note')).toBeNull();
  expect(host.querySelector('[data-testid="customize-project"]')).toBeNull();
});
