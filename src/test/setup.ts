import '@testing-library/jest-dom/vitest'; // ger t.ex. expect(el).toBeInTheDocument()
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';
import { clearCache } from '../lib/api.ts';

afterEach(() => {
  cleanup();
  clearCache(); // varje test ska börja utan sparade API-svar
});
