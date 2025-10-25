# PageSpeed Insights Optimization Guide

## Analysis Summary
Based on your project structure and common PageSpeed issues, here are the key areas for optimization:

---

## 🔴 HIGH PRIORITY OPTIMIZATIONS

### 1. **Code Splitting & Bundle Size**

#### Problem:
- Multiple heavy libraries (recharts, react-datepicker, xlsx, etc.) loaded on every page
- Home page loads charts library even if user doesn't scroll to view them

#### Solutions:

**A. Dynamic Imports for Heavy Components**
```tsx
// src/app/page.tsx - Home page
// Instead of:
import { BarChart, PieChart, ... } from "recharts"

// Use dynamic import:
import dynamic from 'next/dynamic'

const DynamicCharts = dynamic(
  () => import('../components/HomeCharts'),
  { 
    loading: () => <div>Loading charts...</div>,
    ssr: false // Charts don't need SSR
  }
)
```

**B. Lazy Load Heavy Libraries**
```tsx
// For DatePicker
const DatePicker = dynamic(
  () => import('../components/DatePicker'),
  { ssr: false }
)

// For Excel export
const handleExportToExcel = async () => {
  const { exportGamesToExcel } = await import('@/utils/excelExport')
  exportGamesToExcel(games)
}
```

**C. Split Chart Component**
Create `src/components/HomeCharts.tsx`:
```tsx
'use client'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

export default function HomeCharts({ monthlyData, categoryData }) {
  // Move all chart code here
  return (
    <>
      <ResponsiveContainer>...</ResponsiveContainer>
      {/* All chart components */}
    </>
  )
}
```

---

### 2. **Font Loading Optimization**

#### Current Issue:
```tsx
const inter = Inter({ subsets: ["latin"] })
```

#### Optimized Version:
```tsx
const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap', // Prevent invisible text during load
  preload: true,
  variable: '--font-inter',
})
```

---

### 3. **Image Optimization**

#### Add Next.js Image Component
Even for avatars loaded from URLs:

```tsx
// Instead of:
<img src={member.avatar} alt={member.name} />

// Use:
import Image from 'next/image'

<Image 
  src={member.avatar} 
  alt={member.name}
  width={40}
  height={40}
  quality={75}
  loading="lazy"
/>
```

---

### 4. **Reduce JavaScript Execution Time**

#### A. Remove Unused Dependencies
Check if you're using all of these:
```bash
# Analyze bundle size
npm install -D @next/bundle-analyzer

# Add to next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer(nextConfig)

# Run analysis
ANALYZE=true npm run build
```

#### B. Optimize Heavy Libraries

**Lodash** - Use specific imports:
```tsx
// Instead of:
import _ from 'lodash'

// Use:
import omit from 'lodash/omit'
import debounce from 'lodash/debounce'
```

**Recharts** - Consider lighter alternatives:
- Use Chart.js with react-chartjs-2 (smaller bundle)
- Or only import needed components

---

### 5. **CSS Optimization**

#### Current Issue:
Large CSS files loaded on every page

#### Solution - CSS Modules (Already using ✅)
But can optimize further:

```tsx
// Ensure unused styles are removed
// Add to next.config.js
module.exports = {
  experimental: {
    optimizeCss: true, // Enable CSS optimization
  },
}
```

---

## 🟡 MEDIUM PRIORITY OPTIMIZATIONS

### 6. **Third-party Script Optimization**

If you add analytics later, use Next.js Script component:
```tsx
import Script from 'next/script'

<Script
  src="https://analytics.example.com/script.js"
  strategy="lazyOnload" // or "afterInteractive"
/>
```

---

### 7. **Server Components by Default**

#### Identify Client-Only Components
Only use "use client" when necessary:

**Should be Server Components:**
- Static pages
- Data fetching components
- Layout components without interactivity

**Need "use client":**
- Components with useState, useEffect
- Event handlers
- Browser-only APIs

---

### 8. **Preload Critical Resources**

