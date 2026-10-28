const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const svgContent = `
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#059669"/>
      <stop offset="100%" stop-color="#0d9488"/>
    </linearGradient>
    <filter id="shadow" x="0" y="8" width="512" height="512" filterUnits="userSpaceOnUse">
      <feDropShadow dx="0" dy="16" stdDeviation="24" flood-color="#047857" flood-opacity="0.35"/>
    </filter>
  </defs>

  <!-- Background Base with Rounded Corners -->
  <rect x="24" y="24" width="464" height="464" rx="108" fill="url(#bgGrad)"/>
  <rect x="24" y="24" width="464" height="464" rx="108" stroke="white" stroke-width="4" stroke-opacity="0.2"/>

  <!-- Icon: Store + Book Motif -->
  <g transform="translate(106, 106)" stroke="white" stroke-width="22" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <!-- Atap Toko -->
    <path d="M20 100 L150 25 L280 100 Z" fill="white" fill-opacity="0.15"/>
    <!-- Tiang & Dinding -->
    <path d="M40 100 L40 260 L260 260 L260 100"/>
    <!-- Pintu Kasir / Buku -->
    <path d="M100 260 L100 160 L200 160 L200 260"/>
    <!-- Simbol Kas / Rupiah / Checkmark -->
    <circle cx="150" cy="95" r="16" fill="white"/>
    <path d="M125 210 L145 230 L175 190" stroke="#34d399" stroke-width="20"/>
  </g>
</svg>
`;

const publicDir = path.join(__dirname, '..', 'public');

async function run() {
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent.trim());
  console.log('Created icon.svg');

  const svgBuffer = Buffer.from(svgContent);

  // icon-192.png
  await sharp(svgBuffer).resize(192, 192).png().toFile(path.join(publicDir, 'icon-192.png'));
  console.log('Created icon-192.png');

  // icon-512.png
  await sharp(svgBuffer).resize(512, 512).png().toFile(path.join(publicDir, 'icon-512.png'));
  console.log('Created icon-512.png');

  // apple-touch-icon.png
  await sharp(svgBuffer).resize(180, 180).png().toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('Created apple-touch-icon.png');

  // maskable 512 with safe padding
  const maskableSvg = `
  <svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="512" height="512" fill="#059669"/>
    <g transform="translate(106, 106)" stroke="white" stroke-width="22" stroke-linecap="round" stroke-linejoin="round" fill="none">
      <path d="M20 100 L150 25 L280 100 Z" fill="white" fill-opacity="0.15"/>
      <path d="M40 100 L40 260 L260 260 L260 100"/>
      <path d="M100 260 L100 160 L200 160 L200 260"/>
      <circle cx="150" cy="95" r="16" fill="white"/>
      <path d="M125 210 L145 230 L175 190" stroke="#34d399" stroke-width="20"/>
    </g>
  </svg>
  `;
  await sharp(Buffer.from(maskableSvg)).resize(512, 512).png().toFile(path.join(publicDir, 'icon-maskable-512.png'));
  console.log('Created icon-maskable-512.png');

  console.log('ALL PWA ICONS GENERATED SUCCESSFULLY!');
}

run().catch(console.error);
