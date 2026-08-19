import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer.js';

// Aberto via QR Code: mostra só o móvel montado + botão de RA, sem edição
export const receitaURL = new URLSearchParams(window.location.search).get('m');
export const modoVisualizacao = !!receitaURL;

const tamanhoMenuLateral = modoVisualizacao ? 0 : 400;
export const tamanhoScene = window.innerWidth - tamanhoMenuLateral;

// Configurando a cena
export const scene = new THREE.Scene();
scene.background = new THREE.Color(0xE5E5E5)

// Camera
export const camera = new THREE.PerspectiveCamera(75, tamanhoScene / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 5);

// Renderizador
export const renderer = new THREE.WebGLRenderer({ antialias: true });
export const labelRenderer = new CSS2DRenderer();
export const botoesRenderer = new CSS3DRenderer();

// Tamanho da tela
renderer.setSize(tamanhoScene, window.innerHeight);
botoesRenderer.setSize(tamanhoScene, window.innerHeight);
botoesRenderer.domElement.style.position = 'absolute';
botoesRenderer.domElement.style.top = '0px';

// Linkando o renderizador
document.body.appendChild(renderer.domElement);
document.body.appendChild(labelRenderer.domElement);
document.body.appendChild(botoesRenderer.domElement);

// camera rotacao
export const controls = new OrbitControls(camera, botoesRenderer.domElement);

controls.maxPolarAngle = Math.PI / 2;
controls.maxZoom = 0;
controls.zoomSpeed = 0.5;
controls.min = 7;
controls.minAzimuthAngle = -Math.PI / 2; // radians
controls.maxAzimuthAngle = Math.PI / 2
controls.enableDamping = true;
controls.dampingFactor = 0.1;
controls.smoothZoom = true;
controls.update();

// melhorar apresentação do modelo
const pmremGenerator = new THREE.PMREMGenerator(renderer);
scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
scene.updateMatrixWorld(true);

// Instanciando o loader
export const loader = new GLTFLoader();
export const raycaster = new THREE.Raycaster();
export const pointer = new THREE.Vector2();

window.addEventListener('resize', function () {
	var width = tamanhoScene;
	var height = window.innerHeight;
	renderer.setSize(width, height)
	camera.aspect = width / height;
	camera.updateProjectionMatrix;
})

function animate() {
	controls.update();
	labelRenderer.render(scene, camera);
	botoesRenderer.render(scene, camera);
	renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);
