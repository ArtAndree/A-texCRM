import { readdir, readFile, mkdir, writeFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { deflateRawSync } from 'node:zlib';

const root = fileURLToPath(new URL('../', import.meta.url));
const entries = ['src', 'tests', 'scripts', '.github', 'index.html', 'package.json',
  'package-lock.json', 'vite.config.js', '.gitignore', '.editorconfig', 'README.md'];
const files = [];

async function collect(relative) {
  const absolute = path.join(root, relative);
  if ((await stat(absolute)).isFile()) {
    files.push(relative);
    return;
  }
  for (const item of await readdir(absolute, { withFileTypes: true })) {
    if (item.isDirectory() || item.isFile()) await collect(relative + '/' + item.name);
  }
}

const crcTable = Array.from({ length: 256 }, (_, n) => {
  for (let bit = 0; bit < 8; bit++) n = n & 1 ? 0xedb88320 ^ (n >>> 1) : n >>> 1;
  return n >>> 0;
});
function crc32(data) {
  let crc = 0xffffffff;
  for (const byte of data) crc = crcTable[(crc ^ byte) & 255] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

// Standard ZIP with DEFLATE, UTF-8 names and a fixed timestamp; no external archiver needed.
const local = [];
const central = [];
let offset = 0;
for (const entry of entries) await collect(entry);
for (const relative of files.sort()) {
  const name = Buffer.from(relative);
  const data = await readFile(path.join(root, relative));
  const compressed = deflateRawSync(data);
  const crc = crc32(data);
  const header = Buffer.alloc(30);
  header.writeUInt32LE(0x04034b50, 0);
  header.writeUInt16LE(20, 4);
  header.writeUInt16LE(0x800, 6);
  header.writeUInt16LE(8, 8);
  header.writeUInt16LE(33, 12); // 1980-01-01
  header.writeUInt32LE(crc, 14);
  header.writeUInt32LE(compressed.length, 18);
  header.writeUInt32LE(data.length, 22);
  header.writeUInt16LE(name.length, 26);
  local.push(header, name, compressed);

  const directory = Buffer.alloc(46);
  directory.writeUInt32LE(0x02014b50, 0);
  directory.writeUInt16LE(20, 4);
  header.copy(directory, 6, 4, 28);
  directory.writeUInt32LE(offset, 42);
  central.push(directory, name);
  offset += header.length + name.length + compressed.length;
}
const directory = Buffer.concat(central);
const end = Buffer.alloc(22);
end.writeUInt32LE(0x06054b50, 0);
end.writeUInt16LE(files.length, 8);
end.writeUInt16LE(files.length, 10);
end.writeUInt32LE(directory.length, 12);
end.writeUInt32LE(offset, 16);
const output = path.join(root, 'release', 'crm-github-ready.zip');
await mkdir(path.dirname(output), { recursive: true });
await writeFile(output, Buffer.concat([...local, directory, end]));
console.log(`Created ${output} (${files.length} source files; no node_modules or dist).`);
