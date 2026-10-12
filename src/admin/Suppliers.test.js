import { supplierMessage } from './Suppliers';
jest.mock('@/lib/api', () => ({ api: {} }));
test('supplier templates include linked references and no authorization to buy', () => {
  const supplier = { name: 'Supplier', url: 'https://www.alibaba.com/fixture', product_ids: ['1'] };
  const products = [{ id: '1', name: 'Part', sku: 'SKU' }, { id: '2', name: 'Other', sku: 'OTHER' }];
  expect(supplierMessage(supplier, products)).toContain('Part / SKU');
  expect(supplierMessage(supplier, products)).not.toContain('Other');
  expect(supplierMessage(supplier, products)).toContain('No purchase is authorized');
  expect(supplierMessage(supplier, products, 'agent')).toContain('Do not dispatch before our written approval');
});
