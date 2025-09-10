// Vite Configuration for Betta Fish Project
// Local Development Setup with API Proxy

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '192.168.96.28',       // เพิ่ม IP วงแลนของเครื่อง
      '134.236.136.191',     // ถ้าจะเข้าผ่าน IP สาธารณะ
      '.loca.lt',
      '.ngrok-free.app'
    ],
    hmr: {
      host: '192.168.96.28', // ให้ HMR วิ่งผ่าน IP วงแลน
      port: 5173
    },
    
    // API Proxy Configuration
    proxy: {
      '/api': {
        target: 'http://localhost:4000', // เปลี่ยนจาก 5000 เป็น 4000 ให้ตรงกับ backend
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('Proxy Error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Proxying:', req.method, req.url, '→', proxyReq.path);
          });
        },
      },
    },
  },

  // Build Configuration
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

  // Development Configuration
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
  },
});