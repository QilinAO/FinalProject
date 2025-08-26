# 🐟 BettaFish Platform

> ระบบจัดการปลากัดออนไลน์ที่ครบครันและทันสมัย

## 🌟 Features

- 🎯 **ประเมินปลากัด** - ส่งปลากัดเข้าประเมินโดยผู้เชี่ยวชาญ
- 🏆 **การประกวด** - เข้าร่วมการประกวดปลากัดออนไลน์
- 📰 **ข่าวสาร** - ติดตามข่าวสารและกิจกรรม
- 👥 **ระบบผู้ใช้** - User, Expert, Manager, Admin roles
- 📱 **Responsive Design** - ใช้งานได้ทุกอุปกรณ์
- 🎨 **Modern UI/UX** - ออกแบบสวยงามและใช้งานง่าย

## 🚀 Quick Start

### Development
```bash
npm install
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```

## 📦 Deployment

### 🔥 **Vercel (แนะนำ)**

#### วิธีที่ 1: Deploy ผ่าน Dashboard
1. ไปที่ [vercel.com](https://vercel.com)
2. เชื่อม GitHub repository
3. ตั้งค่า Environment Variables:
   ```
   VITE_API_BASE_URL=https://your-backend-api.com
   ```

#### วิธีที่ 2: Deploy ผ่าน CLI
```bash
# ติดตั้ง Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables
vercel env add VITE_API_BASE_URL
```

### 🌍 **Netlify**

#### วิธีที่ 1: Deploy ผ่าน Dashboard
1. ไปที่ [netlify.com](https://netlify.com)
2. เชื่อม GitHub repository
3. ตั้งค่า Build settings:
   - **Build Command:** `npm run build`
   - **Publish Directory:** `dist`

#### วิธีที่ 2: Deploy ผ่าน CLI
```bash
# ติดตั้ง Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod
```

## ⚙️ Environment Variables

### Frontend (.env)
```bash
VITE_API_BASE_URL=https://your-backend-api.com
VITE_APP_TITLE=BettaFish Platform
VITE_ENABLE_NOTIFICATIONS=true
```

### ตั้งค่าใน Deployment Platform

#### Vercel:
```bash
vercel env add VITE_API_BASE_URL production
```

#### Netlify:
```bash
netlify env:set VITE_API_BASE_URL https://your-backend-api.com
```

## 🏗️ Tech Stack

### Frontend
- **React 18** - UI Library
- **Vite** - Build Tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Axios** - HTTP Client
- **React Hook Form** - Form Management
- **Lucide Icons** - Icons

### Design System
- **Custom Color Palette** - สีสันที่สม่ำเสมอ
- **Typography Scale** - ขนาดฟอนต์มาตรฐาน
- **Component Library** - Components ที่ใช้ซ้ำได้
- **Responsive Grid** - Layout ที่ปรับขนาดได้

## 📁 Project Structure

```
src/
├── Component/          # Layout components
├── Pages/             # Page components
│   ├── User/         # User pages
│   ├── Expert/       # Expert pages
│   ├── Manager/      # Manager pages
│   └── Admin/        # Admin pages
├── services/         # API services
├── context/          # React contexts
├── hooks/           # Custom hooks
├── utils/           # Utility functions
└── styles/          # Global styles
```

## 🎨 Design System

### Colors
- **Primary:** Blue gradient (#667eea → #764ba2)
- **Secondary:** Complementary colors
- **Neutral:** Gray scale
- **Status:** Success, Warning, Error

### Layout Classes
- `.page-container` - Main container
- `.page-hero` - Hero section
- `.page-main` - Main content
- `.content-card` - Content cards

## 🔧 Scripts

```bash
npm run dev            # Start development server
npm run build          # Build for production
npm run preview        # Preview production build
npm run lint           # Run ESLint
npm run deploy:vercel  # Deploy to Vercel
npm run deploy:netlify # Deploy to Netlify
```

## 📱 Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers

## 🚨 Troubleshooting

### Common Issues

#### 1. API CORS Error
**Solution:** Add your domain to backend CORS settings

#### 2. 404 on Page Refresh
**Solution:** Ensure redirect rules are set (handled by `vercel.json` / `netlify.toml`)

#### 3. Environment Variables Not Working
**Solution:** Set them in deployment platform dashboard

#### 4. Build Errors
**Solution:** Check Node.js version (18+) and dependencies

## 📈 Performance

- ⚡ **Bundle Size:** ~260KB (gzipped: ~84KB)
- 🚀 **Load Time:** < 3s on 3G
- 📱 **Mobile Score:** 95+ (PageSpeed)
- 🎯 **SEO Score:** 90+ (Lighthouse)

## 🔗 Links

- **Documentation:** [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- **Demo:** [Coming Soon]
- **Backend API:** [Repository Link]

## 👨‍💻 Development

### Prerequisites
- Node.js 18+
- npm 9+

### Setup
1. Clone repository
2. Install dependencies: `npm install`
3. Set environment variables
4. Start development: `npm run dev`

### Code Style
- ESLint configuration
- Prettier formatting
- Conventional commits

## 📄 License

Private Project - All Rights Reserved

---

Made with ❤️ for BettaFish Community