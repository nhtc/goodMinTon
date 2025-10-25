# PageSpeed Optimization - Quick Implementation Guide

## ✅ Changes Already Applied

### 1. **next.config.js** - COMPLETE
- ✅ Enabled gzip compression
- ✅ Configured image optimization (AVIF, WebP)
- ✅ Added package import optimization for heavy libraries
- ✅ Removed powered-by header

### 2. **layout.tsx** - COMPLETE
- ✅ Added font-display: swap to Inter font
- ✅ Added viewport and theme color metadata
- ✅ Enabled font preloading

### 3. **HomeCharts Component** - COMPLETE
- ✅ Created separate component for charts
- ✅ Ready for dynamic import

---

## 🔨 Next Steps - Manual Changes Required

### Step 1: Update Home Page to Use Dynamic Import

**File**: `src/app/page.tsx`

**Find this code** (around line 1-18):
```tsx
"use client"
import React, { useEffect, useRef } from "react"
import Link from "next/link"
import { TypeAnimation } from "react-type-animation"
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
import CountUp from "react-countup"
```

**Replace with**:
```tsx
"use client"
import React, { useEffect, useRef } from "react"
import Link from "next/link"
import dynamic from 'next/dynamic'
import { TypeAnimation } from "react-type-animation"
import CountUp from "react-countup"

// Dynamic import for charts - only loads when needed
const HomeCharts = dynamic(
  () => import('../components/HomeCharts'),
  { 
    loading: () => <div className="chartCard">Loading charts...</div>,
    ssr: false // Charts don't need server-side rendering
  }
)
```

**Then in the component JSX** (find the section with charts and replace):
```tsx
{/* Replace the two chart divs with: */}
<HomeCharts monthlyData={monthlyData} categoryData={categoryData} />
```

---

### Step 2: Optimize Lodash Imports Throughout Project

**Search for**: `import _ from "lodash"`

**Replace with specific imports**:
```tsx
// Instead of:
import _ from "lodash"

// Use:
import omit from 'lodash/omit'
// Then use: omit(obj, 'key') instead of _.omit(obj, 'key')
```

**Common files to update:**
- `src/components/GameForm.tsx`
- `src/components/MemberForm.tsx`
- `src/components/PersonalEventForm.tsx`
- Any other files using lodash

---

### Step 3: Optimize Excel Export (Lazy Load)

**File**: `src/app/history/page.tsx` and `src/app/personal-tracking/page.tsx`

**Find**:
```tsx
import { exportGamesToExcel } from "../../utils/excelExport"
```

**Replace with**:
```tsx
// Remove the import at the top
```

**Find the export function**:
```tsx
const handleExportToExcel = async () => {
  const response = await fetch(/* ... */)
  const data = await response.json()
  exportGamesToExcel(data.games)
}
```

**Replace with**:
```tsx
const handleExportToExcel = async () => {
  const response = await fetch(/* ... */)
  const data = await response.json()
  
  // Lazy load the Excel export library
  const { exportGamesToExcel } = await import('@/utils/excelExport')
  exportGamesToExcel(data.games)
}
```

---

### Step 4: Optimize DatePicker (Already Dynamic Import Ready)

**File**: `src/components/GameForm.tsx`

**Find**:
```tsx
import DatePicker from "./DatePicker"
```

**Replace with**:
```tsx
import dynamic from 'next/dynamic'

const DatePicker = dynamic(
  () => import('./DatePicker'),
  { ssr: false }
)
```

---

### Step 5: Add Bundle Analyzer (Optional but Recommended)

**Install**:
```bash
npm install -D @next/bundle-analyzer
```

**Update next.config.js**:
```js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... existing config
}

module.exports = withBundleAnalyzer(nextConfig)
```

**Run analysis**:
```bash
ANALYZE=true npm run build
```

---

## 📊 Expected Impact

### After Step 1 (Dynamic Charts):
- **Bundle size reduction**: ~100-150KB
- **Initial load time**: -0.5-1s
- **Lighthouse score**: +5-10 points

