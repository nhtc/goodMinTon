# GameForm Refactoring Guide

## Overview
The GameForm component has been refactored to use smaller, reusable Radix UI components. This improves maintainability, reduces code duplication, and provides better accessibility.

## New Components Created

### 1. FormField (`/src/components/ui/form-field.tsx`)
A reusable form field wrapper with label, icon, required indicator, and error display.

**Props:**
- `label`: string - Field label text
- `icon`: string (optional) - Emoji icon
- `required`: boolean (optional) - Shows asterisk
- `error`: string (optional) - Error message
- `htmlFor`: string (optional) - Links to input ID
- `children`: ReactNode - The input element
- `className`: string (optional) - Additional CSS classes

**Example Usage:**
```tsx
<FormField
  label="Địa điểm"
  icon="📍"
  required
  error={errors.location}
  htmlFor="location"
>
  <Input
    id="location"
    value={location}
    onChange={(e) => setLocation(e.target.value)}
    placeholder="Nhập địa điểm..."
  />
</FormField>
```

### 2. Input (`/src/components/ui/input.tsx`)
Already existed - Radix-styled input component with consistent styling.

**Example Usage:**
```tsx
<Input
  type="number"
  value={yardCost}
  onChange={(e) => setYardCost(Number(e.target.value))}
  placeholder="Nhập chi phí thuê sân..."
/>
```

### 3. PresetButtons (`/src/components/ui/preset-buttons.tsx`)
Reusable preset button grid for quick selections.

**Props:**
- `options`: PresetOption[] - Array of preset options
  - `label`: string
  - `value`: number | string
  - `icon`: string
- `selectedValue`: number | string - Currently selected value
- `onSelect`: (value) => void - Selection callback
- `formatValue`: (value) => string (optional) - Value formatter

**Example Usage:**
```tsx
const presetCosts = [
  { label: "🏟️ 2H Hưng Phú", value: 160000, icon: "🏢" },
  { label: "👑 2H Sân Khác", value: 240000, icon: "✨" },
]

<PresetButtons
  options={presetCosts}
  selectedValue={yardCost}
  onSelect={(value) => setYardCost(value as number)}
  formatValue={(value) => `${(value as number).toLocaleString('vi-VN')}đ`}
/>
```

### 4. MemberSelector (`/src/components/ui/member-selector.tsx`)
Complete member selection UI with search, checkboxes, and quick actions.

**Props:**
- `members`: Member[] - Array of members
- `selectedMembers`: string[] - Selected member IDs
- `onToggleMember`: (memberId) => void - Toggle callback
- `onSelectAll`: () => void - Select all callback
- `onClearAll`: () => void - Clear all callback
- `searchTerm`: string - Current search term
- `onSearchChange`: (term) => void - Search change callback
- `renderMemberCard`: (member, isSelected) => ReactNode (optional) - Custom card renderer

**Example Usage:**
```tsx
<MemberSelector
  members={members}
  selectedMembers={selectedMembers}
  onToggleMember={handleMemberToggle}
  onSelectAll={selectAllMembers}
  onClearAll={clearAllMembers}
  searchTerm={searchTerm}
  onSearchChange={setSearchTerm}
/>
```

### 5. CostSummary (`/src/components/ui/cost-summary.tsx`)
Displays cost breakdown, totals, and payment summary.

**Props:**
- `yardCost`: number - Court rental cost
- `shuttleCockQuantity`: number (optional) - Number of shuttlecocks
- `shuttleCockPrice`: number (optional) - Price per shuttlecock
- `otherFees`: number (optional) - Other fees
- `totalCost`: number - Total cost
- `costPerMember`: number (optional) - Cost per member
- `memberCount`: number (optional) - Number of members
- `totalCustomAmounts`: number (optional) - Total custom amounts
- `totalExpected`: number (optional) - Total expected collection
- `totalPrePaid`: number (optional) - Total prepaid amount
- `totalRemaining`: number (optional) - Remaining amount

**Example Usage:**
```tsx
<CostSummary
  yardCost={yardCost}
  shuttleCockQuantity={shuttleCockQuantity}
  shuttleCockPrice={shuttleCockPrice}
  otherFees={otherFees}
  totalCost={totalCost}
  costPerMember={costPerMember}
  memberCount={selectedMembers.length}
  totalPrePaid={getTotalPrePaid()}
  totalRemaining={getTotalRemaining()}
/>
```

## How to Refactor GameForm

### Step 1: Update Imports
```tsx
import { FormField } from '../ui/form-field'
import { Input } from '../ui/input'
import { PresetButtons } from '../ui/preset-buttons'
import { MemberSelector } from '../ui/member-selector'
import { CostSummary } from '../ui/cost-summary'
```

