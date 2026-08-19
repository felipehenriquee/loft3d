import './scene.js';
import './ui.js';
import './assembly.js';
import './ar.js';
import './qrcode-share.js';

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
