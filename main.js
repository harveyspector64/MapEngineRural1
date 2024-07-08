// File: main.js
import MapGenerator from './src/core/MapGenerator.js';
import Renderer from './src/rendering/Renderer.js';

const canvas = document.getElementById('mapCanvas');
const mapGenerator = new MapGenerator(50, 50); // Adjust size as needed
const renderer = new Renderer(canvas);

function generateAndRenderMap() {
    const { terrain, structures } = mapGenerator.generate();
    renderer.render(terrain);
    console.log('Structures:', structures);
}

document.getElementById('generateButton').addEventListener('click', generateAndRenderMap);

// Initial generation
generateAndRenderMap();
