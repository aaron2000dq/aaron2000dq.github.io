import { webkit } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const SIZE = 1254;
const TILE_SIZE = 256;
const outputDir = path.resolve("artifacts/rehearsal-map-sources");

const maps = [
  { id: "01-aicheng-south", center: { latitude: 30.273408, longitude: 119.990802 } },
  { id: "02-kekai-corner", center: { latitude: 30.273452, longitude: 119.989613 } },
  { id: "03-chuangjing-north", center: { latitude: 30.275758, longitude: 119.991716 } },
  { id: "04-aicheng-east", center: { latitude: 30.274442, longitude: 119.993348 } },
  {
    id: "05-fuli-north-four-gates",
    center: { latitude: 30.27548, longitude: 119.9901 },
    zoom: 18,
  },
];

function mercator(point, zoom) {
  const scale = TILE_SIZE * 2 ** zoom;
  const latitude = Math.max(-85.0511, Math.min(85.0511, point.latitude));
  return {
    x: ((point.longitude + 180) / 360) * scale,
    y:
      ((1 - Math.asinh(Math.tan((latitude * Math.PI) / 180)) / Math.PI) / 2) *
      scale,
  };
}

await mkdir(outputDir, { recursive: true });
const browser = await webkit.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: SIZE, height: SIZE } });

for (const map of maps) {
  const zoom = map.zoom ?? 17;
  const center = mercator(map.center, zoom);
  const topLeft = { x: center.x - SIZE / 2, y: center.y - SIZE / 2 };
  const tiles = [];
  const minX = Math.floor(topLeft.x / TILE_SIZE);
  const maxX = Math.floor((topLeft.x + SIZE) / TILE_SIZE);
  const minY = Math.floor(topLeft.y / TILE_SIZE);
  const maxY = Math.floor((topLeft.y + SIZE) / TILE_SIZE);
  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      tiles.push({
        url: `https://tile.openstreetmap.org/${zoom}/${x}/${y}.png`,
        x: x * TILE_SIZE - topLeft.x,
        y: y * TILE_SIZE - topLeft.y,
      });
    }
  }

  await page.setContent(`<!doctype html><html><style>
    *{box-sizing:border-box}body{margin:0;background:#eee}
    #map{position:relative;width:${SIZE}px;height:${SIZE}px;overflow:hidden;background:#eee}
    img{position:absolute;width:${TILE_SIZE + 1}px;height:${TILE_SIZE + 1}px}
    .caption{position:absolute;left:24px;bottom:20px;padding:8px 12px;background:#fffc;
      color:#222;font:15px Georgia,serif;border:1px solid #777}
  </style><div id="map">
    ${tiles.map((tile) => `<img src="${tile.url}" style="left:${tile.x}px;top:${tile.y}px">`).join("")}
    <div class="caption">REAL MAP SOURCE · © OpenStreetMap contributors</div>
  </div></html>`);
  await page.waitForFunction(() => [...document.images].every((image) => image.complete));
  await page.locator("#map").screenshot({ path: path.join(outputDir, `${map.id}.png`) });
}

await browser.close();
