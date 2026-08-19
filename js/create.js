
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import { Objetos } from './objects.js';
import { qrcode } from './../src/qrcode/qrcode.js';
import '@google/model-viewer';

// Estado compartilhado pela lógica de montagem/seleção/câmera. Consolidado num único objeto
// (em vez de dezenas de variáveis globais soltas) pra deixar explícito o que é lido/escrito
// pelas funções abaixo — isso já foi causa direta de bugs sutis nesse arquivo.
const state = {
	groundIds: [],
	topIds: [],
	groundButtons: [],
	topButtons: [],
	selectedColor: "#ffffff",
	selectedDirectionX: 0,
	selectedDirectionY: 0,
	selectedObjectId: "",
	hoveredObjectId: "",
	isAddingModule: false,
	selectedSide: undefined,
	selectedModel: undefined,
	selectedIndex: undefined,
	previousHoverIndex: undefined,
	totalWidth: 0,
	totalHeight: 0,
	totalDepth: 0,
	cameraTargetX: 0,
	cameraTargetY: 0,
	cameraTargetZ: 0,
	minX: 10,
	maxX: -10,
	itemCount: 0,
	selectedPieceInfo: undefined,
	assemblySteps: [],
	lastArBlobUrl: null,
	isArModelReady: false
};

// Aberto via QR Code: mostra só o móvel montado + botão de RA, sem edição
const receitaURL = new URLSearchParams(window.location.search).get('m');
const modoVisualizacao = !!receitaURL;

const tamanhoMenuLateral = modoVisualizacao ? 0 : 400;
let tamanhoScene = window.innerWidth - tamanhoMenuLateral;

// Configurando a cena
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xE5E5E5)

// Camera
const camera = new THREE.PerspectiveCamera(75, tamanhoScene / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 5);

// Renderizador
const renderer = new THREE.WebGLRenderer({ antialias: true });
let labelRenderer = new CSS2DRenderer();
let botoesRenderer = new CSS3DRenderer();

// Tamanho da tela
renderer.setSize(tamanhoScene, window.innerHeight);
botoesRenderer.setSize(tamanhoScene, window.innerHeight);
botoesRenderer.domElement.style.position = 'absolute';
botoesRenderer.domElement.style.top = '0px';

// Linkando o renderizador
document.body.appendChild(renderer.domElement);
document.body.appendChild(labelRenderer.domElement);
document.body.appendChild(botoesRenderer.domElement);

// Selo de versão, pra conferir se o site publicado já tem a última mudança
const versaoDiv = document.createElement('div');
versaoDiv.className = 'versaoApp';
versaoDiv.textContent = 'v' + __APP_VERSION__;
versaoDiv.title = 'Build: ' + __BUILD_TIME__;
document.body.appendChild(versaoDiv);

// camera rotacao
const controls = new OrbitControls(camera, botoesRenderer.domElement);

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
const loader = new GLTFLoader();
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

// adicionar primeiro cubo
const cube = new THREE.Mesh(geometry, material)

// criação menu
const menuDiv = document.createElement('div');
menuDiv.className = 'label';

// criação do cabecalho do menu
const cabecalhoDiv = document.createElement('div');
cabecalhoDiv.className = 'cabecalho';
const selectCabecalho = document.createElement('select');

const optionCabecalho = document.createElement('option');
optionCabecalho.value = "1"
optionCabecalho.innerText = "Conjunto Camponesa"
selectCabecalho.appendChild(optionCabecalho)

cabecalhoDiv.appendChild(selectCabecalho)

// criação do conteudo do menu
const conteudoDiv = document.createElement('div');

conteudoDiv.className = 'conteudo';
menuDiv.appendChild(cabecalhoDiv)
menuDiv.appendChild(conteudoDiv)
let objetos = new Objetos();
let botoes = []
let divCadaModelo = []
for (let i = 0; i < objetos.todosObjetos.length; i++) {

	const cadaModelo = document.createElement('div');
	const tituloModelo = document.createElement('h1');
	const cadaBotao = document.createElement('div');
	tituloModelo.textContent = objetos.todosObjetos[i].nomeMovel
	cadaModelo.className = 'centralizado';
	cadaBotao.className = 'centralizado';
	cadaModelo.className = 'cadaModelo';
	cadaBotao.className = 'cadaBotao';

	cadaModelo.appendChild(tituloModelo)
	cadaModelo.appendChild(cadaBotao)
	if (divCadaModelo.length == 0) {
		divCadaModelo.push({
			cadaModelo, movel: objetos.todosObjetos[i].movel,
			tipo: objetos.todosObjetos[i].tipo,
			tamanhox: objetos.todosObjetos[i].tamanhox,
			tamanhoy: objetos.todosObjetos[i].tamanhoy
		})

		conteudoDiv.appendChild(cadaModelo)
	}
	else {
		let encontrou = 0;
		for (let j = 0; j < divCadaModelo.length; j++) {
			if (divCadaModelo[j].movel == objetos.todosObjetos[i].movel) encontrou++;

		}
		if (encontrou == 0) {
			divCadaModelo.push({
				cadaModelo, movel: objetos.todosObjetos[i].movel,
				tipo: objetos.todosObjetos[i].tipo,
				tamanhox: objetos.todosObjetos[i].tamanhox,
				tamanhoy: objetos.todosObjetos[i].tamanhoy
			})
			conteudoDiv.appendChild(cadaModelo)
		}
	}
}

for (let i = 0; i < objetos.todosObjetos.length; i++) {
	const button = document.createElement('button');

	button.className = 'botaoEscolha backgroundImage';
	button.style.backgroundImage = `url('${objetos.todosObjetos[i].img}')`
	button.addEventListener('pointerdown', function (event) {
		state.selectedPieceInfo = { tipo: objetos.todosObjetos[i].tipo == "chao" ? "chao" : "cima", tamanhox: objetos.todosObjetos[i].tamanhox }
		state.selectedColor = "#E56399";
		removeButton.classList.add('hide')
		for (let i = 0; i < botoes.length; i++) {
			botoes[i].button.classList.remove('btnAtivo')
		}
		button.classList.add("btnAtivo")
		if (state.groundIds.length == 0 || state.topIds.length == 0) {
			const chaveModelo = objetos.todosObjetos[i].chave
			criaObjeto(objetos.todosObjetos[i], undefined, undefined, function (id) {
				state.assemblySteps.push({ fn: 'i', k: chaveModelo, id: id })
				atualizarModeloAR()
			})
		}
		else {
			state.selectedModel = objetos.todosObjetos[i]
			verificaPosBotoes()
		}
		state.isAddingModule = false;
		resetaCamera();

	});
	botoes.push({ button, tipo: objetos.todosObjetos[i].tipo == "chao" ? "chao" : "cima", tamanhox: objetos.todosObjetos[i].tamanhox })
	for (let j = 0; j < divCadaModelo.length; j++) {
		if (divCadaModelo[j].movel == objetos.todosObjetos[i].movel) {
			divCadaModelo[j].cadaModelo.lastChild.appendChild(button)
		}
	}
}

const menuLabel = new CSS2DObject(menuDiv);

const btnCompartilhar = document.createElement('button');
btnCompartilhar.className = 'backgroundImage btnCompartilhar ';
const botaoCompartilhar = new CSS2DObject(btnCompartilhar);

const btnVoltar = document.createElement('button');
btnVoltar.className = 'backgroundImage btnCompartilhar btnVoltar';
const botaoVoltar = new CSS2DObject(btnVoltar);

const btnRa = document.createElement('button');
btnRa.className = 'backgroundImage btnCompartilhar btnRa';
const botaoRa = new CSS2DObject(btnRa);

const removeButton = document.createElement('button');
removeButton.className = 'btnRemove backgroundImage hide';
removeButton.addEventListener('pointerdown', function (event) {
	state.selectedIndex = state.selectedIndex
	remove()
	removeButton.classList.add('hide')
});
const btnRemove = new CSS3DObject(removeButton);
btnRemove.scale.set(0.01, 0.01, 1)
btnRemove.position.setZ(0.6)

const addButton = document.createElement('button');
addButton.className = 'btnAdd backgroundImage addMain';
addButton.addEventListener('pointerdown', function (event) {
	state.selectedObjectId = state.hoveredObjectId;
});
const btnAdd = new CSS3DObject(addButton);
btnAdd.scale.set(0.01, 0.01, 1)
btnAdd.position.setZ(0.6)
btnAdd.position.setX(-1.5)


const info = document.createElement('div')
info.classList.add('infoTamanho')
const largura = document.createElement('p')
largura.innerText = "Largura: " + state.totalWidth
const altura = document.createElement('p')
altura.innerText = "Altura: " + state.totalHeight

const profundidade = document.createElement('p')
profundidade.innerText = "Profundidade: " + state.totalDepth

info.appendChild(largura)
info.appendChild(altura)
info.appendChild(profundidade)


const divInfoTamanho = new CSS2DObject(info);
divInfoTamanho.name = "infoTamanho"
scene.add(menuLabel);
scene.add(botaoCompartilhar);
scene.add(btnRemove);
scene.add(btnAdd);
scene.add(botaoVoltar);
scene.add(botaoRa);
scene.add(divInfoTamanho)

// Modo visualização (aberto via QR Code): some com toda a edição, deixa só o objeto montado e o botão de RA
if (modoVisualizacao) {
	menuDiv.classList.add('hide');
	btnCompartilhar.classList.add('hide');
	btnVoltar.classList.add('hide');
	addButton.classList.add('hide');
	info.classList.add('hide');
	// O "right: 450px" do .btnRa pressupõe os 400px do menu lateral, que aqui não existem;
	// sem isso o botão fica fora da tela em telas estreitas (celular)
	btnRa.style.right = '20px';
}

