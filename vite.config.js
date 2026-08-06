import { defineConfig } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
	base: '/loft3d/',
	resolve: {
		alias: [
			{ find: /^three\/addons\/(.*)$/, replacement: path.resolve(__dirname, 'jsm') + '/$1' },
			{ find: 'three', replacement: path.resolve(__dirname, 'build/three.module.js') }
		]
	},
	build: {
		outDir: 'dist'
	}
});
