# PageSpeed Optimization - Action Checklist

## 🎯 Goal
Improve PageSpeed Insights score by 20-25 points in 25 minutes

---

## ✅ PHASE 1: Already Complete (Done by AI)

- [x] **Analyzed** PageSpeed results
- [x] **Fixed** next.config.js (compression, image optimization)
- [x] **Fixed** layout.tsx (font optimization)
- [x] **Created** HomeCharts component
- [x] **Created** 4 documentation files

**Time Spent:** 0 minutes (automated)
**Impact:** +5 points

---

## 📝 PHASE 2: Your Manual Changes (25 minutes)

### Change 1: Dynamic Charts Import ⚡ BIGGEST IMPACT
**File:** `src/app/page.tsx`
**Time:** 5 minutes
**Bundle Reduction:** -150 KB

- [ ] Remove recharts imports (lines ~5-15)
- [ ] Add `import dynamic from 'next/dynamic'`
- [ ] Add dynamic HomeCharts import
- [ ] Replace two chart divs with `<HomeCharts .../>`
- [ ] Remove COLORS constant

**Reference:** `EXACT_CODE_CHANGES.md` - File 1

---

### Change 2: Lazy Load Excel (History Page)
**File:** `src/app/history/page.tsx`
**Time:** 3 minutes
**Bundle Reduction:** -50 KB

- [ ] Remove `import { exportGamesToExcel }`
- [ ] Update handleExportToExcel function
- [ ] Add `await import()` for lazy loading

**Reference:** `EXACT_CODE_CHANGES.md` - File 2

---

### Change 3: Lazy Load Excel (Personal Events)
**File:** `src/app/personal-tracking/page.tsx`
**Time:** 3 minutes
**Bundle Reduction:** -50 KB

- [ ] Remove `import { exportPersonalEventsToExcel }`
- [ ] Update handleExportToExcel function
- [ ] Add `await import()` for lazy loading

**Reference:** `EXACT_CODE_CHANGES.md` - File 3

---

### Change 4: Lazy Load DatePicker
**File:** `src/components/GameForm.tsx`
**Time:** 2 minutes
**Bundle Reduction:** -60 KB

- [ ] Change DatePicker import to dynamic import
- [ ] Add loading placeholder

**Reference:** `EXACT_CODE_CHANGES.md` - File 4

---

### Change 5: Optimize Lodash (GameForm)
**File:** `src/components/GameForm.tsx`
**Time:** 3 minutes
**Bundle Reduction:** -25 KB

- [ ] Replace `import _ from "lodash"`
- [ ] Add `import omit from 'lodash/omit'`
- [ ] Replace all `_.omit` with `omit`

**Reference:** `EXACT_CODE_CHANGES.md` - File 5

---

### Change 6: Optimize Lodash (MemberForm)
**File:** `src/components/MemberForm.tsx`
**Time:** 3 minutes
**Bundle Reduction:** -25 KB

- [ ] Replace `import _ from "lodash"`
- [ ] Add `import omit from 'lodash/omit'`
- [ ] Replace all `_.omit` with `omit`

**Reference:** `EXACT_CODE_CHANGES.md` - File 5

---

### Change 7: Optimize Lodash (PersonalEventForm)
**File:** `src/components/PersonalEventForm.tsx`
**Time:** 3 minutes
**Bundle Reduction:** -25 KB

- [ ] Replace `import _ from "lodash"`
- [ ] Add specific lodash imports
- [ ] Replace all `_.function` calls

**Reference:** `EXACT_CODE_CHANGES.md` - File 5

---

### Change 8: Test & Build
**Time:** 3 minutes

```bash
# Check for errors
npm run lint

# Build project
npm run build

# Check bundle sizes in output
# Look for reduced sizes on routes
```

- [ ] Run lint (no errors)
- [ ] Run build (successful)
- [ ] Check bundle size reduction
- [ ] Test locally with `npm run start`

---

