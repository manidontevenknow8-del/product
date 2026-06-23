import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  ssr: {
    noExternal: ['react-router', 'react-router-dom'],
  },
  build: {
    sourcemap: false,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/react-router')) {
            return 'vendor-router';
          }
          if (id.includes('node_modules/posthog-js')) {
            return 'vendor-posthog';
          }
          if (id.includes('node_modules/@supabase')) {
            return 'vendor-supabase';
          }
          if (id.includes('expandedBlogPosts') || id.includes('mockBlogPosts') || id.includes('seoBlogPosts')) {
            return 'data-blog';
          }
          if (id.includes('/data/faq/') || id.includes('faqQuestionBank')) {
            return 'data-faq';
          }
          if (id.includes('/data/programmatic/') || id.includes('/data/learn/')) {
            return 'data-seo';
          }
        },
      },
    },
  },
});