### Step 2: Replace Location Field
**Before:**
```tsx
<div className={styles.fieldGroup}>
  <label htmlFor='location' className={`${styles.fieldLabel} ${styles.friendly}`}>
    <span className={styles.labelIcon}>📍</span>
    <span className={styles.labelText}>Địa điểm</span>
    <span className={styles.requiredStar}>*</span>
  </label>
  <input
    type='text'
    id='location'
    value={location}
    onChange={e => setLocation(e.target.value)}
    className={`${styles.formInput} ${errors.location ? "error" : ""}`}
    placeholder='Nhập địa điểm...'
  />
  {errors.location && (
    <div className={`${styles.fieldError} ${styles.friendly}`}>
      <span>😅 {errors.location}</span>
    </div>
  )}
</div>
```

**After:**
```tsx
<FormField
  label="Địa điểm"
  icon="📍"
  required
  error={errors.location}
  htmlFor="location"
>
  <PresetButtons
    options={presetLocations}
    selectedValue={location}
    onSelect={(value) => {
      setLocation(value as string)
      if (errors.location) setErrors(prev => omit(prev, "location"))
    }}
  />
  <Input
    id="location"
    type="text"
    value={location}
    onChange={e => {
      setLocation(e.target.value)
      if (errors.location) setErrors(prev => omit(prev, "location"))
    }}
    placeholder='Hoặc nhập địa điểm khác...'
  />
</FormField>
```

### Step 3: Replace Cost Fields
Replace yard cost, shuttlecock, and other fee inputs with FormField + PresetButtons + Input combinations.

### Step 4: Replace Cost Summary Display
**Before:** (80+ lines of cost breakdown HTML)

**After:**
```tsx
{totalCost > 0 && (
  <CostSummary
    yardCost={yardCost}
    shuttleCockQuantity={shuttleCockQuantity}
    shuttleCockPrice={shuttleCockPrice}
    otherFees={otherFees}
    totalCost={totalCost}
    costPerMember={costPerMember}
    memberCount={selectedMembers.length}
    totalCustomAmounts={getTotalCustomAmounts()}
    totalExpected={getTotalExpectedAmount()}
    totalPrePaid={getTotalPrePaid()}
    totalRemaining={getTotalRemaining()}
  />
)}
```

### Step 5: Simplify Member Selection
Replace the entire member selection section (search + grid + checkboxes) with:

```tsx
{members.length > 0 ? (
  <MemberSelector
    members={members}
    selectedMembers={selectedMembers}
    onToggleMember={handleMemberToggle}
    onSelectAll={selectAllMembers}
    onClearAll={clearAllMembers}
    searchTerm={searchTerm}
    onSearchChange={setSearchTerm}
    renderMemberCard={(member, isSelected) => (
      // Custom rendering for payment status, prepaid amounts, etc.
      <YourCustomMemberCard member={member} isSelected={isSelected} />
    )}
  />
) : (
  <div>No members available</div>
)}
```

## Benefits

1. **Reduced Code**: GameForm goes from 1700+ lines to ~800-1000 lines
2. **Reusability**: Components can be used in PersonalEventForm and other forms
3. **Maintainability**: Each component has single responsibility
4. **Accessibility**: Radix UI components include ARIA attributes
5. **Consistency**: Uniform styling across the app
6. **Testing**: Easier to test smaller components
7. **Type Safety**: Full TypeScript support

## Next Steps

1. Apply these changes to GameForm.tsx progressively
2. Use the same components in PersonalEventForm.tsx
3. Consider creating additional components:
   - `NumberInput` - Input specifically for numbers with +/- buttons
   - `DateField` - FormField wrapper for DatePicker
   - `SelectField` - FormField wrapper for Select
   - `CheckboxField` - FormField wrapper for Checkbox

## File Structure
```
src/components/ui/
├── form-field.tsx
├── form-field.module.css
├── input.tsx (already existed)
├── preset-buttons.tsx
├── preset-buttons.module.css
├── member-selector.tsx
├── member-selector.module.css
├── cost-summary.tsx
└── cost-summary.module.css
```

## Testing Checklist
- [ ] Form field labels link to inputs correctly
- [ ] Error messages display properly
- [ ] Preset buttons select values correctly
- [ ] Member checkboxes work
- [ ] Search filters members
- [ ] Select all/Clear all buttons work
- [ ] Cost summary displays all values
- [ ] Responsive design works on mobile
- [ ] Accessibility: keyboard navigation works
- [ ] Accessibility: screen readers announce correctly
