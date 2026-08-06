import { defineConfig } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function gitHashCurto() {
	try {
		return execSync('git rev-parse --short HEAD').toString().trim();
	} catch {
		return 'dev';
	}
}

export default defineConfig({
	base: '/loft3d/',
	define: {
		__APP_VERSION__: JSON.stringify(gitHashCurto()),
		__BUILD_TIME__: JSON.stringify(new Date().toISOString())
	},
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