// Instantiate a loader
// Optional: Provide a DRACOLoader instance to decode compressed mesh data
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('./three/examples/js/libs/draco/');
loader.setDRACOLoader(dracoLoader);
// Load a glTF resource

const closeButton = document.createElement('button');
closeButton.textContent = "X"
closeButton.className = 'botaoFechar';
closeButton.addEventListener('pointerdown', function (event) {
	menuDiv.classList.add("hide");
});

// Modal com QR Code, exibido quando o dispositivo (desktop) não suporta WebXR
const modalQRCode = document.createElement('div');
modalQRCode.className = 'modalQRCode hide';

const modalQRCodeConteudo = document.createElement('div');
modalQRCodeConteudo.className = 'modalQRCodeConteudo';

const modalQRCodeFechar = document.createElement('button');
modalQRCodeFechar.textContent = 'X';
modalQRCodeFechar.className = 'botaoFechar';
modalQRCodeFechar.addEventListener('pointerdown', function () {
	modalQRCode.classList.add('hide');
});

const modalQRCodeTitulo = document.createElement('h2');
modalQRCodeTitulo.textContent = 'Veja em Realidade Aumentada';

const modalQRCodeTexto = document.createElement('p');
modalQRCodeTexto.textContent = 'A RA só funciona em um celular Android com Chrome. Escaneie o código abaixo para abrir esta montagem no seu celular.';

const modalQRCodeImagem = document.createElement('div');
modalQRCodeImagem.className = 'modalQRCodeImagem';

modalQRCodeConteudo.appendChild(modalQRCodeFechar);
modalQRCodeConteudo.appendChild(modalQRCodeTitulo);
modalQRCodeConteudo.appendChild(modalQRCodeTexto);
modalQRCodeConteudo.appendChild(modalQRCodeImagem);
modalQRCode.appendChild(modalQRCodeConteudo);
document.body.appendChild(modalQRCode);

function serializarMontagem() {
	return state.assemblySteps.map(function (passo) {
		return passo.fn === 'i'
			? 'i:' + passo.k
			: passo.fn + ':' + passo.k + ':' + passo.px + ':' + passo.py + ':' + passo.idx;
	}).join('|');
}

function desserializarMontagem(texto) {
	return texto.split('|').filter(Boolean).map(function (trecho) {
		const partes = trecho.split(':');
		if (partes[0] === 'i') return { fn: 'i', k: partes[1] };
		return { fn: partes[0], k: partes[1], px: Number(partes[2]), py: Number(partes[3]), idx: Number(partes[4]) };
	});
}

function abrirModalQRCode() {
	const qr = qrcode(0, 'M');
	const url = new URL(window.location.href);
	url.search = '';
	if (state.assemblySteps.length > 0) {
		url.searchParams.set('m', serializarMontagem());
	}
	qr.addData(url.toString());
	qr.make();
	modalQRCodeImagem.innerHTML = qr.createSvgTag({ cellSize: 5, margin: 8, scalable: true });
	modalQRCode.classList.remove('hide');
}

// Reconstrói, na ordem gravada, a montagem recebida por URL (usado ao abrir via QR Code)
function remontarDaURL(receita) {
	return receita.reduce(function (promessaAnterior, passo) {
		return promessaAnterior.then(function () {
			const modelo = objetos.todosObjetos.find(function (o) { return o.chave === passo.k; });
			if (!modelo) return;

			return new Promise(function (resolve) {
				if (passo.fn === 'i') {
					criaObjeto(modelo, undefined, undefined, resolve);
					return;
				}
				state.selectedModel = modelo;
				state.selectedIndex = passo.idx;
				state.selectedObjectId = passo.fn === 'c' ? state.groundIds[passo.idx] : state.topIds[passo.idx];
				if (passo.fn === 'c') {
					criaObjetoChao(modelo, passo.px, passo.py, resolve);
				} else {
					criaObjetoCima(modelo, passo.px, passo.py, passo.idx, resolve);
				}
			});
		});
	}, Promise.resolve());
}

// criaObjetos

