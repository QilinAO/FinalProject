# 🚀 การ Deploy แบบง่าย ๆ ทั้ง Frontend + Backend

> **คู่มือนี้จะพาคุณ deploy ทั้งระบบภายใน 15 นาที!**

---

## 📋 **สิ่งที่ต้องเตรียม:**

1. ✅ **GitHub Account:** QilinAO (มีแล้ว)
2. ✅ **Repository:** 
   - Frontend: `FinalProject` 
   - Backend: `API-FinalProJect`
3. ✅ **Supabase Database** (ถ้ามี)

---

## 🎯 **ขั้นตอน Deploy (15 นาที)**

### **Step 1: Deploy Backend API (5 นาที)**

#### **A. เปิด Railway:**
1. ไปที่ https://railway.app
2. กด **"Login with GitHub"** 
3. เข้าสู่ระบบด้วย account **QilinAO**

#### **B. สร้าง Project:**
1. กด **"New Project"**
2. เลือก **"Deploy from GitHub repo"**
3. เลือก Repository: **`API-FinalProJect`**
4. กด **"Deploy Now"**

#### **C. ตั้งค่า Environment Variables:**
1. รอ deploy เสร็จ (2-3 นาที)
2. ไปที่ **Settings → Variables**
3. เพิ่มตัวแปรเหล่านี้:

```bash
NODE_ENV=production
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiI...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiI...
JWT_SECRET=my-super-secret-jwt-key-2024
FRONTEND_URLS=https://localhost:3000
```

> **หมายเหตุ:** ถ้าไม่มี Supabase ให้ใส่ค่าปลอม ๆ ไปก่อน

#### **D. ได้ API URL:**
```
https://api-finalproject-production-xxxx.up.railway.app
```
**📝 จดบันทึก URL นี้ไว้!**

---

### **Step 2: Deploy Frontend (5 นาที)**

#### **A. เปิด Vercel:**
1. ไปที่ https://vercel.com
2. กด **"Continue with GitHub"**
3. เข้าสู่ระบบด้วย account **QilinAO**

#### **B. สร้าง Project:**
1. กด **"New Project"**
2. เลือก Repository: **`FinalProject`**
3. Framework จะ detect **"Vite"** อัตโนมัติ

#### **C. ตั้งค่า Environment Variables:**
1. ในหน้า Configure Project
2. เพิ่ม Environment Variable:

```bash
Name: VITE_API_BASE_URL
Value: https://api-finalproject-production-xxxx.up.railway.app
```
> **ใส่ URL ที่ได้จาก Step 1**

#### **D. Deploy:**
1. กด **"Deploy"**
2. รอ 2-3 นาที
3. ได้ Frontend URL:
```
https://final-project-xxxx.vercel.app
```

---

### **Step 3: เชื่อมต่อ Frontend-Backend (5 นาที)**

#### **A. อัปเดต Backend CORS:**
1. กลับไปที่ **Railway → Settings → Variables**
2. แก้ไข **FRONTEND_URLS** เป็น:
```bash
FRONTEND_URLS=https://final-project-xxxx.vercel.app,https://localhost:3000
```

#### **B. Redeploy Backend:**
1. ไปที่ **Deployments**
2. กด **"Redeploy"** deployment ล่าสุด

#### **C. ทดสอบ:**
1. เปิด Frontend URL ที่ได้
2. ลองใช้งานเว็บไซต์
3. ตรวจสอบว่า API เรียกได้

---

## ✅ **ผลลัพธ์สุดท้าย**

หลังจากทำเสร็จ คุณจะได้:

### **🌐 URLs:**
- **เว็บไซต์:** `https://final-project-xxxx.vercel.app`
- **API:** `https://api-finalproject-production-xxxx.up.railway.app`

### **🎯 Features ที่ใช้งานได้:**
- ✅ หน้าแรก (Homepage)
- ✅ ข่าวสาร (News)
- ✅ การประกวด (Contest)  
- ✅ ประเมินปลากัด (Evaluation)
- ✅ ประวัติ (History)
- ✅ Login/SignUp
- ✅ Mobile Responsive

---

## 🚨 **หากมีปัญหา**

### **1. Frontend ไม่เรียก API ได้:**
- ตรวจสอบ `VITE_API_BASE_URL` ใน Vercel
- ตรวจสอบ `FRONTEND_URLS` ใน Railway

### **2. CORS Error:**
```bash
# แก้ไข FRONTEND_URLS ใน Railway:
FRONTEND_URLS=https://your-frontend.vercel.app,https://your-frontend.netlify.app
```

### **3. API ตอบ 500 Error:**
- ตรวจสอบ Environment Variables ใน Railway
- ดู Logs ใน Railway Dashboard

---

## 🎉 **เสร็จแล้ว!**

ตอนนี้คุณมีเว็บไซต์ **BettaFish Platform** ที่ทำงานได้จริงแล้ว!

### **📱 สิ่งที่ควรทำต่อ:**
1. **แชร์ URL** ให้เพื่อนทดสอบ
2. **ตั้งค่า Custom Domain** (ถ้าต้องการ)
3. **Monitor Performance** ผ่าน Dashboard
4. **Backup Database** ประจำ

### **💰 ค่าใช้จ่าย:**
- **Vercel:** ฟรี
- **Railway:** $5/เดือน (หรือใช้ฟรี $5 credit)
- **รวม:** ประมาณ $5/เดือน

---

## 📞 **ติดต่อช่วยเหลือ**

หากมีปัญหา สามารถ:
1. ดู Logs ใน Railway/Vercel Dashboard
2. ตรวจสอบ Network tab ใน Browser
3. ดู Console errors ใน DevTools

**Happy Coding! 🚀✨**
