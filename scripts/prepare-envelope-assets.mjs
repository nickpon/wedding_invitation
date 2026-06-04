import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const sourcesDir = path.join(__dirname, 'envelope-sources');
const outDir = path.join(root, 'public/assets/envelope');

/** Dusty-rose wax ramp matched to site palette (--accent-deep, --accent, --bg-soft). */
const WAX_GRADIENT = '#8f5d72-#b87b98-#e79bb8-#f4d2e0';

const svgFiles = [
  ['Vector_49.svg', 'side-left.svg'],
  ['Vector_48.svg', 'side-right.svg'],
  ['flap-top.svg', 'flap-top.svg'],
  ['flap-bottom.svg', 'flap-bottom.svg'],
];

function prepareEnvelopeSvg(raw) {
  return raw
    .replaceAll('#FEF9F3', '#fef9f3')
    .replaceAll('#66000E', '#e79bb8')
    .replace(
      /stroke="#e79bb8"/g,
      'stroke="#e79bb8" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"'
    );
}

function recolorWaxSeal() {
  const src = path.join(sourcesDir, 'seal-wax-source.png');
  const out = path.join(outDir, 'seal-wax.png');
  const tmpA = path.join(outDir, '_seal_a.png');
  const tmpG = path.join(outDir, '_seal_g.png');
  const tmpC = path.join(outDir, '_seal_c.png');

  if (!fs.existsSync(src)) {
    throw new Error(`Missing wax seal source: ${src}`);
  }

  execSync(
    `magick "${src}" -alpha on -fuzz 10% -transparent black "${tmpA}"`,
    { stdio: 'inherit' }
  );
  execSync(`magick "${tmpA}" -alpha off -colorspace gray "${tmpG}"`, { stdio: 'inherit' });
  execSync(
    `magick "${tmpG}" \\( -size 256x1 gradient:'${WAX_GRADIENT}' \\) -clut "${tmpC}"`,
    { stdio: 'inherit' }
  );
  execSync(
    `magick "${tmpC}" "${tmpA}" -compose CopyOpacity -composite "${out}"`,
    { stdio: 'inherit' }
  );

  for (const f of [tmpA, tmpG, tmpC]) fs.unlinkSync(f);
}

fs.mkdirSync(outDir, { recursive: true });

for (const [srcName, destName] of svgFiles) {
  const raw = fs.readFileSync(path.join(sourcesDir, srcName), 'utf8');
  fs.writeFileSync(path.join(outDir, destName), prepareEnvelopeSvg(raw));
}

recolorWaxSeal();

console.log('Envelope assets prepared in public/assets/envelope/');
