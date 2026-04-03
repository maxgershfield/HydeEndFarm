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

# Optional: inject Cellar door link target (passport meta + top bar)
if [ -n "${NEXT_PUBLIC_HYDE_WINE_MARKETPLACE_URL:-}" ]; then
  node -e '
const fs = require("fs");
const url = process.env.NEXT_PUBLIC_HYDE_WINE_MARKETPLACE_URL || "";
if (!url) process.exit(0);
const esc = url.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
for (const f of ["public/passport.html", "public/index.html"]) {
  let s = fs.readFileSync(f, "utf8");
  s = s.replace(
    /(<meta name="hyde-wine-marketplace-url" content=")[^"]*(")/,
    (_, a, b) => a + esc + b
  );
  fs.writeFileSync(f, s);
}
'
fi
