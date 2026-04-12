const sharp = require('/usr/lib/node_modules/openclaw/node_modules/sharp');
const fs = require('fs');
const path = require('path');

async function extractHighQuality() {
  const inputPath = '/home/andrew/Downloads/assets_new/SkyToCity.webp';
  const outputDir = '/home/andrew/.openclaw/workspace/public/assets/videos/sky_to_city_frames';

  try {
    const image = sharp(inputPath, { animated: true });
    const metadata = await image.metadata();
    const pages = metadata.pages || 1;

    console.log(`Re-extracting ${pages} frames with high quality...`);

    for (let i = 0; i < pages; i++) {
      await sharp(inputPath, { page: i })
        .webp({ quality: 90, effort: 6 }) // High quality, high compression effort
        .toFile(path.join(outputDir, `frame_${i.toString().padStart(3, '0')}.webp`));
    }
    console.log('Done!');
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

extractHighQuality();
