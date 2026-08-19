import { test, expect } from '@playwright/test';
import { clickCatalogItem, clickOnObject, getAssemblyState, removeSelected } from './helpers.js';

test.beforeEach(async ({ page }) => {
	await page.goto('/');
});

test('remove uma peça real (chão) e ela vira um espaço vazio', async ({ page }) => {
	await clickCatalogItem(page, 'BALCAO80');
	await page.waitForFunction(() => window.__testHooks.state.groundIds.length === 1);
	const antes = await getAssemblyState(page);

	const clicou = await clickOnObject(page, antes.groundIds[0]);
	expect(clicou).toBe(true);
	await page.waitForFunction((id) => window.__testHooks.state.selectedObjectId === id, antes.groundIds[0]);

	await removeSelected(page);
	await page.waitForFunction(
		(idAnterior) => {
			const { state } = window.__testHooks;
			return state.groundIds[0] !== idAnterior;
		},
		antes.groundIds[0]
	);

	const depois = await getAssemblyState(page);
	expect(depois.groundIds).toHaveLength(1);
	expect(depois.groundIds[0]).not.toBe(antes.groundIds[0]);

	const nomeNovo = await page.evaluate(() => {
		const { state, scene } = window.__testHooks;
		return scene.getObjectById(state.groundIds[0]).name;
	});
	expect(nomeNovo).toBe('placeholder');
});

test('remove uma coluna totalmente vazia (realocaModelo) e ela some da montagem', async ({ page }) => {
	// Coloca e depois remove um balcão sozinho: chão e cima ficam ambos como placeholder,
	// uma coluna "totalmente vazia" que pode ser removida de fato (não vira outro espaço vazio).
	await clickCatalogItem(page, 'BALCAO80');
	await page.waitForFunction(() => window.__testHooks.state.groundIds.length === 1);
	const antes = await getAssemblyState(page);

	await clickOnObject(page, antes.groundIds[0]);
	await page.waitForFunction((id) => window.__testHooks.state.selectedObjectId === id, antes.groundIds[0]);
	await removeSelected(page);
	await page.waitForFunction(() => {
		const { state, scene } = window.__testHooks;
		return scene.getObjectById(state.groundIds[0]).name === 'placeholder';
	});

	const ambosPlaceholder = await page.evaluate(() => {
		const { state, scene } = window.__testHooks;
		return scene.getObjectById(state.groundIds[0]).name === 'placeholder' && scene.getObjectById(state.topIds[0]).name === 'placeholder';
	});
	expect(ambosPlaceholder).toBe(true);

	const placeholderId = (await getAssemblyState(page)).groundIds[0];
	await clickOnObject(page, placeholderId);
	await page.waitForFunction(() => !document.querySelector('.btnRemove').classList.contains('hide'));

	await removeSelected(page);
	await page.waitForFunction(() => window.__testHooks.state.groundIds.length === 0);

	const s = await getAssemblyState(page);
	expect(s.groundIds).toHaveLength(0);
	expect(s.topIds).toHaveLength(0);
	expect(s.groundButtonsLength).toBe(0);
	expect(s.topButtonsLength).toBe(0);
});
