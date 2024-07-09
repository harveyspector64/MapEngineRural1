// main.js

import MapGenerator from './src/core/MapGenerator.js';
import Renderer from './src/rendering/Renderer.js';
import { TILES } from './src/features/TerrainGenerator.js';

const canvas = document.getElementById('mapCanvas');
const renderer = new Renderer(canvas);

async function init() {
    console.log('Initializing...');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const mapWidth = Math.ceil(canvas.width / renderer.tileSize);
    const mapHeight = Math.ceil(canvas.height / renderer.tileSize);

    // Load all necessary sprites
    const tileTypes = [...Object.values(TILES), 'road', 'barn', 'silo'];
    await renderer.loadSprites(tileTypes);

    const mapGenerator = new MapGenerator(mapWidth, mapHeight);
    const { terrain, structures } = mapGenerator.generate();

    console.log('Rendering map...');
    renderer.render(terrain);
    
    console.log('Map generated with dimensions:', mapWidth, 'x', mapHeight);
    console.log('Structures:', structures);
}

window.addEventListener('load', init);
window.addEventListener('resize', init);

console.log('main.js loaded');
