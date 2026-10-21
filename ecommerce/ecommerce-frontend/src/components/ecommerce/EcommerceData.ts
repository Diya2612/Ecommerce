export interface Product {
  id: string;
  name: string;
  category: string;
  categoryName: string;
  tagline: string;
  price: number;
  originalPrice: number;
  discount: number;
  rating: number;
  reviewsCount: number;
  badge?: string;
  inStock: boolean;
  stockLeft: number;
  images: string[];
  colors?: { name: string; hex: string; image: string }[];
  specs: string[];
  features3D?: { title: string; desc: string; x: number; y: number }[];
}

export const ECOMMERCE_CATEGORIES = [
  {
    id: 'visiting-cards',
    name: 'Visiting Cards & NFC',
    itemCount: '42 styles',
    icon: 'CreditCard',
    gradient: 'from-purple-600 via-indigo-600 to-purple-800',
    image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'custom-packaging',
    name: 'Packaging & Custom Boxes',
    itemCount: '58 items',
    icon: 'Package',
    gradient: 'from-amber-500 via-orange-600 to-red-600',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'apparel',
    name: 'Apparel & Corporate Wear',
    itemCount: '76 items',
    icon: 'Shirt',
    gradient: 'from-blue-600 via-indigo-600 to-cyan-600',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'drinkware-gifts',
    name: 'Personalized Drinkware & Mugs',
    itemCount: '64 items',
    icon: 'Coffee',
    gradient: 'from-emerald-500 via-teal-600 to-cyan-700',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'signs-marketing',
    name: 'Standees, Signs & Banners',
    itemCount: '39 items',
    icon: 'Flag',
    gradient: 'from-rose-500 via-pink-600 to-purple-700',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'photo-gifts',
    name: 'Acrylic Frames & Photo Canvas',
    itemCount: '48 items',
    icon: 'Image',
    gradient: 'from-violet-600 via-purple-600 to-indigo-700',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'stationery',
    name: 'Office Stationery & Stamps',
    itemCount: '52 items',
    icon: 'BookOpen',
    gradient: 'from-amber-600 via-orange-500 to-yellow-600',
    image: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'tech-audio',
    name: 'Smart Gadgets & Audio',
    itemCount: '35 items',
    icon: 'Headphones',
    gradient: 'from-cyan-600 via-blue-600 to-indigo-700',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
  },
];

