import { categories, products } from './catalog.js';
import { messages, lowStock } from './copy.js';
import { cartTotal, findProduct, listProducts, purchasableItem, sanitizeCart, setQuantity } from './store.js';
import { connectCarousel, revealActivePhoto } from './carousel.js';

const header = document.querySelector('.site-header');
const main = document.querySelector('main');
const footer = document.querySelector('.site-footer');
const announcement = document.querySelector('.announcement');
const storageKey = 'kvitka-demo-cart';
const saved = key => {
  try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
};
const save = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* Storage is optional. */ }
};
let language = saved('kvitka-demo-language') === 'en' ? 'en' : 'uk';
let cart = sanitizeCart(saved(storageKey));
let route = 'home';
let product = null;
let variant = '';
let activePhoto = 0;
let filters = { category: '', query: '', sort: 'default' };
let disposeCarousels = [];
let announcementTimer;
const t = key => messages(language)[key];
const local = value => value[language];
const money = value => new Intl.NumberFormat(language === 'uk' ? 'uk-UA' : 'en', {
  style: 'currency', currency: 'UAH', maximumFractionDigits: 0, currencyDisplay: 'narrowSymbol',
}).format(value);
const pageLink = (page, label, className = '') => `<a class="${className}" href="#${page}">${label}</a>`;
const arrow = direction => `<svg aria-hidden="true" viewBox="0 0 24 24"><path d="${direction === 'previous' ? 'm15 5-7 7 7 7' : 'm9 5 7 7-7 7'}"/></svg>`;
const image = (url, label = '', eager = false) => `<img src="${url}" alt="${label}" decoding="async"${eager ? '' : ' loading="lazy"'}>`;
const carouselButtons = () => ['previous', 'next'].map(direction =>
  `<button class="carousel-button ${direction}" type="button" data-${direction} aria-label="${t(direction)}" disabled>${arrow(direction)}</button>`
).join('');
const selectOption = (value, label, selected) => `<option value="${value}"${selected === value ? ' selected' : ''}>${label}</option>`;

// Template values come from the bundled catalog and translation dictionaries.
// Search and quantity input are handled through DOM properties.
function renderHeader() {
  document.documentElement.lang = language;
  document.querySelector('[data-skip]').textContent = t('skip');
  const nav = (page, label) => `<a href="#${page}"${route === page ? ' aria-current="page"' : ''}>${label}</a>`;
  header.innerHTML = `<div class="wrap header-inner">
    <a class="brand" href="#home"><img src="./assets/mark.svg" alt="" width="38" height="51">Kvitka Shop</a>
    <nav>${nav('home', t('home'))}${nav('shop', t('shop'))}</nav>
    <div class="header-actions"><div class="languages" role="group" aria-label="${t('language')}">
      <button type="button" data-language="uk" aria-pressed="${language === 'uk'}">UA</button>
      <button type="button" data-language="en" aria-pressed="${language === 'en'}">EN</button>
    </div><a class="cart-link" href="#cart" data-cart-count${route === 'cart' ? ' aria-current="page"' : ''}></a></div>
  </div>`;
  footer.innerHTML = `<div class="wrap footer-inner"><a class="brand" href="#home">Kvitka Shop</a><p>${t('demo')}</p></div>`;
  renderCartCount();
}

function renderCartCount() {
  const count = cart.reduce((sum, line) => sum + line.quantity, 0);
  header.querySelector('[data-cart-count]').textContent = `${t('cart')} (${count})`;
}

function productCard(item, featured = false) {
  const variants = item.variants?.length ?? 0;
  const heading = featured ? 'h3' : 'h2';
  return `<a class="product-card${featured ? ' featured-card' : ''}" href="#product/${item.id}">
    ${image(item.images[0])}<${heading}>${local(item.name)}</${heading}>
    <div class="card-footer"><span>${money(item.price)}</span>${!featured && variants ? `<span class="variant-count">+${variants} ${t('colors').toLocaleLowerCase(language)}</span>` : ''}</div>
  </a>`;
}

