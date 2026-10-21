export interface PrintoProduct {
  id: string;
  name: string;
  slug: string;
  category: string;
  categoryName: string;
  image: string;
  badge?: string;
  rating: number;
  reviewsCount: number;
  startingPrice: number;
  originalPrice?: number;
  minQuantity: number;
  dispatchTime: string;
  description: string;
  features: string[];
  options?: {
    sizes?: string[];
    finishes?: string[];
    materials?: string[];
    colors?: string[];
  };
  bulkPricing?: {
    qty: number;
    pricePerUnit: number;
  }[];
}

export interface PrintoCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  image: string;
  description: string;
  itemCount: string;
  startingPrice: number;
}

export const PRINTO_CATEGORIES: PrintoCategory[] = [
  {
    id: 'visiting-cards',
    name: 'Visiting Cards',
    slug: 'visiting-cards',
    icon: 'CreditCard',
    image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
    description: 'Standard, Matte, Metallic Foil & Smart NFC business cards',
    itemCount: '24+ Varieties',
    startingPrice: 149,
  },
  {
    id: 'custom-apparel',
    name: 'Custom Apparel',
    slug: 'custom-apparel',
    icon: 'Shirt',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80',
    description: 'Round neck tees, polo shirts, hoodies, aprons & canvas tote bags',
    itemCount: '18+ Styles',
    startingPrice: 299,
  },
  {
    id: 'drinkware',
    name: 'Mugs & Drinkware',
    slug: 'drinkware',
    icon: 'Coffee',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
    description: 'Photo ceramic mugs, magic color-changing mugs, sipper bottles',
    itemCount: '15+ Models',
    startingPrice: 199,
  },
  {
    id: 'stationery',
    name: 'Office Stationery',
    slug: 'stationery',
    icon: 'BookOpen',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    description: 'Custom hardcover journals, letterheads, stamps & engraved pens',
    itemCount: '32+ Items',
    startingPrice: 120,
  },
  {
    id: 'marketing',
    name: 'Marketing & Signage',
    slug: 'marketing',
    icon: 'Megaphone',
    image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=600&q=80',
    description: 'Roll-up standees, event flyers, vinyl banners & vinyl stickers',
    itemCount: '40+ Formats',
    startingPrice: 250,
  },
  {
    id: 'photo-gifts',
    name: 'Photo Gifts',
    slug: 'photo-gifts',
    icon: 'Image',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80',
    description: 'Acrylic desk blocks, canvas prints, calendars & photo books',
    itemCount: '20+ Keepsakes',
    startingPrice: 349,
  },
  {
    id: 'packaging',
    name: 'Custom Packaging',
    slug: 'packaging',
    icon: 'Package',
    image: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80',
    description: 'Mailer boxes, printed paper shopping bags, shipping pouches',
    itemCount: '14+ Sizes',
    startingPrice: 18,
  },
  {
    id: 'corporate-gifting',
    name: 'Corporate Gifts',
    slug: 'corporate-gifting',
    icon: 'Gift',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80',
    description: 'Employee onboarding kits, executive gift sets & award trophies',
    itemCount: '50+ Combos',
    startingPrice: 499,
  },
];

