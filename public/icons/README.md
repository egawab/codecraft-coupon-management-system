# PWA Icons

## Required Icons

Generate the following icon sizes for the PWA:

- icon-16x16.png
- icon-32x32.png
- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png

## How to Generate

### Option 1: Using an online tool
1. Go to https://realfavicongenerator.net/
2. Upload your logo (preferably 512x512 or larger)
3. Download the generated icons
4. Place them in this folder

### Option 2: Using ImageMagick
```bash
# Install ImageMagick
# macOS: brew install imagemagick
# Ubuntu: sudo apt-get install imagemagick

# Convert a source image to all sizes
convert source.png -resize 16x16 icon-16x16.png
convert source.png -resize 32x32 icon-32x32.png
convert source.png -resize 72x72 icon-72x72.png
convert source.png -resize 96x96 icon-96x96.png
convert source.png -resize 128x128 icon-128x128.png
convert source.png -resize 144x144 icon-144x144.png
convert source.png -resize 152x152 icon-152x152.png
convert source.png -resize 192x192 icon-192x192.png
convert source.png -resize 384x384 icon-384x384.png
convert source.png -resize 512x512 icon-512x512.png
```

### Option 3: Use PWA Asset Generator
```bash
npx pwa-asset-generator source.png ./public/icons --icon-only
```

## Temporary Placeholder

For now, you can use the favicon.svg as a placeholder or create simple colored squares.
The PWA will work without icons, but they're recommended for better UX.
