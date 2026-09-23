import { defineConfig, transformWithOxc } from 'vite';
import react from '@vitejs/plugin-react';

const jsAsJsxPlugin = {
  name: 'treat-js-as-jsx',
  enforce: 'pre',
  async transform(code, id) {
    if (!id.includes('node_modules') && id.endsWith('.js') && (code.includes('<') || code.includes('</'))) {
      return transformWithOxc(code, id, { lang: 'jsx' });
    }
  },
};

export default defineConfig({
  plugins: [jsAsJsxPlugin, react()],
  optimizeDeps: {
    rolldownOptions: {
      plugins: [jsAsJsxPlugin],
    },
  },
});