function criaObjeto(modelo, x, y, onDone) {

	loader.load(
		// resource URL
		modelo.local,
		// called when the resource is loaded
		function (gltf) {

			scene.add(gltf.scene);
			let cube1BB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
			cube1BB.setFromObject(gltf.scene)

			gltf.scene.box3 = cube1BB;
			let tamanhox = cube1BB.max.x - cube1BB.min.x;

			state.totalWidth = (state.totalWidth + tamanhox)

			largura.innerText = "Largura: " + state.totalWidth.toFixed(2)

			handleCameraOnAdd(0);
			let tamanhoy = cube1BB.max.y - cube1BB.min.y;
			let tamanhoz = cube1BB.max.z - cube1BB.min.z;
			state.totalHeight = tamanhoy
			state.totalDepth = tamanhoz
			altura.innerText = "Altura: " + state.totalWidth.toFixed(2) + "m"
			profundidade.innerText = "Profundidade: " + state.totalDepth.toFixed(2) + "m"

			gltf.scene.userData = {
				modelo: modelo,
				centro: true,
				centroDireita: false,
				centroEsquerda: false,
				tamanho: {
					iniciox: cube1BB.min.x,
					fimx: cube1BB.max.x,
					inicioy: cube1BB.min.y,
					fimy: cube1BB.max.y,
					totalx: tamanhox,
					totaly: tamanhoy,
					totalz: tamanhoz
				},


			}

			gltf.scene.name = modelo.nome
			gltf.scene.position.setX(-1.5)
			if (modelo.tamanhoy == 1) {
				modelo.tipo == "chao" ? state.groundIds.push(gltf.scene.id) : state.topIds.push(gltf.scene.id)
				modelo.tipo == "chao" ? criaCuboCima(true) : criaCubo(true)
			}
			else {
				state.groundIds.push(gltf.scene.id)
				state.topIds.push(gltf.scene.id)

			}

			let botao = {
				direita: "",
				esquerda: "",
				cima: "",
				baixo: "",
			}
			let botaoCima = {
				direita: "",
				esquerda: "",
				cima: "",
				baixo: "",
			}

			state.groundButtons.push(botao)
			state.topButtons.push(botaoCima)

			createButtonAdd(1, 0, scene.getObjectById(state.groundIds[0]), 0, "chao")

			createButtonAdd(-1, 0, scene.getObjectById(state.groundIds[0]), 0, "chao")
			createButtonAdd(0, 1, scene.getObjectById(state.groundIds[0]), 0, "chao")
			createButtonAdd(0, -1, scene.getObjectById(state.groundIds[0]), 0, "chao")

			createButtonAdd(1, 0, scene.getObjectById(state.topIds[0]), 0, "cima")

			createButtonAdd(-1, 0, scene.getObjectById(state.topIds[0]), 0, "cima")
			createButtonAdd(0, 1, scene.getObjectById(state.topIds[0]), 0, "cima")
			if (state.groundIds.length > 0 && state.topIds.length > 0) addButton.classList.add('hide')
			if (onDone) onDone(gltf.scene.id);
		},
		// called while loading is progressing
		function (xhr) {},
		// called when loading has errors
		function (error) {}
	);

}
function criaObjetoChao(modelo, px, py, onDone) {
	loader.load(
		// resource URL
		modelo.local,
		// called when the resource is loaded
		function (gltf) {
			scene.add(gltf.scene);
			let cube2BB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
			cube2BB.setFromObject(gltf.scene)
			gltf.scene.box3 = cube2BB;
			let cubeEscolhido = scene.getObjectById(state.selectedObjectId);

			let tamanhox = cube2BB.max.x - cube2BB.min.x;
			state.totalWidth = state.totalWidth + tamanhox;

			handleCameraOnAdd(cubeEscolhido.position.x);
			largura.innerText = "Largura: " + state.totalWidth.toFixed(2) + "m"
			let tamanhoy = cube2BB.max.y - cube2BB.min.y;
			state.totalHeight = tamanhoy

			const tamanhoz = cube2BB.max.z - cube2BB.min.z;
			state.totalDepth = tamanhoz
			profundidade.innerText = "Profundidade: " + state.totalDepth.toFixed(2) + "m"
			altura.innerText = "Altura: " + state.totalHeight.toFixed(2) + "m"
			gltf.scene.position.setY(gltf.scene.position.y + (gltf.scene.position.y - cube2BB.min.y))

			gltf.scene.userData = {
				modelo,
				centro: false,
				centroDireita: false,
				centroEsquerda: false,
				tamanho: {
					iniciox: cube2BB.min.x,
					fimx: cube2BB.max.x,
					totalx: tamanhox,
					totaly: tamanhoy
				},
			}
			// direita
			if (px > 0) {

				let cubeDireita = state.groundIds[state.selectedIndex + 1] ? scene.getObjectById(state.groundIds[state.selectedIndex + 1]) : null
				if (cubeDireita && cubeDireita.name == "cubo") {
					scene.remove(cubeDireita)
				}
				state.groundIds[state.selectedIndex + 1] ? state.groundIds[state.selectedIndex + 1] = gltf.scene.id : state.groundIds.push(gltf.scene.id)

				gltf.scene.position.setX(cubeEscolhido.position.x + (cubeEscolhido.box3.max.x) + gltf.scene.box3.max.x);


				gltf.scene.userData.tamanho = {
					iniciox: cubeEscolhido.userData.tamanho.fimx,
					fimx: cubeEscolhido.userData.tamanho.fimx + tamanhox,
					inicioy: gltf.scene.box3.min.y,
					fimy: gltf.scene.box3.max.y,
					totalx: tamanhox,
					totaly: tamanhoy
				}
				gltf.scene.userData.esquerda = {
					preenchido: true,
					id: cubeEscolhido.id
				}

				cubeEscolhido.userData.direita = {
					preenchido: true,
					id: gltf.scene.id
				}
				if (!state.topIds[state.selectedIndex + 1])
					modelo.tamanhoy == 1 ? criaCuboCima(true) : state.topIds.push(gltf.scene.id);
				let botao = {
					direita: "",
					esquerda: "",
					cima: "",
					baixo: "",
				}
				let botaoCima = {
					direita: "",
					esquerda: "",
					cima: "",
					baixo: "",
				}

				state.topButtons[state.selectedIndex + 1] ? state.topButtons[state.selectedIndex + 1] = state.topButtons[state.selectedIndex + 1] : state.topButtons.push(botaoCima)
				state.groundButtons[state.selectedIndex + 1] ? state.groundButtons[state.selectedIndex + 1] = state.groundButtons[state.selectedIndex + 1] : state.groundButtons.push(botao)
				createButtonAdd(1, 0, gltf.scene, state.selectedIndex + 1, "chao")
				createButtonAdd(-1, 0, gltf.scene, state.selectedIndex + 1, "chao")
				createButtonAdd(0, 1, gltf.scene, state.selectedIndex + 1, "chao")
				createButtonAdd(0, -1, gltf.scene, state.selectedIndex + 1, "chao")

				createButtonAdd(1, 0, scene.getObjectById(state.topIds[state.selectedIndex + 1]), state.selectedIndex + 1, "cima")
				createButtonAdd(-1, 0, scene.getObjectById(state.topIds[state.selectedIndex + 1]), state.selectedIndex + 1, "cima")
				createButtonAdd(0, 1, scene.getObjectById(state.topIds[state.selectedIndex + 1]), state.selectedIndex + 1, "cima")

				//moveCamera(1)
				// esquerda
			} else if (px < 0) {
				let cubeEsquerda = state.groundIds[state.selectedIndex - 1] ? scene.getObjectById(state.groundIds[state.selectedIndex - 1]) : null
				if (cubeEsquerda && cubeEsquerda.name == "cubo") {
					scene.remove(cubeEsquerda)
				}
				state.groundIds[state.selectedIndex - 1] ? state.groundIds[state.selectedIndex - 1] = gltf.scene.id : state.groundIds.unshift(gltf.scene.id)
				gltf.scene.userData.centroEsquerda = true;
				gltf.scene.position.setX(cubeEscolhido.position.x + (cubeEscolhido.box3.min.x) + gltf.scene.box3.min.x);

				cubeEscolhido.esquerda = { preenchido: true, id: gltf.scene.id };
				gltf.scene.userData.tamanho = {
					iniciox: cubeEscolhido.box3.min.x,
					fimx: cubeEscolhido.box3.min.x - tamanhox,
					inicioy: gltf.scene.box3.min.y,
					fimy: gltf.scene.box3.max.y,
					totalx: tamanhox,
					totaly: tamanhoy
				}

				gltf.scene.userData.direita = {
					preenchido: true,
					id: cubeEscolhido.id
				}

				cubeEscolhido.userData.esquerda = {
					preenchido: true,
					id: gltf.scene.id
				}
				if (!state.topIds[state.selectedIndex - 1]) modelo.tamanhoy == 1 ? criaCuboCima(true) : state.topIds.unshift(gltf.scene.id)

				let botao = {
					direita: "",
					esquerda: "",
					cima: "",
					baixo: "",
				}

				let botaoCima = {
					direita: "",
					esquerda: "",
					cima: "",
					baixo: "",
				}

				state.groundButtons[state.selectedIndex - 1] ? botoes[state.selectedIndex - 1] = botoes[state.selectedIndex - 1] : state.groundButtons.unshift(botao)
				state.topButtons[state.selectedIndex - 1] ? state.topButtons[state.selectedIndex - 1] = state.topButtons[state.selectedIndex - 1] : state.topButtons.unshift(botaoCima)
				createButtonAdd(1, 0, gltf.scene, state.selectedIndex - 1 <= 0 ? 0 : state.selectedIndex - 1, "chao")
				createButtonAdd(-1, 0, gltf.scene, state.selectedIndex - 1 <= 0 ? 0 : state.selectedIndex - 1, "chao")
				createButtonAdd(0, 1, gltf.scene, state.selectedIndex - 1 <= 0 ? 0 : state.selectedIndex - 1, "chao")
				createButtonAdd(0, -1, gltf.scene, state.selectedIndex - 1 <= 0 ? 0 : state.selectedIndex - 1, "chao")

				createButtonAdd(1, 0, scene.getObjectById(state.topIds[state.selectedIndex - 1 >= 0 ? state.selectedIndex - 1 : 0]), state.selectedIndex - 1 >= 0 ? state.selectedIndex - 1 : 0, "cima")
				createButtonAdd(-1, 0, scene.getObjectById(state.topIds[state.selectedIndex - 1 >= 0 ? state.selectedIndex - 1 : 0]), state.selectedIndex - 1 >= 0 ? state.selectedIndex - 1 : 0, "cima")
				createButtonAdd(0, 1, scene.getObjectById(state.topIds[state.selectedIndex - 1 >= 0 ? state.selectedIndex - 1 : 0]), state.selectedIndex - 1 >= 0 ? state.selectedIndex - 1 : 0, "cima")


				//moveCamera(-1)
			} else if (py < 0) {
				gltf.scene.userData.centroDireita = cubeEscolhido.userData.centroDireita
				gltf.scene.userData.centroEsquerda = cubeEscolhido.userData.centroEsquerda
				gltf.scene.userData.centro = cubeEscolhido.userData.centro

				let cubeRemover = scene.getObjectById(state.groundIds[state.selectedIndex]);

				scene.remove(cubeRemover)
				state.groundIds[state.selectedIndex] = gltf.scene.id

				let cubeEsquerda = state.groundIds[state.selectedIndex - 1] ? scene.getObjectById(state.groundIds[state.selectedIndex - 1]) : null
				if (cubeEsquerda && cubeEsquerda.name == "cubo") {
					scene.remove(cubeEsquerda)
				}

				gltf.scene.position.setX(cubeEscolhido.position.x);

				gltf.scene.userData.tamanho = {
					iniciox: cubeEscolhido.box3.min.x,
					fimx: cubeEscolhido.box3.min.x - tamanhox,
					inicioy: gltf.scene.box3.min.y,
					fimy: gltf.scene.box3.max.y,
					totalx: tamanhox,
					totaly: tamanhoy
				}
			}
			if (onDone) onDone(gltf.scene.id);
		},
		// called while loading is progressing
		function (xhr) {},
		// called when loading has errors
		function (error) {}
	);

}

