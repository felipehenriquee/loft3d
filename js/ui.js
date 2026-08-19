import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import { Objetos } from './objects.js';
import { state } from './state.js';
import { scene, modoVisualizacao } from './scene.js';
import { criaObjeto, verificaPosBotoes, resetaCamera, remove } from './assembly.js';
import { dispositivoMovel, modelViewerAR, atualizarModeloAR } from './ar.js';
import { abrirModalQRCode } from './qrcode-share.js';

// Selo de versão, pra conferir se o site publicado já tem a última mudança
const versaoDiv = document.createElement('div');
versaoDiv.className = 'versaoApp';
versaoDiv.textContent = 'v' + __APP_VERSION__;
versaoDiv.title = 'Build: ' + __BUILD_TIME__;
document.body.appendChild(versaoDiv);

// criação menu
export const menuDiv = document.createElement('div');
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
export const objetos = new Objetos();
export let botoes = []
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

export const btnRa = document.createElement('button');
btnRa.className = 'backgroundImage btnCompartilhar btnRa';
btnRa.title = 'Ver em Realidade Aumentada';
const botaoRa = new CSS2DObject(btnRa);

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

export const removeButton = document.createElement('button');
removeButton.className = 'btnRemove backgroundImage hide';
removeButton.addEventListener('pointerdown', function (event) {
	state.selectedIndex = state.selectedIndex
	remove()
	removeButton.classList.add('hide')
});
export const btnRemove = new CSS3DObject(removeButton);
btnRemove.scale.set(0.01, 0.01, 1)
btnRemove.position.setZ(0.6)

export const addButton = document.createElement('button');
addButton.className = 'btnAdd backgroundImage addMain';
addButton.addEventListener('pointerdown', function (event) {
	state.selectedObjectId = state.hoveredObjectId;
});
const btnAdd = new CSS3DObject(addButton);
btnAdd.scale.set(0.01, 0.01, 1)
btnAdd.position.setZ(0.6)
btnAdd.position.setX(-1.5)


export const info = document.createElement('div')
info.classList.add('infoTamanho')
export const largura = document.createElement('p')
largura.innerText = "Largura: " + state.totalWidth
export const altura = document.createElement('p')
altura.innerText = "Altura: " + state.totalHeight

export const profundidade = document.createElement('p')
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

const closeButton = document.createElement('button');
closeButton.textContent = "X"
closeButton.className = 'botaoFechar';
closeButton.addEventListener('pointerdown', function (event) {
	menuDiv.classList.add("hide");
});
