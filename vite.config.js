import { defineConfig } from 'vite';
import { execSync } from 'child_process';

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
	build: {
		outDir: 'dist'
	}
});