function criaObjetoCima(modelo, px, py, index, onDone) {
	loader.load(
		// resource URL
		modelo.local,
		// called when the resource is loaded
		function (gltf) {

			scene.add(gltf.scene);
			let cube1BB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
			cube1BB.setFromObject(gltf.scene)
			gltf.scene.box3 = cube1BB;
			let cubeEscolhido = scene.getObjectById(state.selectedObjectId);

			handleCameraOnAdd(cubeEscolhido.position.x);
			const tamanhox = cube1BB.max.x - cube1BB.min.x;
			const tamanhoy = cube1BB.max.y - cube1BB.min.y;
			gltf.scene.userData = {
				modelo,
				centro: false,
				centroDireita: false,
				centroEsquerda: false,
				tamanho: {
					iniciox: cube1BB.min.x,
					fimx: cube1BB.max.x,
				},
				cima: {
					preenchido: false,
					id: ""
				},
				direita: {
					preenchido: false,
					id: ""
				},
				baixo: {
					preenchido: false,
					id: ""
				},
				esquerda: {
					preenchido: false,
					id: ""
				}

			}
			// direita
			if (px > 0) {

				let cubeDireita = state.topIds[state.selectedIndex + 1] ? scene.getObjectById(state.topIds[state.selectedIndex + 1]) : null;
				gltf.scene.userData.centroDireita = true
				cubeDireita ? state.topIds[state.selectedIndex + 1] = gltf.scene.id : state.topIds.push(gltf.scene.id)
				if (cubeDireita && cubeDireita.name == "cubo") {
					scene.remove(cubeDireita)

				}
				gltf.scene.position.setX(cubeEscolhido.position.x + (cubeEscolhido.box3.max.x) + gltf.scene.box3.max.x);

				gltf.scene.userData.tamanho = {
					iniciox: cubeEscolhido.box3.max.x,
					fimx: cubeEscolhido.box3.min.x,
					inicioy: gltf.scene.box3.min.y,
					fimy: gltf.scene.box3.max.y
				}
				cubeEscolhido.direita = { preenchido: true, id: gltf.scene.id };
				if (!state.groundIds[state.selectedIndex + 1]) {
					criaCubo(true)

				}
				let botao = {
					direita: "",
					esquerda: "",
					cima: "",
					baixo: "",
				}
				let botaoCima = {
					direita: "",
					esquerda: "",
					cima: "",
					baixo: "",
				}

				state.groundButtons[state.selectedIndex + 1] ? state.groundButtons[state.selectedIndex + 1] = state.groundButtons[state.selectedIndex + 1] : state.groundButtons.push(botao)
				createButtonAdd(1, 0, scene.getObjectById(state.groundIds[state.selectedIndex + 1]), state.selectedIndex + 1, "chao")
				createButtonAdd(-1, 0, scene.getObjectById(state.groundIds[state.selectedIndex + 1]), state.selectedIndex + 1, "chao")
				createButtonAdd(0, 1, scene.getObjectById(state.groundIds[state.selectedIndex + 1]), state.selectedIndex + 1, "chao")
				createButtonAdd(0, -1, scene.getObjectById(state.groundIds[state.selectedIndex + 1]), state.selectedIndex + 1, "chao")

				state.topButtons[state.selectedIndex + 1] ? state.topButtons[state.selectedIndex + 1] = state.topButtons[state.selectedIndex + 1] : state.topButtons.push(botaoCima)
				createButtonAdd(1, 0, scene.getObjectById(state.topIds[state.selectedIndex + 1]), state.selectedIndex + 1, "cima")
				createButtonAdd(-1, 0, scene.getObjectById(state.topIds[state.selectedIndex + 1]), state.selectedIndex + 1, "cima")
				createButtonAdd(0, 1, scene.getObjectById(state.topIds[state.selectedIndex + 1]), state.selectedIndex + 1, "cima")

			}
			// esquerda
			else if (px < 0) {
				gltf.scene.userData.centroEsquerda = true

				let cubeEsquerda = state.topIds[state.selectedIndex - 1] ? scene.getObjectById(state.topIds[state.selectedIndex - 1]) : null;
				cubeEsquerda ? state.topIds[state.selectedIndex - 1] = gltf.scene.id : state.topIds.unshift(gltf.scene.id)
				if (cubeEsquerda && cubeEsquerda.name == "cubo") {
					scene.remove(cubeEsquerda)

				}
				gltf.scene.position.setX(cubeEscolhido.position.x - tamanhox);

				gltf.scene.position.setX(cubeEscolhido.position.x + (cubeEscolhido.box3.min.x) + gltf.scene.box3.min.x);

				gltf.scene.userData.tamanho = {
					iniciox: cubeEscolhido.box3.min.x,
					fimx: cubeEscolhido.box3.min.x - tamanhox,
					inicioy: gltf.scene.box3.min.y,
					fimy: gltf.scene.box3.max.y
				}
				if (!state.groundIds[state.selectedIndex - 1]) {
					criaCubo(true)

				}
				let botao = {
					direita: "",
					esquerda: "",
					cima: "",
					baixo: "",
					index: 0
				}
				let botaoCima = {
					direita: "",
					esquerda: "",
					cima: "",
					baixo: "",
					index: 0
				}

				state.groundButtons[state.selectedIndex - 1] ? state.groundButtons[state.selectedIndex - 1] = state.groundButtons[state.selectedIndex - 1] : state.groundButtons.unshift(botao)
				createButtonAdd(1, 0, scene.getObjectById(state.groundIds[state.selectedIndex - 1 >= 0 ? state.selectedIndex - 1 : 0]), state.selectedIndex - 1 >= 0 ? state.selectedIndex - 1 : 0, "chao")
				createButtonAdd(-1, 0, scene.getObjectById(state.groundIds[state.selectedIndex - 1 >= 0 ? state.selectedIndex - 1 : 0]), state.selectedIndex - 1 >= 0 ? state.selectedIndex - 1 : 0, "chao")
				createButtonAdd(0, 1, scene.getObjectById(state.groundIds[state.selectedIndex - 1 >= 0 ? state.selectedIndex - 1 : 0]), state.selectedIndex - 1 >= 0 ? state.selectedIndex - 1 : 0, "chao")
				createButtonAdd(0, -1, scene.getObjectById(state.groundIds[state.selectedIndex - 1 >= 0 ? state.selectedIndex - 1 : 0]), state.selectedIndex - 1 >= 0 ? state.selectedIndex - 1 : 0, "chao")

				state.topButtons[state.selectedIndex - 1] ? state.topButtons[state.selectedIndex - 1] = state.topButtons[state.selectedIndex - 1] : state.topButtons.unshift(botaoCima)
				createButtonAdd(1, 0, scene.getObjectById(state.topIds[state.selectedIndex - 1 >= 0 ? state.selectedIndex - 1 : 0]), state.selectedIndex - 1 >= 0 ? state.selectedIndex - 1 : 0, "cima")
				createButtonAdd(-1, 0, scene.getObjectById(state.topIds[state.selectedIndex - 1 >= 0 ? state.selectedIndex - 1 : 0]), state.selectedIndex - 1 >= 0 ? state.selectedIndex - 1 : 0, "cima")
				createButtonAdd(0, 1, scene.getObjectById(state.topIds[state.selectedIndex - 1 >= 0 ? state.selectedIndex - 1 : 0]), state.selectedIndex - 1 >= 0 ? state.selectedIndex - 1 : 0, "cima")
			}
			// cima
			else if (py > 0) {
				gltf.scene.userData.centroDireita = cubeEscolhido.userData.centroDireita
				gltf.scene.userData.centroEsquerda = cubeEscolhido.userData.centroEsquerda
				gltf.scene.userData.centro = cubeEscolhido.userData.centro

				let cubeRemover = scene.getObjectById(state.topIds[state.selectedIndex]);

				scene.remove(cubeRemover)
				state.topIds[state.selectedIndex] = gltf.scene.id
				gltf.scene.position.setX(cubeEscolhido.position.x);

				gltf.scene.userData.tamanho = {
					iniciox: cubeEscolhido.box3.min.x,
					fimx: cubeEscolhido.box3.max.x,
					inicioy: gltf.scene.box3.min.y,
					fimy: gltf.scene.box3.max.y
				}
				gltf.scene.userData.baixo = {
					preenchido: true,
					id: cubeEscolhido.id
				}

				cubeEscolhido.userData.cima = {
					preenchido: true,
					modelo: gltf.scene.id
				}
			}
			if (onDone) onDone(gltf.scene.id);
		},
		// called while loading is progressing
		function (xhr) {},
		// called when loading has errors
		function (error) {}
	);

}

// Remove da sequência gravada a peça correspondente ao objeto apagado, para o QR Code
// refletir sempre a montagem atual (não o histórico completo de tudo que já foi adicionado)
function removerDaGravacao(obj, outroObj, posicaoRemovida) {
	if (obj.name == "cubo") {
		// Removeu clicando num espaço vazio: some a peça real que estava do outro lado, e a coluna inteira é reindexada
		const idRemovido = outroObj.id;
		state.assemblySteps = state.assemblySteps
			.filter(function (passo) { return passo.id !== idRemovido; })
			.map(function (passo) {
				if (typeof passo.idx === 'number' && passo.idx > posicaoRemovida) {
					return Object.assign({}, passo, { idx: passo.idx - 1 });
				}
				return passo;
			});
	} else {
		// Removeu a peça real: ela vira um espaço vazio, sem afetar os índices das demais
		state.assemblySteps = state.assemblySteps.filter(function (passo) { return passo.id !== obj.id; });
	}
}

function remove() {
	const obj = scene.getObjectById(state.selectedObjectId);

	let outroObj = obj.userData.modelo.tipo == "chao" ? scene.getObjectById(state.topIds[state.selectedIndex]) : scene.getObjectById(state.groundIds[state.selectedIndex]);

	removerDaGravacao(obj, outroObj, state.selectedIndex);

	for (let i = 0; i < state.groundButtons.length; i++) {
		scene.getObjectById(state.groundButtons[i].direita).visible = false
		scene.getObjectById(state.groundButtons[i].esquerda).visible = false
		scene.getObjectById(state.groundButtons[i].cima).visible = false
		scene.getObjectById(state.topButtons[i].direita).visible = false
		scene.getObjectById(state.topButtons[i].esquerda).visible = false
		scene.getObjectById(state.topButtons[i].cima).visible = false

	}

	let botoesApagar = {
		direita: state.groundButtons[state.selectedIndex].direita,
		esquerda: state.groundButtons[state.selectedIndex].esquerda,
		cima: state.groundButtons[state.selectedIndex].cima,

	}
	let botoesApagarCima = {
		direita: state.topButtons[state.selectedIndex].direita,
		esquerda: state.topButtons[state.selectedIndex].esquerda,
		cima: state.topButtons[state.selectedIndex].cima,

	}


	if (obj.name == "cubo") {

		let valorSubtrair = (obj.userData.tamanho.fimx - obj.userData.tamanho.iniciox) < 0 ? (obj.userData.tamanho.fimx - obj.userData.tamanho.iniciox) * -1 : (obj.userData.tamanho.fimx - obj.userData.tamanho.iniciox)
		state.totalWidth = state.totalWidth - valorSubtrair
		largura.innerText = "Largura: " + state.totalWidth.toFixed(2) + "m"
		realocaModelo();


		scene.remove(outroObj);
		scene.remove(obj);
		scene.remove(botoesApagar.direita)
		scene.remove(botoesApagar.esquerda)
		scene.remove(botoesApagar.cima)
		scene.remove(botoesApagarCima.direita)
		scene.remove(botoesApagarCima.esquerda)
		scene.remove(botoesApagarCima.cima)

	} else {
		if (state.groundIds[state.selectedIndex] == state.topIds[state.selectedIndex]) criaCuboCima()
		obj.userData.modelo.tipo == "chao" ? criaCubo() : criaCuboCima()

		scene.remove(obj);
	}
	state.previousHoverIndex = null
	if (state.groundIds.length == 0 && state.topIds.length == 0) addButton.classList.remove('hide')

	atualizarModeloAR()
}

