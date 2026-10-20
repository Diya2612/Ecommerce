import { db } from '../../src/database';
import { products } from '../../src/features/product/shared/products.schema';
import { productVariants } from '../../src/features/product/shared/product-variants.schema';
import { productFaqs } from '../../src/features/product/shared/product-faqs.schema';
import { logger } from '../../src/utils/logging/logger';
import { uuidv7 } from 'uuidv7';
import { eq } from 'drizzle-orm';
import { loadEnv } from '../../src/utils/config/load-env';
loadEnv();

const toUnsplashUrl = (photoId: string) =>
  `https://images.unsplash.com/${photoId}?w=1600&q=80&auto=format&fit=crop`;

const TOURNAMENT_BOARD_GALLERY = [
  toUnsplashUrl('photo-1699743570117-91384b4b0400'),
  toUnsplashUrl('photo-1688514103479-68df94a77152'),
  toUnsplashUrl('photo-1743322364855-b01ce063a477'),
  toUnsplashUrl('photo-1652558973197-498325ed3758'),
  toUnsplashUrl('photo-1688381691940-d0ead2a3eb42'),
];

const HERITAGE_BOARD_GALLERY = [
  toUnsplashUrl('photo-1574923203787-ee36eef07c71'),
  toUnsplashUrl('photo-1625036452519-de446d5a3cb4'),
  toUnsplashUrl('photo-1621173404054-7cf62b779d8a'),
  toUnsplashUrl('photo-1696448359181-55b8dd5f972a'),
  toUnsplashUrl('photo-1599209248207-d1cc979102fb'),
];

const COINS_GALLERY = [
  toUnsplashUrl('photo-1642131589758-cbbd11d213f3'),
  toUnsplashUrl('photo-1709914371506-2eaf11fd6d64'),
  toUnsplashUrl('photo-1583041475142-cfd72e558188'),
  toUnsplashUrl('photo-1763571588783-9f21962b34e5'),
  toUnsplashUrl('photo-1659480142923-0cd01191e0e9'),
];

const STRIKER_GALLERY = [
  toUnsplashUrl('photo-1767619834318-63184920c4b1'),
  toUnsplashUrl('photo-1652558973276-365360d5024a'),
  toUnsplashUrl('photo-1652558973330-50f77152ce1f'),
  toUnsplashUrl('photo-1646221496474-f1980f9b5be5'),
  toUnsplashUrl('photo-1646221496282-cdf8e808a428'),
];

const ACCESSORIES_GALLERY = [
  toUnsplashUrl('photo-1617300067484-314ed2cfd9a6'),
  toUnsplashUrl('photo-1643119721733-d05e9f462ec8'),
  toUnsplashUrl('photo-1753849985607-310166f77cc2'),
  toUnsplashUrl('photo-1752981560877-8f18ab9c2787'),
  toUnsplashUrl('photo-1696448359181-55b8dd5f972a'),
];

const PRODUCT_GALLERY_BY_SLUG: Record<string, string[]> = {
  'tournament-elite-2026': TOURNAMENT_BOARD_GALLERY,
  'premium-rosewood-edition': HERITAGE_BOARD_GALLERY,
  'championship-pro': TOURNAMENT_BOARD_GALLERY,
  'heritage-collection': HERITAGE_BOARD_GALLERY,
  'striker-pro-set': STRIKER_GALLERY,
  'professional-coins-set': COINS_GALLERY,
  'beginner-training-board': TOURNAMENT_BOARD_GALLERY,
  'club-series-intermediate': TOURNAMENT_BOARD_GALLERY,
  'classic-wooden-coins': COINS_GALLERY,
  'durable-plastic-coins': COINS_GALLERY,
  'official-tournament-coins': COINS_GALLERY,
  'standard-wooden-striker': STRIKER_GALLERY,
  'neon-acrylic-striker': STRIKER_GALLERY,
  'tournament-edition-striker': STRIKER_GALLERY,
  'disco-carrom-powder': ACCESSORIES_GALLERY,
  'heavy-duty-board-cover': ACCESSORIES_GALLERY,
  'foldable-metal-stand': ACCESSORIES_GALLERY,
};