function renderHome() {
  const cards = categories.map(category => `<a class="category-card" href="#shop/${category.id}">
    ${image(category.image)}<span class="category-copy"><strong>${local(category.name)}</strong><small>${local(category.description)}</small></span><span class="category-arrow" aria-hidden="true">→</span>
  </a>`).join('');
  return `<section class="hero" aria-labelledby="hero-title">
    <img class="hero-image" src="./assets/hero.webp" alt="" fetchpriority="high" width="1916" height="821">
    <div class="wrap"><div class="hero-copy"><p class="eyebrow">${t('handmade')}</p>
    <h1 id="hero-title">${t('hero')}</h1><p>${t('intro')}</p>${pageLink('shop', `${t('toShop')} <span aria-hidden="true">→</span>`, 'button')}</div></div>
  </section>
  <div class="wrap home-content">
    <section aria-labelledby="category-title"><h2 id="category-title">${t('categories')}</h2>
      <div class="carousel category-carousel" data-carousel="categories"><div class="category-strip" data-strip>${cards}</div>${carouselButtons()}</div>
    </section>
    <section aria-labelledby="featured-title"><div class="section-heading"><h2 id="featured-title">${t('featured')}</h2>
      ${pageLink('shop', `${t('viewAll')} <span aria-hidden="true">→</span>`, 'text-link')}</div>
      <div class="featured-grid">${products.filter(item => item.featured).slice(0, 4).map(item => productCard(item, true)).join('')}</div>
    </section>
    <section class="studio">${image('./assets/studio.webp')}<div><p class="eyebrow">${t('handmade')}</p><h2>${t('studio')}</h2><p>${t('studioCopy')}</p></div></section>
  </div>`;
}

function renderShop() {
  const choices = [{ id: '', name: t('all') }, ...categories.map(category => ({ id: category.id, name: local(category.name) }))];
  return `<section class="wrap page"><h1>${t('shop')}</h1>
    <div class="shop-tools">
      <label class="search-field">${t('search')}<input type="search" data-search></label>
      <label class="mobile-category">${t('category')}<select data-category>${choices.map(choice => selectOption(choice.id, choice.name, filters.category)).join('')}</select></label>
      <label>${t('sort')}<select data-sort>${['default', 'low', 'high'].map(option => selectOption(option, t(option), filters.sort)).join('')}</select></label>
    </div>
    <div class="category-filters" role="group" aria-label="${t('categories')}">
      ${choices.map(choice => `<button type="button" class="chip" data-filter="${choice.id}" aria-pressed="${choice.id === filters.category}">${choice.name}</button>`).join('')}
    </div>
    <div class="shop-grid" data-results></div>
  </section>`;
}

function renderResults() {
  const items = listProducts({ ...filters, language });
  main.querySelector('[data-results]').innerHTML = items.length
    ? items.map(item => productCard(item)).join('') : `<p class="empty-message">${t('emptySearch')}</p>`;
}

function renderProduct() {
  return `<section class="wrap page">
    ${pageLink('shop', `<span aria-hidden="true">←</span> ${t('back')}`, 'text-link product-back')}
    <div class="product-layout">
      <div class="product-gallery">
        <div class="main-photo">${image(product.images[activePhoto], local(product.name), true)}</div>
        ${product.images.length > 1 ? `<div class="carousel gallery-carousel" data-carousel="gallery"><div class="thumbnails" data-strip role="group" aria-label="${t('photos')}">
          ${product.images.map((url, index) => `<button class="thumb" type="button" data-photo="${index}" aria-label="${t('photo')} ${index + 1}" aria-pressed="${index === activePhoto}">${image(url)}</button>`).join('')}
          </div>${carouselButtons()}</div>` : ''}
      </div>
      <div class="product-info"><h1>${local(product.name)}</h1><p class="product-price" data-price></p>
        <p>${local(product.description)}</p>
        ${product.variants ? `<fieldset class="variants"><legend>${t('color')}</legend>${product.variants.map(option =>
          `<label><input type="radio" name="variant" value="${option.id}"${option.id === variant ? ' checked' : ''}><span class="swatch" style="--swatch:${option.swatch}"></span>${local(option.name)}</label>`
        ).join('')}</fieldset>` : ''}
        <label class="quantity-label">${t('quantity')}<input data-quantity type="number" min="1" step="1" value="1"></label>
        <p class="stock" data-stock hidden></p><button type="button" class="button" data-add>${t('add')}</button>
      </div>
    </div>
  </section>`;
}