function realocaModelo() {

	let cubeApagar = scene.getObjectById(state.groundIds[state.selectedIndex]);
	let tamanhoApagar = cubeApagar.userData.tamanho.fimx - cubeApagar.userData.tamanho.iniciox

	if (cubeApagar.userData.centroEsquerda) {
		for (let i = state.selectedIndex; i >= 0; i--) {
			let cubeAtual = scene.getObjectById(state.groundIds[i]);
			let cubeAtualCima = scene.getObjectById(state.topIds[i]);
			if (i - 1 >= 0) {
				let cubeDireita = scene.getObjectById(state.groundIds[i + 1]);
				let cubeEsquerda = scene.getObjectById(state.groundIds[i - 1]);
				let cubeDireitaCima = scene.getObjectById(state.topIds[i + 1]);
				let cubeEsquerdaCima = scene.getObjectById(state.topIds[i - 1]);
				let cubeDireitaBotao = scene.getObjectById(state.groundButtons[i - 1].direita);
				let cubeEsquerdaBotao = scene.getObjectById(state.groundButtons[i - 1].esquerda);
				let cubeCimaBotao = scene.getObjectById(state.groundButtons[i - 1].cima);
				let cubeDireitaCimaBotao = scene.getObjectById(state.topButtons[i - 1].direita);
				let cubeEsquerdaCimaBotao = scene.getObjectById(state.topButtons[i - 1].esquerda);
				let cubeCimaCimaBotao = scene.getObjectById(state.topButtons[i - 1].cima);
				let tamanho = cubeAtual.userData.tamanho.fimx - cubeAtual.userData.tamanho.iniciox;
				let tamanhoCima = cubeAtualCima.userData.tamanho.fimx - cubeAtualCima.userData.tamanho.iniciox;
				cubeEsquerda.userData.tamanho.fimx = cubeEsquerda.userData.tamanho.fimx - tamanho;
				cubeEsquerda.userData.tamanho.iniciox = cubeEsquerda.userData.tamanho.iniciox - tamanho;
				cubeEsquerda.position.setX(cubeEsquerda.position.x - tamanhoApagar);
				cubeDireita.userData.esquerda = cubeEsquerda.userData.esquerda;

				cubeEsquerdaCima.userData.tamanho.fimx = cubeEsquerdaCima.userData.tamanho.fimx - tamanhoCima;
				cubeEsquerdaCima.userData.tamanho.iniciox = cubeEsquerdaCima.userData.tamanho.iniciox - tamanhoCima;
				cubeEsquerdaCima.position.setX(cubeEsquerdaCima.position.x - tamanhoApagar);
				cubeDireitaCima.userData.esquerda = cubeEsquerdaCima.userData.esquerda;


				cubeDireitaBotao.position.x = cubeDireitaBotao.position.x - tamanhoApagar
				cubeEsquerdaBotao.position.x = cubeEsquerdaBotao.position.x - tamanhoApagar
				cubeCimaBotao.position.x = cubeCimaBotao.position.x - tamanhoApagar


				cubeDireitaCimaBotao.position.x = cubeDireitaCimaBotao.position.x - tamanhoApagar
				cubeEsquerdaCimaBotao.position.x = cubeEsquerdaCimaBotao.position.x - tamanhoApagar
				cubeCimaCimaBotao.position.x = cubeCimaCimaBotao.position.x - tamanhoApagar
			} else {
				let cubeEsquerda = scene.getObjectById(state.groundIds[i]);
				let cubeEsquerdaCima = scene.getObjectById(state.topIds[i]);
				cubeEsquerda.userData.esquerda = cubeAtual.userData.esquerda;
				cubeEsquerdaCima.userData.esquerda = cubeAtualCima.userData.esquerda;
			}
		}
	}
	else {
		for (let i = state.selectedIndex; i < state.groundIds.length; i++) {
			let cubeAtual = scene.getObjectById(state.groundIds[i]);
			let cubeAtualCima = scene.getObjectById(state.topIds[i]);
			if (i + 1 < state.groundIds.length && i - 1 > 0) {
				let cubeDireita = scene.getObjectById(state.groundIds[i + 1]);
				let cubeDireitaCima = scene.getObjectById(state.topIds[i + 1]);
				let cubeDireitaBotao = scene.getObjectById(state.groundButtons[i + 1].direita);
				let cubeEsquerdaBotao = scene.getObjectById(state.groundButtons[i + 1].esquerda);
				let cubeCimaBotao = scene.getObjectById(state.groundButtons[i + 1].cima);
				let cubeDireitaCimaBotao = scene.getObjectById(state.topButtons[i + 1].direita);
				let cubeEsquerdaCimaBotao = scene.getObjectById(state.topButtons[i + 1].esquerda);
				let cubeCimaCimaBotao = scene.getObjectById(state.topButtons[i + 1].cima);
				let tamanho = cubeAtual.userData.tamanho.fimx - cubeAtual.userData.tamanho.iniciox;
				let tamanhoCima = cubeAtualCima.userData.tamanho.fimx - cubeAtualCima.userData.tamanho.iniciox;
				cubeDireita.userData.tamanho.iniciox = cubeDireita.userData.tamanho.iniciox - tamanho;
				cubeDireita.userData.tamanho.fimx = cubeDireita.userData.tamanho.fimx - tamanho;
				cubeDireita.position.x = cubeDireita.position.x - tamanhoApagar
				// cubeEsquerda.userData.direita = cubeDireita.userData.direita;

				cubeDireitaCima.userData.tamanho.iniciox = cubeDireitaCima.userData.tamanho.iniciox - tamanhoCima;
				cubeDireitaCima.userData.tamanho.fimx = cubeDireitaCima.userData.tamanho.fimx - tamanhoCima;
				cubeDireitaCima.position.x = cubeDireitaCima.position.x - tamanhoApagar
				cubeDireitaBotao.position.x = cubeDireitaBotao.position.x - tamanhoApagar
				cubeEsquerdaBotao.position.x = cubeEsquerdaBotao.position.x - tamanhoApagar
				cubeCimaBotao.position.x = cubeCimaBotao.position.x - tamanhoApagar


				cubeDireitaCimaBotao.position.x = cubeDireitaCimaBotao.position.x - tamanhoApagar
				cubeEsquerdaCimaBotao.position.x = cubeEsquerdaCimaBotao.position.x - tamanhoApagar
				cubeCimaCimaBotao.position.x = cubeCimaCimaBotao.position.x - tamanhoApagar

			}

			else if (i - 1 > 0) {

				let cubeEsquerda = scene.getObjectById(state.groundIds[i - 1]);
				let cubeEsquerdaCima = scene.getObjectById(state.topIds[i - 1]);
				cubeEsquerda.userData.direita = cubeAtual.userData.direita;
				cubeEsquerdaCima.userData.direita = cubeAtualCima.userData.direita;

			}
			else if (i + 1 < state.groundIds.length) {

				let cubeDireita = scene.getObjectById(state.groundIds[i + 1]);
				let cubeDireitaCima = scene.getObjectById(state.topIds[i + 1]);
				let tamanho = cubeAtual.userData.tamanho.fimx - cubeAtual.userData.tamanho.iniciox;
				cubeDireita.userData.tamanho.iniciox = cubeDireita.userData.tamanho.iniciox - tamanho;
				cubeDireita.userData.tamanho.fimx = cubeDireita.userData.tamanho.fimx - tamanho;
				cubeDireita.position.x = cubeDireita.position.x - tamanhoApagar

				let tamanhoCima = cubeAtual.userData.tamanho.fimx - cubeAtualCima.userData.tamanho.iniciox;
				cubeDireitaCima.userData.tamanho.iniciox = cubeDireitaCima.userData.tamanho.iniciox - tamanhoCima;
				cubeDireitaCima.userData.tamanho.fimx = cubeDireitaCima.userData.tamanho.fimx - tamanhoCima;
				cubeDireitaCima.position.x = cubeDireitaCima.position.x - tamanhoApagar



			}


		}
	}

	state.groundIds.splice(state.selectedIndex, 1);
	state.topIds.splice(state.selectedIndex, 1);
	state.groundButtons.splice(state.selectedIndex, 1);
	state.topButtons.splice(state.selectedIndex, 1);
}

