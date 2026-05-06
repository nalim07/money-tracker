# Issue: Mobile UI Responsiveness and CSV Import Logic Fixes

## Description
The `/transactions` page had horizontal scrolling issues on mobile, and the CSV import logic was creating duplicates and failing to resolve category IDs correctly (showing "Kategori tidak diketahui").

## Goals
- Fix horizontal scrolling on mobile.
- Implement deduplication logic for CSV import.
- Fix category mapping to store IDs instead of names.
- Update UI to show skipped (duplicate) transactions during import.

## Changes
- Updated `Layout.tsx` with `min-w-0` to prevent overflow.
- Restructured `TransactionsHeader.tsx` buttons for mobile grid.
- Adjusted `TransactionsFilters.tsx` to 2 columns on mobile.
- Added `truncate` and `flex-wrap` to `TransactionListItem.tsx`.
- Modified `ImportCSVDialog.tsx` to include `transactions` for deduplication.
- Added `skippedCount` to import process.
- Updated `csvImport.ts` to trim category names.
- Modified `useCategoryOperations.ts` to return the created category object.

## Verification
- Checked mobile view for horizontal scroll.
- Verified CSV import skips existing transactions.
- Verified categories are correctly resolved after import.