const getProductGallery = (slug: string, fallbackImage: string) => {
  const gallery = PRODUCT_GALLERY_BY_SLUG[slug] ?? [fallbackImage];
  return gallery.length > 0 ? gallery : [fallbackImage];
};

const getVariantImage = (gallery: string[], variantIndex: number) =>
  gallery[(variantIndex + 1) % gallery.length] ?? gallery[0];

const PRE_DEFINED_PRODUCTS = [
  {
    title: 'Tournament Elite 2026',
    slug: 'tournament-elite-2026',
    sku: 'SIS-TE-2026',
    description:
      'The Tournament Elite 2026 is an officially sized and manufactured carrom board designed for professional play and tournament settings. Features extremely smooth surface and superior rebound engineered for long-lasting competitive gameplay.',
    short_desc: 'Professional grade tournament carrom board.',
    price: '1399.00',
    cost: '1000.00',
    compare: '1799.00',
    status: 'active' as const,
    image_url:
      'https://images.unsplash.com/photo-1699743570117-91384b4b0400?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0b3VybmFtZW50JTIwY2Fycm9tJTIwYm9hcmQlMjBwcm9mZXNzaW9uYWx8ZW58MXx8fHwxNzcwMTk5MjM5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    variants: [
      { name: 'Color', value: '#8B4513', sku: 'SIS-TE-2026-C1', price: '1399.00', cost: '1000.00' },
      { name: 'Color', value: '#654321', sku: 'SIS-TE-2026-C2', price: '1399.00', cost: '1000.00' },
      { name: 'Color', value: '#3E2723', sku: 'SIS-TE-2026-C3', price: '1399.00', cost: '1000.00' },
    ],
    faqs: [
      {
        q: 'Is this board suitable for official tournaments?',
        a: 'Yes, it meets all international tournament specifications.',
      },
      { q: 'What is the warranty period?', a: 'Comes with a 2 Year Warranty.' },
    ],
  },
  {
    title: 'Premium Rosewood Edition',
    slug: 'premium-rosewood-edition',
    sku: 'SIS-PREM-RSE',
    description:
      'Experience luxury with the Premium Rosewood Edition. Crafted from fine Rosewood, it offers a stunning aesthetic mixed with exceptional gameplay properties.',
    short_desc: 'Handcrafted luxury Rosewood carrom board.',
    price: '899.00',
    cost: '600.00',
    compare: '1199.00',
    status: 'active' as const,
    image_url:
      'https://images.unsplash.com/photo-1574923203787-ee36eef07c71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcmVtaXVtJTIwY2Fycm9tJTIwYm9hcmQlMjB3b29kZW58ZW58MXx8fHwxNzcwMTk5MjM3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    variants: [
      { name: 'Color', value: '#5D4037', sku: 'SIS-PREM-RSE-C1', price: '899.00', cost: '600.00' },
      { name: 'Color', value: '#4E342E', sku: 'SIS-PREM-RSE-C2', price: '899.00', cost: '600.00' },
    ],
    faqs: [
      { q: 'What material is used?', a: 'Premium quality solid Rosewood.' },
      { q: 'What is the warranty period?', a: 'Comes with a 1 Year Warranty.' },
    ],
  },
  {
    title: 'Championship Pro',
    slug: 'championship-pro',
    sku: 'SIS-CHAMP-PRO',
    description:
      'Built for champions, the Championship Pro provides high-speed rebounds and a perfectly even surface for professional competitors.',
    short_desc: 'Pro-tier competition carrom board.',
    price: '749.00',
    cost: '500.00',
    compare: '899.00', // Added a default comparison based on typical markup
    status: 'active' as const,
    image_url:
      'https://images.unsplash.com/photo-1574923203787-ee36eef07c71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjB3b29kZW4lMjBjYXJyb20lMjBib2FyZHxlbnwxfHx8fDE3NzAxOTkyMzh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    variants: [
      { name: 'Color', value: '#795548', sku: 'SIS-CHAMP-PRO-C1', price: '749.00', cost: '500.00' },
    ],
    faqs: [
      {
        q: 'Are coins included?',
        a: 'Yes, it comes with a standard set of professional coins and a striker.',
      },
      { q: 'What is the warranty period?', a: 'Comes with a 1 Year Warranty.' },
    ],
  },
  {
    title: 'Heritage Collection',
    slug: 'heritage-collection',
    sku: 'SIS-HERITAGE',
    description:
      'A limited edition board that merges classic Indian craftsmanship with modern precision techniques for pure aesthetics and performance.',
    short_desc: 'Limited edition heritage craftsmanship board.',
    price: '1699.00',
    cost: '1200.00',
    compare: '2199.00',
    status: 'active' as const,
    image_url:
      'https://images.unsplash.com/photo-1699743570117-91384b4b0400?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0b3VybmFtZW50JTIwY2Fycm9tJTIwYm9hcmQlMjBwcm9mZXNzaW9uYWx8ZW58MXx8fHwxNzcwMTk5MjM5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    variants: [
      {
        name: 'Color',
        value: '#4E342E',
        sku: 'SIS-HERITAGE-C1',
        price: '1699.00',
        cost: '1200.00',
      },
    ],
    faqs: [
      {
        q: 'How do I maintain the board?',
        a: 'Use specialized carrom powder directly on the board.',
      },
      { q: 'What is the warranty period?', a: 'Comes with a 3 Year Warranty.' },
    ],
  },
  {
    title: 'Striker Pro Set',
    slug: 'striker-pro-set',
    sku: 'SIS-ACC-STRK-PRO',
    description:
      'Professional grade striker set containing precision weighted strikers for ultimate aiming accuracy and smooth striking.',
    short_desc: 'High-precision carrom striker set.',
    price: '129.00',
    cost: '60.00',
    compare: '179.00',
    status: 'active' as const,
    image_url:
      'https://images.unsplash.com/photo-1767619834318-63184920c4b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXJyb20lMjBzdHJpa2VyJTIwY29pbnMlMjBwbGF5aW5nfGVufDF8fHx8MTc3MDE5OTIzOHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    variants: [
      {
        name: 'Color',
        value: '#000000',
        sku: 'SIS-ACC-STRK-PRO-BLK',
        price: '129.00',
        cost: '60.00',
      },
      {
        name: 'Color',
        value: '#424242',
        sku: 'SIS-ACC-STRK-PRO-GRY',
        price: '129.00',
        cost: '60.00',
      },
    ],
    faqs: [
      {
        q: 'What is the weight of each striker?',
        a: 'Exactly 15 grams per striker, compliant with tournament rules.',
      },
      { q: 'What is the warranty period?', a: 'Comes with a 1 Year Warranty.' },
    ],
  },
  {
    title: 'Professional Coins Set',
    slug: 'professional-coins-set',
    sku: 'SIS-ACC-COINS-PRO',
    description:
      'Complete set of superior smooth carrom coins (white, black, red) ideal for professional setups, known for minimal friction.',
    short_desc: 'Complete set of frictionless professional coins.',
    price: '79.00',
    cost: '30.00',
    compare: '99.00',
    status: 'active' as const,
    image_url:
      'https://images.unsplash.com/photo-1767619834318-63184920c4b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXJyb20lMjBzdHJpa2VyJTIwY29pbnMlMjBwbGF5aW5nfGVufDF8fHx8MTc3MDE5OTIzOHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    variants: [
      {
        name: 'Set Type',
        value: 'Complete Set (38 Pcs)',
        sku: 'SIS-ACC-COINS-PRO-38',
        price: '79.00',
        cost: '30.00',
      },
    ],
    faqs: [
      {
        q: 'Does this come with a striker?',
        a: 'No, this is a distinct coin set. Strikers are sold separately.',
      },
    ],
  },
  {
    title: 'Beginner Training Board',
    slug: 'beginner-training-board',
    sku: 'SIS-BEG-BRD',
    description:
      'Perfect for homes and beginners. Standard size layout with a smooth playing surface for family fun.',
    short_desc: 'Standard beginner board for family play.',
    price: '399.00',
    cost: '250.00',
    compare: '499.00',
    status: 'active' as const,
    image_url:
      'https://images.unsplash.com/photo-1574923203787-ee36eef07c71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcmVtaXVtJTIwY2Fycm9tJTIwYm9hcmQlMjB3b29kZW58ZW58MXx8fHwxNzcwMTk5MjM3fDA&ixlib=rb-4.1.0&q=80&w=1080',
    variants: [
      { name: 'Size', value: '26x26', sku: 'SIS-BEG-BRD-26', price: '399.00', cost: '250.00' },
    ],
    faqs: [],
  },
  {
    title: 'Club Series Intermediate',
    slug: 'club-series-intermediate',
    sku: 'SIS-INT-BRD',
    description:
      'Designed for club players, offering a thicker ply and a faster surface than beginner models.',
    short_desc: 'Mid-range board for regular club players.',
    price: '599.00',
    cost: '400.00',
    compare: '699.00',
    status: 'active' as const,
    image_url:
      'https://images.unsplash.com/photo-1699743570117-91384b4b0400?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0b3VybmFtZW50JTIwY2Fycm9tJTIwYm9hcmQlMjBwcm9mZXNzaW9uYWx8ZW58MXx8fHwxNzcwMTk5MjM5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    variants: [
      { name: 'Size', value: '30x30', sku: 'SIS-INT-BRD-30', price: '599.00', cost: '400.00' },
    ],
    faqs: [],
  },
  {
    title: 'Classic Wooden Coins',
    slug: 'classic-wooden-coins',
    sku: 'SIS-ACC-COINS-WD',
    description: 'Traditional handcrafted wooden coins providing an authentic carrom experience.',
    short_desc: 'Authentic wooden carrom coins.',
    price: '49.00',
    cost: '20.00',
    compare: '69.00',
    status: 'active' as const,
    image_url:
      'https://images.unsplash.com/photo-1767619834318-63184920c4b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXJyb20lMjBzdHJpa2VyJTIwY29pbnMlMjBwbGF5aW5nfGVufDF8fHx8MTc3MDE5OTIzOHww&ixlib=rb-4.1.0&q=80&w=1080',
    variants: [],
    faqs: [],
  },
  {
    title: 'Durable Plastic Coins',
    slug: 'durable-plastic-coins',
    sku: 'SIS-ACC-COINS-PL',
    description:
      'Lightweight and extremely durable plastic coins, perfect for kids and casual play.',
    short_desc: 'Lightweight plastic practice coins.',
    price: '29.00',
    cost: '10.00',
    compare: '39.00',
    status: 'active' as const,
    image_url:
      'https://images.unsplash.com/photo-1767619834318-63184920c4b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXJyb20lMjBzdHJpa2VyJTIwY29pbnMlMjBwbGF5aW5nfGVufDF8fHx8MTc3MDE5OTIzOHww&ixlib=rb-4.1.0&q=80&w=1080',
    variants: [],
    faqs: [],
  },
  {
    title: 'Official Tournament Coins',
    slug: 'official-tournament-coins',
    sku: 'SIS-ACC-COINS-TR',
    description: 'ICF approved tournament coins adhering to strict weight and diameter standards.',
    short_desc: 'Approved tournament standard coins.',
    price: '89.00',
    cost: '40.00',
    compare: '109.00',
    status: 'active' as const,
    image_url:
      'https://images.unsplash.com/photo-1767619834318-63184920c4b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXJyb20lMjBzdHJpa2VyJTIwY29pbnMlMjBwbGF5aW5nfGVufDF8fHx8MTc3MDE5OTIzOHww&ixlib=rb-4.1.0&q=80&w=1080',
    variants: [],
    faqs: [],
  },
  {
    title: 'Standard Wooden Striker',
    slug: 'standard-wooden-striker',
    sku: 'SIS-ACC-STRK-WD',
    description: 'Classic wooden striker suitable for everyday casual games.',
    short_desc: 'Classic wood playing striker.',
    price: '39.00',
    cost: '15.00',
    compare: '49.00',
    status: 'active' as const,
    image_url:
      'https://images.unsplash.com/photo-1767619834318-63184920c4b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXJyb20lMjBzdHJpa2VyJTIwY29pbnMlMjBwbGF5aW5nfGVufDF8fHx8MTc3MDE5OTIzOHww&ixlib=rb-4.1.0&q=80&w=1080',
    variants: [],
    faqs: [],
  },
  {
    title: 'Neon Acrylic Striker',
    slug: 'neon-acrylic-striker',
    sku: 'SIS-ACC-STRK-AC',
    description:
      'Smooth acrylic striker available in vibrant colors for an eye-catching look on the board.',
    short_desc: 'Vibrant and smooth acrylic striker.',
    price: '59.00',
    cost: '25.00',
    compare: '79.00',
    status: 'active' as const,
    image_url:
      'https://images.unsplash.com/photo-1767619834318-63184920c4b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXJyb20lMjBzdHJpa2VyJTIwY29pbnMlMjBwbGF5aW5nfGVufDF8fHx8MTc3MDE5OTIzOHww&ixlib=rb-4.1.0&q=80&w=1080',
    variants: [],
    faqs: [],
  },
  {
    title: 'Tournament Edition Striker',
    slug: 'tournament-edition-striker',
    sku: 'SIS-ACC-STRK-TR',
    description:
      '15g tournament standard striker designed to exact specifications for competitive play.',
    short_desc: '15g official tournament striker.',
    price: '149.00',
    cost: '70.00',
    compare: '199.00',
    status: 'active' as const,
    image_url:
      'https://images.unsplash.com/photo-1767619834318-63184920c4b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXJyb20lMjBzdHJpa2VyJTIwY29pbnMlMjBwbGF5aW5nfGVufDF8fHx8MTc3MDE5OTIzOHww&ixlib=rb-4.1.0&q=80&w=1080',
    variants: [],
    faqs: [],
  },
  {
    title: 'Disco Carrom Powder',
    slug: 'disco-carrom-powder',
    sku: 'SIS-ACC-PWD-PR',
    description:
      'Friction-reducing powder to ensure the smoothest coin glide and protect the board surface.',
    short_desc: 'Specialized frictionless carrom powder.',
    price: '19.00',
    cost: '8.00',
    compare: '29.00',
    status: 'active' as const,
    image_url:
      'https://images.unsplash.com/photo-1767619834318-63184920c4b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXJyb20lMjBzdHJpa2VyJTIwY29pbnMlMjBwbGF5aW5nfGVufDF8fHx8MTc3MDE5OTIzOHww&ixlib=rb-4.1.0&q=80&w=1080',
    variants: [],
    faqs: [],
  },
  {
    title: 'Heavy Duty Board Cover',
    slug: 'heavy-duty-board-cover',
    sku: 'SIS-ACC-COV-HD',
    description: 'Water-resistant, padded cover to safely store and transport your carrom boards.',
    short_desc: 'Padded protective carrom board cover.',
    price: '99.00',
    cost: '45.00',
    compare: '129.00',
    status: 'active' as const,
    image_url:
      'https://images.unsplash.com/photo-1767619834318-63184920c4b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXJyb20lMjBzdHJpa2VyJTIwY29pbnMlMjBwbGF5aW5nfGVufDF8fHx8MTc3MDE5OTIzOHww&ixlib=rb-4.1.0&q=80&w=1080',
    variants: [],
    faqs: [],
  },
  {
    title: 'Foldable Metal Stand',
    slug: 'foldable-metal-stand',
    sku: 'SIS-ACC-STD-MT',
    description:
      'Sturdy, adjustable height metal stand providing a stable platform for any size board.',
    short_desc: 'Adjustable metal carrom board stand.',
    price: '249.00',
    cost: '120.00',
    compare: '299.00',
    status: 'active' as const,
    image_url:
      'https://images.unsplash.com/photo-1767619834318-63184920c4b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXJyb20lMjBzdHJpa2VyJTIwY29pbnMlMjBwbGF5aW5nfGVufDF8fHx8MTc3MDE5OTIzOHww&ixlib=rb-4.1.0&q=80&w=1080',
    variants: [],
    faqs: [],
  },
];

