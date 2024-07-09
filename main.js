import TerrainGenerator from './src/features/TerrainGenerator.js';
import Renderer from './src/rendering/Renderer.js';
import StructureGenerator from './src/features/StructureGenerator.js';
import RoadGenerator from './src/features/RoadGenerator.js';
import { TILES } from './src/features/TerrainGenerator.js';

const canvas = document.getElementById('mapCanvas');
const renderer = new Renderer(canvas);

async function init() {
    try {
        console.log("Initializing...");
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const mapWidth = Math.ceil(canvas.width / renderer.tileSize);
        const mapHeight = Math.ceil(canvas.height / renderer.tileSize);

        console.log("Map dimensions:", mapWidth, "x", mapHeight);

        await renderer.loadSprites(Object.values(TILES).concat(['barn', 'silo']));

        console.log("Generating terrain...");
        const terrainGenerator = new TerrainGenerator(mapWidth, mapHeight);
        let terrain = terrainGenerator.generate();
        console.log("Terrain generated");

        try {
            console.log("Generating roads...");
            const roadGenerator = new RoadGenerator(terrain);
            terrain = roadGenerator.generate();
            console.log("Roads generated");
        } catch (roadError) {
            console.error("Error generating roads:", roadError);
            console.log("Continuing without roads");
        }

        console.log("Generating structures...");
        const structureGenerator = new StructureGenerator(terrain);
        const structures = structureGenerator.generate();
        console.log("Structures generated");

        console.log("Rendering map...");
        renderer.render(terrain);
        console.log("Map rendered");

        const tileCounts = Object.fromEntries(
            Object.values(TILES).map(tile => [tile, terrain.flat().filter(t => t === tile).length])
        );
        console.log("Tile counts:", tileCounts);
    } catch (error) {
        console.error("An error occurred during initialization:", error);
    }
}

window.addEventListener('load', init);
