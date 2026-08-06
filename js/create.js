
import * as THREE from 'three';
// import Stats from './../three/examples/jsm/libs/stats.module.js';
import { OrbitControls } from './../jsm/controls/OrbitControls.js';
import { RoomEnvironment } from './../jsm/environments/RoomEnvironment.js';
import { GLTFLoader } from './../jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from './../jsm/loaders/DRACOLoader.js';
import { CSS2DRenderer } from './../jsm/renderers/CSS2DRenderer.js';
import { CSS2DObject } from './../jsm/renderers/CSS2DRenderer.js';
import { CSS3DRenderer } from './../jsm/renderers/CSS3DRenderer.js';
import { CSS3DObject } from './../jsm/renderers/CSS3DRenderer.js';
import { Objetos } from './objects.js';
import { qrcode } from './../src/qrcode/qrcode.js';

let ids = []
let idsCima = []
let botoes3d = []
let botoes3dCima = []

// Aberto via QR Code: mostra só o móvel montado + botão de RA, sem edição
const receitaURL = new URLSearchParams(window.location.search).get('m');
const modoVisualizacao = !!receitaURL;

const tamanhoMenuLateral = modoVisualizacao ? 0 : 400;
let tamanhoScene = window.innerWidth - tamanhoMenuLateral;
// import { Projector } from './three/examples/jsm/loaders/DRACOLoader.js';

// Configurando a cena
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xE5E5E5)

// Camera
const camera = new THREE.PerspectiveCamera(75, tamanhoScene / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 5);

// Renderizador
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.xr.enabled = true;
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
const cubos = [];

// criação menu
const menuDiv = document.createElement('div');
menuDiv.className = 'label';
// menuDiv.className = 'hide';

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
		movelEscolhido = { tipo: objetos.todosObjetos[i].tipo == "chao" ? "chao" : "cima", tamanhox: objetos.todosObjetos[i].tamanhox }
		corEscolhida = "#E56399";
		removeButton.classList.add('hide')
		for (let i = 0; i < botoes.length; i++) {
			botoes[i].button.classList.remove('btnAtivo')
		}
		button.classList.add("btnAtivo")
		if (ids.length == 0 || idsCima.length == 0) {
			const chaveModelo = objetos.todosObjetos[i].chave
			criaObjeto(objetos.todosObjetos[i], undefined, undefined, function (id) {
				montagemGravada.push({ fn: 'i', k: chaveModelo, id: id })
			})
		}
		// menuDiv.classList.add("hide");
		else {
			modeloEscolhido = objetos.todosObjetos[i]
			verificaPosBotoes()
		}
		adicionaCubo = false;
		resetaCamera();

	});
	botoes.push({ button, tipo: objetos.todosObjetos[i].tipo == "chao" ? "chao" : "cima", tamanhox: objetos.todosObjetos[i].tamanhox })
	for (let j = 0; j < divCadaModelo.length; j++) {
		if (divCadaModelo[j].movel == objetos.todosObjetos[i].movel) {
			divCadaModelo[j].cadaModelo.lastChild.appendChild(button)
		}
	}
}

let corEscolhida = "#ffffff";
let positionEscolhida = "#ffffff";
let xEscolhido = 0;
let yEscolhido = 0;
let uuidEscolhido = "";
let uuidEscolhidoTemporario = "";
let adicionaCubo = false;
let ladoEscolhido;
let ladoEscolhidoTemporario;
let modeloEscolhido
let indexEscolhido;
let indexEscolhidoTemporario;
let indexAntigo;
let valorLargura = 0;
let valorAltura = 0;
let valorProfundidade = 0;
let tamanhoCamera = 8;
let cameraInicialx = 0
let cameraInicialy = 0
let cameraInicialz = 0
let valorXMenor = 10;
let valorXMaior = -10;
let quantidadeItens = 0;

let movelEscolhido;
// Sequência de peças montadas, usada para reconstruir a montagem quando aberta via QR Code
let montagemGravada = [];
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
	indexEscolhido = indexEscolhido
	remove()
	removeButton.classList.add('hide')
});
const btnRemove = new CSS3DObject(removeButton);
btnRemove.scale.set(0.01, 0.01, 1)
btnRemove.position.setZ(0.6)

const addButton = document.createElement('button');
addButton.className = 'btnAdd backgroundImage addMain';
addButton.addEventListener('pointerdown', function (event) {
	uuidEscolhido = uuidEscolhidoTemporario;
});
const btnAdd = new CSS3DObject(addButton);
btnAdd.scale.set(0.01, 0.01, 1)
btnAdd.position.setZ(0.6)
btnAdd.position.setX(-1.5)


const addButtonBaixo = document.createElement('button');
addButtonBaixo.className = 'btnAdd backgroundImage hide';
addButtonBaixo.addEventListener('pointerdown', function (event) {
	xEscolhido = 0;
	yEscolhido = -1;
	adicionaCubo = true;
	ladoEscolhido = "baixo";
	indexEscolhido = indexEscolhidoTemporario
});

const info = document.createElement('div')
info.classList.add('infoTamanho')
const largura = document.createElement('p')
largura.innerText = "Largura: " + valorLargura
const altura = document.createElement('p')
altura.innerText = "Altura: " + valorAltura

const profundidade = document.createElement('p')
profundidade.innerText = "Profundidade: " + valorProfundidade

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
}

// Retículo usado para indicar onde o conjunto será posicionado em RA
const reticle = new THREE.Mesh(
	new THREE.RingGeometry(0.08, 0.1, 32).rotateX(-Math.PI / 2),
	new THREE.MeshBasicMaterial({ color: 0xE56399 })
);
reticle.matrixAutoUpdate = true;
reticle.visible = false;
scene.add(reticle);