export const ECOMMERCE_PRODUCTS: Product[] = [
  // 1. Business & Visiting Cards (Printo Flagship)
  {
    id: 'prod-visiting-card',
    name: 'Royal 3D Gold Foil Luxury Visiting Cards',
    category: 'visiting-cards',
    categoryName: 'Visiting Cards & NFC',
    tagline: 'Embossed metallic gold foil, 400 GSM silk velvet stock with 3D tactile finish',
    price: 499,
    originalPrice: 899,
    discount: 44,
    rating: 4.9,
    reviewsCount: 4210,
    badge: 'Printo Bestseller',
    inStock: true,
    stockLeft: 100,
    images: [
      'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=800&q=80',
    ],
    colors: [
      { name: 'Metallic Gold on Velvet Black', hex: '#bf953f', image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80' },
      { name: 'Holographic Silver on Royal Navy', hex: '#0f172a', image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=800&q=80' },
      { name: 'Rose Gold on Natural Kraft', hex: '#b76e79', image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80' },
    ],
    specs: ['400 GSM European Imported Stock', '3D Raised Foil Stamping (0.2mm relief)', 'Scratch-Proof Matte Velvet Lamination', 'Available in Pack of 100, 250, 500+'],
    features3D: [
      { title: '3D Raised Gold Foil', desc: 'Precision hydraulic foil pressing with specular gleam', x: 30, y: 35 },
      { title: 'Velvet Touch Base', desc: 'Non-reflective tactile coating resisting smudges and fingerprints', x: 65, y: 60 },
      { title: 'Crisp Edge Cutting', desc: 'Diamond-honed guillotine edges ensuring 100% registration', x: 40, y: 80 },
    ],
  },

  // 2. Custom Packaging & Corrugated Mailer Boxes (Printo Flagship)
  {
    id: 'prod-mailer-box',
    name: 'Custom Corrugated E-Commerce Mailer Boxes',
    category: 'custom-packaging',
    categoryName: 'Packaging & Custom Boxes',
    tagline: 'Full CMYK HD exterior & interior printing with crash-lock easy assembly',
    price: 1299,
    originalPrice: 1999,
    discount: 35,
    rating: 4.9,
    reviewsCount: 3180,
    badge: 'Unboxing Delight',
    inStock: true,
    stockLeft: 45,
    images: [
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80',
    ],
    colors: [
      { name: 'Custom Printed Kraft', hex: '#d97706', image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80' },
      { name: 'Matte Black Luxe', hex: '#1e293b', image: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80' },
    ],
    specs: ['E-Flute 3-Ply High Tensile Board', 'Edge Crush Test (ECT) 32+ Standard', 'Eco-Friendly Soy-Based Inks', 'Zero Glue Self-Locking Wings'],
    features3D: [
      { title: 'Dual-Sided HD Printing', desc: 'Full interior artwork greeting customers upon unboxing', x: 45, y: 30 },
      { title: 'Reinforced Corner Locks', desc: 'Structural strength withstands up to 15 kg stacking load', x: 25, y: 65 },
      { title: 'Eco Recycled Fluting', desc: '100% biodegradable corrugated cardboard sourced responsibly', x: 75, y: 55 },
    ],
  },

  // 3. Embroidered Polo T-Shirts (Printo Flagship)
  {
    id: 'prod-polo-tshirt',
    name: 'Executive Embroidered Pique Polo T-Shirt',
    category: 'apparel',
    categoryName: 'Apparel & Corporate Wear',
    tagline: '100% Combed cotton (240 GSM) with high-density precision chest embroidery',
    price: 599,
    originalPrice: 999,
    discount: 40,
    rating: 4.8,
    reviewsCount: 2650,
    badge: 'Corporate Standard',
    inStock: true,
    stockLeft: 30,
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=800&q=80',
    ],
    colors: [
      { name: 'Midnight Navy', hex: '#0f172a', image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80' },
      { name: 'Royal Crimson', hex: '#991b1b', image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=800&q=80' },
      { name: 'Pure White', hex: '#f8fafc', image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80' },
    ],
    specs: ['240 GSM Bio-Washed Pique Fabric', 'Madeira German Thread Embroidery', 'Pre-Shrunk & Colorfast up to 50 Washes', 'Ribbed Collar & Mother-of-Pearl Buttons'],
    features3D: [
      { title: '12,000-Stitch Embroidery', desc: 'Sharp micro-stitch detailing reproduces intricate logos', x: 38, y: 35 },
      { title: 'Breathable Honeycomb Knit', desc: 'Moisture-wicking all-day comfort for office and outdoors', x: 60, y: 55 },
      { title: 'Reinforced Split Hem', desc: 'Twin needle stitching along sides and waist', x: 50, y: 80 },
    ],
  },

  // 4. Personalized Insulated Vacuum Tumbler (Printo Flagship)
  {
    id: 'prod-tumbler',
    name: 'AeroThermal Stainless Steel Laser-Engraved Tumbler',
    category: 'drinkware-gifts',
    categoryName: 'Personalized Drinkware & Mugs',
    tagline: 'Double-wall vacuum insulation keeps drinks 24h cold / 12h piping hot',
    price: 649,
    originalPrice: 1199,
    discount: 46,
    rating: 4.9,
    reviewsCount: 3890,
    badge: 'Hot Gift Choice',
    inStock: true,
    stockLeft: 18,
    images: [
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?auto=format&fit=crop&w=800&q=80',
    ],
    colors: [
      { name: 'Matte Obsidian Black', hex: '#18181b', image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80' },
      { name: 'Aurora Emerald', hex: '#065f46', image: 'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?auto=format&fit=crop&w=800&q=80' },
      { name: 'Frost White', hex: '#fafafa', image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80' },
    ],
    specs: ['Food Grade 304 Stainless Steel', 'Permanent Fiber Laser Logo Engraving', 'Spill-Proof Magnetic Slide Lid', 'Fits All Standard Car Cup Holders'],
    features3D: [
      { title: 'Permanent Laser Engraving', desc: 'Precision laser removes powder coat revealing steel core', x: 50, y: 48 },
      { title: 'Copper Heat Insulation Layer', desc: 'Reflective inner wall eliminates condensation and sweat', x: 30, y: 70 },
      { title: 'Tritan Crystal Lid', desc: 'BPA-free impact resistant lid with silicone gasket seal', x: 50, y: 20 },
    ],
  },

  // 5. Retractable Rollup Standees (Printo Flagship)
  {
    id: 'prod-standee',
    name: 'Aluminium Retractable 6ft Rollup Standee Display',
    category: 'signs-marketing',
    categoryName: 'Standees, Signs & Banners',
    tagline: 'High resolution non-tearable PVC vinyl banner with heavy aluminium base and carry bag',
    price: 1499,
    originalPrice: 2499,
    discount: 40,
    rating: 4.8,
    reviewsCount: 1780,
    badge: 'Ready in 24h',
    inStock: true,
    stockLeft: 12,
    images: [
      'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
    ],
    colors: [
      { name: 'Brushed Silver Stand', hex: '#94a3b8', image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80' },
      { name: 'Matte Black Stand', hex: '#0f172a', image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80' },
    ],
    specs: ['Standard 6x2.5 ft or 6x3 ft Display', '280 Micron Star Poly Non-Curling Vinyl', '1440 DPI Japanese UV Curable Printing', 'Padded Travel Carrying Bag Included'],
    features3D: [
      { title: 'Non-Curling Star Vinyl', desc: 'Zero edge curling even under intense trade show spotlights', x: 50, y: 35 },
      { title: 'Heavy Stabilizer Feet', desc: 'Die-cast aluminum feet ensure stability in crowded halls', x: 50, y: 88 },
      { title: 'Spring Roller Cartridge', desc: 'Smooth retraction mechanism tested for 500+ rollups', x: 50, y: 75 },
    ],
  },

  // 6. Floating Acrylic Photo Frames (Printo Flagship)
  {
    id: 'prod-acrylic-frame',
    name: 'Floating Acrylic Glass Wall Print (with Standoffs)',
    category: 'photo-gifts',
    categoryName: 'Acrylic Frames & Photo Canvas',
    tagline: '5mm Ultra-clear cast acrylic with back-mounted metallic print & brushed steel bolts',
    price: 999,
    originalPrice: 1799,
    discount: 44,
    rating: 4.9,
    reviewsCount: 2430,
    badge: 'Gallery Grade',
    inStock: true,
    stockLeft: 25,
    images: [
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80',
    ],
    colors: [
      { name: 'Diamond Polished Edge', hex: '#e2e8f0', image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80' },
    ],
    specs: ['5mm Optically Pure Cast Acrylic', 'Back-Mounted Metallic Photo Paper', 'Diamond Hand-Polished 3D Beveled Edges', '4x Stainless Steel Architectural Standoffs'],
    features3D: [
      { title: '99% Optical Clarity', desc: 'Enhances color depth and blacks with luminous 3D glow', x: 45, y: 45 },
      { title: 'Stainless Steel Standoffs', desc: 'Floats the acrylic print 1 inch away from the wall surface', x: 80, y: 20 },
      { title: 'UV Curable Inks', desc: 'Fade-proof archival prints guaranteed vibrant for 50+ years', x: 30, y: 70 },
    ],
  },

  // 7. Tech Audio (Consumer E-Commerce)
  {
    id: 'prod-audio-headphones',
    name: 'AeroPulse Pro Spatial ANC Wireless Headphones',
    category: 'tech-audio',
    categoryName: 'Smart Gadgets & Audio',
    tagline: 'Titanium drivers, spatial 3D surround sound & 50h battery',
    price: 6999,
    originalPrice: 11999,
    discount: 42,
    rating: 4.9,
    reviewsCount: 2840,
    badge: '3D Interactive',
    inStock: true,
    stockLeft: 14,
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80',
    ],
    colors: [
      { name: 'Cosmic Violet', hex: '#6b21a8', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80' },
      { name: 'Obsidian Black', hex: '#111827', image: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80' },
    ],
    specs: ['40mm Titanium Biomembrane', 'Active Noise Cancellation 42dB', 'Bluetooth 5.4 Ultra-Low Latency', 'Fast USB-C Charging (10m = 6h)'],
    features3D: [
      { title: '40mm Driver Chamber', desc: 'Precision tuned acoustic chamber delivering studio bass', x: 28, y: 38 },
      { title: 'Memory Foam Seal', desc: 'Cooling gel-infused breathable leatherette earcups', x: 70, y: 55 },
      { title: 'ANC Dual Mics', desc: 'Active environment cancelling array for crystal clarity', x: 45, y: 78 },
    ],
  },

  // 8. Custom Sublimation Coffee Mug
  {
    id: 'prod-coffee-mug',
    name: 'Classic Ceramic HD Sublimation Coffee Mug',
    category: 'drinkware-gifts',
    categoryName: 'Personalized Drinkware & Mugs',
    tagline: 'Gloss white ceramic with full 360-degree wraparound photo and logo print',
    price: 249,
    originalPrice: 499,
    discount: 50,
    rating: 4.8,
    reviewsCount: 5120,
    badge: 'Top Gifting Choice',
    inStock: true,
    stockLeft: 80,
    images: [
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?auto=format&fit=crop&w=800&q=80',
    ],
    colors: [
      { name: 'Classic Pure White (11 oz)', hex: '#f8fafc', image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80' },
      { name: 'Magic Heat Changing Black', hex: '#09090b', image: 'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?auto=format&fit=crop&w=800&q=80' },
    ],
    specs: ['11 oz / 325ml Grade A Ceramic', 'Microwave & Dishwasher Safe', 'Edge-to-Edge Sublimation Photo Print', 'Comes in Individual Safe-Transit Gift Box'],
    features3D: [
      { title: 'Full 360° Wraparound Print', desc: 'Seamless photographic print without gaps or color fading', x: 48, y: 40 },
      { title: 'Ergonomic C-Handle', desc: 'Comfortable grip designed for hot coffee or tea', x: 80, y: 50 },
      { title: 'Heat Reveal Coating', desc: 'Color morphs from black to reveals artwork when hot liquid is poured', x: 30, y: 75 },
    ],
  },
];
