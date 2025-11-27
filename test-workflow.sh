#!/bin/bash

# Test script to simulate GitHub Actions workflow locally
# This verifies that all-events.json is generated before tests run

set -e  # Exit on any error

echo "=========================================="
echo "Testing Workflow Steps Locally"
echo "=========================================="

# Clean up any existing generated files
echo ""
echo "Step 1: Cleaning up existing generated files..."
rm -f page/src/misc/all-events.json
rm -f page/src/misc/all-cfps.json
echo "✓ Cleanup complete"

# Install dependencies in page directory
echo ""
echo "Step 2: Installing page dependencies..."
cd page
npm install -D
cd ..
echo "✓ Page dependencies installed"

# Install dependencies in tools directory and run mdParser
echo ""
echo "Step 3: Installing tools dependencies..."
cd tools
npm install -D
echo "✓ Tools dependencies installed"

# Run mdValidator
echo ""
echo "Step 4: Running mdValidator..."
node mdValidator.js
echo "✓ mdValidator passed"

# Run mdParser
echo ""
echo "Step 5: Running mdParser to generate all-events.json..."
node mdParser.js
cd ..

# Verify all-events.json was created
if [ ! -f "page/src/misc/all-events.json" ]; then
    echo "❌ ERROR: all-events.json was not created!"
    exit 1
fi
echo "✓ all-events.json created successfully"

# Show file info
echo ""
echo "Generated file info:"
ls -lh page/src/misc/all-events.json
echo ""
wc -l page/src/misc/all-events.json

# Run tests
echo ""
echo "Step 6: Running tests..."
cd page
npm test -- --run
cd ..

echo ""
echo "=========================================="
echo "✅ All steps completed successfully!"
echo "=========================================="
echo ""
echo "This confirms the workflow will work correctly:"
echo "1. mdParser.js generates all-events.json"
echo "2. Tests can import and use all-events.json"
echo ""
