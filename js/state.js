// Estado compartilhado pela lógica de montagem/seleção/câmera. Consolidado num único objeto
// (em vez de dezenas de variáveis globais soltas) pra deixar explícito o que é lido/escrito
// pelas funções do app — isso já foi causa direta de bugs sutis nesse projeto.
export const state = {
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
