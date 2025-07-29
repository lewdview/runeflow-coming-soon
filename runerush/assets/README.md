# RuneFlow Brand Assets

This directory contains all brand assets for RuneFlow projects.

## Directory Structure

```
assets/
├── images/
│   ├── logos/          # RuneFlow logos in various formats
│   ├── icons/          # Favicons, app icons, etc.
│   └── brand/          # Other brand elements
├── fonts/              # Brand fonts (if any)
└── brand-guidelines/   # Brand guidelines and style guides
```

## Logo Usage Guidelines

### Primary Logo
- Use the primary logo whenever possible
- Maintain proper spacing and proportions
- Don't modify colors unless using approved variations

### File Formats Available
- **SVG** - For web use, scalable
- **PNG** - For web use with transparency
- **JPG** - For print or solid backgrounds
- **ICO** - For favicons

### Recommended Sizes
- **Favicon**: 16x16, 32x32, 48x48
- **Web Header**: 200px height (maintain aspect ratio)
- **Full Width**: 1200px width (maintain aspect ratio)
- **Social Media**: 1200x630 (for og:image)

## Usage in HTML

```html
<!-- Primary Logo -->
<img src="assets/images/logos/runeflow-logo.svg" alt="RuneFlow" class="logo">

<!-- Favicon -->
<link rel="icon" type="image/x-icon" href="assets/images/icons/favicon.ico">
<link rel="icon" type="image/svg+xml" href="assets/images/icons/favicon.svg">
```

## Usage in CSS

```css
.logo {
    background-image: url('../images/logos/runeflow-logo.svg');
    background-size: contain;
    background-repeat: no-repeat;
}
```

Last updated: $(date)
