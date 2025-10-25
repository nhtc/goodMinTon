# Exact Code Changes for PageSpeed Optimization

## File 1: src/app/page.tsx

### REMOVE these imports (lines ~5-15):
```tsx
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
```

### ADD this import (after React imports):
```tsx
import dynamic from 'next/dynamic'

// Dynamic import for charts - loads only when component is visible
const HomeCharts = dynamic(
  () => import('../components/HomeCharts'),
  { 
    loading: () => (
      <div className="chartCard" style={{ padding: '20px', textAlign: 'center' }}>
        <div className="spinner"></div>
        <p>Loading charts...</p>
      </div>
    ),
    ssr: false
  }
)
```

### FIND this section in JSX (the two chart divs):
```tsx
{/* Charts Section */}
<div className={styles.chartCard}>
  <h3 className={styles.chartTitle}>📊 Hoạt động theo tháng</h3>
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={monthlyData}>
      {/* ... chart code ... */}
    </BarChart>
  </ResponsiveContainer>
</div>

<div className={styles.chartCard}>
  <h3 className={styles.chartTitle}>📈 Phân bổ danh mục</h3>
  <ResponsiveContainer width="100%" height={300}>
    <PieChart>
      {/* ... chart code ... */}
    </PieChart>
  </ResponsiveContainer>
</div>
```

### REPLACE with:
```tsx
{/* Charts Section - Lazy Loaded */}
<HomeCharts monthlyData={monthlyData} categoryData={categoryData} />
```

### REMOVE the COLORS constant (no longer needed):
```tsx
const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b"]
```

---

## File 2: src/app/history/page.tsx

### FIND this import:
```tsx
import { exportGamesToExcel } from "../../utils/excelExport"
```

### REMOVE IT (delete the line)

### FIND the handleExportToExcel function:
```tsx
const handleExportToExcel = async () => {
  setIsExporting(true)
  try {
    const response = await fetch(`/api/games?paginate=false`)
    if (!response.ok) throw new Error('Failed to fetch games')
    
    const data = await response.json()
    exportGamesToExcel(data.games)
    
    // Show success toast
  } catch (error) {
    console.error('Export failed:', error)
  } finally {
    setIsExporting(false)
  }
}
```

### REPLACE with:
```tsx
const handleExportToExcel = async () => {
  setIsExporting(true)
  try {
    const response = await fetch(`/api/games?paginate=false`)
    if (!response.ok) throw new Error('Failed to fetch games')
    
    const data = await response.json()
    
    // Lazy load the Excel export library (only when needed)
    const { exportGamesToExcel } = await import('../../utils/excelExport')
    exportGamesToExcel(data.games)
    
    // Show success toast
  } catch (error) {
    console.error('Export failed:', error)
  } finally {
    setIsExporting(false)
  }
}
```

---

## File 3: src/app/personal-tracking/page.tsx

### FIND this import:
```tsx
import { exportPersonalEventsToExcel } from '@/utils/excelExport'
```

### REMOVE IT (delete the line)

### FIND the handleExportToExcel function:
```tsx
const handleExportToExcel = async () => {
  try {
    const response = await fetch('/api/personal-events?paginate=false')
    if (!response.ok) throw new Error('Failed to fetch events')
    
    const data = await response.json()
    exportPersonalEventsToExcel(data.events)
    
    // Show toast...
  } catch (error) {
    console.error('Export failed:', error)
  }
}
```

### REPLACE with:
```tsx
const handleExportToExcel = async () => {
  try {
    const response = await fetch('/api/personal-events?paginate=false')
    if (!response.ok) throw new Error('Failed to fetch events')
    
    const data = await response.json()
    
    // Lazy load the Excel export library (only when needed)
    const { exportPersonalEventsToExcel } = await import('@/utils/excelExport')
    exportPersonalEventsToExcel(data.events)
    
    // Show toast...
  } catch (error) {
    console.error('Export failed:', error)
  }
}
```

---

## File 4: src/components/GameForm.tsx

### FIND this import:
```tsx
import DatePicker from "./DatePicker"
```

### REPLACE with:
```tsx
import dynamic from 'next/dynamic'

// Lazy load DatePicker component
const DatePicker = dynamic(
  () => import('./DatePicker'),
  { 
    loading: () => <div style={{ height: '44px', background: '#f3f4f6', borderRadius: '12px' }}></div>,
    ssr: false 
  }
)
```

---

## File 5: Optimize Lodash (Multiple Files)

### GameForm.tsx

**FIND:**
```tsx
import _ from "lodash"
```

**REPLACE with:**
```tsx
import omit from 'lodash/omit'
```

**THEN throughout the file, REPLACE:**
```tsx
_.omit(prev, "date")
```
**WITH:**
```tsx
omit(prev, "date")
```

### Apply same pattern to:
- `src/components/MemberForm.tsx`
- `src/components/PersonalEventForm.tsx`
- Any other file using `_.omit` or other lodash functions

---

## File 6: Add Loading UI (Optional Enhancement)

### Create src/app/loading.tsx:
```tsx
export default function Loading() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '60vh',
      flexDirection: 'column',
      gap: '16px'
    }}>
      <div style={{
        width: '48px',
        height: '48px',
        border: '4px solid #e5e7eb',
        borderTop: '4px solid #3b82f6',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
      <p style={{ color: '#6b7280', fontSize: '14px' }}>Loading...</p>
      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
```

---

## Testing Commands

### 1. Check for syntax errors:
```bash
npm run lint
```

### 2. Build to verify everything works:
```bash
npm run build
```

### 3. Check build output for bundle sizes:
Look for lines like:
```
Route (app)                              Size     First Load JS
┌ ○ /                                    5.2 kB         120 kB
├ ○ /history                             8.1 kB         135 kB
```

### 4. Test locally:
```bash
npm run start
```

### 5. Install bundle analyzer (optional):
```bash
npm install -D @next/bundle-analyzer
```

Then update next.config.js:
```js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer(nextConfig)
```

Run analysis:
```bash
ANALYZE=true npm run build
```

---

## Summary of Changes

✅ **3 files already updated by AI:**
1. `next.config.js` - Performance optimizations
2. `src/app/layout.tsx` - Font optimization
3. `src/components/HomeCharts.tsx` - Created new component

📝 **6 files you need to update manually:**
1. `src/app/page.tsx` - Dynamic import for charts
2. `src/app/history/page.tsx` - Lazy load Excel export
3. `src/app/personal-tracking/page.tsx` - Lazy load Excel export
4. `src/components/GameForm.tsx` - Lazy load DatePicker + optimize lodash
5. `src/components/MemberForm.tsx` - Optimize lodash
6. `src/components/PersonalEventForm.tsx` - Optimize lodash

⏱️ **Time estimate:** 20-30 minutes total
📉 **Expected bundle reduction:** 270-380 KB (~30-40%)
🚀 **Expected performance gain:** +15-25 Lighthouse score points

---

## Before You Start

1. **Commit your current code:**
   ```bash
   git add .
   git commit -m "checkpoint: before performance optimizations"
   ```

2. **Create a new branch (optional):**
   ```bash
   git checkout -b performance-optimization
   ```

3. **Make the changes listed above**

4. **Test thoroughly before deploying!**

---

Good luck! 🚀
