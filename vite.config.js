// D:\ProJectFinal\Lasts\my-project\vite.config.js (ฉบับสมบูรณ์)

// --- ส่วนที่ 1: การนำเข้า (Imports) ---

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';


// --- ส่วนที่ 2: การตั้งค่า (Configuration) ---

// https://vitejs.dev/config/
export default defineConfig({
  // Plugins ที่จะใช้ในโปรเจกต์ (ในที่นี้คือ React)
  plugins: [react()],

  // การตั้งค่าสำหรับ Development Server
  server: {
    // อนุญาตให้เข้าถึงจาก host ภายนอก
    host: '0.0.0.0',
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '.loca.lt',
      'purple-bikes-learn.loca.lt',
      'cruel-snakes-work.loca.lt',
      '.ngrok-free.app',
      '938cc95ee6a3.ngrok-free.app',
      '8f053d9a1832.ngrok-free.app',
      'c9d1a8e1f4a8.ngrok-free.app'
    ],
    // ตั้งค่า Proxy เพื่อแก้ปัญหา CORS และเชื่อมต่อ Frontend กับ Backend
    proxy: {
      // [อัปเดต] เราจะดักจับทุก request ที่ขึ้นต้นด้วย '/api'
      // ซึ่งเป็น path กลางของ API ทั้งหมดของเรา
      // (เช่น /api/auth/signin, /api/admin/users, /api/experts/queue)
      '/api': {
        
        // [อัปเดต] Target คือที่อยู่ของ Backend Server ของเรา ซึ่งรันอยู่ที่ Port 5000
        target: 'http://betta-fish-backend:5000',
        
        // changeOrigin: จำเป็นสำหรับการทำ Proxy ข้าม Origin (localhost:5173 -> localhost:5000)
        changeOrigin: true,
        
        // secure: ตั้งเป็น false เพราะ Backend ของเราใน Local ไม่ได้ใช้ HTTPS
        secure: false,

        // (Optional) ลบ /api ออกจาก path ก่อนส่งไปหา Backend
        // แต่ในกรณีของเรา Backend ถูกออกแบบให้รับ /api อยู่แล้ว จึงไม่ต้องใช้บรรทัดนี้
        // rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});