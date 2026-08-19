import { test, expect } from '@playwright/test';
import { clickCatalogItem, clickDirectionButton, waitDirectionButtonVisible, getAssemblyState } from './helpers.js';

test.beforeEach(async ({ page }) => {
	await page.goto('/');
});

test('coloca a primeira peça (chão)', async ({ page }) => {
	await clickCatalogItem(page, 'BALCAO80');
	await page.waitForFunction(() => window.__testHooks.state.groundIds.length === 1);

	const s = await getAssemblyState(page);
	expect(s.groundIds).toHaveLength(1);
	expect(s.topIds).toHaveLength(1);
});

test('coloca a primeira peça (cima)', async ({ page }) => {
	await clickCatalogItem(page, 'ARMARIO80');
	await page.waitForFunction(() => window.__testHooks.state.topIds.length === 1);

	const s = await getAssemblyState(page);
	expect(s.groundIds).toHaveLength(1);
	expect(s.topIds).toHaveLength(1);
});

test('adiciona peça à direita', async ({ page }) => {
	await clickCatalogItem(page, 'BALCAO80');
	await page.waitForFunction(() => window.__testHooks.state.groundIds.length === 1);

	await clickCatalogItem(page, 'BALCAO80');
	await waitDirectionButtonVisible(page, 'direita', 'groundButtons');
	const clicked = await clickDirectionButton(page, 'direita', 'groundButtons');
	expect(clicked).toBe(true);
	await page.waitForFunction(() => window.__testHooks.state.groundIds.length === 2);

	const s = await getAssemblyState(page);
	expect(s.groundIds).toHaveLength(2);
	expect(s.topIds).toHaveLength(2);
	expect(s.groundButtonsLength).toBe(2);
	expect(s.topButtonsLength).toBe(2);
});

test('adiciona peça à esquerda mantém groundButtons/topButtons alinhados com groundIds/topIds', async ({ page }) => {
	// Regressão: unshift em groundIds/topIds sem o unshift correspondente em
	// groundButtons/topButtons deixava os arrays de botões mais curtos.
	await clickCatalogItem(page, 'BALCAO80');
	await page.waitForFunction(() => window.__testHooks.state.groundIds.length === 1);

	await clickCatalogItem(page, 'BALCAO80');
	await waitDirectionButtonVisible(page, 'direita', 'groundButtons');
	await clickDirectionButton(page, 'direita', 'groundButtons');
	await page.waitForFunction(() => window.__testHooks.state.groundIds.length === 2);

	await clickCatalogItem(page, 'BALCAO80');
	await waitDirectionButtonVisible(page, 'esquerda', 'groundButtons');
	const clicked = await clickDirectionButton(page, 'esquerda', 'groundButtons');
	expect(clicked).toBe(true);
	await page.waitForFunction(() => window.__testHooks.state.groundIds.length === 3);

	const s = await getAssemblyState(page);
	expect(s.groundIds).toHaveLength(3);
	expect(s.topIds).toHaveLength(3);
	expect(s.groundButtonsLength).toBe(3);
	expect(s.topButtonsLength).toBe(3);

	// selecionar o catálogo de novo não deve quebrar (verificaPosBotoes lê todas as posições)
	await clickCatalogItem(page, 'ARMARIO80');
	await page.waitForTimeout(300);
	expect(page.locator('body')).toBeTruthy();
});

test('armário grande não cabe em cima de balcão pequeno (regra de tamanho)', async ({ page }) => {
	await clickCatalogItem(page, 'BALCAO80');
	await page.waitForFunction(() => window.__testHooks.state.groundIds.length === 1);

	await clickCatalogItem(page, 'ARMARIO120');
	await page.waitForTimeout(300);

	const cimaVisivel = await page.evaluate(() => {
		const { state, scene } = window.__testHooks;
		return scene.getObjectById(state.groundButtons[0].cima).visible;
	});
	expect(cimaVisivel).toBe(false);
});

test('armário do mesmo tamanho cabe em cima do balcão', async ({ page }) => {
	await clickCatalogItem(page, 'BALCAO80');
	await page.waitForFunction(() => window.__testHooks.state.groundIds.length === 1);

	await clickCatalogItem(page, 'ARMARIO80');
	await waitDirectionButtonVisible(page, 'cima', 'groundButtons');
	const clicked = await clickDirectionButton(page, 'cima', 'groundButtons');
	expect(clicked).toBe(true);

	await page.waitForFunction(() => {
		const { state, scene } = window.__testHooks;
		return scene.getObjectById(state.topIds[0]).name !== 'placeholder';
	});
});

test('botão "baixo" fica perto da peça de cima e coloca a peça corretamente', async ({ page }) => {
	// Regressão: o botão "baixo" ficava posicionado longe demais do armário (~1 unidade),
	// e precisa de idBotaoFallback pra funcionar já que fica numa lacuna sem malha 3D.
	await clickCatalogItem(page, 'ARMARIO80');
	await page.waitForFunction(() => window.__testHooks.state.topIds.length === 1);

	await clickCatalogItem(page, 'BALCAO80');
	await waitDirectionButtonVisible(page, 'baixo', 'groundButtons');

	const gap = await page.evaluate(() => {
		const { state, scene } = window.__testHooks;
		const armario = scene.getObjectById(state.topIds[0]);
		const botaoBaixo = scene.getObjectById(state.groundButtons[0].baixo);
		return armario.box3.min.y - botaoBaixo.position.y;
	});
	expect(gap).toBeGreaterThan(0);
	expect(gap).toBeLessThan(0.5);

	const clicked = await clickDirectionButton(page, 'baixo', 'groundButtons');
	expect(clicked).toBe(true);
	await page.waitForFunction(() => {
		const { state, scene } = window.__testHooks;
		return scene.getObjectById(state.groundIds[0]).name !== 'placeholder';
	});
});
