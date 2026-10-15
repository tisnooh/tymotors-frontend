import fs from 'node:fs';
import path from 'node:path';
import { catalogueCategory, vehicleViewSet, VIEW_CATEGORIES } from './vehicleViews';

const vehicle = { brand: 'mercedes-benz', model: 'Classe A', generation: 'W177', year: '2020', body_type: 'Compacte', trim: 'AMG Line' };

test('only reviewed W177 category assets are linked and delivered as real WebP files', () => {
  const views = vehicleViewSet(vehicle);
  for (const category of VIEW_CATEGORIES) {
    expect(views[category].src).toContain('/images/customize/w177/');
    const bytes = fs.readFileSync(path.join(process.cwd(), 'public', views[category].src));
    expect(bytes.subarray(0, 4).toString()).toBe('RIFF');
    expect(bytes.subarray(8, 12).toString()).toBe('WEBP');
    expect(bytes.length).toBeLessThan(500000);
  }
  expect(vehicleViewSet({ ...vehicle, year: '', body_type: '', trim: '' })).not.toBeNull();
});

test.each([
  { brand: 'bmw' }, { model: 'Classe C' }, { generation: 'W176' },
  { year: '2023' }, { year: '2017' }, { year: 'invalid' }, { year: '2020.5' },
  { body_type: 'Berline' }, { body_type: 'Coupé' }, { trim: 'Progressive' }, { trim: 'A45 AMG' },
])('never borrows W177 imagery for a mismatching vehicle: %j', change => {
  expect(vehicleViewSet({ ...vehicle, ...change })).toBeNull();
});

test('hotspot aliases map to catalogue categories and unsupported ones remain all', () => {
  expect(catalogueCategory('exterior')).toBe('performance');
  expect(catalogueCategory('multimedia-technology')).toBe('technology');
  expect(catalogueCategory('interior')).toBe('interior');
  expect(catalogueCategory('unreviewed-category')).toBe('all');
});
