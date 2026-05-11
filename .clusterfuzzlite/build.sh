#!/bin/bash -eu

cd tools
npm install --save-dev @jazzer.js/core

# Copy fuzz tests to the output directory
cp fuzz/*.js $OUT/

# Create a package.json for the fuzz targets
cat > $OUT/package.json << EOF
{
  "dependencies": {
    "@jazzer.js/core": "*"
  }
}
EOF

cd $OUT
npm install
