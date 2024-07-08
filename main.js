import TerrainGenerator from './src/features/TerrainGenerator.js';
import Renderer from './src/rendering/Renderer.js';
import { TILES } from './src/features/TerrainGenerator.js';

const canvas = document.getElementById('mapCanvas');
const renderer = new Renderer(canvas);

async function init() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const mapWidth = Math.ceil(canvas.width / renderer.tileSize);
    const mapHeight = Math.ceil(canvas.height / renderer.tileSize);

    await renderer.loadSprites(Object.values(TILES));

    const terrainGenerator = new TerrainGenerator(mapWidth, mapHeight);
    const terrain = terrainGenerator.generate();

    renderer.render(terrain);
}

window.addEventListener('load', init);
window.addEventListener('resize', init);
