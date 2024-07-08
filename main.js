// main.js

import TerrainGenerator from './src/features/TerrainGenerator.js';
import Renderer from './src/rendering/Renderer.js';
import StructureGenerator from './src/features/StructureGenerator.js';
import { TILES } from './src/features/TerrainGenerator.js';

const canvas = document.getElementById('mapCanvas');
const renderer = new Renderer(canvas);

function getDeviceZoom() {
    const ua = navigator.userAgent;
    if (/iPad|iPhone|iPod/.test(ua) && !window.MSStream) {
        return 1.5; // Adjust this value to fine-tune the zoom level on iOS
    }
    return 1.0;
}

async function init() {
    const zoom = getDeviceZoom();
    canvas.width = window.innerWidth * zoom;
    canvas.height = window.innerHeight * zoom;

    const mapWidth = Math.ceil(canvas.width / renderer.tileSize);
    const mapHeight = Math.ceil(canvas.height / renderer.tileSize);

    await renderer.loadSprites(Object.values(TILES).concat(['barn', 'silo']));

    const terrainGenerator = new TerrainGenerator(mapWidth, mapHeight);
    const terrain = terrainGenerator.generate();

    const structureGenerator = new StructureGenerator(terrain);
    const structures = structureGenerator.generate();

    renderer.render(terrain);

    console.log('Map generated with dimensions:', mapWidth, 'x', mapHeight);
    console.log('Structures:', structures);
}

window.addEventListener('load', init);
window.addEventListener('resize', init);