function criaCubo(embaixo = false, nome = "cubo") {
	state.selectedColor = "#000000";

	const material = new THREE.MeshBasicMaterial({ color: state.selectedColor, transparent: true, opacity: 0 });

	let cubeEscolhido = state.topIds.length == 1 ? scene.getObjectById(state.topIds[0]) : scene.getObjectById(state.topIds[state.selectedIndex]);
	let cubeCima;
	if (state.selectedSide == "esquerda") cubeCima = state.topIds.length == 1 ? scene.getObjectById(state.topIds[0]) : scene.getObjectById(state.topIds[state.selectedIndex]);
	else cubeCima = state.topIds.length == 1 ? scene.getObjectById(state.topIds[0]) : scene.getObjectById(state.topIds[state.selectedIndex + 1]);
	// Sem vizinho à direita (ex: removendo o item da ponta), usa o próprio item como referência
	if (!cubeCima) cubeCima = cubeEscolhido;

	const geometry = new THREE.BoxGeometry(embaixo ? cubeCima.box3.min.x - cubeCima.box3.max.x : cubeEscolhido.box3.min.x - cubeEscolhido.box3.max.x, 0.86, 1);
	const cube = new THREE.Mesh(geometry, material)

	scene.add(cube)

	let cube2BB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
	cube2BB.setFromObject(cube)

	cube.box3 = cube2BB;
	cube.position.setY(cube.position.y + (cube.position.y - cube2BB.min.y))
	cube.position.setX(cubeEscolhido.position.x)
	const tamanhox = cube2BB.max.x - cube2BB.min.x;
	const tamanhoy = cube2BB.max.y - cube2BB.min.y;
	cube.userData = {
		modelo: { tipo: "chao", tamanhox: cubeCima.userData.modelo.tamanhox, tamanhoy: cubeCima.userData.modelo.tamanhoy },
		centro: cubeEscolhido.userData.centro,
		centroDireita: cubeEscolhido.userData.centroDireita,
		centroEsquerda: cubeEscolhido.userData.centroEsquerda,
		tamanho: {
			iniciox: cubeEscolhido.userData.tamanho.iniciox,
			fimx: cubeEscolhido.userData.tamanho.fimx,
			inicioy: cubeEscolhido.userData.tamanho.inicioy,
			fimy: cubeEscolhido.userData.tamanho.fimy
		},
		cima: cubeEscolhido.userData.cima,
		direita: cubeEscolhido.userData.direita,
		baixo: cubeEscolhido.userData.baixo,
		esquerda: cubeEscolhido.userData.esquerda

	}
	embaixo ? (state.selectedSide == "esquerda" && state.selectedIndex == 0 ? state.groundIds.unshift(cube.id) : state.groundIds.push(cube.id)) : state.groundIds[state.selectedIndex] = cube.id;

	if (state.selectedSide == "direita") {
		embaixo ? cube.position.setX(cubeCima.position.x) : cube.position.setX(cubeEscolhido.position.x);
	}
	else {
		embaixo ? cube.position.setX(cubeCima.position.x) : cube.position.setX(cubeEscolhido.position.x);
	}
	cube.position.getComponent(0);
	cube.name = "cubo"
}
function criaCuboCima(emcima = false, nome = "cubo") {

	state.selectedColor = "#000000";


	const material = new THREE.MeshBasicMaterial({ color: state.selectedColor, transparent: true, opacity: 0 });


	let cubeEscolhido = state.groundIds.length == 1 ? scene.getObjectById(state.groundIds[0]) : scene.getObjectById(state.groundIds[state.selectedIndex])

	let cubeBaixo = state.groundIds.length == 1 ? scene.getObjectById(state.groundIds[0]) : scene.getObjectById(state.groundIds[state.selectedIndex + 1]);
	// Sem vizinho à direita (ex: removendo o item da ponta), usa o próprio item como referência
	if (!cubeBaixo) cubeBaixo = cubeEscolhido;

	const geometry = new THREE.BoxGeometry(emcima ? cubeBaixo.box3.min.x - cubeBaixo.box3.max.x : cubeEscolhido.box3.min.x - cubeEscolhido.box3.max.x, 0.86, 1);
	const cube = new THREE.Mesh(geometry, material)

	scene.add(cube)

	let cube2BB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
	cube2BB.setFromObject(cube)

	cube.box3 = cube2BB;
	cube.position.setY(cube.position.y + (cube.position.y - cube2BB.min.y) + 1.44)

	cube.position.setZ(0.2)
	const tamanhox = cube2BB.max.x - cube2BB.min.x;
	const tamanhoy = cube2BB.max.y - cube2BB.min.y;
	cube.userData = {
		modelo: { tipo: "cima", tamanhox: cubeBaixo.userData.modelo.tamanhox, tamanhoy: cubeBaixo.userData.modelo.tamanhoy },
		centro: cubeEscolhido.userData.centro,
		centroDireita: cubeEscolhido.userData.centroDireita,
		centroEsquerda: cubeEscolhido.userData.centroEsquerda,
		tamanho: {
			iniciox: cubeEscolhido.userData.tamanho.iniciox,
			fimx: cubeEscolhido.userData.tamanho.fimx,
			inicioy: cubeEscolhido.userData.tamanho.inicioy,
			fimy: cubeEscolhido.userData.tamanho.fimy
		},
		cima: cubeEscolhido.userData.cima,
		direita: cubeEscolhido.userData.direita,
		baixo: cubeEscolhido.userData.baixo,
		esquerda: cubeEscolhido.userData.esquerda

	}

	emcima ? (state.selectedSide == "esquerda" && state.selectedIndex == 0 ? state.topIds.unshift(cube.id) : state.topIds.push(cube.id)) : state.topIds[state.selectedIndex] = cube.id;

	if (state.selectedSide == "direita") {
		emcima ? cube.position.setX(cubeBaixo.position.x) : cube.position.setX(cubeEscolhido.position.x);
	}
	else {
		emcima ? cube.position.setX(cubeBaixo.position.x) : cube.position.setX(cubeEscolhido.position.x);
		cube.position.setX(cubeEscolhido.position.x);
	}
	cube.position.getComponent(0);
	cube.name = nome
}

window.addEventListener('resize', function () {
	var width = tamanhoScene;
	var height = window.innerHeight;
	renderer.setSize(width, height)
	camera.aspect = width / height;
	camera.updateProjectionMatrix;
})

// Projeta a posição do clique/toque na cena e devolve os objetos atingidos pelo raio.
// Esse bloco de 4 linhas se repetia igual em 6 lugares diferentes do arquivo.
function raycastFromEvent(event) {
	pointer.x = (event.clientX / tamanhoScene) * 2 - 1;
	pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;
	raycaster.setFromCamera(pointer, camera);
	return raycaster.intersectObjects(scene.children);
}

// Resolve, a partir de um clique, qual peça (real ou "cubo" vazio) foi atingida, preenchendo
// state.selectedObjectId/state.selectedIndex. Usado tanto pra selecionar uma peça pra excluir
// quanto pelos botões de adicionar (direita/esquerda/cima/baixo) — esse era o bloco de
// raycasting+resolução que se repetia quase idêntico em 5 lugares diferentes.
//
// opts.tipo: "chao"/"cima" do botão clicado, usado quando opts.usarTipoDoObjetoClicado é falso
// opts.usarTipoDoObjetoClicado: usa o tipo do objeto atingido pelo raio em vez de opts.tipo
//   (assim funcionam os botões de cima/baixo e a seleção por clique direto na peça)
// opts.idBotaoFallback + opts.ladoBotaoFallback: se o raio não acertar nada (ex: o próprio
//   botão 3D bloqueando o raio), procura em qual posição está registrado esse botão — só os
//   botões de direita/esquerda precisam desse fallback
//
// Devolve o objeto atingido (ou null se nada foi atingido e não havia fallback aplicável).
function resolveSelecaoDoClique(event, opts) {
	opts = opts || {};
	const intersects = raycastFromEvent(event);

	if (intersects.length > 0) {
		menuDiv.classList.add("label");
		state.selectedObjectId = intersects[0].object.name == "cubo" ? intersects[0].object.id : intersects[0].object.parent.id;

		let cubeEscolhido = scene.getObjectById(state.selectedObjectId);
		if (!cubeEscolhido.userData.tamanho) {
			state.selectedObjectId = intersects[0].object.parent.parent.id;
			cubeEscolhido = scene.getObjectById(state.selectedObjectId);
		}

		const tipoParaIndice = opts.usarTipoDoObjetoClicado ? cubeEscolhido.userData.modelo.tipo : opts.tipo;
		state.selectedIndex = tipoParaIndice == "chao" ? state.groundIds.indexOf(state.selectedObjectId) : state.topIds.indexOf(state.selectedObjectId);
		return cubeEscolhido;
	}

	if (opts.idBotaoFallback) {
		for (let k = 0; k < state.groundButtons.length; k++) {
			if (state.topButtons[k][opts.ladoBotaoFallback] == opts.idBotaoFallback) {
				state.selectedIndex = k;
				state.selectedObjectId = opts.tipo == "chao" ? state.groundIds[state.selectedIndex] : state.topIds[state.selectedIndex];
			}
			if (state.groundButtons[k][opts.ladoBotaoFallback] == opts.idBotaoFallback) {
				state.selectedIndex = k;
				state.selectedObjectId = opts.tipo == "chao" ? state.groundIds[state.selectedIndex] : state.topIds[state.selectedIndex];
			}
		}
	}
	return null;
}

window.addEventListener('click', function () {
	if (modoVisualizacao) return;
	const cubeEscolhido = resolveSelecaoDoClique(event, { usarTipoDoObjetoClicado: true });
	if (!cubeEscolhido) return;

	removeButton.classList.add('hide')
	let listaContraria = cubeEscolhido.userData.modelo.tipo == "chao" ? state.topIds : state.groundIds
	if (cubeEscolhido.name == "cubo") {
		removeButton.classList.add('hide')
		if (scene.getObjectById(listaContraria[state.selectedIndex]).name == "cubo") {
			removeButton.classList.remove('hide')
			btnRemove.position.setY(cubeEscolhido.userData.modelo.tipo == "chao" ? cubeEscolhido.position.y - 0.5 : cubeEscolhido.position.y + 0.5)
			btnRemove.position.setX(cubeEscolhido.position.x)
		}
	}
	else {
		removeButton.classList.remove('hide')
		btnRemove.position.setY(cubeEscolhido.userData.modelo.tipo == "chao" ? cubeEscolhido.position.y : cubeEscolhido.position.y + 2.1)
		btnRemove.position.setX(cubeEscolhido.position.x)
	}
})

function onPointerMove(event) {
	var intersects = raycastFromEvent(event);

	if (intersects.length > 0) {
		document.body.style.cursor = 'pointer'
		const position = intersects[0].object.position;
		state.hoveredObjectId = intersects[0].object.parent.id;
		let cubeEscolhido = scene.getObjectById(state.hoveredObjectId);

		if (intersects[0].object.name != "cubo" && intersects[0].object.name != "botao") {
			if (!state.previousHoverIndex || state.previousHoverIndex != state.hoveredObjectId) {
				if (state.previousHoverIndex) {


					let cubeEscolhido = scene.getObjectById(state.previousHoverIndex);
					cubeEscolhido.children[cubeEscolhido.children.length > 1 ? 1 : 0].material.opacity = 1
					cubeEscolhido.children[cubeEscolhido.children.length > 1 ? 1 : 0].material.transparent = true
				}
				state.previousHoverIndex = state.hoveredObjectId
			}
			cubeEscolhido.children[cubeEscolhido.children.length > 1 ? 1 : 0].material.opacity = 0.5
			cubeEscolhido.children[cubeEscolhido.children.length > 1 ? 1 : 0].material.transparent = true
		}
	}
	else {
		document.body.style.cursor = 'auto'
		if (state.previousHoverIndex) {
			let cubeEscolhido = scene.getObjectById(state.previousHoverIndex);

			if (cubeEscolhido.name != "cubo" && cubeEscolhido != "botao") {

				cubeEscolhido.children[cubeEscolhido.children.length > 1 ? 1 : 0].material.opacity = 1
				cubeEscolhido.children[cubeEscolhido.children.length > 1 ? 1 : 0].material.transparent = true
			}

		}
	}
}
window.addEventListener('pointermove', onPointerMove);

