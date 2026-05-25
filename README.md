# 🕯️ Solstice Studio — E-Commerce Storefront & Visual CMS

Welcome to **Solstice Studio**, a premium, modern e-commerce storefront designed for a slow, intentional lifestyle. This website features a high-end, editorial aesthetic (avoiding the generic "AI-generated" look) and comes fully equipped with a robust, zero-code **Visual CMS (Content Management System)**.

A non-technical user can unlock "Studio CMS Mode" to easily edit any text, title, logo, or category on the site directly in-context, manage the complete product catalog, adjust the color theme, and backup/restore data without touching a single line of code.

---

## 🔑 Administrative Portal Access

* **Access Entrance**: Scroll to the footer and click the **"Staff Portal"** link, or click the **lock icon** in the top navigation bar.
* **Default Credentials**:
  * **Username**: `admin`
  * **Password**: `admin123`

---

## 🌟 Key Features

### 1. Authentic Editorial Aesthetics ("Not Looking Like AI")
* **Bespoke Typography**: Elegant, classical serif headings (`Cormorant Garamond`) paired with modern, highly readable geometric UI body text (`DM Sans`).
* **Organic Palette**: A curated earth-tone visual theme (soft bone-cream background, deep charcoal typography, warm linen borders, and a deep olive accent color).
* **Grid and White Space**: Asymmetrical hero layouts, generous margins, sharp lines, and spacious product grids.
* **Realistic Microcopy**: Every item has unique descriptions, physical dimensions, material composition, and accurate stock pricing.

### 2. Zero-Code Visual CMS Engine
* **In-Context Inline Text Editing**: Double-click or click any text element (headings, paragraphs, buttons, logos) on the page in CMS Mode. A modal will pop up allowing you to update the text, which reflects instantly on the page without refreshes.
* **Catalogue Manager**: A clean dashboard interface to:
  * **Add Products** with detailed forms (Name, Category, Price, Stock, Description, Primary/Secondary Image URLs, Materials, and Dimensions).
  * **Edit Products** with pre-filled inputs.
  * **Delete Products** with double-confirmation safety.
* **Theme Styling & Brand Panel**: Adjust the Global Store Name, Subtitle, top Announcement text, and accent color theme directly with an **integrated color picker**!
* **Robust Data Backups (Export/Import)**: 
  * Download the entire state of your custom storefront as a clean `.json` file backup.
  * Upload a previous backup JSON file to instantly restore your products and text edits in case of clearing browser cookies.
  * Reset the storefront to "factory defaults" with one click.
  * *All modifications persist in real-time to your browser's `localStorage`.*

### 3. Fully Functional Storefront E-Commerce
* **Categories Filter**: Smooth, animated catalog filtering (Ceramics, Textiles, Lighting).
* **Live Search**: Instant, query-based product search checking titles, descriptions, and materials.
* **Interactive Slide-out Cart**: Modify item quantities, remove items, and see calculations for shipping (dynamic indicators for free shipping above $150).
* **Detailed Object Drawer**: Slide-out panel for every item containing galleries, material breakdowns, inventory, and add-to-cart selectors.
* **Simulated Checkout**: Smooth secure checkout with mock payment processing, inventory decrementing, and order success screens.

---

## 📂 File Architecture

The project is built entirely on high-performance vanilla HTML5, CSS3, and modern ES6 JS, ensuring absolute compatibility across both local browser double-clicks and server instances (no complex Node.js compile frameworks or Tailwind builds to break!).

```
d:/New folder/
├── index.html       # Storefront semantic skeleton, drawers, and CMS panels
├── styles.css       # Design tokens, typographic sheets, layouts, and editor themes
├── products.js      # Global default products catalog and storefront values
├── app.js           # E-commerce interactions (cart, search, catalog, checkout)
├── admin.js         # Visual CMS (login, in-context edits, catalogue modifications, backups)
└── package.json     # Lightweight script directory to start local http-server
```

---

## 🚀 Quick Start Guide

### Option A: Local Double-Click (Frictionless)
Since we attached the initial catalog to the global `window` object in `products.js`, **you do not even need a local server to test the CMS!**
1. Navigate to `d:\New folder\` in your file manager.
2. Double-click `index.html` to open it directly in Google Chrome, Microsoft Edge, Safari, or Mozilla Firefox.
3. Enjoy a fully functioning visual editor, cart drawers, and mock checkout.

### Option B: Local Web Server (Recommended for local dev)
To run a local web server under a secure address:
1. Open terminal inside `d:\New folder`.
2. Run `npm install` to download dev dependencies (or run `npm start` directly).
3. Run **`npm start`** to launch a super fast dev server.
4. Open **`http://localhost:3000`** in your browser.
