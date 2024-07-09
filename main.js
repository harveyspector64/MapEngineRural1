import TerrainGenerator from './src/features/TerrainGenerator.js';
import Renderer from './src/rendering/Renderer.js';
import RoadGenerator from './src/features/RoadGenerator.js';
import KeyPointGenerator from './src/features/KeyPointGenerator.js';
import SuitabilityMapGenerator from './src/features/SuitabilityMapGenerator.js';
import { TILES } from './src/features/TerrainGenerator.js';

const canvas = document.getElementById('mapCanvas');
const renderer = new Renderer(canvas);

async function init() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const mapWidth = Math.ceil(canvas.width / renderer.tileSize);
    const mapHeight = Math.ceil(canvas.height / renderer.tileSize);

    await renderer.loadSprites(Object.values(TILES).concat(['barn', 'silo']));

    const terrainGenerator = new TerrainGenerator(mapWidth, mapHeight);
    const terrain = terrainGenerator.generate();

    const keyPointGenerator = new KeyPointGenerator(terrain);
    const keyPoints = keyPointGenerator.generateKeyPoints(5); // Adjust number of key points as needed

    const suitabilityMapGenerator = new SuitabilityMapGenerator(terrain);
    const suitabilityMap = suitabilityMapGenerator.generateSuitabilityMap();

    const roadGenerator = new RoadGenerator(terrain, suitabilityMap);
    roadGenerator.generateRoads(keyPoints);

    renderer.render(terrain);

    console.log('Map generated with dimensions:', mapWidth, 'x', mapHeight);
}

window.addEventListener('load', init);
window.addEventListener('resize', init);
