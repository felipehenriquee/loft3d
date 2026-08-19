import * as THREE from 'three';
import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import { state } from './state.js';
import { scene, camera, controls, raycaster, pointer, tamanhoScene, loader, modoVisualizacao } from './scene.js';
import { menuDiv, removeButton, btnRemove, addButton, largura, altura, profundidade } from './ui.js';
import { atualizarModeloAR } from './ar.js';

// Chamado quando o GLTFLoader falha ao carregar um modelo (ex: URL fora do ar, rede caiu):
// sem isso o carregamento falhava em silêncio, sem log nem qualquer aviso pro usuário
function avisaErroCarregamento(modelo, error) {
	console.error('Falha ao carregar o modelo "' + modelo.nome + '" (' + modelo.local + '):', error);
	alert('Não foi possível carregar "' + modelo.nome + '". Verifique sua conexão e tente novamente.');
}

// Entrada vazia de botões (direita/esquerda/cima/baixo) rastreados por coluna em
// state.groundButtons/state.topButtons, antes de qualquer botão ser criado ali
function criaBotoesVazio() {
	return { direita: "", esquerda: "", cima: "", baixo: "" };
}

// Garante a entrada de botões (chão e cima) no índice dado — reaproveita se já existir, senão
// cria uma vazia — e cria os 4 botões de direção do chão + 3 do topo (a fileira de cima nunca
// ganha botão "baixo") apontando pros objetos daquele índice. Bloco repetido em criaObjeto,
// criaObjetoChao e criaObjetoCima toda vez que uma coluna nova ganha vizinhos.
// groundJaTinhaEntrada/topJaTinhaEntrada precisam vir calculados pelo chamador, ANTES de
// qualquer mutação em groundIds/topIds/groundButtons/topButtons: no caso "noInicio" (unshift),
// checar os arrays já mutados aqui dentro daria falso positivo (a entrada "antiga" que ainda
// não foi deslocada engana a checagem, e o unshift que faltava nunca acontece)
function registraBotoesDaColuna(indiceGround, cubeGround, groundJaTinhaEntrada, indiceTop, cubeTop, topJaTinhaEntrada, noInicio) {
	if (!groundJaTinhaEntrada) {
		noInicio ? state.groundButtons.unshift(criaBotoesVazio()) : state.groundButtons.push(criaBotoesVazio());
	}
	if (!topJaTinhaEntrada) {
		noInicio ? state.topButtons.unshift(criaBotoesVazio()) : state.topButtons.push(criaBotoesVazio());
	}

	createButtonAdd(1, 0, cubeGround, indiceGround, "chao");
	createButtonAdd(-1, 0, cubeGround, indiceGround, "chao");
	createButtonAdd(0, 1, cubeGround, indiceGround, "chao");
	createButtonAdd(0, -1, cubeGround, indiceGround, "chao");

	createButtonAdd(1, 0, cubeTop, indiceTop, "cima");
	createButtonAdd(-1, 0, cubeTop, indiceTop, "cima");
	createButtonAdd(0, 1, cubeTop, indiceTop, "cima");
}

