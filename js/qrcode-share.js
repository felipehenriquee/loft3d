import { qrcode } from './../src/qrcode/qrcode.js';
import { state } from './state.js';
import { objetos } from './ui.js';
import { criaObjeto, criaObjetoChao, criaObjetoCima } from './assembly.js';

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

export function serializarMontagem() {
	return state.assemblySteps.map(function (passo) {
		return passo.fn === 'i'
			? 'i:' + passo.k
			: passo.fn + ':' + passo.k + ':' + passo.px + ':' + passo.py + ':' + passo.idx;
	}).join('|');
}

export function desserializarMontagem(texto) {
	return texto.split('|').filter(Boolean).map(function (trecho) {
		const partes = trecho.split(':');
		if (partes[0] === 'i') return { fn: 'i', k: partes[1] };
		return { fn: partes[0], k: partes[1], px: Number(partes[2]), py: Number(partes[3]), idx: Number(partes[4]) };
	});
}

export function abrirModalQRCode() {
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
export function remontarDaURL(receita) {
	return receita.reduce(function (promessaAnterior, passo) {
		return promessaAnterior.then(function () {
			const modelo = objetos.todosObjetos.find(function (o) { return o.chave === passo.k; });
			if (!modelo) return;

			return new Promise(function (resolve) {
				if (passo.fn === 'i') {
					criaObjeto(modelo, resolve);
					return;
				}
				state.selectedModel = modelo;
				state.selectedIndex = passo.idx;
				state.selectedObjectId = passo.fn === 'c' ? state.groundIds[passo.idx] : state.topIds[passo.idx];
				if (passo.fn === 'c') {
					criaObjetoChao(modelo, passo.px, passo.py, resolve);
				} else {
					criaObjetoCima(modelo, passo.px, passo.py, resolve);
				}
			});
		});
	}, Promise.resolve());
}
