# Changelog - 2026-05-06

## [Fixed] Mobile UI and CSV Import Logic

### Summary
Fixed horizontal scrolling on mobile and improved CSV import reliability with deduplication and correct category mapping.

### Changes
- Fixed horizontal scroll overflow in `Layout.tsx` by adding `min-w-0`.
- Optimized Transactions header layout and filter grid for better mobile responsiveness.
- Added deduplication check (type, amount, description, wallet, date, and category) during CSV import process.
- Fixed category mapping logic to store category IDs instead of names, preventing "Unknown Category" errors.
- Added automatic whitespace trimming for category names in CSV parser.
- Enhanced Import UI to display the count of skipped duplicate transactions.
- Updated `addCategory` hook to return the newly created category object for immediate use.

### Files Modified
- `src/components/Layout.tsx`
- `src/components/transactions/TransactionsHeader.tsx`
- `src/components/transactions/TransactionsFilters.tsx`
- `src/components/transactions/TransactionListItem.tsx`
- `src/components/ImportCSVDialog.tsx`
- `src/utils/csvImport.ts`
- `src/hooks/useCategoryOperations.ts`

### Related Issues
- Closes #1

### Breaking Changes
- None
