import TerrainGenerator from './src/features/TerrainGenerator.js';
import Renderer from './src/rendering/Renderer.js';
import StructureGenerator from './src/features/StructureGenerator.js';
import RoadGenerator from './src/features/RoadGenerator.js';  // Import RoadGenerator
import { TILES } from './src/features/TerrainGenerator.js';

const canvas = document.getElementById('mapCanvas');
const renderer = new Renderer(canvas);

async function init() {
    canvas.width = 300;  // Smaller width for testing
    canvas.height = 200;  // Smaller height for testing

    const mapWidth = Math.ceil(canvas.width / renderer.tileSize);
    const mapHeight = Math.ceil(canvas.height / renderer.tileSize);

    await renderer.loadSprites(Object.values(TILES).concat(['barn', 'silo']));

    const terrainGenerator = new TerrainGenerator(mapWidth, mapHeight);
    const terrain = terrainGenerator.generate();

    const roadGenerator = new RoadGenerator(terrain);  // Initialize RoadGenerator
    roadGenerator.generateRoads();  // Generate roads

    const structureGenerator = new StructureGenerator(terrain);
    const structures = structureGenerator.generate();

    renderer.render(terrain);

    console.log('Map generated with dimensions:', mapWidth, 'x', mapHeight);
    console.log('Structures:', structures);
}

window.addEventListener('load', init);
window.addEventListener('resize', init);
