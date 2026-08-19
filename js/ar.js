import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { state } from './state.js';
import { scene } from './scene.js';

// Realidade Aumentada via <model-viewer>: Scene Viewer no Android, AR Quick Look no iOS,
// e WebXR como bônus quando disponível — bem mais compatível que WebXR puro.
export const dispositivoMovel = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

// <model-viewer> só é usado em RA (dispositivoMovel); em desktop essa lib nunca roda, então
// carregar via import() sob demanda evita ~centenas de KB no bundle inicial de quem nunca vai
// precisar dela (todo mundo em desktop, e até celulares que nunca chegam a montar nada)
export let modelViewerAR = null;
let carregamentoModelViewer = null;

function garanteModelViewerCarregado() {
	if (!carregamentoModelViewer) {
		carregamentoModelViewer = import('@google/model-viewer').then(function () {
			modelViewerAR = document.createElement('model-viewer');
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
		});
	}
	return carregamentoModelViewer;
}

// Mantém o <model-viewer> com a montagem atual pré-carregada, para o clique no botão
// poder chamar activateAR() de forma síncrona — Scene Viewer/Quick Look só abrem se
// ativados dentro do próprio gesto de clique; exportar/carregar o GLB depois do clique
// perde esse gesto e o navegador bloqueia a RA sem avisar nada.
export async function atualizarModeloAR() {
	if (!dispositivoMovel || (state.groundIds.length === 0 && state.topIds.length === 0)) return;

	state.isArModelReady = false;
	await garanteModelViewerCarregado();

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
