const copy = (uk, en) => ({ uk, en });
const image = name => `./assets/${name}.webp`;

export const categories = [
  { id: 'figures', image: image('collection'), name: copy('Фігурки', 'Figurines'), description: copy('Деталі, що зігрівають', 'Small pieces with character') },
  { id: 'decor', image: image('studio'), name: copy('Декор для дому', 'Home decor'), description: copy('Для затишних куточків', 'For cozy corners') },
  { id: 'gifts', image: image('hope'), name: copy('Подарунки', 'Gifts'), description: copy('Особливі речі для близьких', 'Thoughtful pieces for loved ones') },
  { id: 'collection', image: image('warmth'), name: copy('Колекційні вироби', 'Collectibles'), description: copy('Маленькі історії з гіпсу', 'Small stories in plaster') },
  { id: 'made-to-order', image: image('calm'), name: copy('Вироби на замовлення', 'Pieces made to order'), description: copy('Створені для вас', 'Made especially for you') },
];

export const products = [
  {
    id: 'hope', category: 'figures', featured: true, price: 450,
    name: copy('Ангелочок «Надія»', 'Angel “Hope”'),
    description: copy('Тиха фігурка зі складеними руками для полиці або подарунка.', 'A quiet figure with folded hands, for a shelf or a gift.'),
    images: ['hope', 'collection', 'warmth', 'calm', 'studio'].map(image),
    variants: [
      { id: 'ivory', name: copy('Молочний', 'Ivory'), swatch: '#eadccd', stock: 3, photo: 0 },
      { id: 'sand', name: copy('Пісочний', 'Sand'), swatch: '#c7aa8e', stock: 1, photo: 2, price: 480 },
      { id: 'stone', name: copy('Кам’яний', 'Stone'), swatch: '#a7998c', stock: 0, photo: 3 },
    ],
  },
  {
    id: 'warmth', category: 'decor', featured: true, price: 320, stock: 5,
    name: copy('Ангелочок «Тепло»', 'Angel “Warmth”'),
    description: copy('Мініатюрна фігурка для затишного куточка вдома.', 'A miniature figurine for a cozy corner at home.'),
    images: ['warmth', 'collection'].map(image),
  },
  {
    id: 'little-gift', category: 'gifts', featured: true, price: 540, stock: 2,
    name: copy('Маленький подарунок', 'A little gift'),
    description: copy('Пам’ятний подарунок для близької людини.', 'A keepsake for someone close.'),
    images: ['collection'].map(image),
  },
  {
    id: 'calm', category: 'collection', featured: true, price: 620, stock: 7,
    name: copy('Ангел «Спокій»', 'Angel “Calm”'),
    description: copy('Фігурка з виразними деталями крил.', 'A figure with finely detailed wings.'),
    images: ['calm', 'hope'].map(image),
  },
  {
    id: 'studio-piece', category: 'made-to-order', price: 780, madeToOrder: true,
    name: copy('Фігурка на замовлення', 'Made-to-order figure'),
    description: copy('Декоративна фігурка, яку виготовляють на замовлення.', 'A decorative figure prepared to order.'),
    images: ['studio', 'calm'].map(image),
  },
  {
    id: 'keepsake', category: 'decor', price: 290, stock: 0,
    name: copy('Гіпсова мініатюра для затишного дому', 'Plaster miniature for a cozy home'),
    description: copy('Невелика декоративна фігурка з гіпсу.', 'A small decorative plaster figurine.'),
    images: ['hope'].map(image),
  },
];
