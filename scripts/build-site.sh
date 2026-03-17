#!/bin/bash
set -e

echo "Building schema-explorer..."
pnpm --filter @sf-report-tools/schema-explorer build

echo "Building scenario-manual..."
pnpm --filter @sf-report-tools/scenario-manual build

echo "Assembling dist..."
rm -rf dist
mkdir -p dist/scenario-manual

cp -r packages/schema-explorer/dist/* dist/
cp -r packages/scenario-manual/dist/* dist/scenario-manual/

echo "Build complete. Output in ./dist/"
