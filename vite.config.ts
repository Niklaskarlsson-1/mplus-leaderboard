import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  base: './',
  test: {
    environment: 'jsdom', // en låtsas-webbläsare så att komponenter kan renderas
    setupFiles: ['./src/test/setup.ts'],
    restoreMocks: true,
    unstubGlobals: true, // återställ fetch efter varje test
  },
});
