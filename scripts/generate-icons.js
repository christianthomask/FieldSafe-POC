// Generates simple PWA icons using only built-in Node.js modules.
// Run: node scripts/generate-icons.js

const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

function createPNG(width, height, renderPixel) {
  // Build raw RGBA scanlines (filter byte 0 = None per row)
  const rawData = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    const rowOffset = y * (1 + width * 4);
    rawData[rowOffset] = 0; // filter: None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = renderPixel(x, y, width, height);
      const px = rowOffset + 1 + x * 4;
      rawData[px] = r;
      rawData[px + 1] = g;
      rawData[px + 2] = b;
      rawData[px + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);

  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const typeAndData = Buffer.concat([Buffer.from(type, "ascii"), data]);
    const crc = crc32(typeAndData);
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc >>> 0);
    return Buffer.concat([len, typeAndData, crcBuf]);
  }

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  return Buffer.concat([
    signature,
    chunk("IHDR", ihdr),
    chunk("IDAT", compressed),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// CRC32 lookup table
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}
function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// Render function: navy background with orange diamond + white "F"
function renderPixel(x, y, w, h) {
  const cx = w / 2;
  const cy = h / 2;
  const nx = (x - cx) / cx;
  const ny = (y - cy) / cy;

  // Navy background
  const navy = [30, 41, 59, 255];
  // Orange
  const orange = [249, 115, 22, 255];
  // White
  const white = [255, 255, 255, 255];

  // Diamond shape (rotated square)
  const diamondSize = 0.55;
  const inDiamond = Math.abs(nx) + Math.abs(ny) < diamondSize;

  // "F" letterform (simplified block letter)
  const fScale = w;
  const fx = x / fScale;
  const fy = y / fScale;

  // F positioned in center of diamond
  const fLeft = 0.38;
  const fRight = 0.62;
  const fTop = 0.30;
  const fBottom = 0.70;
  const stemWidth = 0.06;
  const barHeight = 0.055;

  const inStem = fx >= fLeft && fx <= fLeft + stemWidth && fy >= fTop && fy <= fBottom;
  const inTopBar = fy >= fTop && fy <= fTop + barHeight && fx >= fLeft && fx <= fRight;
  const inMidBar = fy >= 0.465 && fy <= 0.465 + barHeight && fx >= fLeft && fx <= fRight - 0.05;

  const inF = inStem || inTopBar || inMidBar;

  if (inDiamond && inF) return white;
  if (inDiamond) return orange;

  // Rounded corners for the icon (mask outside a circle)
  const cornerRadius = 0.18;
  const ax = Math.abs(nx);
  const ay = Math.abs(ny);
  const limit = 1.0 - cornerRadius;
  if (ax > limit && ay > limit) {
    const dx = ax - limit;
    const dy = ay - limit;
    if (Math.sqrt(dx * dx + dy * dy) > cornerRadius) {
      return [0, 0, 0, 0]; // transparent
    }
  }

  return navy;
}

// Generate icons
const publicDir = path.join(__dirname, "..", "public");

for (const size of [192, 512]) {
  const png = createPNG(size, size, renderPixel);
  const outPath = path.join(publicDir, `icon-${size}.png`);
  fs.writeFileSync(outPath, png);
  console.log(`Created ${outPath} (${png.length} bytes)`);
}

// Also create a simple favicon (32x32)
const favicon = createPNG(32, 32, renderPixel);
fs.writeFileSync(path.join(publicDir, "favicon.png"), favicon);
console.log(`Created favicon.png (${favicon.length} bytes)`);
