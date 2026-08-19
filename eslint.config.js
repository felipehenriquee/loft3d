import js from '@eslint/js';
import globals from 'globals';
import prettierConfig from 'eslint-config-prettier';

export default [
	{
		ignores: ['dist/**', 'node_modules/**', 'src/qrcode/**', 'public/**']
	},
	js.configs.recommended,
	{
		languageOptions: {
			ecmaVersion: 2022,
			sourceType: 'module',
			globals: {
				...globals.browser,
				__APP_VERSION__: 'readonly',
				__BUILD_TIME__: 'readonly',
				// carregado via <script> em index.html, não é um módulo ES
				gsap: 'readonly'
			}
		},
		rules: {
			'no-unused-vars': ['warn', { args: 'none' }]
		}
	},
	{
		files: ['playwright.config.js'],
		languageOptions: {
			globals: globals.node
		}
	},
	{
		// Mistura código Node (test()/expect()) com callbacks de page.evaluate() que rodam
		// no navegador — libera os globals dos dois ambientes pra evitar falso positivo
		files: ['tests/**'],
		languageOptions: {
			globals: { ...globals.node, ...globals.browser }
		}
	},
	prettierConfig
];