function criaObjeto(modelo, onDone) {

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
			altura.innerText = "Altura: " + state.totalHeight.toFixed(2) + "m"
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
				modelo.tipo == "chao" ? criaPlaceholderCima(true) : criaPlaceholder(true)
			}
			else {
				state.groundIds.push(gltf.scene.id)
				state.topIds.push(gltf.scene.id)

			}

			registraBotoesDaColuna(0, scene.getObjectById(state.groundIds[0]), false, 0, scene.getObjectById(state.topIds[0]), false, false);
			if (state.groundIds.length > 0 && state.topIds.length > 0) addButton.classList.add('hide')
			if (onDone) onDone(gltf.scene.id);
		},
		// called while loading is progressing
		function (xhr) {},
		// called when loading has errors
		function (error) { avisaErroCarregamento(modelo, error); }
	);

}
function criaObjetoChao(modelo, direcaoX, direcaoY, onDone) {
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
			if (direcaoX > 0) {

				let cubeDireita = state.groundIds[state.selectedIndex + 1] ? scene.getObjectById(state.groundIds[state.selectedIndex + 1]) : null
				if (cubeDireita && cubeDireita.name == "placeholder") {
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
				const groundJaTinhaEntradaDireita = !!state.groundButtons[state.selectedIndex + 1];
				const topJaTinhaEntradaDireita = !!state.topButtons[state.selectedIndex + 1];

				if (!state.topIds[state.selectedIndex + 1])
					modelo.tamanhoy == 1 ? criaPlaceholderCima(true) : state.topIds.push(gltf.scene.id);

				registraBotoesDaColuna(state.selectedIndex + 1, gltf.scene, groundJaTinhaEntradaDireita, state.selectedIndex + 1, scene.getObjectById(state.topIds[state.selectedIndex + 1]), topJaTinhaEntradaDireita, false);

				//moveCamera(1)
				// esquerda
			} else if (direcaoX < 0) {
				const groundJaTinhaEntradaEsquerda = !!state.groundButtons[state.selectedIndex - 1];
				const topJaTinhaEntradaEsquerda = !!state.topButtons[state.selectedIndex - 1];

				let cubeEsquerda = state.groundIds[state.selectedIndex - 1] ? scene.getObjectById(state.groundIds[state.selectedIndex - 1]) : null
				if (cubeEsquerda && cubeEsquerda.name == "placeholder") {
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
				if (!state.topIds[state.selectedIndex - 1]) modelo.tamanhoy == 1 ? criaPlaceholderCima(true) : state.topIds.unshift(gltf.scene.id)

				const indiceVizinhoEsquerda = Math.max(state.selectedIndex - 1, 0);
				registraBotoesDaColuna(indiceVizinhoEsquerda, gltf.scene, groundJaTinhaEntradaEsquerda, indiceVizinhoEsquerda, scene.getObjectById(state.topIds[indiceVizinhoEsquerda]), topJaTinhaEntradaEsquerda, true);

				//moveCamera(-1)
			} else if (direcaoY < 0) {
				gltf.scene.userData.centroDireita = cubeEscolhido.userData.centroDireita
				gltf.scene.userData.centroEsquerda = cubeEscolhido.userData.centroEsquerda
				gltf.scene.userData.centro = cubeEscolhido.userData.centro

				let cubeRemover = scene.getObjectById(state.groundIds[state.selectedIndex]);

				scene.remove(cubeRemover)
				state.groundIds[state.selectedIndex] = gltf.scene.id

				let cubeEsquerda = state.groundIds[state.selectedIndex - 1] ? scene.getObjectById(state.groundIds[state.selectedIndex - 1]) : null
				if (cubeEsquerda && cubeEsquerda.name == "placeholder") {
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
		function (error) { avisaErroCarregamento(modelo, error); }
	);

}

function criaObjetoCima(modelo, direcaoX, direcaoY, onDone) {
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
			if (direcaoX > 0) {

				let cubeDireita = state.topIds[state.selectedIndex + 1] ? scene.getObjectById(state.topIds[state.selectedIndex + 1]) : null;
				gltf.scene.userData.centroDireita = true
				cubeDireita ? state.topIds[state.selectedIndex + 1] = gltf.scene.id : state.topIds.push(gltf.scene.id)
				if (cubeDireita && cubeDireita.name == "placeholder") {
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

				const groundJaTinhaEntradaDireita = !!state.groundButtons[state.selectedIndex + 1];
				const topJaTinhaEntradaDireita = !!state.topButtons[state.selectedIndex + 1];

				if (!state.groundIds[state.selectedIndex + 1]) {
					criaPlaceholder(true)

				}

				registraBotoesDaColuna(state.selectedIndex + 1, scene.getObjectById(state.groundIds[state.selectedIndex + 1]), groundJaTinhaEntradaDireita, state.selectedIndex + 1, gltf.scene, topJaTinhaEntradaDireita, false);

			}
			// esquerda
			else if (direcaoX < 0) {
				gltf.scene.userData.centroEsquerda = true

				const groundJaTinhaEntradaEsquerda = !!state.groundButtons[state.selectedIndex - 1];
				const topJaTinhaEntradaEsquerda = !!state.topButtons[state.selectedIndex - 1];

				let cubeEsquerda = state.topIds[state.selectedIndex - 1] ? scene.getObjectById(state.topIds[state.selectedIndex - 1]) : null;
				cubeEsquerda ? state.topIds[state.selectedIndex - 1] = gltf.scene.id : state.topIds.unshift(gltf.scene.id)
				if (cubeEsquerda && cubeEsquerda.name == "placeholder") {
					scene.remove(cubeEsquerda)

				}
				gltf.scene.position.setX(cubeEscolhido.position.x + (cubeEscolhido.box3.min.x) + gltf.scene.box3.min.x);

				gltf.scene.userData.tamanho = {
					iniciox: cubeEscolhido.box3.min.x,
					fimx: cubeEscolhido.box3.min.x - tamanhox,
					inicioy: gltf.scene.box3.min.y,
					fimy: gltf.scene.box3.max.y
				}
				if (!state.groundIds[state.selectedIndex - 1]) {
					criaPlaceholder(true)

				}

				const indiceVizinhoEsquerda = Math.max(state.selectedIndex - 1, 0);
				registraBotoesDaColuna(indiceVizinhoEsquerda, scene.getObjectById(state.groundIds[indiceVizinhoEsquerda]), groundJaTinhaEntradaEsquerda, indiceVizinhoEsquerda, gltf.scene, topJaTinhaEntradaEsquerda, true);
			}
			// cima
			else if (direcaoY > 0) {
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
		function (error) { avisaErroCarregamento(modelo, error); }
	);

}

// Remove da sequência gravada a peça correspondente ao objeto apagado, para o QR Code
// refletir sempre a montagem atual (não o histórico completo de tudo que já foi adicionado)
function removerDaGravacao(obj, outroObj, posicaoRemovida) {
	if (obj.name == "placeholder") {
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

	escondeTodosOsBotoes('chao');
	escondeTodosOsBotoes('cima');

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


	if (obj.name == "placeholder") {

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
		if (state.groundIds[state.selectedIndex] == state.topIds[state.selectedIndex]) criaPlaceholderCima()
		obj.userData.modelo.tipo == "chao" ? criaPlaceholder() : criaPlaceholderCima()

		scene.remove(obj);
	}
	state.previousHoverIndex = null
	if (state.groundIds.length == 0 && state.topIds.length == 0) addButton.classList.remove('hide')

	atualizarModeloAR()
}

// Desloca o tamanho registrado e a posição X de um cubo (ou peça real) em tamanhoApagar,
// repetido em toda realocaModelo pra cada vizinho afetado pela remoção
function deslocaTamanhoEPosicao(cubo, tamanho, tamanhoApagar) {
	cubo.userData.tamanho.iniciox = cubo.userData.tamanho.iniciox - tamanho;
	cubo.userData.tamanho.fimx = cubo.userData.tamanho.fimx - tamanho;
	cubo.position.setX(cubo.position.x - tamanhoApagar);
}

// Desloca em tamanhoApagar os 6 botões (direita/esquerda/cima, do chão e de cima) de uma coluna
function deslocaBotoesNoIndice(indice, tamanhoApagar) {
	const botoes = [
		scene.getObjectById(state.groundButtons[indice].direita),
		scene.getObjectById(state.groundButtons[indice].esquerda),
		scene.getObjectById(state.groundButtons[indice].cima),
		scene.getObjectById(state.topButtons[indice].direita),
		scene.getObjectById(state.topButtons[indice].esquerda),
		scene.getObjectById(state.topButtons[indice].cima)
	];
	botoes.forEach(function (botao) { botao.position.x = botao.position.x - tamanhoApagar; });
}

// Coluna apagada nascida do lado esquerdo do centro: percorre de selectedIndex até 0,
// puxando cada vizinho à esquerda (tamanho, posição e botões) em tamanhoApagar
function realocaColunaAEsquerda(tamanhoApagar) {
	// indiceColuna percorre as colunas da removida até a ponta esquerda (índice 0)
	for (let indiceColuna = state.selectedIndex; indiceColuna >= 0; indiceColuna--) {
		let cubeAtual = scene.getObjectById(state.groundIds[indiceColuna]);
		let cubeAtualCima = scene.getObjectById(state.topIds[indiceColuna]);
		if (indiceColuna - 1 >= 0) {
			let cubeDireita = scene.getObjectById(state.groundIds[indiceColuna + 1]);
			let cubeEsquerda = scene.getObjectById(state.groundIds[indiceColuna - 1]);
			let cubeDireitaCima = scene.getObjectById(state.topIds[indiceColuna + 1]);
			let cubeEsquerdaCima = scene.getObjectById(state.topIds[indiceColuna - 1]);
			let tamanho = cubeAtual.userData.tamanho.fimx - cubeAtual.userData.tamanho.iniciox;
			let tamanhoCima = cubeAtualCima.userData.tamanho.fimx - cubeAtualCima.userData.tamanho.iniciox;

			deslocaTamanhoEPosicao(cubeEsquerda, tamanho, tamanhoApagar);
			cubeDireita.userData.esquerda = cubeEsquerda.userData.esquerda;

			deslocaTamanhoEPosicao(cubeEsquerdaCima, tamanhoCima, tamanhoApagar);
			cubeDireitaCima.userData.esquerda = cubeEsquerdaCima.userData.esquerda;

			deslocaBotoesNoIndice(indiceColuna - 1, tamanhoApagar);
		} else {
			let cubeEsquerda = scene.getObjectById(state.groundIds[indiceColuna]);
			let cubeEsquerdaCima = scene.getObjectById(state.topIds[indiceColuna]);
			cubeEsquerda.userData.esquerda = cubeAtual.userData.esquerda;
			cubeEsquerdaCima.userData.esquerda = cubeAtualCima.userData.esquerda;
		}
	}
}

// Coluna apagada nascida do lado direito do centro (ou o próprio centro): percorre de
// selectedIndex até o fim, puxando cada vizinho à direita (tamanho, posição e botões) em tamanhoApagar
function realocaColunaADireita(tamanhoApagar) {
	// indiceColuna percorre as colunas da removida até a ponta direita (fim de groundIds)
	for (let indiceColuna = state.selectedIndex; indiceColuna < state.groundIds.length; indiceColuna++) {
		let cubeAtual = scene.getObjectById(state.groundIds[indiceColuna]);
		let cubeAtualCima = scene.getObjectById(state.topIds[indiceColuna]);
		if (indiceColuna + 1 < state.groundIds.length && indiceColuna - 1 > 0) {
			let cubeDireita = scene.getObjectById(state.groundIds[indiceColuna + 1]);
			let cubeDireitaCima = scene.getObjectById(state.topIds[indiceColuna + 1]);
			let tamanho = cubeAtual.userData.tamanho.fimx - cubeAtual.userData.tamanho.iniciox;
			let tamanhoCima = cubeAtualCima.userData.tamanho.fimx - cubeAtualCima.userData.tamanho.iniciox;

			deslocaTamanhoEPosicao(cubeDireita, tamanho, tamanhoApagar);
			// cubeEsquerda.userData.direita = cubeDireita.userData.direita;

			deslocaTamanhoEPosicao(cubeDireitaCima, tamanhoCima, tamanhoApagar);

			deslocaBotoesNoIndice(indiceColuna + 1, tamanhoApagar);
		}

		else if (indiceColuna - 1 > 0) {

			let cubeEsquerda = scene.getObjectById(state.groundIds[indiceColuna - 1]);
			let cubeEsquerdaCima = scene.getObjectById(state.topIds[indiceColuna - 1]);
			cubeEsquerda.userData.direita = cubeAtual.userData.direita;
			cubeEsquerdaCima.userData.direita = cubeAtualCima.userData.direita;

		}
		else if (indiceColuna + 1 < state.groundIds.length) {

			let cubeDireita = scene.getObjectById(state.groundIds[indiceColuna + 1]);
			let cubeDireitaCima = scene.getObjectById(state.topIds[indiceColuna + 1]);
			let tamanho = cubeAtual.userData.tamanho.fimx - cubeAtual.userData.tamanho.iniciox;
			let tamanhoCima = cubeAtual.userData.tamanho.fimx - cubeAtualCima.userData.tamanho.iniciox;

			deslocaTamanhoEPosicao(cubeDireita, tamanho, tamanhoApagar);
			deslocaTamanhoEPosicao(cubeDireitaCima, tamanhoCima, tamanhoApagar);
		}


	}
}

function realocaModelo() {

	let cubeApagar = scene.getObjectById(state.groundIds[state.selectedIndex]);
	let tamanhoApagar = cubeApagar.userData.tamanho.fimx - cubeApagar.userData.tamanho.iniciox

	if (cubeApagar.userData.centroEsquerda) {
		realocaColunaAEsquerda(tamanhoApagar);
	}
	else {
		realocaColunaADireita(tamanhoApagar);
	}

	state.groundIds.splice(state.selectedIndex, 1);
	state.topIds.splice(state.selectedIndex, 1);
	state.groundButtons.splice(state.selectedIndex, 1);
	state.topButtons.splice(state.selectedIndex, 1);
}

// Cria o cubo invisível que ocupa um espaço vazio (chão ou cima) enquanto não há peça real
// ali. criaPlaceholder e criaPlaceholderCima eram quase idênticas — só trocavam qual fileira é a de
// referência/vizinho, o deslocamento vertical/z do cubo e o tipo do modelo guardado.
function criaPlaceholderEmFileira(config) {
	const { listaReferencia, listaDestino, novoNaPonta, deslocamentoYExtra, deslocamentoZ, tipoModelo, ladoEsquerdaUsaMesmoIndice, nome } = config;

	state.selectedColor = "#000000";
	const material = new THREE.MeshBasicMaterial({ color: state.selectedColor, transparent: true, opacity: 0 });

	let cubeEscolhido = listaReferencia.length == 1 ? scene.getObjectById(listaReferencia[0]) : scene.getObjectById(listaReferencia[state.selectedIndex]);

	let cubeVizinho;
	if (ladoEsquerdaUsaMesmoIndice && state.selectedSide == "esquerda") {
		cubeVizinho = listaReferencia.length == 1 ? scene.getObjectById(listaReferencia[0]) : scene.getObjectById(listaReferencia[state.selectedIndex]);
	} else {
		cubeVizinho = listaReferencia.length == 1 ? scene.getObjectById(listaReferencia[0]) : scene.getObjectById(listaReferencia[state.selectedIndex + 1]);
	}
	// Sem vizinho à direita (ex: removendo o item da ponta), usa o próprio item como referência
	if (!cubeVizinho) cubeVizinho = cubeEscolhido;

	const geometry = new THREE.BoxGeometry(novoNaPonta ? cubeVizinho.box3.min.x - cubeVizinho.box3.max.x : cubeEscolhido.box3.min.x - cubeEscolhido.box3.max.x, 0.86, 1);
	const cube = new THREE.Mesh(geometry, material)

	scene.add(cube)

	let cube2BB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
	cube2BB.setFromObject(cube)

	cube.box3 = cube2BB;
	cube.position.setY(cube.position.y + (cube.position.y - cube2BB.min.y) + deslocamentoYExtra)
	if (deslocamentoZ) cube.position.setZ(deslocamentoZ)

	cube.userData = {
		modelo: { tipo: tipoModelo, tamanhox: cubeVizinho.userData.modelo.tamanhox, tamanhoy: cubeVizinho.userData.modelo.tamanhoy },
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

	novoNaPonta
		? (state.selectedSide == "esquerda" && state.selectedIndex == 0 ? listaDestino.unshift(cube.id) : listaDestino.push(cube.id))
		: listaDestino[state.selectedIndex] = cube.id;

	cube.position.setX(novoNaPonta ? cubeVizinho.position.x : cubeEscolhido.position.x);
	cube.name = nome
}

function criaPlaceholder(embaixo = false, nome = "placeholder") {
	criaPlaceholderEmFileira({
		listaReferencia: state.topIds,
		listaDestino: state.groundIds,
		novoNaPonta: embaixo,
		deslocamentoYExtra: 0,
		deslocamentoZ: null,
		tipoModelo: "chao",
		ladoEsquerdaUsaMesmoIndice: true,
		nome
	});
}

function criaPlaceholderCima(emcima = false, nome = "placeholder") {
	criaPlaceholderEmFileira({
		listaReferencia: state.groundIds,
		listaDestino: state.topIds,
		novoNaPonta: emcima,
		deslocamentoYExtra: 1.44,
		deslocamentoZ: 0.2,
		tipoModelo: "cima",
		ladoEsquerdaUsaMesmoIndice: false,
		nome
	});
}

// Projeta a posição do clique/toque na cena e devolve os objetos atingidos pelo raio.
// Esse bloco de 4 linhas se repetia igual em 6 lugares diferentes do arquivo.
function raycastFromEvent(event) {
	pointer.x = (event.clientX / tamanhoScene) * 2 - 1;
	pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;
	raycaster.setFromCamera(pointer, camera);
	return raycaster.intersectObjects(scene.children);
}

// Resolve, a partir de um clique, qual peça (real ou "placeholder" vazio) foi atingida, preenchendo
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
		state.selectedObjectId = intersects[0].object.name == "placeholder" ? intersects[0].object.id : intersects[0].object.parent.id;

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
	if (cubeEscolhido.name == "placeholder") {
		removeButton.classList.add('hide')
		if (scene.getObjectById(listaContraria[state.selectedIndex]).name == "placeholder") {
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

// Ajusta a opacidade da malha de destaque (hover) de uma peça — usado tanto pra acender
// quanto pra apagar o realce ao passar/tirar o mouse de cima
function defineDestaque(obj, opacidade) {
	const destaque = obj.children[obj.children.length > 1 ? 1 : 0];
	destaque.material.opacity = opacidade;
	destaque.material.transparent = true;
}

function onPointerMove(event) {
	var intersects = raycastFromEvent(event);

	if (intersects.length > 0) {
		document.body.style.cursor = 'pointer'
		const position = intersects[0].object.position;
		state.hoveredObjectId = intersects[0].object.parent.id;
		let cubeEscolhido = scene.getObjectById(state.hoveredObjectId);

		if (intersects[0].object.name != "placeholder" && intersects[0].object.name != "botao") {
			if (!state.previousHoverIndex || state.previousHoverIndex != state.hoveredObjectId) {
				if (state.previousHoverIndex) {
					defineDestaque(scene.getObjectById(state.previousHoverIndex), 1);
				}
				state.previousHoverIndex = state.hoveredObjectId
			}
			defineDestaque(cubeEscolhido, 0.5);
		}
	}
	else {
		document.body.style.cursor = 'auto'
		if (state.previousHoverIndex) {
			let cubeEscolhido = scene.getObjectById(state.previousHoverIndex);

			if (cubeEscolhido.name != "placeholder" && cubeEscolhido.name != "botao") {
				defineDestaque(cubeEscolhido, 1);
			}

		}
	}
}
window.addEventListener('pointermove', onPointerMove);

// Depois de colocar uma peça, esconde os 4 botões (direita/esquerda/cima/baixo) de toda a
// fileira do tipo dado — repetido em todo handler de clique dos botões de adicionar
function escondeTodosOsBotoes(tipo) {
	const listaBotoes = tipo == "chao" ? state.groundButtons : state.topButtons;
	for (let j = 0; j < listaBotoes.length; j++) {
		const botaoDireita = scene.getObjectById(tipo == "chao" ? state.groundButtons[j].direita : state.topButtons[j].direita);
		const botaoEsquerda = scene.getObjectById(tipo == "chao" ? state.groundButtons[j].esquerda : state.topButtons[j].esquerda);
		const botaoCima = scene.getObjectById(state.groundButtons[j].cima);
		const botaoBaixo = scene.getObjectById(state.groundButtons[j].baixo);

		botaoDireita.visible = false
		botaoEsquerda.visible = false
		botaoCima.visible = false
		if (botaoBaixo) botaoBaixo.visible = false
	}
}

// Boilerplate repetido pelos 4 botões de adicionar (direita/esquerda/cima/baixo): elemento HTML
// + wrapper CSS3DObject com a escala/z/nome/visibilidade padrão desses botões
function criaBotaoCSS3D() {
	const elemento = document.createElement('button');
	elemento.className = 'btnAdd backgroundImage';

	const objeto3d = new CSS3DObject(elemento);
	objeto3d.scale.set(0.01, 0.01, 1);
	objeto3d.position.setZ(0.6);
	objeto3d.name = "botao";
	objeto3d.visible = false;

	return { elemento, objeto3d };
}

function criaBotaoDireita(objetoReferencia, i, tipo) {
	const { elemento: addButtonDireita, objeto3d: btnAddDireita } = criaBotaoCSS3D();

	addButtonDireita.addEventListener('pointerdown', function (event) {
		state.selectedDirectionX = 1;
		state.selectedDirectionY = 0
		state.isAddingModule = true;
		state.selectedSide = "direita"

		resolveSelecaoDoClique(event, { tipo, idBotaoFallback: btnAddDireita.id, ladoBotaoFallback: 'direita' });
		{
			const passoGravado = { fn: tipo == "chao" ? 'c' : 't', k: state.selectedModel.chave, px: state.selectedDirectionX, py: state.selectedDirectionY, idx: state.selectedIndex }
			const aoConcluir = function (id) { passoGravado.id = id; state.assemblySteps.push(passoGravado); atualizarModeloAR() }
			tipo == "chao" ? criaObjetoChao(state.selectedModel, state.selectedDirectionX, state.selectedDirectionY, aoConcluir) : criaObjetoCima(state.selectedModel, state.selectedDirectionX, state.selectedDirectionY, aoConcluir)
		}
		escondeTodosOsBotoes(tipo);
	});

	if (objetoReferencia.name == "placeholder") {
		btnAddDireita.position.setX(objetoReferencia.position.x + 0.25)
		btnAddDireita.position.setY(tipo == "chao" ? objetoReferencia.position.y + 0.05 : objetoReferencia.position.y - 0.27)
	}
	else {
		btnAddDireita.position.setX(tipo == "chao" ? objetoReferencia.position.x + 0.25 : objetoReferencia.position.x + 0.3)
		btnAddDireita.position.setY(tipo == "chao" ? objetoReferencia.position.y + 0.5 : objetoReferencia.position.y + 1.6)
	}

	tipo == "chao" ? state.groundButtons[i].direita = btnAddDireita.id : state.topButtons[i].direita = btnAddDireita.id;
	scene.add(btnAddDireita);
}

function criaBotaoEsquerda(objetoReferencia, i, tipo) {
	const { elemento: addButtonEsquerda, objeto3d: btnAddEsquerda } = criaBotaoCSS3D();

	addButtonEsquerda.addEventListener('pointerdown', function (event) {
		state.selectedDirectionX = -1;
		state.selectedDirectionY = 0
		state.isAddingModule = true;
		state.selectedSide = "esquerda"

		resolveSelecaoDoClique(event, { tipo, idBotaoFallback: btnAddEsquerda.id, ladoBotaoFallback: 'esquerda' });
		{
			const passoGravado = { fn: tipo == "chao" ? 'c' : 't', k: state.selectedModel.chave, px: state.selectedDirectionX, py: state.selectedDirectionY, idx: state.selectedIndex }
			const aoConcluir = function (id) { passoGravado.id = id; state.assemblySteps.push(passoGravado); atualizarModeloAR() }
			tipo == "chao" ? criaObjetoChao(state.selectedModel, state.selectedDirectionX, state.selectedDirectionY, aoConcluir) : criaObjetoCima(state.selectedModel, state.selectedDirectionX, state.selectedDirectionY, aoConcluir)
		}
		escondeTodosOsBotoes(tipo);
	});

	if (objetoReferencia.name == "placeholder") {
		btnAddEsquerda.position.setX(objetoReferencia.position.x - 0.25)
		btnAddEsquerda.position.setY(tipo == "chao" ? objetoReferencia.position.y + 0.05 : objetoReferencia.position.y - 0.27)
	}
	else {
		btnAddEsquerda.position.setX(tipo == "chao" ? objetoReferencia.position.x - 0.25 : objetoReferencia.position.x - 0.1)
		btnAddEsquerda.position.setY(objetoReferencia.userData.modelo.tipo == "chao" ? objetoReferencia.position.y + 0.5 : objetoReferencia.position.y + 1.6)
	}
	tipo == "chao" ? state.groundButtons[i].esquerda = btnAddEsquerda.id : state.topButtons[i].esquerda = btnAddEsquerda.id;

	scene.add(btnAddEsquerda);
}

function criaBotaoCima(objetoReferencia, i, tipo) {
	const { elemento: addButtonCima, objeto3d: btnAddCima } = criaBotaoCSS3D();

	addButtonCima.addEventListener('pointerdown', function (event) {

		state.selectedDirectionX = 0;
		state.selectedDirectionY = 1;
		state.isAddingModule = true;
		state.selectedSide = "cima";

		resolveSelecaoDoClique(event, { usarTipoDoObjetoClicado: true });

		{
			const passoGravado = { fn: 't', k: state.selectedModel.chave, px: state.selectedDirectionX, py: state.selectedDirectionY, idx: state.selectedIndex }
			criaObjetoCima(state.selectedModel, state.selectedDirectionX, state.selectedDirectionY, function (id) {
				passoGravado.id = id
				state.assemblySteps.push(passoGravado)
				atualizarModeloAR()
			})
		}
		escondeTodosOsBotoes(tipo);
	});

	btnAddCima.position.setX(objetoReferencia.position.x + 0.05)
	btnAddCima.position.setY(objetoReferencia.position.y + 0.75)

	tipo == "chao" ? state.groundButtons[i].cima = btnAddCima.id : state.topButtons[i].cima = btnAddCima.id;
	scene.add(btnAddCima);
}

function criaBotaoBaixo(objetoReferencia, i, tipo) {
	const { elemento: addButtonBaixoPos, objeto3d: btnAddBaixoPos } = criaBotaoCSS3D();

	addButtonBaixoPos.addEventListener('pointerdown', function (event) {

		state.selectedDirectionX = 0;
		state.selectedDirectionY = -1;
		state.isAddingModule = true;
		state.selectedSide = "baixo";

		// Precisa de idBotaoFallback: ao contrário do botão "cima", o botão "baixo" fica
		// posicionado na lacuna vertical acima do cubo (perto da peça real de cima), sem
		// nenhuma malha 3D embaixo do próprio botão pro raio acertar
		resolveSelecaoDoClique(event, { usarTipoDoObjetoClicado: true, tipo: 'chao', idBotaoFallback: btnAddBaixoPos.id, ladoBotaoFallback: 'baixo' });

		{
			const passoGravado = { fn: 'c', k: state.selectedModel.chave, px: state.selectedDirectionX, py: state.selectedDirectionY, idx: state.selectedIndex }
			criaObjetoChao(state.selectedModel, state.selectedDirectionX, state.selectedDirectionY, function (id) {
				passoGravado.id = id
				state.assemblySteps.push(passoGravado)
				atualizarModeloAR()
			})
		}
		escondeTodosOsBotoes(tipo);
	});

	btnAddBaixoPos.position.setX(objetoReferencia.position.x + 0.05)
	btnAddBaixoPos.position.setY(objetoReferencia.position.y + 0.75)

	state.groundButtons[i].baixo = btnAddBaixoPos.id;
	scene.add(btnAddBaixoPos);
}

function createButtonAdd(x = 0, y = 0, objetoReferencia, i, tipo) {
	if (x == 1) return criaBotaoDireita(objetoReferencia, i, tipo);
	if (x == -1) return criaBotaoEsquerda(objetoReferencia, i, tipo);
	if (y == 1) return criaBotaoCima(objetoReferencia, i, tipo);
	if (y == -1) return criaBotaoBaixo(objetoReferencia, i, tipo);
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


// Só as pontas da fileira (primeiro e último índice) podem ganhar módulo pelas laterais
function definirVisivelSeBorda(botao, indice) {
	botao.visible = (indice == 0 || indice == state.groundIds.length - 1);
}

// Selecionou uma peça de chão: os botões de cima (armário) somem, já que essa peça é pro chão
function ajustaBotoesParaPecaChao(botaoDireitaCima, botaoEsquerdaCima) {
	botaoDireitaCima.visible = false
	botaoEsquerdaCima.visible = false
}

// Selecionou uma peça de cima (armário): os botões de chão somem, e o botão "cima" só aparece
// se já existir um balcão embaixo do mesmo tamanho
function ajustaBotoesParaPecaCima(botaoDireita, botaoEsquerda, botaoCima, cubeEscolhido, cubeCima) {
	botaoDireita.visible = false
	botaoEsquerda.visible = false

	if (cubeCima.name == "placeholder" && cubeEscolhido.userData.modelo.tamanhox == state.selectedPieceInfo.tamanhox) botaoCima.visible = true
}

// Botão "baixo" só aparece pra peça de chão, quando já existe um armário ali em cima do mesmo tamanho
function ajustaBotaoBaixo(botaoBaixo, cubeEscolhido, cubeCima) {
	if (!botaoBaixo) return;
	botaoBaixo.visible = false;
	if (state.selectedPieceInfo.tipo != "chao") return;

	if (cubeEscolhido.name == "placeholder" && cubeCima.name != "placeholder" && cubeCima.userData.modelo.tamanhox == state.selectedPieceInfo.tamanhox) {
		botaoBaixo.visible = true
	}
}

// Mostra o botão direita/esquerda certo (chão ou cima) olhando o vizinho naquela direção,
// repetido igual pros dois lados (só troca qual vizinho e qual par de botões)
function atualizaVisibilidadePorVizinho(botaoChao, botaoCima, cubeVizinhoChao, cubeVizinhoCima) {
	if (state.selectedPieceInfo.tipo == "chao" && cubeVizinhoChao.name == "placeholder" && cubeVizinhoChao.userData.modelo.tamanhox == state.selectedPieceInfo.tamanhox) {
		botaoChao.visible = true
	}
	else if (state.selectedPieceInfo.tipo == "cima" && cubeVizinhoCima.name == "placeholder" && cubeVizinhoCima.userData.modelo.tamanhox == state.selectedPieceInfo.tamanhox) {
		botaoCima.visible = true
	}
	else {
		botaoChao.visible = false
		botaoCima.visible = false
	}
}

function verificaPosBotoes() {
	for (let i = 0; i < state.groundIds.length; i++) {
		const cubeEscolhido = scene.getObjectById(state.groundIds[i]);
		const cubeCima = scene.getObjectById(state.topIds[i]);

		let botaoDireita = scene.getObjectById(state.groundButtons[i].direita);
		let botaoEsquerda = scene.getObjectById(state.groundButtons[i].esquerda);
		let botaoCima = scene.getObjectById(state.groundButtons[i].cima);
		let botaoDireitaCima = scene.getObjectById(state.topButtons[i].direita);
		let botaoEsquerdaCima = scene.getObjectById(state.topButtons[i].esquerda);
		let botaoCimaCima = scene.getObjectById(state.topButtons[i].cima);
		let botaoBaixo = scene.getObjectById(state.groundButtons[i].baixo);

		definirVisivelSeBorda(botaoDireita, i);
		definirVisivelSeBorda(botaoEsquerda, i);
		definirVisivelSeBorda(botaoDireitaCima, i);
		definirVisivelSeBorda(botaoEsquerdaCima, i);
		botaoCima.visible = false;
		botaoCimaCima.visible = false;

		if (state.selectedPieceInfo.tipo == "chao") {
			ajustaBotoesParaPecaChao(botaoDireitaCima, botaoEsquerdaCima);
		}
		if (state.selectedPieceInfo.tipo == "cima") {
			ajustaBotoesParaPecaCima(botaoDireita, botaoEsquerda, botaoCima, cubeEscolhido, cubeCima);
		}

		ajustaBotaoBaixo(botaoBaixo, cubeEscolhido, cubeCima);

		if (i + 1 < state.groundIds.length) {
			atualizaVisibilidadePorVizinho(botaoDireita, botaoDireitaCima, scene.getObjectById(state.groundIds[i + 1]), scene.getObjectById(state.topIds[i + 1]));
		}
		if (i - 1 >= 0) {
			atualizaVisibilidadePorVizinho(botaoEsquerda, botaoEsquerdaCima, scene.getObjectById(state.groundIds[i - 1]), scene.getObjectById(state.topIds[i - 1]));
		}
	}

}

function handleCameraOnAdd(valorXCube) {
	let expandiuLimite = false;
	if (state.maxX < valorXCube) {
		state.maxX = valorXCube
		expandiuLimite = true;
	}
	if (state.minX > valorXCube) {
		state.minX = valorXCube
		expandiuLimite = true;
	}
	if (expandiuLimite) {
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

export { criaObjeto, criaObjetoChao, criaObjetoCima, remove, removerDaGravacao, realocaModelo, criaPlaceholder, criaPlaceholderCima, raycastFromEvent, resolveSelecaoDoClique, createButtonAdd, resetaCamera, handleCameraOnAdd, verificaPosBotoes, onPointerMove };