function createButtonAdd(x = 0, y = 0, cubinho, i, tipo) {

	if (x == 1) {
		const addButtonDireita = document.createElement('button');
		addButtonDireita.className = 'btnAdd backgroundImage';


		addButtonDireita.addEventListener('pointerdown', function (event) {
			state.selectedDirectionX = 1;
			state.selectedDirectionY = 0
			state.isAddingModule = true;
			state.selectedSide = "direita"

			resolveSelecaoDoClique(event, { tipo, idBotaoFallback: window['btnDireita'].id, ladoBotaoFallback: 'direita' });
			{
				const passoGravado = { fn: tipo == "chao" ? 'c' : 't', k: state.selectedModel.chave, px: state.selectedDirectionX, py: state.selectedDirectionY, idx: state.selectedIndex }
				const aoConcluir = function (id) { passoGravado.id = id; state.assemblySteps.push(passoGravado); atualizarModeloAR() }
				tipo == "chao" ? criaObjetoChao(state.selectedModel, state.selectedDirectionX, state.selectedDirectionY, aoConcluir) : criaObjetoCima(state.selectedModel, state.selectedDirectionX, state.selectedDirectionY, state.selectedIndex, aoConcluir)
			}
			for (let j = 0; j < (tipo == "chao" ? state.groundButtons.length : state.topButtons.length); j++) {
				const botaoDireita = scene.getObjectById(tipo == "chao" ? state.groundButtons[j].direita : state.topButtons[j].direita);
				const botaoEsquerda = scene.getObjectById(tipo == "chao" ? state.groundButtons[j].esquerda : state.topButtons[j].esquerda);
				const botaoCima = scene.getObjectById(state.groundButtons[j].cima);
				const botaoBaixo = scene.getObjectById(state.groundButtons[j].baixo);

				botaoDireita.visible = false
				botaoEsquerda.visible = false
				botaoCima.visible = false
				if (botaoBaixo) botaoBaixo.visible = false

			}

		});
		window['btnDireita'] = new CSS3DObject(addButtonDireita);
		window['btnDireita'].scale.set(0.01, 0.01, 1)
		window['btnDireita'].position.setZ(0.6)
		window['btnDireita'].name = "botao"
		window['btnDireita'].visible = false;

		if (cubinho.name == "cubo") {

			window['btnDireita'].position.setX(cubinho.position.x + 0.25)
			window['btnDireita'].position.setY(tipo == "chao" ? cubinho.position.y + 0.05 : cubinho.position.y - 0.27)

		}
		else {
			window['btnDireita'].position.setX(tipo == "chao" ? cubinho.position.x + 0.25 : cubinho.position.x + 0.3)
			window['btnDireita'].position.setY(tipo == "chao" ? cubinho.position.y + 0.5 : cubinho.position.y + 1.6)
		}


		tipo == "chao" ? state.groundButtons[i].direita = window['btnDireita'].id : state.topButtons[i].direita = window['btnDireita'].id;
		scene.add(window['btnDireita']);

	}
	else if (x == -1) {
		const addButtonEsquerda = document.createElement('button');
		addButtonEsquerda.className = 'btnAdd backgroundImage';

		const btnAddEsquerda = new CSS3DObject(addButtonEsquerda);
		addButtonEsquerda.addEventListener('pointerdown', function (event) {
			state.selectedDirectionX = -1;
			state.selectedDirectionY = 0
			state.isAddingModule = true;
			state.selectedSide = "esquerda"

			resolveSelecaoDoClique(event, { tipo, idBotaoFallback: btnAddEsquerda.id, ladoBotaoFallback: 'esquerda' });
			{
				const passoGravado = { fn: tipo == "chao" ? 'c' : 't', k: state.selectedModel.chave, px: state.selectedDirectionX, py: state.selectedDirectionY, idx: state.selectedIndex }
				const aoConcluir = function (id) { passoGravado.id = id; state.assemblySteps.push(passoGravado); atualizarModeloAR() }
				tipo == "chao" ? criaObjetoChao(state.selectedModel, state.selectedDirectionX, state.selectedDirectionY, aoConcluir) : criaObjetoCima(state.selectedModel, state.selectedDirectionX, state.selectedDirectionY, state.selectedIndex, aoConcluir)
			}
			for (let j = 0; j < (tipo == "chao" ? state.groundButtons.length : state.topButtons.length); j++) {
				const botaoDireita = scene.getObjectById(tipo == "chao" ? state.groundButtons[j].direita : state.topButtons[j].direita);
				const botaoEsquerda = scene.getObjectById(tipo == "chao" ? state.groundButtons[j].esquerda : state.topButtons[j].esquerda);
				const botaoCima = scene.getObjectById(state.groundButtons[j].cima);
				const botaoBaixo = scene.getObjectById(state.groundButtons[j].baixo);

				botaoDireita.visible = false
				botaoEsquerda.visible = false
				botaoCima.visible = false
				if (botaoBaixo) botaoBaixo.visible = false

			}

		});
		btnAddEsquerda.scale.set(0.01, 0.01, 1)
		btnAddEsquerda.position.setZ(0.6)
		btnAddEsquerda.name = "botao";
		btnAddEsquerda.visible = false;

		if (cubinho.name == "cubo") {
			btnAddEsquerda.position.setX(cubinho.position.x - 0.25)
			btnAddEsquerda.position.setY(tipo == "chao" ? cubinho.position.y + 0.05 : cubinho.position.y - 0.27)

		}
		else {
			btnAddEsquerda.position.setX(tipo == "chao" ? cubinho.position.x - 0.25 : cubinho.position.x - 0.1)
			btnAddEsquerda.position.setY(cubinho.userData.modelo.tipo == "chao" ? cubinho.position.y + 0.5 : cubinho.position.y + 1.6)
		}
		tipo == "chao" ? state.groundButtons[i].esquerda = btnAddEsquerda.id : state.topButtons[i].esquerda = btnAddEsquerda.id;

		scene.add(btnAddEsquerda);
	}
	else if (y == 1) {
		const addButtonCima = document.createElement('button');
		addButtonCima.className = 'btnAdd backgroundImage';

		const btnAddCima = new CSS3DObject(addButtonCima);

		addButtonCima.addEventListener('pointerdown', function (event) {

			state.selectedDirectionX = 0;
			state.selectedDirectionY = 1;
			state.isAddingModule = true;
			state.selectedSide = "cima";

			resolveSelecaoDoClique(event, { usarTipoDoObjetoClicado: true });

			{
				const passoGravado = { fn: 't', k: state.selectedModel.chave, px: state.selectedDirectionX, py: state.selectedDirectionY, idx: state.selectedIndex }
				criaObjetoCima(state.selectedModel, state.selectedDirectionX, state.selectedDirectionY, state.selectedIndex, function (id) {
					passoGravado.id = id
					state.assemblySteps.push(passoGravado)
					atualizarModeloAR()
				})
			}
			for (let j = 0; j < (tipo == "chao" ? state.groundButtons.length : state.topButtons.length); j++) {
				const botaoDireita = scene.getObjectById(tipo == "chao" ? state.groundButtons[j].direita : state.topButtons[j].direita);
				const botaoEsquerda = scene.getObjectById(tipo == "chao" ? state.groundButtons[j].esquerda : state.topButtons[j].esquerda);
				const botaoCima = scene.getObjectById(state.groundButtons[j].cima);
				const botaoBaixo = scene.getObjectById(state.groundButtons[j].baixo);

				botaoDireita.visible = false
				botaoEsquerda.visible = false
				botaoCima.visible = false
				if (botaoBaixo) botaoBaixo.visible = false

			}

		});
		btnAddCima.scale.set(0.01, 0.01, 1)
		btnAddCima.position.setZ(0.6)

		btnAddCima.name = "botao"
		btnAddCima.visible = false;

		if (cubinho.name == "cubo") {
			btnAddCima.position.setX(cubinho.position.x + 0.05)
			btnAddCima.position.setY(cubinho.position.y + 0.75)

		}
		else {
			btnAddCima.position.setX(cubinho.position.x + 0.05)
			btnAddCima.position.setY(cubinho.position.y + 0.75)

		}
		tipo == "chao" ? state.groundButtons[i].cima = btnAddCima.id : state.topButtons[i].cima = btnAddCima.id;
		scene.add(btnAddCima);
	}
	else if (y == -1) {
		const addButtonBaixoPos = document.createElement('button');
		addButtonBaixoPos.className = 'btnAdd backgroundImage';

		const btnAddBaixoPos = new CSS3DObject(addButtonBaixoPos);

		addButtonBaixoPos.addEventListener('pointerdown', function (event) {

			state.selectedDirectionX = 0;
			state.selectedDirectionY = -1;
			state.isAddingModule = true;
			state.selectedSide = "baixo";

			resolveSelecaoDoClique(event, { usarTipoDoObjetoClicado: true });

			{
				const passoGravado = { fn: 'c', k: state.selectedModel.chave, px: state.selectedDirectionX, py: state.selectedDirectionY, idx: state.selectedIndex }
				criaObjetoChao(state.selectedModel, state.selectedDirectionX, state.selectedDirectionY, function (id) {
					passoGravado.id = id
					state.assemblySteps.push(passoGravado)
					atualizarModeloAR()
				})
			}
			for (let j = 0; j < state.groundButtons.length; j++) {
				const botaoDireita = scene.getObjectById(state.groundButtons[j].direita);
				const botaoEsquerda = scene.getObjectById(state.groundButtons[j].esquerda);
				const botaoCima = scene.getObjectById(state.groundButtons[j].cima);
				const botaoBaixo = scene.getObjectById(state.groundButtons[j].baixo);

				botaoDireita.visible = false
				botaoEsquerda.visible = false
				botaoCima.visible = false
				if (botaoBaixo) botaoBaixo.visible = false

			}

		});
		btnAddBaixoPos.scale.set(0.01, 0.01, 1)
		btnAddBaixoPos.position.setZ(0.6)

		btnAddBaixoPos.name = "botao"
		btnAddBaixoPos.visible = false;

		btnAddBaixoPos.position.setX(cubinho.position.x)
		btnAddBaixoPos.position.setY(cubinho.position.y)

		state.groundButtons[i].baixo = btnAddBaixoPos.id;
		scene.add(btnAddBaixoPos);
	}

}

