import './scene.js';
import './ui.js';
import './assembly.js';
import './ar.js';
import './qrcode-share.js';

import * as THREE from 'three';
import { state } from './state.js';
import { scene, camera, tamanhoScene } from './scene.js';

// Ganchos usados pelos testes automatizados (Playwright) pra inspecionar o estado da
// montagem/cena e simular cliques precisos em objetos 3D (projetando a posição mundial pra
// coordenada de tela, o inverso exato de raycastFromEvent em assembly.js) sem depender de
// leitura de DOM/pixel ou de varrer a tela clicando. Eliminado do build de produção, já que
// import.meta.env.DEV é substituído por "false" e o bloco vira código morto.
if (import.meta.env.DEV) {
	window.__testHooks = {
		state,
		scene,
		screenPositionOf(objectId) {
			const obj = scene.getObjectById(objectId);
			if (!obj) return null;
			// obj.position é só a origem/pivot — não necessariamente um ponto sobre a malha
			// renderizada. O centro da bounding box atual (recalculada agora, não o box3
			// guardado no objeto, que é uma foto de antes do posicionamento final) garante
			// um ponto de fato coberto pela geometria, pro raio do clique acertar.
			const caixa = new THREE.Box3().setFromObject(obj);
			const posicaoMundo = new THREE.Vector3();
			caixa.getCenter(posicaoMundo);
			posicaoMundo.project(camera);
			// inverso de: pointer.x = (clientX / tamanhoScene) * 2 - 1
			//             pointer.y = -(clientY / innerHeight) * 2 + 1
			return {
				x: ((posicaoMundo.x + 1) / 2) * tamanhoScene,
				y: ((1 - posicaoMundo.y) / 2) * window.innerHeight
			};
		}
	};
}

import { receitaURL } from './scene.js';
import { btnRa } from './ui.js';
import { atualizarModeloAR } from './ar.js';
import { remontarDaURL, desserializarMontagem } from './qrcode-share.js';

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
