// D:\ProJectFinal\Lasts\my-project\src\main.jsx (ฉบับสมบูรณ์)

// --- ส่วนที่ 1: การนำเข้า (Imports) ---

// นำเข้า Library ที่จำเป็นจาก React เพื่อให้สามารถใช้งาน React และจัดการ DOM ได้
import React from 'react';
import { createRoot } from 'react-dom/client';

// นำเข้า Component หลักของแอปพลิเคชันของเรา ซึ่งก็คือไฟล์ App.jsx
import App from './App'; 

// นำเข้า AuthProvider จาก AuthContext ที่เราสร้างขึ้น
// นี่คือ Component ที่จะทำหน้าที่จัดการข้อมูลและสถานะการ Login ทั้งหมด
import { AuthProvider } from './context/AuthContext'; 

// นำเข้า Library อื่นๆ ที่จำเป็น
import Modal from 'react-modal'; // Library สำหรับสร้าง Modal

// นำเข้าไฟล์ CSS หลักของโปรเจกต์ ซึ่งรวม Tailwind CSS directives ไว้
import './index.css'; 


// --- ส่วนที่ 2: การตั้งค่าเริ่มต้น (Configuration) ---

// ตั้งค่า react-modal ให้รับรู้ว่า element หลักของแอปเราคือ `#root`
// การทำเช่นนี้สำคัญมากสำหรับ Accessibility (การเข้าถึงของผู้พิการ) 
// เพราะมันจะช่วยซ่อน element อื่นๆ ทั้งหมดเมื่อ Modal เปิดอยู่ ทำให้ Screen Reader โฟกัสที่ Modal ได้ถูกต้อง
Modal.setAppElement('#root');


// --- ส่วนที่ 3: การเตรียม Root สำหรับ Render ---

// 1. ค้นหา DOM element ที่มี id="root" ในไฟล์ `public/index.html`
//    ซึ่งเป็นเหมือน "กระดาน" ที่ React จะวาดแอปพลิเคชันของเราลงไป
const rootElement = document.getElementById('root');

// 2. สร้าง "root" สำหรับการ Render ของ React 18
//    นี่เป็นวิธีมาตรฐานใหม่ของ React 18 ในการเริ่มต้นแอปพลิเคชัน
const root = createRoot(rootElement);


// --- ส่วนที่ 4: การ Render แอปพลิเคชัน ---

// สั่งให้ React เริ่มทำการ "Render" หรือ "วาด" แอปพลิเคชันของเราลงบน "กระดาน" ที่เตรียมไว้
root.render(
  // <React.StrictMode> เป็นเครื่องมือสำหรับช่วยนักพัฒนาหาปัญหาที่อาจเกิดขึ้นในแอป
  // เช่น การใช้ lifecycle methods ที่ล้าสมัย หรือการเขียนโค้ดที่อาจก่อให้เกิด side-effects ที่ไม่คาดคิด
  // Component นี้จะทำงานเฉพาะใน Development Mode และไม่มีผลกระทบใดๆ กับเวอร์ชัน Production
  <React.StrictMode>

    {/*
      [จุดที่สำคัญที่สุดของไฟล์นี้]
      <AuthProvider> คือหัวใจของการจัดการสถานะ Login
      เรานำมันมาห่อหุ้ม <App /> ไว้ ณ จุดสูงสุดของ Component Tree
      เพื่อให้ทุกๆ Component ที่อยู่ภายใต้ <App /> (ซึ่งก็คือทั้งแอปพลิเคชัน)
      สามารถใช้ hook `useAuth()` เพื่อเข้าถึงข้อมูล user, สถานะ isAuthenticated,
      และฟังก์ชัน signin/signout ได้จากทุกที่ในแอป
    */}
    <AuthProvider>
      <App />
    </AuthProvider>
    
  </React.StrictMode>
);