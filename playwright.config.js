import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	testDir: './tests',
	fullyParallel: true,
	retries: process.env.CI ? 2 : 0,
	reporter: 'list',
	use: {
		baseURL: 'http://localhost:5174/loft3d/',
		trace: 'retain-on-failure'
	},
	projects: [
		{
			name: 'chromium',
			use: {
				...devices['Desktop Chrome'],
				channel: 'chrome',
				// WebGL por software: sem GPU disponível no ambiente de CI/sandbox
				launchOptions: {
					args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader']
				}
			}
		}
	],
	webServer: {
		command: 'npm run dev',
		url: 'http://localhost:5174/loft3d/',
		reuseExistingServer: !process.env.CI,
		timeout: 30000
	}
});