const corDeFundoOriginal = scene.background;

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
	return montagemGravada.map(function (passo) {
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
	if (montagemGravada.length > 0) {
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
				modeloEscolhido = modelo;
				indexEscolhido = passo.idx;
				uuidEscolhido = passo.fn === 'c' ? ids[passo.idx] : idsCima[passo.idx];
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

			valorLargura = (valorLargura + tamanhox)

			largura.innerText = "Largura: " + valorLargura.toFixed(2)

			handleCameraOnAdd(0);
			let tamanhoy = cube1BB.max.y - cube1BB.min.y;
			let tamanhoz = cube1BB.max.z - cube1BB.min.z;
			valorAltura = tamanhoy
			valorProfundidade = tamanhoz
			altura.innerText = "Altura: " + valorLargura.toFixed(2) + "m"
			profundidade.innerText = "Profundidade: " + valorProfundidade.toFixed(2) + "m"

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
				modelo.tipo == "chao" ? ids.push(gltf.scene.id) : idsCima.push(gltf.scene.id)
				modelo.tipo == "chao" ? criaCuboCima(true) : criaCubo(true)
			}
			else {
				ids.push(gltf.scene.id)
				idsCima.push(gltf.scene.id)

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

			botoes3d.push(botao)
			botoes3dCima.push(botaoCima)

			createButtonAdd(1, 0, scene.getObjectById(ids[0]), 0, "chao")

			createButtonAdd(-1, 0, scene.getObjectById(ids[0]), 0, "chao")
			createButtonAdd(0, 1, scene.getObjectById(ids[0]), 0, "chao")

			createButtonAdd(1, 0, scene.getObjectById(idsCima[0]), 0, "cima")

			createButtonAdd(-1, 0, scene.getObjectById(idsCima[0]), 0, "cima")
			createButtonAdd(0, 1, scene.getObjectById(idsCima[0]), 0, "cima")
			if (ids.length > 0 && idsCima.length > 0) addButton.classList.add('hide')
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
			let cubeEscolhido = scene.getObjectById(uuidEscolhido);

			let tamanhox = cube2BB.max.x - cube2BB.min.x;
			valorLargura = valorLargura + tamanhox;

			handleCameraOnAdd(cubeEscolhido.position.x);
			largura.innerText = "Largura: " + valorLargura.toFixed(2) + "m"
			let tamanhoy = cube2BB.max.y - cube2BB.min.y;
			valorAltura = tamanhoy

			const tamanhoz = cube2BB.max.z - cube2BB.min.z;
			valorProfundidade = tamanhoz
			profundidade.innerText = "Profundidade: " + valorProfundidade.toFixed(2) + "m"
			altura.innerText = "Altura: " + valorAltura.toFixed(2) + "m"
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

				let cubeDireita = ids[indexEscolhido + 1] ? scene.getObjectById(ids[indexEscolhido + 1]) : null
				if (cubeDireita && cubeDireita.name == "cubo") {
					scene.remove(cubeDireita)
				}
				ids[indexEscolhido + 1] ? ids[indexEscolhido + 1] = gltf.scene.id : ids.push(gltf.scene.id)

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
				if (!idsCima[indexEscolhido + 1])
					modelo.tamanhoy == 1 ? criaCuboCima(true) : idsCima.push(gltf.scene.id);
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

				botoes3dCima[indexEscolhido + 1] ? botoes3dCima[indexEscolhido + 1] = botoes3dCima[indexEscolhido + 1] : botoes3dCima.push(botaoCima)
				botoes3d[indexEscolhido + 1] ? botoes3d[indexEscolhido + 1] = botoes3d[indexEscolhido + 1] : botoes3d.push(botao)
				createButtonAdd(1, 0, gltf.scene, indexEscolhido + 1, "chao")
				createButtonAdd(-1, 0, gltf.scene, indexEscolhido + 1, "chao")
				createButtonAdd(0, 1, gltf.scene, indexEscolhido + 1, "chao")

				createButtonAdd(1, 0, scene.getObjectById(idsCima[indexEscolhido + 1]), indexEscolhido + 1, "cima")
				createButtonAdd(-1, 0, scene.getObjectById(idsCima[indexEscolhido + 1]), indexEscolhido + 1, "cima")
				createButtonAdd(0, 1, scene.getObjectById(idsCima[indexEscolhido + 1]), indexEscolhido + 1, "cima")

				//moveCamera(1)
				// esquerda
			} else if (px < 0) {
				let cubeEsquerda = ids[indexEscolhido - 1] ? scene.getObjectById(ids[indexEscolhido - 1]) : null
				if (cubeEsquerda && cubeEsquerda.name == "cubo") {
					scene.remove(cubeEsquerda)
				}
				ids[indexEscolhido - 1] ? ids[indexEscolhido - 1] = gltf.scene.id : ids.unshift(gltf.scene.id)
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
				if (!idsCima[indexEscolhido - 1]) modelo.tamanhoy == 1 ? criaCuboCima(true) : idsCima.unshift(gltf.scene.id)

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

				botoes3d[indexEscolhido - 1] ? botoes[indexEscolhido - 1] = botoes[indexEscolhido - 1] : botoes3d.unshift(botao)
				botoes3dCima[indexEscolhido - 1] ? botoes3dCima[indexEscolhido - 1] = botoes3dCima[indexEscolhido - 1] : botoes3dCima.unshift(botaoCima)
				createButtonAdd(1, 0, gltf.scene, indexEscolhido - 1 <= 0 ? 0 : indexEscolhido - 1, "chao")
				createButtonAdd(-1, 0, gltf.scene, indexEscolhido - 1 <= 0 ? 0 : indexEscolhido - 1, "chao")
				createButtonAdd(0, 1, gltf.scene, indexEscolhido - 1 <= 0 ? 0 : indexEscolhido - 1, "chao")

				createButtonAdd(1, 0, scene.getObjectById(idsCima[indexEscolhido - 1 >= 0 ? indexEscolhido - 1 : 0]), indexEscolhido - 1 >= 0 ? indexEscolhido - 1 : 0, "cima")
				createButtonAdd(-1, 0, scene.getObjectById(idsCima[indexEscolhido - 1 >= 0 ? indexEscolhido - 1 : 0]), indexEscolhido - 1 >= 0 ? indexEscolhido - 1 : 0, "cima")
				createButtonAdd(0, 1, scene.getObjectById(idsCima[indexEscolhido - 1 >= 0 ? indexEscolhido - 1 : 0]), indexEscolhido - 1 >= 0 ? indexEscolhido - 1 : 0, "cima")


				//moveCamera(-1)
			} else if (py < 0) {
				gltf.scene.userData.centroDireita = cubeEscolhido.userData.centroDireita
				gltf.scene.userData.centroEsquerda = cubeEscolhido.userData.centroEsquerda
				gltf.scene.userData.centro = cubeEscolhido.userData.centro

				let cubeRemover = scene.getObjectById(ids[indexEscolhido]);

				scene.remove(cubeRemover)
				ids[indexEscolhido] = gltf.scene.id

				let cubeEsquerda = ids[indexEscolhido - 1] ? scene.getObjectById(ids[indexEscolhido - 1]) : null
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
			let cubeEscolhido = scene.getObjectById(uuidEscolhido);

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

				let cubeDireita = idsCima[indexEscolhido + 1] ? scene.getObjectById(idsCima[indexEscolhido + 1]) : null;
				gltf.scene.userData.centroDireita = true
				cubeDireita ? idsCima[indexEscolhido + 1] = gltf.scene.id : idsCima.push(gltf.scene.id)
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
				if (!ids[indexEscolhido + 1]) {
					// ids[indexEscolhido+1] = 0;
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

				botoes3d[indexEscolhido + 1] ? botoes3d[indexEscolhido + 1] = botoes3d[indexEscolhido + 1] : botoes3d.push(botao)
				createButtonAdd(1, 0, scene.getObjectById(ids[indexEscolhido + 1]), indexEscolhido + 1, "chao")
				createButtonAdd(-1, 0, scene.getObjectById(ids[indexEscolhido + 1]), indexEscolhido + 1, "chao")
				createButtonAdd(0, 1, scene.getObjectById(ids[indexEscolhido + 1]), indexEscolhido + 1, "chao")

				botoes3dCima[indexEscolhido + 1] ? botoes3dCima[indexEscolhido + 1] = botoes3dCima[indexEscolhido + 1] : botoes3dCima.push(botaoCima)
				createButtonAdd(1, 0, scene.getObjectById(idsCima[indexEscolhido + 1]), indexEscolhido + 1, "cima")
				createButtonAdd(-1, 0, scene.getObjectById(idsCima[indexEscolhido + 1]), indexEscolhido + 1, "cima")
				createButtonAdd(0, 1, scene.getObjectById(idsCima[indexEscolhido + 1]), indexEscolhido + 1, "cima")

			}
			// esquerda
			else if (px < 0) {
				gltf.scene.userData.centroEsquerda = true

				let cubeEsquerda = idsCima[indexEscolhido - 1] ? scene.getObjectById(idsCima[indexEscolhido - 1]) : null;
				cubeEsquerda ? idsCima[indexEscolhido - 1] = gltf.scene.id : idsCima.unshift(gltf.scene.id)
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
				if (!ids[indexEscolhido - 1]) {
					// ids[indexEscolhido+1] = 0;
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

				botoes3d[indexEscolhido - 1] ? botoes3d[indexEscolhido - 1] = botoes3d[indexEscolhido - 1] : botoes3d.unshift(botao)
				createButtonAdd(1, 0, scene.getObjectById(ids[indexEscolhido - 1 >= 0 ? indexEscolhido - 1 : 0]), indexEscolhido - 1 >= 0 ? indexEscolhido - 1 : 0, "chao")
				createButtonAdd(-1, 0, scene.getObjectById(ids[indexEscolhido - 1 >= 0 ? indexEscolhido - 1 : 0]), indexEscolhido - 1 >= 0 ? indexEscolhido - 1 : 0, "chao")
				createButtonAdd(0, 1, scene.getObjectById(ids[indexEscolhido - 1 >= 0 ? indexEscolhido - 1 : 0]), indexEscolhido - 1 >= 0 ? indexEscolhido - 1 : 0, "chao")

				botoes3dCima[indexEscolhido - 1] ? botoes3dCima[indexEscolhido - 1] = botoes3dCima[indexEscolhido - 1] : botoes3dCima.unshift(botaoCima)
				createButtonAdd(1, 0, scene.getObjectById(idsCima[indexEscolhido - 1 >= 0 ? indexEscolhido - 1 : 0]), indexEscolhido - 1 >= 0 ? indexEscolhido - 1 : 0, "cima")
				createButtonAdd(-1, 0, scene.getObjectById(idsCima[indexEscolhido - 1 >= 0 ? indexEscolhido - 1 : 0]), indexEscolhido - 1 >= 0 ? indexEscolhido - 1 : 0, "cima")
				createButtonAdd(0, 1, scene.getObjectById(idsCima[indexEscolhido - 1 >= 0 ? indexEscolhido - 1 : 0]), indexEscolhido - 1 >= 0 ? indexEscolhido - 1 : 0, "cima")
			}
			// cima
			else if (py > 0) {
				gltf.scene.userData.centroDireita = cubeEscolhido.userData.centroDireita
				gltf.scene.userData.centroEsquerda = cubeEscolhido.userData.centroEsquerda
				gltf.scene.userData.centro = cubeEscolhido.userData.centro

				let cubeRemover = scene.getObjectById(idsCima[indexEscolhido]);

				scene.remove(cubeRemover)
				idsCima[indexEscolhido] = gltf.scene.id
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
		montagemGravada = montagemGravada
			.filter(function (passo) { return passo.id !== idRemovido; })
			.map(function (passo) {
				if (typeof passo.idx === 'number' && passo.idx > posicaoRemovida) {
					return Object.assign({}, passo, { idx: passo.idx - 1 });
				}
				return passo;
			});
	} else {
		// Removeu a peça real: ela vira um espaço vazio, sem afetar os índices das demais
		montagemGravada = montagemGravada.filter(function (passo) { return passo.id !== obj.id; });
	}
}

function remove() {
	const obj = scene.getObjectById(uuidEscolhido);

	let outroObj = obj.userData.modelo.tipo == "chao" ? scene.getObjectById(idsCima[indexEscolhido]) : scene.getObjectById(ids[indexEscolhido]);

	removerDaGravacao(obj, outroObj, indexEscolhido);

	for (let i = 0; i < botoes3d.length; i++) {
		scene.getObjectById(botoes3d[i].direita).visible = false
		scene.getObjectById(botoes3d[i].esquerda).visible = false
		scene.getObjectById(botoes3d[i].cima).visible = false
		scene.getObjectById(botoes3dCima[i].direita).visible = false
		scene.getObjectById(botoes3dCima[i].esquerda).visible = false
		scene.getObjectById(botoes3dCima[i].cima).visible = false

	}

	let botoesApagar = {
		direita: botoes3d[indexEscolhido].direita,
		esquerda: botoes3d[indexEscolhido].esquerda,
		cima: botoes3d[indexEscolhido].cima,

	}
	let botoesApagarCima = {
		direita: botoes3dCima[indexEscolhido].direita,
		esquerda: botoes3dCima[indexEscolhido].esquerda,
		cima: botoes3dCima[indexEscolhido].cima,

	}


	if (obj.name == "cubo") {

		let valorSubtrair = (obj.userData.tamanho.fimx - obj.userData.tamanho.iniciox) < 0 ? (obj.userData.tamanho.fimx - obj.userData.tamanho.iniciox) * -1 : (obj.userData.tamanho.fimx - obj.userData.tamanho.iniciox)
		valorLargura = valorLargura - valorSubtrair
		largura.innerText = "Largura: " + valorLargura.toFixed(2) + "m"
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
		if (ids[indexEscolhido] == idsCima[indexEscolhido]) criaCuboCima()
		obj.userData.modelo.tipo == "chao" ? criaCubo() : criaCuboCima()

		scene.remove(obj);
	}
	indexAntigo = null
	if (ids.length == 0 && idsCima.length == 0) addButton.classList.remove('hide')

}

function realocaModelo() {

	let cubeApagar = scene.getObjectById(ids[indexEscolhido]);
	let tamanhoApagar = cubeApagar.userData.tamanho.fimx - cubeApagar.userData.tamanho.iniciox

	if (cubeApagar.userData.centroEsquerda) {
		for (let i = indexEscolhido; i >= 0; i--) {
			let cubeAtual = scene.getObjectById(ids[i]);
			let cubeAtualCima = scene.getObjectById(idsCima[i]);
			if (i - 1 >= 0) {
				let cubeDireita = scene.getObjectById(ids[i + 1]);
				let cubeEsquerda = scene.getObjectById(ids[i - 1]);
				let cubeDireitaCima = scene.getObjectById(idsCima[i + 1]);
				let cubeEsquerdaCima = scene.getObjectById(idsCima[i - 1]);
				let cubeDireitaBotao = scene.getObjectById(botoes3d[i - 1].direita);
				let cubeEsquerdaBotao = scene.getObjectById(botoes3d[i - 1].esquerda);
				let cubeCimaBotao = scene.getObjectById(botoes3d[i - 1].cima);
				let cubeDireitaCimaBotao = scene.getObjectById(botoes3dCima[i - 1].direita);
				let cubeEsquerdaCimaBotao = scene.getObjectById(botoes3dCima[i - 1].esquerda);
				let cubeCimaCimaBotao = scene.getObjectById(botoes3dCima[i - 1].cima);
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
				let cubeEsquerda = scene.getObjectById(ids[i]);
				let cubeEsquerdaCima = scene.getObjectById(idsCima[i]);
				cubeEsquerda.userData.esquerda = cubeAtual.userData.esquerda;
				cubeEsquerdaCima.userData.esquerda = cubeAtualCima.userData.esquerda;
			}
		}
	}
	else {
		for (let i = indexEscolhido; i < ids.length; i++) {
			let cubeAtual = scene.getObjectById(ids[i]);
			let cubeAtualCima = scene.getObjectById(idsCima[i]);
			if (i + 1 < ids.length && i - 1 > 0) {
				let cubeDireita = scene.getObjectById(ids[i + 1]);
				let cubeDireitaCima = scene.getObjectById(idsCima[i + 1]);
				let cubeDireitaBotao = scene.getObjectById(botoes3d[i + 1].direita);
				let cubeEsquerdaBotao = scene.getObjectById(botoes3d[i + 1].esquerda);
				let cubeCimaBotao = scene.getObjectById(botoes3d[i + 1].cima);
				let cubeDireitaCimaBotao = scene.getObjectById(botoes3dCima[i + 1].direita);
				let cubeEsquerdaCimaBotao = scene.getObjectById(botoes3dCima[i + 1].esquerda);
				let cubeCimaCimaBotao = scene.getObjectById(botoes3dCima[i + 1].cima);
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

				let cubeEsquerda = scene.getObjectById(ids[i - 1]);
				let cubeEsquerdaCima = scene.getObjectById(idsCima[i - 1]);
				cubeEsquerda.userData.direita = cubeAtual.userData.direita;
				cubeEsquerdaCima.userData.direita = cubeAtualCima.userData.direita;

			}
			else if (i + 1 < ids.length) {

				let cubeDireita = scene.getObjectById(ids[i + 1]);
				let cubeDireitaCima = scene.getObjectById(idsCima[i + 1]);
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

	ids.splice(indexEscolhido, 1);
	idsCima.splice(indexEscolhido, 1);
	botoes3d.splice(indexEscolhido, 1);
	botoes3dCima.splice(indexEscolhido, 1);
}

function criaCubo(embaixo = false, nome = "cubo") {
	corEscolhida = "#000000";

	const material = new THREE.MeshBasicMaterial({ color: corEscolhida, transparent: true, opacity: 0 });

	let cubeEscolhido = idsCima.length == 1 ? scene.getObjectById(idsCima[0]) : scene.getObjectById(idsCima[indexEscolhido]);
	let cubeCima;
	if (ladoEscolhido == "esquerda") cubeCima = idsCima.length == 1 ? scene.getObjectById(idsCima[0]) : scene.getObjectById(idsCima[indexEscolhido]);
	else cubeCima = idsCima.length == 1 ? scene.getObjectById(idsCima[0]) : scene.getObjectById(idsCima[indexEscolhido + 1]);

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
	embaixo ? (ladoEscolhido == "esquerda" && indexEscolhido == 0 ? ids.unshift(cube.id) : ids.push(cube.id)) : ids[indexEscolhido] = cube.id;

	if (ladoEscolhido == "direita") {
		embaixo ? cube.position.setX(cubeCima.position.x) : cube.position.setX(cubeEscolhido.position.x);
	}
	else {
		embaixo ? cube.position.setX(cubeCima.position.x) : cube.position.setX(cubeEscolhido.position.x);
	}
	cube.position.getComponent(0);
	cube.name = "cubo"
}
function criaCuboCima(emcima = false, nome = "cubo") {

	corEscolhida = "#000000";


	const material = new THREE.MeshBasicMaterial({ color: corEscolhida, transparent: true, opacity: 0 });


	let cubeEscolhido = ids.length == 1 ? scene.getObjectById(ids[0]) : scene.getObjectById(ids[indexEscolhido])

	let cubeBaixo = ids.length == 1 ? scene.getObjectById(ids[0]) : scene.getObjectById(ids[indexEscolhido + 1]);

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

	emcima ? (ladoEscolhido == "esquerda" && indexEscolhido == 0 ? idsCima.unshift(cube.id) : idsCima.push(cube.id)) : idsCima[indexEscolhido] = cube.id;

	if (ladoEscolhido == "direita") {
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

window.addEventListener('click', function () {
	if (modoVisualizacao) return;
	pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
	pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;
	raycaster.setFromCamera(pointer, camera);
	var intersects = raycaster.intersectObjects(scene.children);

	if (intersects.length > 0) {
		menuDiv.classList.add("label");
		const position = intersects[0].object.position;
		uuidEscolhido = intersects[0].object.name == "cubo" ? intersects[0].object.id : intersects[0].object.parent.id;

		let cubeEscolhido = scene.getObjectById(uuidEscolhido);

		if (!cubeEscolhido.userData.tamanho) {

			uuidEscolhido = intersects[0].object.parent.parent.id;
			cubeEscolhido = scene.getObjectById(uuidEscolhido);
		}

		removeButton.classList.add('hide')
		indexEscolhido = cubeEscolhido.userData.modelo.tipo == "chao" ? ids.indexOf(uuidEscolhido) : idsCima.indexOf(uuidEscolhido)

		let listaContraria = cubeEscolhido.userData.modelo.tipo == "chao" ? idsCima : ids
		if (cubeEscolhido.name == "cubo") {
			removeButton.classList.add('hide')
			if (scene.getObjectById(listaContraria[indexEscolhido]).name == "cubo") {
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
	}
})

function onPointerMove(event) {
	pointer.x = (event.clientX / tamanhoScene) * 2 - 1;
	pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;
	raycaster.setFromCamera(pointer, camera);
	var intersects = raycaster.intersectObjects(scene.children);

	if (intersects.length > 0) {
		document.body.style.cursor = 'pointer'
		const position = intersects[0].object.position;
		uuidEscolhidoTemporario = intersects[0].object.parent.id;
		let cubeEscolhido = scene.getObjectById(uuidEscolhidoTemporario);

		if (intersects[0].object.name != "cubo" && intersects[0].object.name != "botao") {
			if (!indexAntigo || indexAntigo != uuidEscolhidoTemporario) {
				if (indexAntigo) {


					let cubeEscolhido = scene.getObjectById(indexAntigo);
					cubeEscolhido.children[cubeEscolhido.children.length > 1 ? 1 : 0].material.opacity = 1
					cubeEscolhido.children[cubeEscolhido.children.length > 1 ? 1 : 0].material.transparent = true
				}
				indexAntigo = uuidEscolhidoTemporario
			}
			cubeEscolhido.children[cubeEscolhido.children.length > 1 ? 1 : 0].material.opacity = 0.5
			cubeEscolhido.children[cubeEscolhido.children.length > 1 ? 1 : 0].material.transparent = true
		}
	}
	else {
		document.body.style.cursor = 'auto'
		if (indexAntigo) {
			let cubeEscolhido = scene.getObjectById(indexAntigo);

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
			xEscolhido = 1;
			yEscolhido = 0
			adicionaCubo = true;
			ladoEscolhido = "direita"

			pointer.x = (event.clientX / tamanhoScene) * 2 - 1;
			pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;
			raycaster.setFromCamera(pointer, camera);
			var intersects = raycaster.intersectObjects(scene.children);

			if (intersects.length > 0) {
				menuDiv.classList.add("label");
				const position = intersects[0].object.position;
				uuidEscolhido = intersects[0].object.name == "cubo" ? intersects[0].object.id : intersects[0].object.parent.id;

				let cubeEscolhido = scene.getObjectById(uuidEscolhido);


				if (!cubeEscolhido.userData.tamanho) {

					uuidEscolhido = intersects[0].object.parent.parent.id;
					cubeEscolhido = scene.getObjectById(uuidEscolhido);
				}

				indexEscolhido = tipo == "chao" ? ids.indexOf(uuidEscolhido) : idsCima.indexOf(uuidEscolhido);
			}
			else {

				for (let k = 0; k < botoes3d.length; k++) {

					if (botoes3dCima[k].direita == window['btnDireita'].id) {
						indexEscolhido = k

						uuidEscolhido = tipo == "chao" ? ids[indexEscolhido] : idsCima[indexEscolhido]
					}
					if (botoes3d[k].direita == window['btnDireita'].id) {
						indexEscolhido = k

						uuidEscolhido = tipo == "chao" ? ids[indexEscolhido] : idsCima[indexEscolhido]
					}

				}

			}
			{
				const passoGravado = { fn: tipo == "chao" ? 'c' : 't', k: modeloEscolhido.chave, px: xEscolhido, py: yEscolhido, idx: indexEscolhido }
				const aoConcluir = function (id) { passoGravado.id = id; montagemGravada.push(passoGravado) }
				tipo == "chao" ? criaObjetoChao(modeloEscolhido, xEscolhido, yEscolhido, aoConcluir) : criaObjetoCima(modeloEscolhido, xEscolhido, yEscolhido, indexEscolhido, aoConcluir)
			}
			for (let j = 0; j < tipo == "chao" ? botoes3d.length : botoes3dCima.length; j++) {
				const botaoDireita = scene.getObjectById(tipo == "chao" ? botoes3d[j].direita : botoes3dCima[j].direita);
				const botaoEsquerda = scene.getObjectById(tipo == "chao" ? botoes3d[j].esquerda : botoes3dCima[j].esquerda);
				const botaoCima = scene.getObjectById(botoes3d[j].cima);

				botaoDireita.visible = false
				botaoEsquerda.visible = false
				botaoCima.visible = false

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


		tipo == "chao" ? botoes3d[i].direita = window['btnDireita'].id : botoes3dCima[i].direita = window['btnDireita'].id;
		scene.add(window['btnDireita']);

	}
	else if (x == -1) {
		const addButtonEsquerda = document.createElement('button');
		addButtonEsquerda.className = 'btnAdd backgroundImage';

		const btnAddEsquerda = new CSS3DObject(addButtonEsquerda);
		addButtonEsquerda.addEventListener('pointerdown', function (event) {
			xEscolhido = -1;
			yEscolhido = 0
			adicionaCubo = true;
			ladoEscolhido = "esquerda"

			pointer.x = (event.clientX / tamanhoScene) * 2 - 1;
			pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;
			raycaster.setFromCamera(pointer, camera);
			var intersects = raycaster.intersectObjects(scene.children);

			if (intersects.length > 0) {
				menuDiv.classList.add("label");
				const position = intersects[0].object.position;
				uuidEscolhido = intersects[0].object.name == "cubo" ? intersects[0].object.id : intersects[0].object.parent.id;

				let cubeEscolhido = scene.getObjectById(uuidEscolhido);


				if (!cubeEscolhido.userData.tamanho) {

					uuidEscolhido = intersects[0].object.parent.parent.id;
					cubeEscolhido = scene.getObjectById(uuidEscolhido);
				}

				indexEscolhido = tipo == "chao" ? ids.indexOf(uuidEscolhido) : idsCima.indexOf(uuidEscolhido);

			}
			else {

				for (let k = 0; k < botoes3d.length; k++) {

					if (botoes3dCima[k].esquerda == btnAddEsquerda.id) {
						indexEscolhido = k

						uuidEscolhido = tipo == "chao" ? ids[indexEscolhido] : idsCima[indexEscolhido]
					}
					if (botoes3d[k].esquerda == btnAddEsquerda.id) {
						indexEscolhido = k

						uuidEscolhido = tipo == "chao" ? ids[indexEscolhido] : idsCima[indexEscolhido]
					}

				}

			}
			{
				const passoGravado = { fn: tipo == "chao" ? 'c' : 't', k: modeloEscolhido.chave, px: xEscolhido, py: yEscolhido, idx: indexEscolhido }
				const aoConcluir = function (id) { passoGravado.id = id; montagemGravada.push(passoGravado) }
				tipo == "chao" ? criaObjetoChao(modeloEscolhido, xEscolhido, yEscolhido, aoConcluir) : criaObjetoCima(modeloEscolhido, xEscolhido, yEscolhido, indexEscolhido, aoConcluir)
			}
			for (let j = 0; j < tipo == "chao" ? botoes3d.length : botoes3dCima.length; j++) {
				const botaoDireita = scene.getObjectById(tipo == "chao" ? botoes3d[j].direita : botoes3dCima[j].direita);
				const botaoEsquerda = scene.getObjectById(tipo == "chao" ? botoes3d[j].esquerda : botoes3dCima[j].esquerda);
				const botaoCima = scene.getObjectById(botoes3d[j].cima);

				botaoDireita.visible = false
				botaoEsquerda.visible = false
				botaoCima.visible = false

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
		tipo == "chao" ? botoes3d[i].esquerda = btnAddEsquerda.id : botoes3dCima[i].esquerda = btnAddEsquerda.id;

		scene.add(btnAddEsquerda);
	}
	else if (y == 1) {
		const addButtonCima = document.createElement('button');
		addButtonCima.className = 'btnAdd backgroundImage';

		const btnAddCima = new CSS3DObject(addButtonCima);

		addButtonCima.addEventListener('pointerdown', function (event) {

			xEscolhido = 0;
			yEscolhido = 1;
			adicionaCubo = true;
			ladoEscolhido = "cima";

			pointer.x = (event.clientX / tamanhoScene) * 2 - 1;
			pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;
			raycaster.setFromCamera(pointer, camera);
			var intersects = raycaster.intersectObjects(scene.children);

			if (intersects.length > 0) {
				menuDiv.classList.add("label");
				const position = intersects[0].object.position;
				uuidEscolhido = intersects[0].object.name == "cubo" ? intersects[0].object.id : intersects[0].object.parent.id;

				let cubeEscolhido = scene.getObjectById(uuidEscolhido);


				if (!cubeEscolhido.userData.tamanho) {

					uuidEscolhido = intersects[0].object.parent.parent.id;
					cubeEscolhido = scene.getObjectById(uuidEscolhido);
				}

				indexEscolhido = cubeEscolhido.userData.modelo.tipo == "chao" ? ids.indexOf(uuidEscolhido) : idsCima.indexOf(uuidEscolhido);

			}

			{
				const passoGravado = { fn: 't', k: modeloEscolhido.chave, px: xEscolhido, py: yEscolhido, idx: indexEscolhido }
				criaObjetoCima(modeloEscolhido, xEscolhido, yEscolhido, indexEscolhido, function (id) {
					passoGravado.id = id
					montagemGravada.push(passoGravado)
				})
			}
			for (let j = 0; j < tipo == "chao" ? botoes3d.length : botoes3dCima.length; j++) {
				const botaoDireita = scene.getObjectById(tipo == "chao" ? botoes3d[j].direita : botoes3dCima[j].direita);
				const botaoEsquerda = scene.getObjectById(tipo == "chao" ? botoes3d[j].esquerda : botoes3dCima[j].esquerda);
				const botaoCima = scene.getObjectById(botoes3d[j].cima);

				botaoDireita.visible = false
				botaoEsquerda.visible = false
				botaoCima.visible = false

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
		tipo == "chao" ? botoes3d[i].cima = btnAddCima.id : botoes3dCima[i].cima = btnAddCima.id;
		scene.add(btnAddCima);
	}
	else if (y == -1) {
		const btnAddBaixo = new CSS3DObject(addButtonBaixo);
		btnAddBaixo.scale.set(0.01, 0.01, 1)
		btnAddBaixo.position.setZ(0.6)
		btnAddBaixo.position.setX(-1.5)
		btnAddBaixo.name = "botao"
		scene.add(btnAddBaixo);

	}

}

function resetaCamera() {
	gsap.to(camera.position, {
		x: cameraInicialx,
		y: cameraInicialy,
		z: cameraInicialz != 0 ? cameraInicialz : 5,
		duration: 1,
		onStart: () => { controls.enabled = false },
		onComplete: () => { controls.enabled = true; }
	})
	gsap.to(controls.target, {
		x: cameraInicialx,
		y: cameraInicialy,
		onStart: () => { controls.enabled = false },
		onComplete: () => { controls.enabled = true }
	})
	gsap.to(camera, { zoom: 0, duration: 0.5 })
}


function verificaPosBotoes() {
	for (let i = 0; i < ids.length; i++) {
		const cubeEscolhido = scene.getObjectById(ids[i]);
		let botaoDireita = scene.getObjectById(botoes3d[i].direita);
		i == 0 || i == ids.length - 1 ? botaoDireita.visible = true : botaoDireita.visible = false
		let botaoEsquerda = scene.getObjectById(botoes3d[i].esquerda);
		i == 0 || i == ids.length - 1 ? botaoEsquerda.visible = true : botaoEsquerda.visible = false
		let botaoCima = scene.getObjectById(botoes3d[i].cima);
		botaoCima.visible = false;

		let botaoDireitaCima = scene.getObjectById(botoes3dCima[i].direita);
		i == 0 || i == ids.length - 1 ? botaoDireitaCima.visible = true : botaoDireitaCima.visible = false
		let botaoEsquerdaCima = scene.getObjectById(botoes3dCima[i].esquerda);
		i == 0 || i == ids.length - 1 ? botaoEsquerdaCima.visible = true : botaoEsquerdaCima.visible = false
		let botaoCimaCima = scene.getObjectById(botoes3dCima[i].cima);
		botaoCimaCima.visible = false

		if (movelEscolhido.tipo == "chao") {

			botaoDireitaCima.visible = false
			botaoEsquerdaCima.visible = false

		}
		if (movelEscolhido.tipo == "cima") {
			botaoDireita.visible = false
			botaoEsquerda.visible = false

			let cubeCima = scene.getObjectById(idsCima[i]);
			if (cubeCima.name == "cubo") botaoCima.visible = true
		}

		if (i + 1 < ids.length) {
			const cubeDireita = scene.getObjectById(ids[i + 1]);
			const cubeDireitaCima = scene.getObjectById(idsCima[i + 1]);


			if (movelEscolhido.tipo == "chao" && cubeDireita.name == "cubo" && cubeDireita.userData.modelo.tamanhox == movelEscolhido.tamanhox) {
				botaoDireita.visible = true
			}
			else if (movelEscolhido.tipo == "cima" && cubeDireitaCima.name == "cubo" && cubeDireitaCima.userData.modelo.tamanhox == movelEscolhido.tamanhox) {
				botaoDireitaCima.visible = true
			}
			else {
				botaoDireita.visible = false
				botaoDireitaCima.visible = false

			}
		}
		if (i - 1 >= 0) {
			const cubeEsquerda = scene.getObjectById(ids[i - 1]);
			const cubeEsquerdaCima = scene.getObjectById(idsCima[i - 1]);

			if (movelEscolhido.tipo == "chao" && cubeEsquerda.name == "cubo" && cubeEsquerda.userData.modelo.tamanhox == movelEscolhido.tamanhox) {
				botaoEsquerda.visible = true
			}
			else if (movelEscolhido.tipo == "cima" && cubeEsquerdaCima.name == "cubo" && cubeEsquerdaCima.userData.modelo.tamanhox == movelEscolhido.tamanhox) {
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
	if (valorXMaior < valorXCube) {
		valorXMaior = valorXCube
		quantidadeItens += 1;
		cameraInicialz = (quantidadeItens / 50) + camera.position.z
	}
	if (valorXMenor > valorXCube) {
		valorXMenor = valorXCube
		quantidadeItens += 1;
		cameraInicialz = (quantidadeItens / 50) + camera.position.z
	}

	cameraInicialx = (valorXMenor + (valorXMaior - valorXMenor) / 2);
	gsap.to(controls.target, {
		x: cameraInicialx,
		onStart: () => { controls.enabled = false },
		onComplete: () => { controls.enabled = true }
	})
	gsap.to(camera.position, {
		z: cameraInicialz,
		x: cameraInicialx,
		onStart: () => { controls.enabled = false },
		onComplete: () => { controls.enabled = true }
	})

	controls.update();
}


// WebXR - Realidade Aumentada
let arSession = null;
let hitTestSource = null;
let hitTestSourceRequested = false;

function onSelect() {
	if (reticle.visible) {
		const posicaoMundo = new THREE.Vector3();
		reticle.getWorldPosition(posicaoMundo);
		scene.position.copy(posicaoMundo);
	}
}

async function onSessionStarted(session) {
	arSession = session;
	hitTestSourceRequested = false;
	hitTestSource = null;

	session.addEventListener('end', onSessionEnded);
	session.addEventListener('select', onSelect);

	renderer.xr.setReferenceSpaceType('local');
	await renderer.xr.setSession(session);

	scene.background = null;
	reticle.visible = false;
	btnRa.classList.add('btnAtivo');
}

function onSessionEnded() {
	arSession.removeEventListener('end', onSessionEnded);
	arSession.removeEventListener('select', onSelect);
	arSession = null;
	hitTestSourceRequested = false;
	hitTestSource = null;

	scene.background = corDeFundoOriginal;
	scene.position.set(0, 0, 0);
	reticle.visible = false;
	btnRa.classList.remove('btnAtivo');
}

let raSuportada = false;

btnRa.addEventListener('pointerdown', function () {
	if (arSession !== null) {
		arSession.end();
		return;
	}

	if (!raSuportada) {
		abrirModalQRCode();
		return;
	}

	navigator.xr.requestSession('immersive-ar', { requiredFeatures: ['hit-test'] })
		.then(onSessionStarted)
		.catch(function (erro) {
			console.warn('Não foi possível iniciar a sessão de RA', erro);
			abrirModalQRCode();
		});
});

if ('xr' in navigator) {
	navigator.xr.isSessionSupported('immersive-ar').then(function (suportado) {
		raSuportada = suportado;
		btnRa.title = suportado ? 'Ver em Realidade Aumentada' : 'Ver no celular via QR Code';
	});
} else {
	btnRa.title = 'Ver no celular via QR Code';
}

// Se a página foi aberta via QR Code, remonta automaticamente a montagem antes de liberar o botão de RA
if (receitaURL) {
	btnRa.disabled = true;
	remontarDaURL(desserializarMontagem(receitaURL)).finally(function () {
		btnRa.disabled = false;
	});
}

function animate(timestamp, frame) {

	if (frame) {

		const referenceSpace = renderer.xr.getReferenceSpace();
		const session = renderer.xr.getSession();

		if (!hitTestSourceRequested) {
			session.requestReferenceSpace('viewer').then(function (viewerSpace) {
				session.requestHitTestSource({ space: viewerSpace }).then(function (source) {
					hitTestSource = source;
				});
			});
			hitTestSourceRequested = true;
		}

		if (hitTestSource) {
			const hitTestResults = frame.getHitTestResults(hitTestSource);

			if (hitTestResults.length > 0) {
				const hit = hitTestResults[0];
				const pose = hit.getPose(referenceSpace);
				const posicaoMundo = new THREE.Vector3().setFromMatrixPosition(
					new THREE.Matrix4().fromArray(pose.transform.matrix)
				);

				reticle.visible = true;
				reticle.position.copy(posicaoMundo).sub(scene.position);
			} else {
				reticle.visible = false;
			}
		}
	} else {
		controls.update();
	}

	if (!renderer.xr.isPresenting) {
		labelRenderer.render(scene, camera);
		botoesRenderer.render(scene, camera);
	}

	renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);
