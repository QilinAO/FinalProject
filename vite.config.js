import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  server: {
    // Port สำหรับ Frontend
    port: 5173, 
  },

  // ส่วน Build Configuration ยังคงไว้เหมือนเดิม
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@headlessui/react', 'lucide-react'],
        },
      },
    },
  },
  
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
  },
});