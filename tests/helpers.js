// Helpers compartilhados pelos testes E2E. O app não expõe uma API de teste tradicional
// (é uma cena Three.js manipulada por clique/toque), então interagimos via clique real do
// mouse nas posições calculadas dos elementos, e inspecionamos o resultado através de
// window.__testHooks (só existe em dev, ver js/create.js).

export async function clickCatalogItem(page, imageSubstring) {
	const box = await page.evaluate((substring) => {
		const button = [...document.querySelectorAll('button.botaoEscolha')].find((b) => b.style.backgroundImage.includes(substring));
		const rect = button.getBoundingClientRect();
		return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
	}, imageSubstring);
	await page.mouse.click(box.x, box.y);
}

// Clica na projeção em tela de um objeto 3D pelo id (window.__testHooks.screenPositionOf),
// sem precisar varrer a tela clicando ponto a ponto.
export async function clickOnObject(page, objectId) {
	const box = await page.evaluate((id) => window.__testHooks.screenPositionOf(id), objectId);
	if (!box) return false;
	await page.mouse.click(box.x, box.y);
	return true;
}

// side: 'direita' | 'esquerda' | 'cima' | 'baixo'; arrayName: 'groundButtons' | 'topButtons'
export async function clickDirectionButton(page, side, arrayName, index = 0) {
	const box = await page.evaluate(
		({ side, arrayName, index }) => {
			const { state, scene } = window.__testHooks;
			const id = state[arrayName][index] && state[arrayName][index][side];
			if (!id) return null;
			const obj = scene.getObjectById(id);
			if (!obj || !obj.visible) return null;
			const rect = obj.element.getBoundingClientRect();
			return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
		},
		{ side, arrayName, index }
	);
	if (!box) return false;
	await page.mouse.click(box.x, box.y);
	return true;
}

export async function waitDirectionButtonVisible(page, side, arrayName, index = 0) {
	await page.waitForFunction(
		({ side, arrayName, index }) => {
			const { state, scene } = window.__testHooks;
			const entry = state[arrayName][index];
			if (!entry || !entry[side]) return false;
			const obj = scene.getObjectById(entry[side]);
			return !!(obj && obj.visible);
		},
		{ side, arrayName, index }
	);
}

export async function getAssemblyState(page) {
	return page.evaluate(() => {
		const { state } = window.__testHooks;
		return {
			groundIds: state.groundIds.slice(),
			topIds: state.topIds.slice(),
			groundButtonsLength: state.groundButtons.length,
			topButtonsLength: state.topButtons.length,
			selectedObjectId: state.selectedObjectId,
			selectedIndex: state.selectedIndex
		};
	});
}

export async function removeSelected(page) {
	await page.evaluate(() => {
		document.querySelector('.btnRemove').dispatchEvent(new Event('pointerdown', { bubbles: true }));
	});
}