### After Step 2 (Lodash optimization):
- **Bundle size reduction**: ~50-70KB
- **Parse time**: -50-100ms

### After Step 3 (Excel lazy load):
- **Bundle size reduction**: ~80-100KB (xlsx is heavy!)
- **Initial load time**: -0.3-0.5s

### After Step 4 (DatePicker lazy load):
- **Bundle size reduction**: ~40-60KB
- **Initial load time**: -0.2-0.3s

### **Total Expected Improvement**:
- ✅ Bundle size: **-270-380KB** (~30-40% reduction)
- ✅ Load time: **-1.5-2.5 seconds**
- ✅ Lighthouse Performance: **+15-25 points**

---

## 🎯 Priority Order

1. **HIGHEST PRIORITY** - Step 1 (Dynamic Charts) - 5 minutes
2. **HIGH PRIORITY** - Step 3 (Excel lazy load) - 3 minutes
3. **MEDIUM PRIORITY** - Step 2 (Lodash) - 10 minutes
4. **LOW PRIORITY** - Step 4 (DatePicker) - 2 minutes
5. **ANALYSIS** - Step 5 (Bundle analyzer) - 5 minutes

**Total time**: ~25 minutes for massive performance gains!

---

## 🧪 Testing After Changes

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Check build output** - Look for bundle sizes:
   ```
   ✓ Compiled successfully
   Route (app)                              Size     First Load JS
   ┌ ○ /                                    XXX kB         XXX kB  <- Should be smaller
   ```

3. **Test locally**:
   ```bash
   npm run start
   ```

4. **Deploy to Vercel**:
   ```bash
   git add .
   git commit -m "perf: optimize bundle size and loading"
   git push
   ```

5. **Re-run PageSpeed Insights**:
   - Wait 2-3 minutes after deployment
   - Test: https://pagespeed.web.dev/
   - Compare before/after scores

---

## 📈 Monitoring

### Before Optimization (Baseline):
Document current metrics:
- [ ] Performance Score: ____
- [ ] FCP (First Contentful Paint): ____
- [ ] LCP (Largest Contentful Paint): ____
- [ ] TBT (Total Blocking Time): ____
- [ ] CLS (Cumulative Layout Shift): ____

### After Optimization:
- [ ] Performance Score: ____
- [ ] FCP: ____
- [ ] LCP: ____
- [ ] TBT: ____
- [ ] CLS: ____

### Improvement:
- [ ] Score improvement: ____ points
- [ ] Load time reduction: ____ seconds

---

## 🚨 Common Issues & Solutions

### Issue 1: Build errors after changes
**Solution**: Make sure all imports are correct and dynamic imports use proper syntax

### Issue 2: Charts not showing
**Solution**: Check that HomeCharts component is exported as default

### Issue 3: Type errors with lodash
**Solution**: Install `@types/lodash` if not already installed

### Issue 4: Bundle analyzer not working
**Solution**: Make sure to use `ANALYZE=true` before the npm command

---

## ✨ Additional Optimizations (Future)

- [ ] Convert more components to Server Components
- [ ] Add React.lazy() for other heavy components
- [ ] Implement viewport-based lazy loading for charts
- [ ] Add Suspense boundaries for better loading states
- [ ] Consider replacing recharts with lighter Chart.js
- [ ] Add service worker for offline support
- [ ] Implement route prefetching for common paths

---

## 📝 Checklist

- [x] Updated next.config.js with optimizations
- [x] Updated layout.tsx with font optimization
- [x] Created HomeCharts component
- [ ] Update page.tsx to use dynamic import for charts
- [ ] Optimize lodash imports
- [ ] Lazy load Excel export
- [ ] Lazy load DatePicker
- [ ] Install and run bundle analyzer
- [ ] Test build locally
- [ ] Deploy to production
- [ ] Re-test with PageSpeed Insights
- [ ] Document improvements

---

**Status**: 3/11 Complete - Ready for manual implementation
**Last Updated**: October 21, 2025
