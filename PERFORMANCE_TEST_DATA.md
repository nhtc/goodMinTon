# Performance Testing Dataset - Quick Reference

## ✅ Successfully Generated

### 📊 Dataset Size
```
Total Records: 4,644

├── 100 Members (91 active, 9 inactive)
├── 500 Games (spanning 2+ years)
│   └── 3,446 Game Participants (~7 per game)
└── 50 Personal Events
    └── 548 Event Participants (~11 per event)
```

### ⚡ Performance Metrics
- **Generation Time:** ~30-60 seconds
- **Date Range (Games):** Oct 2023 - Jan 2026 (27 months)
- **Date Range (Events):** Oct 2024 - Apr 2026 (18 months)
- **Payment Completion Rate:** 
  - Games: 78% paid, 22% unpaid
  - Events: 59% paid, 41% unpaid

### 🎯 Testing Use Cases

This dataset is perfect for testing:

1. **Pagination** - 500 games to test page loading
2. **Filtering** - Various date ranges, payment statuses, locations
3. **Search** - 100 members to search through
4. **Sorting** - Large datasets to test sort performance
5. **Database Queries** - Test query optimization with thousands of records
6. **UI Performance** - Rendering large lists and tables
7. **Load Testing** - Stress test API endpoints
8. **Export Features** - Generate reports from large datasets

### 🔧 Customize Dataset Size

Edit `prisma/seed.ts` to change:

```typescript
const CONFIG = {
  members: 100,        // Change to 50, 200, 500, etc.
  games: 500,          // Change to 100, 1000, 2000, etc.
  personalEvents: 50,  // Change to 25, 100, 200, etc.
};
```

### 📝 Commands

```bash
# Generate new dataset
npm run db:seed

# View database (if using Prisma Studio)
npx prisma studio

# Reset and reseed
npm run db:seed
```

### 💡 Tips

- Start with current size (100/500/50) for initial testing
- Scale up to (200/1000/100) for stress testing
- Monitor browser/server performance metrics
- Test pagination with different page sizes
- Check query performance in slow network conditions

### 🎲 Random Data Features

- **Realistic Names**: 48 first names × 40 last names = 1,920 combinations
- **Vietnamese Phone Numbers**: Random +84... numbers
- **Unique Avatars**: Generated via Dicebear API
- **Realistic Costs**: Court fees (150k-300k VND), shuttlecocks, etc.
- **Payment Patterns**: Historical data has higher payment rates
- **Multiple Locations**: 16 different badminton venues
- **Varied Participation**: 4-10 players per game, 5-15 per event

---

**Last Generated:** October 17, 2025
**Script Location:** `/prisma/seed.ts`
**Full Documentation:** `DUMMY_DATA_REFERENCE.md`
