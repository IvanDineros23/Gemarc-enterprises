# CSS Structure Documentation

## Overview
The CSS has been reorganized from a single `styles.css` file into multiple modular files for better organization, maintainability, and performance.

## New CSS Structure

### 📁 css/
```
css/
├── common.css      # Shared styles (header, footer, navigation, etc.)
├── index.css       # Homepage specific styles
├── about.css       # About page specific styles
├── services.css    # Services page specific styles
├── contact.css     # Contact page specific styles
├── news.css        # News page specific styles
└── products.css    # Product pages specific styles
```

## File Descriptions

### 🔧 common.css
**Purpose**: Contains all shared styles used across multiple pages
**Includes**:
- Reset and base styles
- Header and navigation styles
- Footer styles
- Common sections (contact CTA, bottom section)
- Floating social media buttons
- Basic responsive design
- Services navigation (products menu)

### 🏠 index.css
**Purpose**: Homepage specific styles
**Includes**:
- Hero section
- Service cards with hover effects
- Partnership section and carousel
- Homepage-specific responsive design

### ℹ️ about.css
**Purpose**: About page specific styles
**Includes**:
- About hero section
- Tab functionality styles
- Company history and mission/vision sections
- Timeline styles
- Government logos section
- About-specific responsive design

### 🛠️ services.css
**Purpose**: Services page specific styles
**Includes**:
- Services hero section
- Service categories grid
- Equipment cards
- Featured services
- "Why choose us" section
- Services-specific responsive design

### 📞 contact.css
**Purpose**: Contact page specific styles
**Includes**:
- Contact hero section
- Contact form styling
- Contact information layout
- Map section
- Business hours section
- Emergency contact section
- Contact-specific responsive design

### 📰 news.css
**Purpose**: News page specific styles
**Includes**:
- News hero section
- Featured news layout
- Slideshow functionality
- News cards and archive
- Newsletter subscription
- Training topics and client benefits
- News-specific responsive design

### 📦 products.css
**Purpose**: All product pages specific styles
**Includes**:
- Product hero sections
- Brand sections (Matest, NL Scientific, LabTech, etc.)
- Product cards and grids
- Equipment showcase
- Brand logo adjustments
- Product-specific responsive design

## HTML File Updates

All HTML files have been updated to use the new CSS structure:

### Before:
```html
<link rel="stylesheet" href="styles.css">
```

### After:
```html
<link rel="stylesheet" href="css/common.css">
<link rel="stylesheet" href="css/[page-specific].css">
```

## File Mapping

| HTML File | CSS Files Used |
|-----------|----------------|
| index.html | common.css + index.css |
| about.html | common.css + about.css |
| services.html | common.css + services.css |
| contact.html | common.css + contact.css |
| news.html | common.css + news.css |
| All product pages* | common.css + products.css |

*Product pages include: aggregates.html, asphalt-bitumen.html, cement-mortar.html, concrete-mortar.html, drilling-machine.html, industrial-equipment.html, soil.html, steel.html

## Benefits of This Structure

### 🚀 Performance Benefits
- **Faster loading**: Pages only load CSS they need
- **Reduced file size**: Smaller CSS files per page
- **Better caching**: Common styles cached once, used everywhere
- **Parallel downloads**: Browser can download multiple CSS files simultaneously

### 🛠️ Development Benefits
- **Better organization**: Easy to find and edit page-specific styles
- **Reduced conflicts**: Less chance of CSS conflicts between pages
- **Easier maintenance**: Changes to specific pages don't affect others
- **Better collaboration**: Multiple developers can work on different pages simultaneously

### 📱 Responsive Design
Each CSS file includes its own responsive design optimizations specific to that page's content and layout requirements.

## Legacy Support

The original `styles.css` file has been converted to import all the new modular files for backwards compatibility:

```css
@import url('css/common.css');
@import url('css/index.css');
@import url('css/about.css');
@import url('css/services.css');
@import url('css/contact.css');
@import url('css/news.css');
@import url('css/products.css');
```

## Image Path Updates

All CSS files use relative paths to images:
- Changed from `url('images/...)` to `url('../images/...)`
- This ensures images load correctly from the css/ subdirectory

## Best Practices Going Forward

1. **Always link common.css first** in any new HTML page
2. **Use specific CSS files** instead of importing everything via styles.css
3. **Add new styles** to the appropriate page-specific CSS file
4. **Keep common styles** in common.css if they're used on multiple pages
5. **Test responsiveness** after making changes to ensure mobile compatibility

## Backup

The original styles.css has been backed up as `styles-backup.css` for reference.
