# History Page - Member Display Limit with Smart Sorting

## Summary
Updated the history page to show only 4 members initially in each game card with unpaid members sorted to the top, with a "Show More" button to expand and view all members. This ensures all game cards have consistent height and prioritizes unpaid members for better visibility.

## Changes Made

### 1. Component State Management
**File:** `src/app/history/page.tsx`

Added state to track which games have expanded member lists:
```typescript
const [expandedUnpaidGames, setExpandedUnpaidGames] = useState<Set<string>>(new Set())
```

Added toggle function:
```typescript
const toggleUnpaidMembers = (gameId: string) => {
  setExpandedUnpaidGames(prev => {
    const newSet = new Set(prev)
    if (newSet.has(gameId)) {
      newSet.delete(gameId)
    } else {
      newSet.add(gameId)
    }
    return newSet
  })
}
```

### 2. Participants Display Logic
Updated the participants list to:
- **Sort members**: Unpaid members first, then paid members
- Show only **4 members total** initially
- Provide a "Show More" button when there are more than 4 members
- Allow expanding to see all members

**Logic:**
```typescript
{(() => {
  // Sort participants: unpaid first, then paid
  const sortedParticipants = [...game.participants].sort((a, b) => {
    if (a.hasPaid === b.hasPaid) return 0
    return a.hasPaid ? 1 : -1 // unpaid (false) comes before paid (true)
  })
  
  const isExpanded = expandedUnpaidGames.has(game.id)
  const maxMembersToShow = 4
  const hasMoreMembers = sortedParticipants.length > maxMembersToShow
  
  // Show limited members or all if expanded
  const participantsToDisplay = isExpanded 
    ? sortedParticipants 
    : sortedParticipants.slice(0, maxMembersToShow)
  
  const hiddenCount = sortedParticipants.length - maxMembersToShow
  
  return (
    <>
      {participantsToDisplay.map(participant => {
        // ... participant rendering
      })}
      
      {hasMoreMembers && (
        <button onClick={() => toggleUnpaidMembers(game.id)}>
          {isExpanded ? 'Thu gọn' : `Hiển thị thêm ${hiddenCount} thành viên`}
        </button>
      )}
    </>
  )
})()}
```

### 3. Button Styling
**File:** `src/app/history/page.module.css`

Added styles for the "Show More" button:
```css
.showMoreUnpaidBtn {
  width: 100%;
  margin-top: 0.5rem;
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 1px solid #fbbf24;
  border-radius: 8px;
  color: #92400e;
  /* ... more styles */
}

.showMoreUnpaidBtn:hover {
  background: linear-gradient(135deg, #fde68a 0%, #fcd34d 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(251, 191, 36, 0.2);
}
```

## Benefits

### 1. Consistent Card Height
- All game cards now have similar heights (unless expanded)
- Improves visual consistency and grid alignment
- Better layout on larger screens

### 2. Improved Performance
- Reduces initial DOM elements when games have many participants
- Faster initial render
- Better scrolling performance

### 3. Better User Experience
- **Unpaid members are prioritized** - always shown first for quick visibility
- Easy to see who hasn't paid yet without scrolling
- Easier to scan the page when cards are uniform
- Clear indication of how many more members exist
- Simple expand/collapse interaction

### 4. Mobile-Friendly
- Reduces vertical scrolling on mobile devices
- Cards fit better on smaller screens
- Less overwhelming with many participants
- Important payment info (unpaid) visible immediately

## User Flow

1. **Initial View:**
   - User sees up to 4 members, **unpaid members shown first**
   - If more than 4 members exist, a yellow "Show More" button appears
   - Example: 6 unpaid + 4 paid = shows 4 unpaid initially

2. **Expand View:**
   - Click "Show More" button
   - All members are revealed (still sorted: unpaid first, paid last)
   - Button changes to "Thu gọn" (Collapse)

3. **Collapse View:**
   - Click "Thu gọn" button
   - Returns to showing only 4 members (unpaid priority)
   - Maintains state per game card independently

## Example Scenarios

### Scenario 1: Game with 3 members (2 unpaid, 1 paid)
- Shows: 2 unpaid + 1 paid
- Button: Hidden (less than 4 total members)

### Scenario 2: Game with 4 members (3 unpaid, 1 paid)
- Shows: 3 unpaid + 1 paid
- Button: Hidden (exactly 4 members)

### Scenario 3: Game with 10 members (6 unpaid, 4 paid)
- Initial: 4 unpaid (first 4 of 6 unpaid)
- Button: "Hiển thị thêm 6 thành viên"
- After click: All 6 unpaid + all 4 paid
- Button: "Thu gọn"

### Scenario 4: Game with 8 members (2 unpaid, 6 paid)
- Initial: 2 unpaid + 2 paid (first 4 members sorted)
- Button: "Hiển thị thêm 4 thành viên"
- After click: 2 unpaid + 6 paid
- Button: "Thu gọn"

### Scenario 5: All members paid (10 paid, 0 unpaid)
- Initial: First 4 paid members
- Button: "Hiển thị thêm 6 thành viên"

## Technical Notes

### State Management
- Uses `Set<string>` to track expanded games for O(1) lookup
- Independent state per game card
- Persists during page session (resets on page reload)

### Sorting Algorithm
```typescript
const sortedParticipants = [...game.participants].sort((a, b) => {
  if (a.hasPaid === b.hasPaid) return 0
  return a.hasPaid ? 1 : -1 // unpaid first, paid last
})
```

### Display Priority
1. **Unpaid members** (sorted first)
2. **Paid members** (sorted after unpaid)
3. Show first 4 members from sorted list
4. Hide remaining members behind "Show More" button

### Button Visibility
- Only shows when `sortedParticipants.length > 4`
- Updates text dynamically based on state
- Shows count of total hidden members (not just unpaid)

## Testing Checklist

- [x] Build successfully completes
- [x] TypeScript compilation passes
- [ ] Cards have consistent height when collapsed
- [ ] Unpaid members appear first in the list
- [ ] "Show More" button appears for games with >4 members
- [ ] Button correctly expands to show all members
- [ ] Button correctly collapses back to 4 members
- [ ] Button text updates correctly (expand/collapse)
- [ ] Multiple games can be expanded independently
- [ ] Sorting works correctly (unpaid → paid)
- [ ] Works with various member combinations
- [ ] Responsive on mobile devices
- [ ] Button styling and hover effects work

## Future Enhancements

1. **Persist Expanded State:**
   - Save to localStorage
   - Restore on page reload

2. **Keyboard Navigation:**
   - Add keyboard shortcuts (Space/Enter)
   - Focus management

3. **Animation:**
   - Smooth height transition when expanding/collapsing
   - Fade in/out effect for additional members

4. **Customizable Limit:**
   - Allow users to set their preferred limit
   - Admin setting for default limit
