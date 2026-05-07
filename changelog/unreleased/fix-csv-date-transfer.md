# Changelog - 2026-05-07

## [Fixed] CSV Date Offset and Transfer Category Display

### Summary
Fixed a critical bug where CSV imports would shift dates back by one day, and resolved UI issues where balance transfers showed as "Unknown Category". Also fixed synchronization issues in the transaction form dropdown and a filtering bug in the analytics charts.

### Changes
- Changed date serialization to use local date strings (YYYY-MM-DD) in `transactionService.ts` and `useAddTransactionForm.ts`.
- Appended `T00:00:00` when parsing dates from Supabase in `financeUtils.ts` to ensure local timezone interpretation.
- Added UI fallbacks for the 'Transfer' category string in `Home.tsx`, `WalletDetails.tsx`, and `TransactionListItem.tsx`.
- Improved `BalanceTransferForm.tsx` to resolve the actual category ID for 'Transfer' from the database.
- Implemented automatic category reset on transaction type change in `useAddTransactionForm.ts`.
- Added a robust `key` to the category `Select` component in `TransactionCategoryField.tsx` to force synchronization.
- Fixed `EditTransactionForm.tsx` to use category IDs instead of names.
- Corrected category filtering logic in `InteractivePieChart.tsx`.

### Files Modified
- `src/services/transactionService.ts`
- `src/utils/financeUtils.ts`
- `src/hooks/useAddTransactionForm.ts`
- `src/components/EditTransactionForm.tsx`
- `src/pages/Home.tsx`
- `src/pages/WalletDetails.tsx`
- `src/components/BalanceTransferForm.tsx`
- `src/components/transactions/TransactionListItem.tsx`
- `src/components/transactions/TransactionCategoryField.tsx`
- `src/components/analytics/InteractivePieChart.tsx`

### Related Issues
- Closes # (Issue ID will be filled after creation)

### Breaking Changes
- None
