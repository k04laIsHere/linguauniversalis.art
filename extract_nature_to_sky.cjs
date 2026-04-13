const sharp = require('/usr/lib/node_modules/openclaw/node_modules/sharp');
const fs = require('fs');
const path = require('path');

async function extractNatureToSky() {
  const inputPath = '/home/andrew/Downloads/assets_new/NatureToSky.webp';
  const outputDir = '/home/andrew/.openclaw/workspace/public/assets/videos/nature_to_sky_frames';

  if (!fs.existsSync(outputDir)){
      fs.mkdirSync(outputDir, { recursive: true });
  }

  try {
    const image = sharp(inputPath, { animated: true });
    const metadata = await image.metadata();
    const pages = metadata.pages || 1;

    console.log(`Extracting ${pages} NatureToSky frames...`);

    for (let i = 0; i < pages; i++) {
      await sharp(inputPath, { page: i })
        .webp({ quality: 90, effort: 6 })
        .toFile(path.join(outputDir, `frame_${i.toString().padStart(3, '0')}.webp`));
    }
    console.log('Done!');
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

extractNatureToSky();
