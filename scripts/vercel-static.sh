#!/usr/bin/env sh
# Assemble Vercel static output (dashboard expects outputDirectory: public)
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
rm -rf public
mkdir -p public
cp passport.html public/passport.html
cp passport.html public/index.html
cp -r farm-map public/farm-map
