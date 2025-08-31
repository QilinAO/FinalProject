# 🐟 Betta Fish Project - Frontend

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

Frontend will run at: http://localhost:5173

### Build
```bash
npm run build
```

## 🔧 Configuration

### Environment Variables
Create `.env.local` file:
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_BETTA_API=http://localhost:5000/api
VITE_BETTA_TOPK=3
VITE_BETTA_THRESHOLD=0.9
```

### API Proxy
Frontend automatically proxies `/api/*` requests to backend at `http://localhost:5000`

## 📁 Project Structure
```
src/
├── components/     # Reusable UI components
├── Pages/         # Page components
├── context/       # React context providers
├── hooks/         # Custom React hooks
├── services/      # API services
└── utils/         # Utility functions
```

## 🎨 UI Framework
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Headless UI** for accessible components
- **Lucide React** for icons

## 🔗 Backend Integration
- API calls through Vite proxy
- CORS configured for localhost:5173
- Authentication middleware ready

## 🚀 Deployment
- **Vercel**: `npm run deploy:vercel`
- **Netlify**: `npm run deploy:netlify`

## 📝 Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run analyze` - Analyze bundle size