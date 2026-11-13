import { products } from './catalog.js';

export const findProduct = id => products.find(product => product.id === id);

export function listProducts({ category, query, sort, language }) {
  const needle = query.trim().toLocaleLowerCase(language);
  const visible = products.filter(product =>
    (!category || product.category === category) &&
    product.name[language].toLocaleLowerCase(language).includes(needle)
  );
  if (sort === 'low') visible.sort((a, b) => a.price - b.price);
  if (sort === 'high') visible.sort((a, b) => b.price - a.price);
  return visible;
}

export function purchasableItem(productId, variantId = '') {
  const product = findProduct(productId);
  if (!product) return null;
  const variant = product.variants?.find(option => option.id === variantId);
  if (product.variants ? !variant : variantId !== '') return null;
  return {
    product,
    variant,
    price: variant?.price ?? product.price,
    limit: (variant ? variant.stock : product.stock) ?? 99,
  };
}

export function setQuantity(cart, productId, variantId, quantity) {
  const item = purchasableItem(productId, variantId);
  if (!item || !Number.isSafeInteger(quantity)) return cart;
  const next = cart.filter(line => line.productId !== productId || line.variantId !== variantId);
  const safeQuantity = Math.max(0, Math.min(item.limit, quantity));
  if (safeQuantity > 0) next.push({ productId, variantId, quantity: safeQuantity });
  return next;
}

export function sanitizeCart(value) {
  if (!Array.isArray(value)) return [];
  return value.reduce((cart, line) => line && typeof line === 'object'
    ? setQuantity(cart, line.productId, line.variantId ?? '', line.quantity)
    : cart, []);
}

export function cartTotal(cart) {
  return cart.reduce((total, { productId, variantId, quantity }) =>
    total + (purchasableItem(productId, variantId)?.price ?? 0) * quantity, 0);
}
