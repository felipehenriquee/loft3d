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

// Renderização sob demanda: desenhar WebGL + as duas camadas de botões HTML a 60fps com a cena
// parada deixava o PC travando depois de um tempo com a página aberta. Agora só desenha enquanto
// a câmera se move (controls.update() devolve true, inclusive no damping e nas animações do gsap)
// ou durante uma janela de tempo depois de alguma interação/carregamento.
let renderizarAte = 0;

export function pedirRender(duracaoMs = 1000) {
	renderizarAte = Math.max(renderizarAte, performance.now() + duracaoMs);
}

['pointerdown', 'pointermove', 'pointerup', 'click', 'wheel', 'keydown'].forEach(function (tipoEvento) {
	window.addEventListener(tipoEvento, function () { pedirRender(); }, { passive: true });
});

// Todo carregamento de modelo passa por aqui: depois que a peça entra na cena ainda vem a
// animação de câmera (gsap), então garante render por um tempo após o callback
const carregaOriginal = loader.load.bind(loader);
loader.load = function (url, aoCarregar, aoProgredir, aoFalhar) {
	return carregaOriginal(url, function (gltf) {
		aoCarregar(gltf);
		pedirRender(1500);
	}, aoProgredir, aoFalhar);
};

// Tira o objeto da cena e libera geometria/material/texturas da GPU — só scene.remove deixava
// tudo alocado, e a memória crescia a cada peça trocada/apagada. Aceita o objeto ou o id dele.
export function removeDaCena(objetoOuId) {
	const objeto = typeof objetoOuId === 'number' ? scene.getObjectById(objetoOuId) : objetoOuId;
	if (!objeto) return;

	scene.remove(objeto);
	objeto.traverse(function (filho) {
		if (filho.geometry) filho.geometry.dispose();
		if (!filho.material) return;
		const materiais = Array.isArray(filho.material) ? filho.material : [filho.material];
		materiais.forEach(function (material) {
			Object.values(material).forEach(function (valor) {
				if (valor && valor.isTexture) valor.dispose();
			});
			material.dispose();
		});
	});
	pedirRender();
}

window.addEventListener('resize', function () {
	var width = tamanhoScene;
	var height = window.innerHeight;
	renderer.setSize(width, height)
	camera.aspect = width / height;
	camera.updateProjectionMatrix();
	pedirRender();
})

function animate() {
	const cameraMudou = controls.update();
	if (!cameraMudou && performance.now() > renderizarAte) return;

	labelRenderer.render(scene, camera);
	botoesRenderer.render(scene, camera);
	renderer.render(scene, camera);
}

pedirRender();
renderer.setAnimationLoop(animate);
