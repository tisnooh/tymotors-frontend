/* Format-only export of reviewed AI masters. Does not retouch, crop or overwrite. */
const fs = require('node:fs/promises');
const path = require('node:path');
const manifest = require('../docs/configurator-views-2026-10-15/sources.json');

async function main() {
  const [generatedPath, mastersPath, sharpPath] = process.argv.slice(2);
  if (!generatedPath || !mastersPath || !sharpPath) throw new Error('Usage: node scripts/encode-configurator-views.cjs <generated-image-folder> <new-master-folder> <sharp-module-path>');
  const sharp = require(path.resolve(sharpPath));
  const generated = path.resolve(generatedPath);
  const masters = path.resolve(mastersPath);
  const existingExteriors = path.resolve(__dirname, '../../assets/vehicle-finals');
  const publicRoot = path.resolve(__dirname, '../public/images/customize');
  await fs.mkdir(masters, { recursive: true });
  let totalBytes = 0;
  for (const item of manifest) {
    if (!/^[a-z0-9-]+$/.test(item.id)) throw new Error('Invalid image directory');
    const target = path.join(publicRoot, item.id);
    await fs.mkdir(target, { recursive: true });
    for (const view of ['exterior', 'interior', 'technology']) {
      const source = view === 'exterior' ? path.join(existingExteriors, item.exterior) : path.join(generated, item[view]);
      const original = path.join(masters, `${item.id}-${view}.png`);
      await fs.copyFile(source, original, require('node:fs').constants.COPYFILE_EXCL);
      const bytes = await sharp(original).webp({ quality: 88, effort: 6 }).toBuffer();
      const metadata = await sharp(bytes).metadata();
      if (bytes.length >= 500000 || metadata.width < 1200 || Math.abs(metadata.width / metadata.height - 16 / 9) > 0.02) throw new Error(`Invalid image size: ${item.id}/${view}`);
      await fs.writeFile(path.join(target, `${view}-v1.webp`), bytes, { flag: 'wx' });
      totalBytes += bytes.length;
      console.log(`${item.id}/${view}: ${metadata.width}x${metadata.height}, ${bytes.length} bytes`);
    }
  }
  console.log(`Exported ${manifest.length * 3} images, ${totalBytes} bytes total. Original PNGs preserved.`);
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
