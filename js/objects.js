// Cada peça do catálogo aponta pro .glb e a imagem de miniatura via variáveis de ambiente
// VITE_<envPrefix>_GLB_URL / VITE_<envPrefix>_IMG_URL (ver .env.example)
const catalogoBase = [
	{ chave: "armario", nome: "Armário", tipo: "cima", tamanhox: 1, tamanhoy: 1, movel: "armario", nomeMovel: "Armários", envPrefix: "ARMARIO" },
	{ chave: "armarioGrande", nome: "Armário Grande", tipo: "cima", tamanhox: 2, tamanhoy: 1, movel: "armario", nomeMovel: "Armários", envPrefix: "ARMARIO_GRANDE" },
	{ chave: "balcao", nome: "Balcão", tipo: "chao", tamanhox: 1, tamanhoy: 1, movel: "balcao", nomeMovel: "Balcões", envPrefix: "BALCAO" },
	{ chave: "balcaoGrande", nome: "Balcão Grande", tipo: "chao", tamanhox: 2, tamanhoy: 1, movel: "balcao", nomeMovel: "Balcões", envPrefix: "BALCAO_GRANDE" },
	{ chave: "paneleiro", nome: "Paneleiro", tipo: "chao", tamanhox: 1, tamanhoy: 2, movel: "paneleiro", nomeMovel: "Paneleiros", envPrefix: "PANELEIRO" }
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
			img: import.meta.env["VITE_" + item.envPrefix + "_IMG_URL"]
		};
	});
}
