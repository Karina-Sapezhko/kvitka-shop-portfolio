const text = {
  uk: {
    skip: 'До вмісту', home: 'Головна', shop: 'Магазин', cart: 'Кошик', language: 'Мова',
    handmade: 'Ручна робота', hero: 'Маленькі речі. Велике тепло',
    intro: 'Створюємо речі вручну, щоб вони додавали дому затишку, ставали особливими подарунками й дарували теплі емоції.',
    toShop: 'Перейти до магазину', categories: 'Категорії', featured: 'Популярні товари',
    viewAll: 'Дивитися всі товари', studio: 'Створено з турботою',
    studioCopy: 'М’які відтінки, живі фактури й увага до дрібниць. Вироби з гіпсу для теплих моментів і затишних домівок.',
    search: 'Пошук', category: 'Категорія', all: 'Усе', sort: 'Сортування', default: 'За замовчуванням',
    low: 'Від дешевих до дорогих', high: 'Від дорогих до дешевих', emptySearch: 'Товарів не знайдено.',
    back: 'До магазину', photos: 'Фотографії товару', photo: 'Фото', previous: 'Прокрутити ліворуч', next: 'Прокрутити праворуч',
    colors: 'Кольори', color: 'Колір', quantity: 'Кількість', add: 'Додати в кошик', added: 'Додано до кошика',
    unavailable: 'Немає в наявності', madeToOrder: 'Під замовлення', limit: 'У кошику вже максимальна кількість.',
    emptyCart: 'Ваш кошик порожній.', remove: 'Видалити', total: 'Разом', checkout: 'Демо-оформлення',
    demo: 'Демонстраційна вітрина. Замовлення не надсилаються, оплата не проводиться.',
    review: 'Перевірте товари й підсумок. Особисті дані не потрібні.', confirm: 'Підтвердити демо-замовлення',
    success: 'Демо-замовлення оформлено', successCopy: 'Жодних даних не надіслано і кошти не списано.',
    notFound: 'Сторінку не знайдено',
  },
  en: {
    skip: 'Skip to content', home: 'Home', shop: 'Shop', cart: 'Cart', language: 'Language',
    handmade: 'Handmade', hero: 'Small things. Big warmth',
    intro: 'We make pieces by hand to bring comfort to your home and make thoughtful gifts for the people you love.',
    toShop: 'Visit the shop', categories: 'Categories', featured: 'Featured products',
    viewAll: 'View all products', studio: 'Made with care',
    studioCopy: 'Soft shades, natural textures, and care in the smallest details. Plaster pieces for warm moments and cozy homes.',
    search: 'Search', category: 'Category', all: 'All', sort: 'Sort by', default: 'Default order',
    low: 'Price: low to high', high: 'Price: high to low', emptySearch: 'No products found.',
    back: 'Back to shop', photos: 'Product photos', photo: 'Photo', previous: 'Scroll left', next: 'Scroll right',
    colors: 'Colors', color: 'Color', quantity: 'Quantity', add: 'Add to cart', added: 'Added to cart',
    unavailable: 'Out of stock', madeToOrder: 'Made to order', limit: 'The maximum quantity is already in your cart.',
    emptyCart: 'Your cart is empty.', remove: 'Remove', total: 'Total', checkout: 'Demo checkout',
    demo: 'Demo storefront. No orders are sent and no payments are taken.',
    review: 'Review the items and total. No personal details are needed.', confirm: 'Confirm demo order',
    success: 'Demo order complete', successCopy: 'No data was sent and no payment was taken.',
    notFound: 'Page not found',
  },
};
export const messages = language => text[language];

export function lowStock(language, quantity) {
  if (![1, 2, 3].includes(quantity)) return '';
  if (language === 'en') return `Only ${quantity} left`;
  return quantity === 1 ? 'Залишилась 1 шт.' : `Залишилось ${quantity} шт.`;
}
