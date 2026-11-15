import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import globals from 'globals';

export default defineConfig([
  js.configs.recommended,
  ...nextVitals,
  {
    files: ['**/*.{js,mjs,jsx}'],
    languageOptions: { globals: { ...globals.node } },
  },
  globalIgnores(['.next/**', 'out/**', 'coverage/**', '.impeccable/**']),
]);