export const PRINTO_PRODUCTS: PrintoProduct[] = [
  {
    id: 'p1',
    name: 'Classic Matte Visiting Cards (350 GSM)',
    slug: 'classic-matte-visiting-cards',
    category: 'visiting-cards',
    categoryName: 'Visiting Cards',
    image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
    badge: 'Bestseller',
    rating: 4.9,
    reviewsCount: 3840,
    startingPrice: 149,
    originalPrice: 249,
    minQuantity: 100,
    dispatchTime: '24 Hours',
    description: 'Premium quality visiting cards printed on 350 GSM art card with silky matte lamination on both sides.',
    features: ['350 GSM Thick Cardstock', 'Velvet Matte Coating', 'Precision Die-Cut Edges', 'Fade-Proof Pigment Inks'],
    options: {
      finishes: ['Matte Lamination', 'Gloss Lamination', 'Spot UV Embossed'],
      sizes: ['Standard (3.5 x 2 in)', 'Square (2.5 x 2.5 in)', 'Rounded Corners'],
    },
    bulkPricing: [
      { qty: 100, pricePerUnit: 1.49 },
      { qty: 250, pricePerUnit: 1.19 },
      { qty: 500, pricePerUnit: 0.99 },
      { qty: 1000, pricePerUnit: 0.79 },
    ],
  },
  {
    id: 'p2',
    name: 'Smart NFC Digital Visiting Card (Matte Black Metal)',
    slug: 'smart-nfc-visiting-card',
    category: 'visiting-cards',
    categoryName: 'Visiting Cards',
    image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80',
    badge: 'Trending',
    rating: 4.8,
    reviewsCount: 920,
    startingPrice: 799,
    originalPrice: 1299,
    minQuantity: 1,
    dispatchTime: 'Same Day',
    description: 'One tap to share your contact details, portfolio, and social links instantly on any smartphone with embedded NFC.',
    features: ['Embedded NFC Chip', 'QR Code Backup', 'No App Required', 'Unlimited Contact Updates'],
    options: {
      colors: ['Matte Black', 'Brushed Gold', 'Silver Steel'],
    },
    bulkPricing: [
      { qty: 1, pricePerUnit: 799 },
      { qty: 5, pricePerUnit: 699 },
      { qty: 10, pricePerUnit: 599 },
    ],
  },
  {
    id: 'p3',
    name: 'Premium 100% Cotton Bio-Washed T-Shirt (180 GSM)',
    slug: 'cotton-bio-washed-tshirt',
    category: 'custom-apparel',
    categoryName: 'Custom Apparel',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80',
    badge: 'Top Rated',
    rating: 4.9,
    reviewsCount: 1640,
    startingPrice: 349,
    originalPrice: 599,
    minQuantity: 1,
    dispatchTime: '2 Days',
    description: 'Comfortable pre-shrunk, bio-washed cotton t-shirt with high definition direct-to-garment digital print.',
    features: ['180 GSM Combed Cotton', 'Vibrant DTG Printing', 'Double-Stitched Seams', 'Breathable & Pre-Shrunk'],
    options: {
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: ['Black', 'White', 'Navy Blue', 'Maroon', 'Heather Grey'],
    },
    bulkPricing: [
      { qty: 1, pricePerUnit: 349 },
      { qty: 10, pricePerUnit: 299 },
      { qty: 50, pricePerUnit: 249 },
      { qty: 100, pricePerUnit: 199 },
    ],
  },
  {
    id: 'p4',
    name: 'Personalized Magic Color-Changing Photo Mug (325 ml)',
    slug: 'magic-color-changing-mug',
    category: 'drinkware',
    categoryName: 'Mugs & Drinkware',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
    badge: 'Popular Gift',
    rating: 4.8,
    reviewsCount: 2150,
    startingPrice: 299,
    originalPrice: 449,
    minQuantity: 1,
    dispatchTime: 'Same Day',
    description: 'Appears sleek black when cold, magically reveals your custom photo and message when hot liquid is poured inside!',
    features: ['Heat-Sensitive Coating', 'Dishwasher & Microwave Safe', 'Glossy Ceramic Finish', 'Sturdy C-Handle'],
    options: {
      colors: ['Matte Black to White', 'Glossy Blue to White'],
    },
    bulkPricing: [
      { qty: 1, pricePerUnit: 299 },
      { qty: 12, pricePerUnit: 229 },
      { qty: 48, pricePerUnit: 189 },
    ],
  },
  {
    id: 'p5',
    name: 'Custom Hardcover Executive Notebook & Pen Set',
    slug: 'custom-hardcover-notebook-pen',
    category: 'stationery',
    categoryName: 'Office Stationery',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    badge: 'Corporate Pick',
    rating: 4.9,
    reviewsCount: 1420,
    startingPrice: 249,
    originalPrice: 399,
    minQuantity: 5,
    dispatchTime: '24 Hours',
    description: 'A5 size custom debossed journal with 160 pages of natural shade paper, ribbon bookmark and laser-engraved metal pen.',
    features: ['PU Leatherette Hardcover', '80 GSM Ivory Paper', 'Elastic Band & Pen Holder', 'Custom Gold/Silver Foil Stamp'],
    options: {
      colors: ['Midnight Black', 'Royal Tan Brown', 'Navy Blue', 'Forest Green'],
    },
    bulkPricing: [
      { qty: 5, pricePerUnit: 249 },
      { qty: 25, pricePerUnit: 219 },
      { qty: 100, pricePerUnit: 179 },
      { qty: 500, pricePerUnit: 149 },
    ],
  },
  {
    id: 'p6',
    name: 'Aluminum Roll-Up Standee with Flex Banner (6 x 2.5 ft)',
    slug: 'aluminum-rollup-standee',
    category: 'marketing',
    categoryName: 'Marketing & Signage',
    image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=600&q=80',
    badge: 'Express Event',
    rating: 4.7,
    reviewsCount: 880,
    startingPrice: 899,
    originalPrice: 1400,
    minQuantity: 1,
    dispatchTime: 'Same Day',
    description: 'Lightweight retractable aluminum standee with anti-curl non-tear banner sheet, ideal for expos, retail stores and events.',
    features: ['High-Res 1440 DPI Print', 'Sturdy Aluminum Base', 'Anti-Curl Synthetic Film', 'Complimentary Padded Carry Bag'],
    options: {
      sizes: ['6 x 2.5 ft', '6 x 3 ft', '6 x 4 ft'],
    },
    bulkPricing: [
      { qty: 1, pricePerUnit: 899 },
      { qty: 5, pricePerUnit: 799 },
      { qty: 15, pricePerUnit: 699 },
    ],
  },
  {
    id: 'p7',
    name: 'Frameless Acrylic Photo Desk Block (6 x 4 in - 20mm)',
    slug: 'acrylic-photo-desk-block',
    category: 'photo-gifts',
    categoryName: 'Photo Gifts',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80',
    badge: 'Popular',
    rating: 4.9,
    reviewsCount: 1120,
    startingPrice: 449,
    originalPrice: 699,
    minQuantity: 1,
    dispatchTime: '24 Hours',
    description: 'Crystal-clear 20mm thick diamond-polished acrylic block giving your memories a floating 3D appearance.',
    features: ['Optical Grade Crystal Acrylic', 'Diamond Edge Polished', 'UV Direct Flatbed Print', 'Self-Standing Desk Display'],
    options: {
      sizes: ['6 x 4 in', '7 x 5 in', '8 x 6 in'],
    },
    bulkPricing: [
      { qty: 1, pricePerUnit: 449 },
      { qty: 10, pricePerUnit: 389 },
      { qty: 50, pricePerUnit: 329 },
    ],
  },
  {
    id: 'p8',
    name: 'Custom Printed E-commerce Mailer Boxes (Pack of 50)',
    slug: 'custom-printed-mailer-boxes',
    category: 'packaging',
    categoryName: 'Custom Packaging',
    image: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80',
    badge: 'Brand Builder',
    rating: 4.8,
    reviewsCount: 650,
    startingPrice: 1250,
    originalPrice: 1800,
    minQuantity: 50,
    dispatchTime: '3 Days',
    description: '3-ply sturdy corrugated cardboard mailer boxes printed with your brand logo, patterns and unboxing messages.',
    features: ['3-Ply E-Flute Corrugated', 'Full Exterior UV Print', 'Tear-Resistant & Crush-Proof', 'Self-Locking Assembly'],
    options: {
      sizes: ['Small (6x4x2 in)', 'Medium (8x6x3 in)', 'Large (10x8x4 in)'],
    },
    bulkPricing: [
      { qty: 50, pricePerUnit: 25 },
      { qty: 200, pricePerUnit: 19 },
      { qty: 500, pricePerUnit: 15 },
    ],
  },
  {
    id: 'p9',
    name: 'Executive Employee Welcome Onboarding Kit (5-in-1)',
    slug: 'executive-welcome-kit',
    category: 'corporate-gifting',
    categoryName: 'Corporate Gifts',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80',
    badge: 'HR Favorite',
    rating: 5.0,
    reviewsCount: 940,
    startingPrice: 999,
    originalPrice: 1599,
    minQuantity: 5,
    dispatchTime: '3 Days',
    description: 'All-inclusive premium welcome kit containing branded Diary, Metal Pen, Insulated Bottle, Laptop Bag & Welcome Card inside a custom gift box.',
    features: ['Custom Logo on all 5 Items', 'Premium Rigid Magnetic Box', 'Free Personalized Welcome Card', 'Doorstep Multi-Location Dispatch'],
    options: {
      colors: ['Executive Black', 'Navy Luxe', 'Charcoal Grey'],
    },
    bulkPricing: [
      { qty: 5, pricePerUnit: 999 },
      { qty: 25, pricePerUnit: 899 },
      { qty: 100, pricePerUnit: 799 },
      { qty: 500, pricePerUnit: 699 },
    ],
  },
];