function updateProduct() {
  const item = purchasableItem(product.id, variant);
  main.querySelector('[data-price]').textContent = money(item.price);
  const quantity = main.querySelector('[data-quantity]');
  quantity.max = item.limit || 1;
  quantity.value = Math.min(item.limit || 1, Number(quantity.value) || 1);
  quantity.disabled = item.limit === 0;
  main.querySelector('[data-add]').disabled = item.limit === 0;
  const stock = main.querySelector('[data-stock]');
  stock.textContent = item.limit === 0 ? t('unavailable') : product.madeToOrder ? t('madeToOrder') : lowStock(language, item.limit);
  stock.hidden = !stock.textContent;
}

function selectPhoto(index) {
  if (!product.images[index]) return;
  activePhoto = index;
  main.querySelector('.main-photo img').src = product.images[index];
  main.querySelectorAll('[data-photo]').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.photo) === index)));
  const strip = main.querySelector('[data-strip]');
  if (strip) revealActivePhoto(strip);
}

function renderCart(checkout = false) {
  if (!cart.length) return `<section class="wrap page"><h1>${t('cart')}</h1><p>${t('emptyCart')}</p>${pageLink('shop', t('toShop'), 'button')}</section>`;
  const lines = cart.map(({ productId, variantId, quantity }) => {
    const item = purchasableItem(productId, variantId);
    const title = local(item.product.name);
    return `<li class="cart-line" data-line data-product="${productId}" data-variant="${variantId}">
      <div class="cart-image">${image(item.product.images[item.variant?.photo ?? 0])}</div>
      <div class="line-title">${pageLink(`product/${productId}`, title)}${item.variant ? `<small>${local(item.variant.name)}</small>` : ''}<small>${money(item.price)}</small></div>
      ${checkout ? `<span>× ${quantity}</span>` : `<input type="number" min="1" max="${item.limit}" value="${quantity}" aria-label="${t('quantity')}: ${title}" data-cart-quantity>
      <button type="button" class="chip" data-remove aria-label="${t('remove')}: ${title}">${t('remove')}</button>`}
    </li>`;
  }).join('');
  return `<section class="wrap page cart-page"><h1>${checkout ? t('checkout') : t('cart')}</h1>
    ${checkout ? `<p>${t('demo')} ${t('review')}</p>` : ''}
    <ul class="cart-list">${lines}</ul><p class="cart-total">${t('total')}: <strong>${money(cartTotal(cart))}</strong></p>
    ${checkout ? `<button type="button" class="button" data-confirm>${t('confirm')}</button> ${pageLink('cart', t('cart'), 'text-link')}` : pageLink('checkout', t('checkout'), 'button')}
  </section>`;
}

function render({ focus = false } = {}) {
  disposeCarousels.forEach(dispose => dispose());
  renderHeader();
  main.innerHTML = ({
    home: renderHome, shop: renderShop, product: renderProduct,
    cart: () => renderCart(), checkout: () => renderCart(true),
    complete: () => `<section class="wrap page"><h1>${t('success')}</h1><p>${t('successCopy')}</p>${pageLink('shop', t('toShop'), 'button')}</section>`,
    missing: () => `<section class="wrap page"><h1>${t('notFound')}</h1>${pageLink('shop', t('toShop'), 'button')}</section>`,
  })[route]();
  document.title = route === 'home' ? 'Kvitka Shop' : `${main.querySelector('h1').textContent} · Kvitka Shop`;
  if (route === 'shop') {
    main.querySelector('[data-search]').value = filters.query;
    renderResults();
  }
  if (route === 'product') updateProduct();
  disposeCarousels = [...main.querySelectorAll('[data-carousel]')].map(frame =>
    connectCarousel(frame, { autoplay: frame.dataset.carousel === 'categories' })
  );
  if (focus) main.focus({ preventScroll: true });
}

