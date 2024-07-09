// main.js

import MapGenerator from './src/core/MapGenerator.js';
import Renderer from './src/rendering/Renderer.js';
import { TILES } from './src/features/TerrainGenerator.js';

const canvas = document.getElementById('mapCanvas');
const renderer = new Renderer(canvas);

async function init() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const mapWidth = Math.ceil(canvas.width / renderer.tileSize);
    const mapHeight = Math.ceil(canvas.height / renderer.tileSize);

    await renderer.loadSprites(Object.values(TILES).concat(['barn', 'silo', 'road']));

    const mapGenerator = new MapGenerator(mapWidth, mapHeight);
    const { terrain, structures, roads } = mapGenerator.generate();

    renderer.render(terrain, roads);
    
    console.log('Map generated with dimensions:', mapWidth, 'x', mapHeight);
    console.log('Structures:', structures);
}

window.addEventListener('load', init);
window.addEventListener('resize', init);
