/* Format-only export of three reviewed corrections; all original files retained. */
const fs = require('node:fs/promises');
const constants = require('node:fs').constants;
const path = require('node:path');
const manifest = require('../docs/configurator-views-2026-10-16/sources.json');

async function main() {
  const [generatedPath, mastersPath, sharpPath] = process.argv.slice(2);
  if (!generatedPath || !mastersPath || !sharpPath) throw Error('Expected generated folder, new master folder and Sharp module path');
  const sharp = require(path.resolve(sharpPath));
  await fs.mkdir(mastersPath, { recursive: true });
  for (const item of manifest) {
    if (!/^[a-z0-9-]+$/.test(item.id) || item.version !== 2) throw Error('Invalid correction target');
    const source = path.join(generatedPath, item.source);
    const master = path.join(mastersPath, `${item.id}-exterior-v2.png`);
    await fs.copyFile(source, master, constants.COPYFILE_EXCL);
    const bytes = await sharp(master).webp({ quality: 88, effort: 6 }).toBuffer();
    const dimensions = await sharp(bytes).metadata();
    if (dimensions.width < 1200 || Math.abs(dimensions.width / dimensions.height - 16 / 9) > 0.02 || bytes.length >= 500000) throw Error('Invalid web image');
    await fs.writeFile(path.join(__dirname, `../public/images/customize/${item.id}/exterior-v2.webp`), bytes, { flag: 'wx' });
    console.log(`${item.id}: ${dimensions.width}x${dimensions.height}, ${bytes.length} bytes`);
  }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
