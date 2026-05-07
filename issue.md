# Issue: CSV Date Offset and Transfer Category Display

## Description
1. CSV import results in dates being shifted backwards by 1 day due to UTC conversion (using `toISOString()`).
2. Balance transfers show "Kategori tidak diketahui" on the Home and Wallet Details pages because the 'Transfer' category string doesn't match any existing category ID.
3. Category dropdown in Add Transaction form is not synchronized when the transaction type changes.
4. Analytics chart shows 0 data because it filters by category name instead of ID.

## Root Cause
1. `toISOString()` converts local time to UTC, causing a -1 day shift for UTC+7 users.
2. `BalanceTransferForm` hardcodes the category as the string 'Transfer', which is not a valid UUID ID in the database.
3. The `Select` component doesn't re-render its options properly when the available categories change without a value reset or key change.
4. `InteractivePieChart.tsx` logic incorrectly compares `transaction.category` (ID) with `category.name`.

## Proposed Solution
1. Use local date serialization (YYYY-MM-DD) and parse with local midnight (`T00:00:00`).
2. Add fallbacks in UI for 'Transfer' string and improve `BalanceTransferForm` to lookup real category IDs.
3. Use `useEffect` to reset category on type change and add a dynamic `key` to the `Select` component.
4. Fix the filtering logic in `InteractivePieChart.tsx` to use IDs.