function resetaCamera() {
	gsap.to(camera.position, {
		x: state.cameraTargetX,
		y: state.cameraTargetY,
		z: state.cameraTargetZ != 0 ? state.cameraTargetZ : 5,
		duration: 1,
		onStart: () => { controls.enabled = false },
		onComplete: () => { controls.enabled = true; }
	})
	gsap.to(controls.target, {
		x: state.cameraTargetX,
		y: state.cameraTargetY,
		onStart: () => { controls.enabled = false },
		onComplete: () => { controls.enabled = true }
	})
	gsap.to(camera, { zoom: 0, duration: 0.5 })
}


function verificaPosBotoes() {
	for (let i = 0; i < state.groundIds.length; i++) {
		const cubeEscolhido = scene.getObjectById(state.groundIds[i]);
		let botaoDireita = scene.getObjectById(state.groundButtons[i].direita);
		i == 0 || i == state.groundIds.length - 1 ? botaoDireita.visible = true : botaoDireita.visible = false
		let botaoEsquerda = scene.getObjectById(state.groundButtons[i].esquerda);
		i == 0 || i == state.groundIds.length - 1 ? botaoEsquerda.visible = true : botaoEsquerda.visible = false
		let botaoCima = scene.getObjectById(state.groundButtons[i].cima);
		botaoCima.visible = false;

		let botaoDireitaCima = scene.getObjectById(state.topButtons[i].direita);
		i == 0 || i == state.groundIds.length - 1 ? botaoDireitaCima.visible = true : botaoDireitaCima.visible = false
		let botaoEsquerdaCima = scene.getObjectById(state.topButtons[i].esquerda);
		i == 0 || i == state.groundIds.length - 1 ? botaoEsquerdaCima.visible = true : botaoEsquerdaCima.visible = false
		let botaoCimaCima = scene.getObjectById(state.topButtons[i].cima);
		botaoCimaCima.visible = false

		if (state.selectedPieceInfo.tipo == "chao") {

			botaoDireitaCima.visible = false
			botaoEsquerdaCima.visible = false

		}
		if (state.selectedPieceInfo.tipo == "cima") {
			botaoDireita.visible = false
			botaoEsquerda.visible = false

			let cubeCima = scene.getObjectById(state.topIds[i]);
			// só deixa colocar o armário em cima se o balcão embaixo for do mesmo tamanho
			if (cubeCima.name == "cubo" && cubeEscolhido.userData.modelo.tamanhox == state.selectedPieceInfo.tamanhox) botaoCima.visible = true
		}

		let botaoBaixo = scene.getObjectById(state.groundButtons[i].baixo);
		if (botaoBaixo) botaoBaixo.visible = false;
		if (state.selectedPieceInfo.tipo == "chao" && botaoBaixo) {
			let cubeCimaReal = scene.getObjectById(state.topIds[i]);
			// só deixa colocar o balcão embaixo se já existir um armário ali e for do mesmo tamanho
			if (cubeEscolhido.name == "cubo" && cubeCimaReal.name != "cubo" && cubeCimaReal.userData.modelo.tamanhox == state.selectedPieceInfo.tamanhox) {
				botaoBaixo.visible = true
			}
		}

		if (i + 1 < state.groundIds.length) {
			const cubeDireita = scene.getObjectById(state.groundIds[i + 1]);
			const cubeDireitaCima = scene.getObjectById(state.topIds[i + 1]);


			if (state.selectedPieceInfo.tipo == "chao" && cubeDireita.name == "cubo" && cubeDireita.userData.modelo.tamanhox == state.selectedPieceInfo.tamanhox) {
				botaoDireita.visible = true
			}
			else if (state.selectedPieceInfo.tipo == "cima" && cubeDireitaCima.name == "cubo" && cubeDireitaCima.userData.modelo.tamanhox == state.selectedPieceInfo.tamanhox) {
				botaoDireitaCima.visible = true
			}
			else {
				botaoDireita.visible = false
				botaoDireitaCima.visible = false

			}
		}
		if (i - 1 >= 0) {
			const cubeEsquerda = scene.getObjectById(state.groundIds[i - 1]);
			const cubeEsquerdaCima = scene.getObjectById(state.topIds[i - 1]);

			if (state.selectedPieceInfo.tipo == "chao" && cubeEsquerda.name == "cubo" && cubeEsquerda.userData.modelo.tamanhox == state.selectedPieceInfo.tamanhox) {
				botaoEsquerda.visible = true
			}
			else if (state.selectedPieceInfo.tipo == "cima" && cubeEsquerdaCima.name == "cubo" && cubeEsquerdaCima.userData.modelo.tamanhox == state.selectedPieceInfo.tamanhox) {
				botaoEsquerdaCima.visible = true
			}
			else {
				botaoEsquerda.visible = false
				botaoEsquerdaCima.visible = false
			}
		}
	}

}

const handleCameraOnAdd = (valorXCube) => {
	if (state.maxX < valorXCube) {
		state.maxX = valorXCube
		state.itemCount += 1;
		state.cameraTargetZ = (state.itemCount / 50) + camera.position.z
	}
	if (state.minX > valorXCube) {
		state.minX = valorXCube
		state.itemCount += 1;
		state.cameraTargetZ = (state.itemCount / 50) + camera.position.z
	}

	state.cameraTargetX = (state.minX + (state.maxX - state.minX) / 2);
	gsap.to(controls.target, {
		x: state.cameraTargetX,
		onStart: () => { controls.enabled = false },
		onComplete: () => { controls.enabled = true }
	})
	gsap.to(camera.position, {
		z: state.cameraTargetZ,
		x: state.cameraTargetX,
		onStart: () => { controls.enabled = false },
		onComplete: () => { controls.enabled = true }
	})

	controls.update();
}


// Realidade Aumentada via <model-viewer>: Scene Viewer no Android, AR Quick Look no iOS,
// e WebXR como bônus quando disponível — bem mais compatível que WebXR puro.
const dispositivoMovel = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

const modelViewerAR = document.createElement('model-viewer');
modelViewerAR.setAttribute('ar', '');
modelViewerAR.setAttribute('ar-modes', 'webxr scene-viewer quick-look');
modelViewerAR.style.position = 'fixed';
// top/left explícitos: sem eles o elemento fica na posição estática (fim do body),
// fora da viewport — e o model-viewer usa IntersectionObserver pra só carregar o
// modelo quando está visível, então "escondido" fora da tela nunca carrega.
modelViewerAR.style.top = '0';
modelViewerAR.style.left = '0';
modelViewerAR.style.width = '1px';
modelViewerAR.style.height = '1px';
modelViewerAR.style.opacity = '0';
modelViewerAR.style.pointerEvents = 'none';
document.body.appendChild(modelViewerAR);

// Mantém o <model-viewer> com a montagem atual pré-carregada, para o clique no botão
// poder chamar activateAR() de forma síncrona — Scene Viewer/Quick Look só abrem se
// ativados dentro do próprio gesto de clique; exportar/carregar o GLB depois do clique
// perde esse gesto e o navegador bloqueia a RA sem avisar nada.
async function atualizarModeloAR() {
	if (!dispositivoMovel || (state.groundIds.length === 0 && state.topIds.length === 0)) return;

	state.isArModelReady = false;
	const exporter = new GLTFExporter();
	const glb = await exporter.parseAsync(scene, { binary: true });
	const url = URL.createObjectURL(new Blob([glb], { type: 'model/gltf-binary' }));

	await new Promise(function (resolve) {
		modelViewerAR.addEventListener('load', resolve, { once: true });
		modelViewerAR.src = url;
	});

	if (state.lastArBlobUrl) URL.revokeObjectURL(state.lastArBlobUrl);
	state.lastArBlobUrl = url;
	state.isArModelReady = true;
}

btnRa.title = 'Ver em Realidade Aumentada';

btnRa.addEventListener('pointerdown', function () {
	if (!dispositivoMovel) {
		abrirModalQRCode();
		return;
	}

	if (!state.isArModelReady) {
		console.warn('Modelo de RA ainda não estava pronto a tempo do clique.');
		return;
	}

	modelViewerAR.activateAR();
});

// Se a página foi aberta via QR Code, remonta automaticamente a montagem e já deixa o
// modelo de RA pré-carregado, antes de liberar o botão
if (receitaURL) {
	btnRa.disabled = true;
	remontarDaURL(desserializarMontagem(receitaURL))
		.then(atualizarModeloAR)
		.finally(function () {
			btnRa.disabled = false;
		});
}

function animate() {
	controls.update();
	labelRenderer.render(scene, camera);
	botoesRenderer.render(scene, camera);
	renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);