```tsx
// src/app/layout.tsx
import { Inter } from "next/font/google"

export const metadata: Metadata = {
  title: "Badminton Manager",
  description: "Manage your badminton games efficiently",
  // Add these:
  icons: {
    icon: '/favicon.ico',
  },
}

// In layout, add preconnect for external resources
export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <head>
        {/* Preconnect to API if external */}
        <link rel="preconnect" href="https://your-api.com" />
        <link rel="dns-prefetch" href="https://your-api.com" />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
```

---

### 9. **API Response Optimization**

#### Enable Compression in Vercel
Create `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=60, stale-while-revalidate=300"
        }
      ]
    }
  ]
}
```

#### Paginate Large Datasets
Already implemented ✅ - Good!

---

### 10. **React Query Optimization**

```tsx
// src/context/QueryProvider.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      refetchOnWindowFocus: false, // Reduce unnecessary refetches
      retry: 1, // Reduce retry attempts
    },
  },
})
```

---

## 🟢 LOW PRIORITY / NICE TO HAVE

### 11. **Add Loading States**

```tsx
// Add loading.tsx in app directory
export default function Loading() {
  return <div>Loading...</div>
}
```

---

### 12. **Enable Static Exports for Static Pages**

```tsx
// For truly static pages, add:
export const dynamic = 'force-static'
export const revalidate = 3600 // Revalidate every hour
```

---

### 13. **Optimize Type Animation**

```tsx
// Instead of loading entire library, consider CSS animations
// or use smaller animation libraries
```

---

## 📊 IMPLEMENTATION PRIORITY

### Phase 1 (Immediate - Biggest Impact):
1. ✅ Dynamic import for Recharts
2. ✅ Dynamic import for DatePicker  
3. ✅ Optimize lodash imports
4. ✅ Add font display swap
5. ✅ Lazy load Excel export

### Phase 2 (This Week):
1. ⏳ Add bundle analyzer
2. ⏳ Remove unused dependencies
3. ⏳ Optimize images with Next/Image
4. ⏳ Add CSS optimization
5. ⏳ Configure React Query properly

### Phase 3 (Next Week):
1. ⏳ Add loading states
2. ⏳ Optimize API caching
3. ⏳ Review and convert to Server Components where possible
4. ⏳ Add preconnect headers

---

## 🎯 EXPECTED IMPROVEMENTS

After implementing Phase 1:
- **JavaScript bundle size**: -30-40% reduction
- **First Contentful Paint**: -0.5-1s improvement
- **Time to Interactive**: -1-2s improvement
- **Total Blocking Time**: -200-500ms improvement

After implementing Phase 2:
- **Lighthouse Score**: 75-85+ (from current baseline)
- **Bundle size**: -50% total reduction
- **Load time**: -2-3s improvement

---

## 🔧 QUICK WINS TO IMPLEMENT NOW

### 1. Update next.config.js
```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compress: true, // Enable gzip compression
  poweredByHeader: false, // Remove X-Powered-By header
  
  images: {
    formats: ['image/avif', 'image/webp'], // Modern image formats
    deviceSizes: [640, 750, 828, 1080, 1200], // Optimize for common devices
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Experimental features for better performance
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['recharts', 'lodash', 'lucide-react'],
  },
}

module.exports = nextConfig
```

### 2. Update layout.tsx
```tsx
import { Inter } from "next/font/google"

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  preload: true,
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: "Badminton Manager",
  description: "Manage your badminton games, members, and history efficiently",
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#3b82f6',
}
```

### 3. Create optimized chart component
See implementation files below.

---

## 📝 MEASURING SUCCESS

### Before Optimization:
Run PageSpeed test and note:
- Performance Score
- First Contentful Paint
- Largest Contentful Paint
- Total Blocking Time
- Cumulative Layout Shift

### After Each Phase:
Re-run test and compare metrics.

### Tools:
- PageSpeed Insights: https://pagespeed.web.dev/
- Chrome DevTools Lighthouse
- Vercel Analytics (if available)

---

## 🚀 NEXT STEPS

1. Implement next.config.js updates
2. Create HomeCharts component with dynamic import
3. Update lodash imports across the codebase
4. Add bundle analyzer and check results
5. Re-test with PageSpeed Insights
6. Document improvements

---

**Last Updated**: October 21, 2025
**Status**: Ready for Implementation
