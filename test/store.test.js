import test from 'node:test';
import assert from 'node:assert/strict';
import { listProducts, purchasableItem, sanitizeCart, setQuantity, cartTotal } from '../public/src/store.js';
import { lowStock } from '../public/src/copy.js';

test('catalog searches translated names and sorts without changing its default order', () => {
  const base = { category: 'decor', query: '', sort: 'default', language: 'uk' };
  assert.deepEqual(listProducts(base).map(item => item.id), ['warmth', 'keepsake']);
  assert.deepEqual(listProducts({ ...base, sort: 'low' }).map(item => item.id), ['keepsake', 'warmth']);
  assert.deepEqual(listProducts(base).map(item => item.id), ['warmth', 'keepsake']);
  assert.deepEqual(listProducts({ ...base, category: '', query: '  CALM ', language: 'en' }).map(item => item.id), ['calm']);
});

test('variant quantities and prices remain independent in the cart', () => {
  assert.equal(purchasableItem('hope'), null);
  const first = setQuantity([], 'hope', 'sand', 3);
  const cart = setQuantity(first, 'hope', 'ivory', 2);
  assert.deepEqual(cart.map(item => item.quantity), [1, 2]);
  assert.equal(cartTotal(cart), 1380);
  assert.deepEqual(setQuantity(cart, 'hope', 'stone', 1), cart);
  assert.deepEqual(setQuantity(cart, 'hope', 'sand', 0), [cart[1]]);
});

test('persisted demo carts discard unknown, invalid and unavailable lines', () => {
  assert.deepEqual(sanitizeCart([
    { productId: 'missing', quantity: 1 },
    { productId: 'hope', variantId: 'ivory', quantity: '3' },
    { productId: 'keepsake', quantity: 2 },
    { productId: 'warmth', quantity: 500 },
    null,
  ]), [{ productId: 'warmth', variantId: '', quantity: 5 }]);
});

test('made to order is available without a stock warning; sold out cannot enter the cart', () => {
  assert.equal(purchasableItem('studio-piece').limit, 99);
  assert.equal(lowStock('en', purchasableItem('studio-piece').limit), '');
  assert.deepEqual(setQuantity([], 'keepsake', '', 1), []);
  assert.equal(lowStock('uk', 1), 'Залишилась 1 шт.');
  assert.equal(lowStock('en', 3), 'Only 3 left');
});
