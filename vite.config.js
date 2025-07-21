// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // ให้เซิร์ฟเวอร์ฟังทุกอินเตอร์เฟซ
    port: 5173, // คุณสามารถระบุพอร์ตที่ต้องการได้
    proxy: {
      '/files': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      '/users': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      '/reports': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
