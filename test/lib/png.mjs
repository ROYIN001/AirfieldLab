// Reads an 8-bit greyscale, non-interlaced PNG (the land-use maps in data/) with nothing but node:zlib, so a Node test
// can see the same class of every cell as the page does.
import zlib from 'node:zlib';

export function readGray(buf) {
  if (buf.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') throw new Error('not a PNG file');
  let o = 8, w = 0, h = 0;
  const idat = [];
  while (o < buf.length) {
    const len = buf.readUInt32BE(o), type = buf.toString('latin1', o + 4, o + 8), data = buf.subarray(o + 8, o + 8 + len);
    if (type === 'IHDR') {
      w = data.readUInt32BE(0); h = data.readUInt32BE(4);
      if (data[8] !== 8 || data[9] !== 0 || data[12] !== 0) throw new Error('only an 8-bit greyscale, non-interlaced PNG can be read');
    } else if (type === 'IDAT') idat.push(data);
    else if (type === 'IEND') break;
    o += 12 + len;
  }
  const raw = zlib.inflateSync(Buffer.concat(idat)), out = new Uint8Array(w * h);
  if (raw.length !== h * (w + 1)) throw new Error(`PNG data is ${raw.length} bytes, not ${h * (w + 1)}`);
  for (let y = 0; y < h; y++) {
    const filter = raw[y * (w + 1)], r = y * (w + 1) + 1, d = y * w;
    for (let x = 0; x < w; x++) {
      const a = x ? out[d + x - 1] : 0, b = y ? out[d - w + x] : 0, c = x && y ? out[d - w + x - 1] : 0;
      let p;
      if (filter === 0) p = 0;
      else if (filter === 1) p = a;
      else if (filter === 2) p = b;
      else if (filter === 3) p = (a + b) >> 1;
      else if (filter === 4) { const pa = Math.abs(b - c), pb = Math.abs(a - c), pc = Math.abs(a + b - 2 * c); p = pa <= pb && pa <= pc ? a : pb <= pc ? b : c; }
      else throw new Error(`PNG filter ${filter} in row ${y}`);
      out[d + x] = (raw[r + x] + p) & 255;
    }
  }
  return { w, h, data: out };
}
