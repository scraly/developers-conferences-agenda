#!/bin/bash -eu

PROJECT_DIR="$SRC/developers-conferences-agenda"
cd "$PROJECT_DIR"

# Copy fuzz tests to the output directory
cp fuzz/*.js "$OUT/"

# Create a package.json for the fuzz targets
cat > "$OUT/package.json" << EOF
{
  "dependencies": {
    "@jazzer.js/core": "*"
  }
}
EOF

cd "$OUT"
npm install