## 📊 PHASE 3: Deploy & Measure (5 minutes)

### Deploy to Vercel
```bash
git add .
git commit -m "perf: optimize bundle size with code splitting"
git push
```

- [ ] Code committed
- [ ] Code pushed to repository
- [ ] Vercel deployment started
- [ ] Deployment successful
- [ ] Wait 2-3 minutes for cache clear

---

### Re-test PageSpeed Insights
**URL:** https://pagespeed.web.dev/

- [ ] Test desktop version
- [ ] Test mobile version
- [ ] Document new scores below

---

## 📈 Results Tracking

### Before Optimization (Baseline)
- Performance Score: _____ / 100
- First Contentful Paint: _____ s
- Largest Contentful Paint: _____ s
- Total Blocking Time: _____ ms
- Cumulative Layout Shift: _____
- Bundle Size: _____ KB

### After Optimization (New)
- Performance Score: _____ / 100 ⬆️ +___
- First Contentful Paint: _____ s ⬇️ -___
- Largest Contentful Paint: _____ s ⬇️ -___
- Total Blocking Time: _____ ms ⬇️ -___
- Cumulative Layout Shift: _____ ⬇️ -___
- Bundle Size: _____ KB ⬇️ -___

### Improvement
- **Score Gain:** +_____ points
- **Load Time Reduction:** -_____ seconds
- **Bundle Reduction:** -_____ KB (____%)

---

## 🎯 Success Criteria

- [ ] Performance score improved by **15+ points**
- [ ] Bundle size reduced by **200+ KB**
- [ ] Load time reduced by **1+ seconds**
- [ ] No new errors introduced
- [ ] All features still work correctly

---

## 🚨 Troubleshooting

### Issue: Build errors
**Check:**
- [ ] All imports are correct
- [ ] No syntax errors
- [ ] Run `npm run lint`

### Issue: Charts not showing
**Check:**
- [ ] HomeCharts component exports default
- [ ] Props passed correctly (monthlyData, categoryData)
- [ ] Dynamic import syntax correct

### Issue: Type errors
**Check:**
- [ ] @types/lodash installed
- [ ] TypeScript properly configured
- [ ] Correct import paths

### Issue: Bundle still large
**Check:**
- [ ] All changes applied
- [ ] Build ran successfully
- [ ] No duplicate imports
- [ ] Run bundle analyzer: `ANALYZE=true npm run build`

---

## ⏱️ Time Tracking

Start Time: ___:___
- [ ] Phase 2 Changes: 25 min ⏰
- [ ] Testing: 3 min ⏰
- [ ] Deploy: 5 min ⏰
End Time: ___:___

**Total Time:** ~33 minutes

---

## 🎉 Celebration Checklist

- [ ] PageSpeed score 80+
- [ ] All tests passing
- [ ] Features working
- [ ] Deployment successful
- [ ] Performance improved
- [ ] 🍾 Pat yourself on the back!

---

## 📁 Files Modified Summary

**Already Modified (3):**
- ✅ next.config.js
- ✅ src/app/layout.tsx
- ✅ src/components/HomeCharts.tsx (new)

**You Need to Modify (7):**
1. src/app/page.tsx
2. src/app/history/page.tsx
3. src/app/personal-tracking/page.tsx
4. src/components/GameForm.tsx
5. src/components/MemberForm.tsx
6. src/components/PersonalEventForm.tsx
7. (Optional) src/app/loading.tsx (new)

**Total Files:** 10 files

---

## 🔗 Quick Links

- **Full Guide:** `PAGESPEED_OPTIMIZATION_GUIDE.md`
- **Quick Wins:** `PAGESPEED_QUICK_WINS.md`
- **Code Changes:** `EXACT_CODE_CHANGES.md` ⭐ USE THIS
- **Summary:** `PAGESPEED_SUMMARY.md`

---

**Ready? Let's go! 🚀**

**Start here:** Open `EXACT_CODE_CHANGES.md` and begin with File 1