function navigate(focus) {
  const [page, id] = (location.hash.slice(1) || 'home').split('/');
  const known = ['home', 'shop', 'product', 'cart', 'checkout', 'complete'];
  route = known.includes(page) ? page : 'missing';
  if (route === 'shop' && id) filters.category = categories.some(category => category.id === id) ? id : '';
  if (route === 'product') {
    product = findProduct(id);
    if (!product) route = 'missing';
    else {
      variant = (product.variants?.find(option => option.stock > 0) ?? product.variants?.[0])?.id ?? '';
      activePhoto = product.variants?.find(option => option.id === variant)?.photo ?? 0;
    }
  }
  render({ focus });
  if (focus) scrollTo({ top: 0, behavior: 'instant' });
}

function updateCart(next) {
  cart = next;
  save(storageKey, cart);
  renderCartCount();
}

header.addEventListener('click', event => {
  const button = event.target.closest('[data-language]');
  if (!button || button.dataset.language === language) return;
  language = button.dataset.language;
  save('kvitka-demo-language', language);
  render();
  header.querySelector(`[data-language="${language}"]`).focus();
});

document.querySelector('[data-skip]').addEventListener('click', event => {
  event.preventDefault();
  main.focus();
});

main.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.hasAttribute('data-filter')) {
    filters.category = button.dataset.filter;
    main.querySelector('[data-category]').value = filters.category;
    main.querySelectorAll('[data-filter]').forEach(chip => chip.setAttribute('aria-pressed', String(chip === button)));
    renderResults();
  }
  if (button.hasAttribute('data-photo')) selectPhoto(Number(button.dataset.photo));
  if (button.hasAttribute('data-add')) {
    const quantity = main.querySelector('[data-quantity]');
    if (!quantity.reportValidity()) return;
    const current = cart.find(line => line.productId === product.id && line.variantId === variant)?.quantity ?? 0;
    const next = setQuantity(cart, product.id, variant, current + Number(quantity.value));
    const updated = next.find(line => line.productId === product.id && line.variantId === variant)?.quantity ?? 0;
    updateCart(next);
    announcement.textContent = updated > current ? t('added') : t('limit');
    clearTimeout(announcementTimer);
    announcementTimer = setTimeout(() => { announcement.textContent = ''; }, 3000);
  }
  if (button.hasAttribute('data-remove')) {
    const { product, variant } = button.closest('[data-line]').dataset;
    updateCart(setQuantity(cart, product, variant, 0));
    render({ focus: true });
  }
  if (button.hasAttribute('data-confirm') && cart.length) {
    updateCart([]);
    location.hash = 'complete';
  }
});

main.addEventListener('input', event => {
  if (event.target.matches('[data-search]')) {
    filters.query = event.target.value;
    renderResults();
  }
});

main.addEventListener('change', event => {
  const input = event.target;
  if (input.matches('[data-category]')) {
    filters.category = input.value;
    main.querySelectorAll('[data-filter]').forEach(chip => chip.setAttribute('aria-pressed', String(chip.dataset.filter === filters.category)));
    renderResults();
  }
  if (input.matches('[data-sort]')) {
    filters.sort = input.value;
    renderResults();
  }
  if (input.name === 'variant') {
    variant = input.value;
    selectPhoto(product.variants.find(option => option.id === variant).photo);
    updateProduct();
  }
  if (input.matches('[data-cart-quantity]')) {
    const { product, variant } = input.closest('[data-line]').dataset;
    const quantity = input.valueAsNumber;
    if (Number.isSafeInteger(quantity) && quantity > 0) updateCart(setQuantity(cart, product, variant, quantity));
    render({ focus: true });
  }
});

window.addEventListener('hashchange', () => navigate(true));
navigate(false);
