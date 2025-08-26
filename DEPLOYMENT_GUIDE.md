# 🚀 Deployment Guide - BettaFish Platform

## 📋 ขั้นตอนการ Deploy

### 🔥 **Vercel (แนะนำ)**

#### 1. เตรียม Repository
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

#### 2. Deploy ผ่าน Vercel CLI
```bash
# ติดตั้ง Vercel CLI
npm i -g vercel

# Login และ Deploy
vercel

# ตั้งค่า Environment Variables
vercel env add VITE_API_BASE_URL
```

#### 3. Deploy ผ่าน Vercel Dashboard
1. ไปที่ https://vercel.com
2. เข้าสู่ระบบด้วย GitHub
3. กด "New Project"
4. เลือก Repository ของคุณ
5. ตั้งค่า:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

#### 4. Environment Variables
ใน Vercel Dashboard → Settings → Environment Variables:
```
VITE_API_BASE_URL=https://your-backend-api.com
```

---

### 🌍 **Netlify**

#### 1. Deploy ผ่าน Netlify CLI
```bash
# ติดตั้ง Netlify CLI
npm install -g netlify-cli

# Login และ Deploy
netlify deploy

# Deploy production
netlify deploy --prod
```

#### 2. Deploy ผ่าน Netlify Dashboard
1. ไปที่ https://netlify.com
2. เข้าสู่ระบบด้วย GitHub
3. กด "New site from Git"
4. เลือก Repository
5. ตั้งค่า:
   - **Build Command:** `npm run build`
   - **Publish Directory:** `dist`
   - **Branch:** `main`

#### 3. Environment Variables
ใน Netlify Dashboard → Site Settings → Environment Variables:
```
VITE_API_BASE_URL=https://your-backend-api.com
```

---

## ⚙️ **ไฟล์การตั้งค่า**

### `vercel.json`
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "dist" }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "https://your-backend-api.com/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### `netlify.toml`
```toml
[build]
  publish = "dist"
  command = "npm run build"

[[redirects]]
  from = "/api/*"
  to = "https://your-backend-api.com/api/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## 🔧 **การตั้งค่า API Backend**

### ตัวอย่าง API URL:
- **Development:** `http://localhost:5000`
- **Production:** `https://your-backend.herokuapp.com` หรือ `https://your-backend.railway.app`

### สร้าง Environment Variables:
```bash
# สำหรับ Vercel
vercel env add VITE_API_BASE_URL production

# สำหรับ Netlify
netlify env:set VITE_API_BASE_URL https://your-backend-api.com
```

---

## 📱 **ตรวจสอบหลัง Deploy**

### ✅ **Checklist:**
- [ ] เว็บไซต์โหลดได้ปกติ
- [ ] การนำทางทำงานได้ (React Router)
- [ ] API calls ทำงานได้
- [ ] Mobile responsive ดี
- [ ] Performance ดี (Google PageSpeed)
- [ ] SEO meta tags ครบ

### 🔍 **Tools สำหรับตรวจสอบ:**
- **Performance:** https://pagespeed.web.dev/
- **SEO:** https://developers.google.com/speed/pagespeed/insights/
- **Mobile:** https://search.google.com/test/mobile-friendly

---

## 🚨 **Troubleshooting**

### ปัญหาที่พบบ่อย:

#### 1. **404 Error บน Refresh**
**สาเหตุ:** React Router ไม่ทำงานหลัง deploy
**แก้ไข:** ใช้ redirect rules ใน `vercel.json` หรือ `netlify.toml`

#### 2. **API CORS Error**
**สาเหตุ:** Backend ไม่อนุญาต domain ใหม่
**แก้ไข:** เพิ่ม domain ใน CORS settings ของ Backend

#### 3. **Environment Variables ไม่ทำงาน**
**สาเหตุ:** ไม่ได้ set ใน platform
**แก้ไข:** ตั้งค่าใน Dashboard หรือใช้ CLI

#### 4. **Build Error**
**สาเหตุ:** Missing dependencies หรือ Node version
**แก้ไข:** ตรวจสอบ `package.json` และ Node version

---

## 🎯 **Performance Tips**

### 1. **Code Splitting**
```javascript
// ใช้ lazy loading
const HomePage = lazy(() => import('./Pages/User/HomePage'));
```

### 2. **Image Optimization**
```javascript
// ใช้ modern formats
<img src="image.webp" alt="..." />
```

### 3. **Bundle Analysis**
```bash
npm run build -- --analyze
```

### 4. **Caching**
```javascript
// ใน service worker
const CACHE_NAME = 'bettafish-v1';
```

---

## 🔗 **Useful Links**

- **Vercel Docs:** https://vercel.com/docs
- **Netlify Docs:** https://docs.netlify.com
- **Vite Deployment:** https://vitejs.dev/guide/static-deploy.html
- **React Router:** https://reactrouter.com/en/main/guides/deploying
