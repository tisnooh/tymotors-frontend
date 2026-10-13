// Build-time image transcoding only. Not imported by the app; no API/key needed.
// Usage: node tests/prepare-comparison-assets.cjs <stock.png> <tuned.png>
// Requires sharp in the local tooling environment (or via NODE_PATH).
const sharp = require('sharp');
const path = require('path');
const fs = require('fs/promises');

async function main() {
  const [before, after] = process.argv.slice(2);
  if (!before || !after) throw new Error('Provide the two selected image paths.');
  const metadata = await Promise.all([sharp(before).metadata(), sharp(after).metadata()]);
  if (metadata[0].width !== metadata[1].width || metadata[0].height !== metadata[1].height) {
    throw new Error('Comparison sources must have identical dimensions.');
  }
  const destination = path.resolve(__dirname, '../public/images/transformations');
  await fs.mkdir(destination, { recursive: true });
  for (const [name, source] of [['stock', before], ['tuned', after]]) {
    for (const width of [480, 960, 1672]) {
      const output = path.join(destination, `front-${name}-v1-${width}.webp`);
      const result = await sharp(source).resize({ width, withoutEnlargement: true }).webp({ quality: 84, effort: 5 }).toFile(output);
      console.log(`${path.basename(output)}: ${result.width}x${result.height}, ${result.size} bytes`);
    }
  }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
