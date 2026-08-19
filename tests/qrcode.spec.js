import { test, expect } from '@playwright/test';
import { clickCatalogItem } from './helpers.js';

test('clicar em RA no desktop abre o modal com QR Code', async ({ page }) => {
	await page.goto('/');
	await clickCatalogItem(page, 'BALCAO80');
	await page.waitForFunction(() => window.__testHooks.state.groundIds.length === 1);

	await page.click('.btnRa');

	const modal = page.locator('.modalQRCode');
	await expect(modal).not.toHaveClass(/hide/);
	await expect(page.locator('.modalQRCodeImagem svg')).toBeVisible();
});

test('abrir com ?m= remonta a montagem automaticamente', async ({ page }) => {
	const receita = 'i:balcao|c:balcao:1:0:0';
	await page.goto('/?m=' + encodeURIComponent(receita));

	await page.waitForFunction(() => window.__testHooks.state.groundIds.length === 2, null, { timeout: 15000 });

	const s = await page.evaluate(() => ({
		groundIds: window.__testHooks.state.groundIds,
		topIds: window.__testHooks.state.topIds
	}));
	expect(s.groundIds).toHaveLength(2);
	expect(s.topIds).toHaveLength(2);

	// modo visualização: menu de edição escondido
	await expect(page.locator('.label').first()).toHaveClass(/hide/);
});
