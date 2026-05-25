// Default products catalogue and static texts for Solstice Studio
// Attached to the window object to support the file:// protocol seamlessly without CORS issues

window.DEFAULT_STORE_DATA = {
  settings: {
    storeName: "SOLSTICE STUDIO",
    storeTagline: "Objects for the Slow Home",
    announcement: "Free shipping on orders over $150 • Crafted sustainably in small batches",
    accentColor: "#4A533C", // Warm Deep Olive
    accentColorHover: "#39412F",
    fontHeading: "'Cormorant Garamond', serif",
    fontBody: "'DM Sans', sans-serif"
  },
  
  texts: {
    // Hero Section
    "hero-eyebrow": "SUMMER COLLECTION",
    "hero-title": "Objects for the slow, intentional home.",
    "hero-subtitle": "A curated collection of hand-thrown ceramics, raw linen textiles, and sculptural lighting, crafted in collaboration with independent artisans.",
    "hero-cta": "Explore the Collection",
    
    // Category Section
    "categories-title": "Shop by Collection",
    "categories-subtitle": "Thoughtfully designed items for daily rituals and quiet spaces.",
    "category-1-name": "Artisanal Ceramics",
    "category-2-name": "Organic Textiles",
    "category-3-name": "Sculptural Lighting",
    
    // Catalog Title
    "catalog-title": "The Full Collection",
    "catalog-subtitle": "Honest materials and timeless design.",
    
    // Philosophy / About Section
    "philosophy-eyebrow": "OUR VALUES",
    "philosophy-title": "Crafted by hand, shaped by nature.",
    "philosophy-p1": "We believe that the objects we surround ourselves with carry energy. That is why every piece in the Solstice collection is made slowly, by hand, using raw and sustainably sourced materials.",
    "philosophy-p2": "By partnering with local workshops and multi-generational artisans, we preserve traditional heritage techniques while designing modern pieces that are made to outlast trends and be passed down through generations.",
    "philosophy-stat1-num": "100%",
    "philosophy-stat1-label": "Traceable Supply Chain",
    "philosophy-stat2-num": "24",
    "philosophy-stat2-label": "Independent Craftspeople",
    "philosophy-stat3-num": "0",
    "philosophy-stat3-label": "Plastics or Synthetic Dyes",

    // Footer Newsletter
    "footer-newsletter-title": "Join the Journal",
    "footer-newsletter-desc": "Subscribe for early access to new collections, artisan stories, and interior inspiration.",
    "footer-newsletter-btn": "Subscribe",
    
    // Footer Links Headings
    "footer-col1-title": "Explore",
    "footer-col2-title": "Customer Care",
    "footer-col3-title": "Our Studio",
    
    // Footer Copyright
    "footer-copyright": "© 2026 Solstice Studio. All rights reserved. Created with intention.",
    "footer-admin-link": "Staff Portal"
  },
  
  products: [
    {
      id: "prod-1",
      name: "Aura Ceramic Vessel",
      category: "ceramics",
      price: 85.00,
      description: "A hand-thrown sculptural vase with a textured stoneware finish. Each vessel features subtle variations in tone and form, celebrating the raw beauty of organic clay. Perfect for displaying dried flora or as a standalone art piece.",
      image: "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=800&q=80",
      secondaryImage: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=800&q=80",
      materials: "100% Stoneware clay, organic matte glaze",
      dimensions: "H: 22cm, W: 14cm",
      inventory: 8,
      isFeatured: true
    },
    {
      id: "prod-2",
      name: "Soren Ribbed Bowl",
      category: "ceramics",
      price: 65.00,
      description: "A wide, low-profile bowl featuring delicate exterior ribbing and a smooth satin interior glaze. Crafted in small batches using local stoneware, it makes a quiet statement on a dining table or kitchen counter.",
      image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80",
      secondaryImage: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=800&q=80",
      materials: "Stoneware clay, satin food-safe glaze",
      dimensions: "H: 6cm, W: 24cm",
      inventory: 12,
      isFeatured: true
    },
    {
      id: "prod-3",
      name: "Dune Espresso Cups (Set of 2)",
      category: "ceramics",
      price: 48.00,
      description: "A pair of tactile, handle-free espresso cups with a raw tactile clay exterior and a gloss milk-white interior glaze. Designed to sit comfortably in the palm of your hand, elevating your morning coffee ritual.",
      image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80",
      secondaryImage: "https://images.unsplash.com/photo-1563822249514-414674ee053a?auto=format&fit=crop&w=800&q=80",
      materials: "Terracotta clay, white tin-glaze interior",
      dimensions: "H: 7cm, W: 6cm",
      inventory: 15,
      isFeatured: false
    },
    {
      id: "prod-4",
      name: "Nara Linen Throw Blanket",
      category: "textiles",
      price: 140.00,
      description: "Crafted from heavy-weight pre-washed European flax linen. Exceptionally soft yet highly structural, featuring natural fringed edges and a warm oatmeal hue. Dramatically drapes over beds, sofas, or accent chairs.",
      image: "https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?auto=format&fit=crop&w=800&q=80",
      secondaryImage: "https://images.unsplash.com/photo-1543294001-f7cbfe92237e?auto=format&fit=crop&w=800&q=80",
      materials: "100% European flax linen (380 gsm)",
      dimensions: "140cm x 200cm",
      inventory: 5,
      isFeatured: true
    },
    {
      id: "prod-5",
      name: "Oasis Waffle Linen Towel",
      category: "textiles",
      price: 38.00,
      description: "A highly absorbent, lightweight towel with a unique waffle texture. Woven from a custom blend of linen and organic cotton, it dries rapidly, gently exfoliates, and softens with every wash.",
      image: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80",
      secondaryImage: "https://images.unsplash.com/photo-1595981267035-7b04ec766147?auto=format&fit=crop&w=800&q=80",
      materials: "60% Organic linen, 40% Organic cotton",
      dimensions: "70cm x 140cm",
      inventory: 20,
      isFeatured: false
    },
    {
      id: "prod-6",
      name: "Lumiere Cushion Cover",
      category: "textiles",
      price: 52.00,
      description: "A minimalist pillow cover woven in a rich, textured slub linen weave. Finished with an invisible zipper closure and crisp structured flanged borders. Brings elegant organic textures to any space.",
      image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80",
      secondaryImage: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80",
      materials: "100% Belgian flax linen",
      dimensions: "50cm x 50cm",
      inventory: 10,
      isFeatured: false
    },
    {
      id: "prod-7",
      name: "Wabi Paper Pendant Light",
      category: "lighting",
      price: 180.00,
      description: "A sculptural hanging pendant crafted from handmade mulberry paper. Framed by organic bamboo, it diffuses a warm, atmospheric glow that immediately centers and calms any bedroom, dining, or living space.",
      image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80",
      secondaryImage: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80",
      materials: "Handmade mulberry paper, bamboo framing, brass fittings",
      dimensions: "H: 45cm, W: 40cm, Cord: 1.5m",
      inventory: 6,
      isFeatured: true
    },
    {
      id: "prod-8",
      name: "Linea Brass Desk Lamp",
      category: "lighting",
      price: 210.00,
      description: "A sleek, geometric table lamp featuring a solid brushed brass stem and a warm dimmable LED. A stunning modern study of pure form, balance, and quiet functionality.",
      image: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=800&q=80",
      secondaryImage: "https://images.unsplash.com/photo-1507646227500-4d389b0012be?auto=format&fit=crop&w=800&q=80",
      materials: "Spun brass, solid Nero Marquina marble base",
      dimensions: "H: 35cm, W: 12cm",
      inventory: 4,
      isFeatured: false
    },
    {
      id: "prod-9",
      name: "Terra Terracotta Table Lamp",
      category: "lighting",
      price: 165.00,
      description: "A sculptural table lamp crafted from unglazed terracotta. It emits a soft, atmospheric downward glow, making it a perfect accent light for bedside tables, bookshelves, or entryway consoles.",
      image: "https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?auto=format&fit=crop&w=800&q=80",
      secondaryImage: "https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&w=800&q=80",
      materials: "Natural terracotta clay, woven fabric cord",
      dimensions: "H: 28cm, W: 18cm",
      inventory: 7,
      isFeatured: false
    }
  ]
};
