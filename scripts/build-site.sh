#!/bin/bash
set -e

echo "Building portal..."
pnpm --filter @sf-report-tools/portal build

echo "Building schema-explorer..."
pnpm --filter @sf-report-tools/schema-explorer build

echo "Building scenario-manual..."
pnpm --filter @sf-report-tools/scenario-manual build

echo "Building goal-seek..."
pnpm --filter @sf-report-tools/goal-seek build

echo "Assembling dist..."
rm -rf dist
mkdir -p dist/schema-explorer
mkdir -p dist/scenario-manual
mkdir -p dist/goal-seek

cp -r packages/portal/dist/* dist/
cp -r packages/schema-explorer/dist/* dist/schema-explorer/
cp -r packages/scenario-manual/dist/* dist/scenario-manual/
cp -r packages/goal-seek/dist/* dist/goal-seek/

echo "Build complete. Output in ./dist/"
