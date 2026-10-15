import imgArmario from "../assets/ARMARIO80.webp";
import imgArmarioGrande from "../assets/ARMARIO120.webp";
import imgBalcao from "../assets/BALCAO80.webp";
import imgBalcaoGrande from "../assets/BALCAO120.webp";
import imgPaneleiro from "../assets/PANELEIRO.webp";

// Cada peça do catálogo aponta pro .glb via variável de ambiente VITE_<envPrefix>_GLB_URL
// (ver .env.example); a miniatura do menu vem da pasta assets
const catalogoBase = [
	{ chave: "armario", nome: "Armário", tipo: "cima", tamanhox: 1, tamanhoy: 1, movel: "armario", nomeMovel: "Armários", envPrefix: "ARMARIO", img: imgArmario },
	{ chave: "armarioGrande", nome: "Armário Grande", tipo: "cima", tamanhox: 2, tamanhoy: 1, movel: "armario", nomeMovel: "Armários", envPrefix: "ARMARIO_GRANDE", img: imgArmarioGrande },
	{ chave: "balcao", nome: "Balcão", tipo: "chao", tamanhox: 1, tamanhoy: 1, movel: "balcao", nomeMovel: "Balcões", envPrefix: "BALCAO", img: imgBalcao },
	{ chave: "balcaoGrande", nome: "Balcão Grande", tipo: "chao", tamanhox: 2, tamanhoy: 1, movel: "balcao", nomeMovel: "Balcões", envPrefix: "BALCAO_GRANDE", img: imgBalcaoGrande },
	{ chave: "paneleiro", nome: "Paneleiro", tipo: "chao", tamanhox: 1, tamanhoy: 2, movel: "paneleiro", nomeMovel: "Paneleiros", envPrefix: "PANELEIRO", img: imgPaneleiro }
];

export class Objetos {
	todosObjetos = catalogoBase.map(function (item) {
		return {
			chave: item.chave,
			nome: item.nome,
			local: import.meta.env["VITE_" + item.envPrefix + "_GLB_URL"],
			tipo: item.tipo,
			tamanhox: item.tamanhox,
			tamanhoy: item.tamanhoy,
			movel: item.movel,
			nomeMovel: item.nomeMovel,
			img: item.img
		};
	});
}
