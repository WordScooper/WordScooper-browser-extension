# List recipes
default:
    @just --list

# Install dependencies
install:
    npm install

# Run Chrome with the extension loaded and live reload
dev-chrome:
    npm run dev

# Run Firefox with the extension loaded and live reload
dev-firefox:
    npm run dev:firefox

# Run the unit tests
test:
    npm test

# Type-check without emitting
compile:
    npm run compile

# Build for Chrome and Firefox into .output/
build:
    npm run build
    npm run build:firefox

# Build store-ready zips for Chrome and Firefox
zip:
    npm run zip
    npm run zip:firefox

# Everything CI runs
check: test compile build

# Resize a square source image into public/icon/{16,32,48,128}.png (needs ImageMagick)
icons source:
    for size in 16 32 48 128; do magick "{{source}}" -resize "${size}x${size}" "public/icon/${size}.png"; done