export const PRINTO_INDUSTRIES = [
  {
    title: 'Startups & Tech Offices',
    tagline: 'Make your team look sharp and unified',
    items: ['ID Cards & Lanyards', 'Laptop Stickers', 'Team T-Shirts', 'Welcome Kits'],
    icon: 'Building2',
    color: 'from-purple-600 to-indigo-700',
  },
  {
    title: 'Cafes & Cloud Kitchens',
    tagline: 'Consistent branding from counter to customer',
    items: ['Custom Food Boxes', 'Menu Cards', 'Branded Coffee Cups', 'Staff Aprons'],
    icon: 'Utensils',
    color: 'from-amber-500 to-orange-600',
  },
  {
    title: 'Events & Trade Shows',
    tagline: 'Grab eyes and stand out on the exhibition floor',
    items: ['Roll-up Standees', 'Flyers & Catalogues', 'Conference Badges', 'Promo Pens'],
    icon: 'Trophy',
    color: 'from-pink-600 to-purple-700',
  },
  {
    title: 'Boutiques & D2C Brands',
    tagline: 'Unboxing experiences customers want to share',
    items: ['Printed Mailer Boxes', 'Thank You Cards', 'Garment Tags', 'Tissue Paper'],
    icon: 'ShoppingBag',
    color: 'from-teal-600 to-emerald-700',
  },
];

export const PRINTO_REVIEWS = [
  {
    id: 1,
    name: 'Vikramaditya Sharma',
    company: 'Founder, CloudScale Technologies',
    rating: 5,
    date: '2 days ago',
    text: 'Ordered 200 onboarding welcome kits for our new cohort. The print quality on the bottles and journals exceeded our expectations, and delivery was 1 day early!',
    verified: true,
  },
  {
    id: 2,
    name: 'Pooja Iyer',
    company: 'Marketing Lead, BrewArt Cafes',
    rating: 5,
    date: '1 week ago',
    text: 'Printo has been our go-to for visiting cards and table tent menus across 6 cafe outlets. The matte lamination is luxurious and never peels.',
    verified: true,
  },
  {
    id: 3,
    name: 'Rohit Kulkarni',
    company: 'Event Director, FinTech Con 2026',
    rating: 5,
    date: '3 weeks ago',
    text: 'Needed 15 roll-up standees and 5,000 attendee badges on an urgent 48-hour deadline. Printo delivered with zero compromises on quality.',
    verified: true,
  },
];
