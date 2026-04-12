const sharp = require('/usr/lib/node_modules/openclaw/node_modules/sharp');
async function check() {
  const meta = await sharp('public/assets/videos/sky_to_city_frames/frame_000.webp').metadata();
  console.log(JSON.stringify(meta, null, 2));
}
check();
