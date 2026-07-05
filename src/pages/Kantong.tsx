import React from 'react';
import WalletGroupsView from '../components/transactions/WalletGroupsView';

const Kantong: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">Kantong Saya</h1>
        <p className="text-xs sm:text-sm text-muted-foreground">Kelola semua kantong dan tujuan keuanganmu</p>
      </div>
      
      <WalletGroupsView />
    </div>
  );
};

export default Kantong;
