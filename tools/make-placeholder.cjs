const sharp = require('C:/Program Files/DSH Desktop/resources/app/node_modules/sharp');
const svg = `<svg width="180" height="360" xmlns="http://www.w3.org/2000/svg">
<rect x="12" y="12" width="156" height="336" fill="#111617" stroke="#ffb43a" stroke-width="2" stroke-dasharray="5 5"/>
<text x="90" y="180" fill="#ffb43a" font-size="16" text-anchor="middle" font-family="sans-serif">NO IMAGE</text>
</svg>`;
sharp(Buffer.from(svg)).webp({ quality: 80 }).toFile('build/app/assets/operators/_placeholder.webp').then(() => console.log('ok'));