async function seedProducts() {
  logger.info('🌱 Seeding products...');

  try {
    for (const p of PRE_DEFINED_PRODUCTS) {
      const gallery = getProductGallery(p.slug, p.image_url);
      const primaryImage = gallery[0];
      const additionalImages = gallery.slice(1);

      // 1. Create or update product
      const generatedProductId = uuidv7();

      // Check if exists by sku
      const [existing] = await db.select().from(products).where(eq(products.sku, p.sku));
      const productId = existing?.id ?? generatedProductId;
      logger.info(`Creating product: ${p.title} (${productId})`);

      if (existing) {
        logger.info(`Product ${p.sku} already exists, refreshing image gallery...`);
        await db
          .update(products)
          .set({
            primary_image_url: primaryImage,
            thumbnail_url: primaryImage,
            additional_images: additionalImages,
            updated_at: new Date(),
          })
          .where(eq(products.id, productId));
      } else {
        await db.insert(products).values({
          id: productId,
          product_title: p.title,
          slug: p.slug,
          sku: p.sku,
          short_description: p.short_desc,
          full_description: p.description,
          selling_price: p.price,
          cost_price: p.cost,
          compare_at_price: p.compare,
          status: p.status,
          has_variants: p.variants.length > 0,
          primary_image_url: primaryImage,
          thumbnail_url: primaryImage,
          additional_images: additionalImages,
          is_deleted: false,
        });
      }

      // 2. Create Variants
      if (p.variants.length > 0) {
        logger.info(` Creating ${p.variants.length} variants...`);
        for (let i = 0; i < p.variants.length; i++) {
          const v = p.variants[i];
          const variantImage = getVariantImage(gallery, i);
          const [existingVariant] = await db
            .select()
            .from(productVariants)
            .where(eq(productVariants.sku, v.sku));

          if (existingVariant) {
            await db
              .update(productVariants)
              .set({
                image_url: variantImage,
                updated_at: new Date(),
              })
              .where(eq(productVariants.id, existingVariant.id));
          } else {
            await db.insert(productVariants).values({
              id: uuidv7(),
              product_id: productId,
              option_name: v.name,
              option_value: v.value,
              sku: v.sku,
              selling_price: v.price,
              compare_at_price: p.compare || null,
              cost_price: v.cost,
              image_url: variantImage,
              is_active: true,
              is_default: i === 0,
              is_deleted: false,
            });
          }
        }
      }

      // 3. Create FAQs
      if (!existing && p.faqs && p.faqs.length > 0) {
        logger.info(` Creating ${p.faqs.length} FAQs...`);
        for (const f of p.faqs) {
          await db.insert(productFaqs).values({
            id: uuidv7(),
            product_id: productId,
            question: f.q,
            answer: f.a,
          });
        }
      }
    }

    logger.info('✨ Product seeding completed!');
    setTimeout(() => process.exit(0), 500);
  } catch (error) {
    logger.error('❌ Error seeding products:', error);
    setTimeout(() => process.exit(1), 500);
  }
}

seedProducts();
