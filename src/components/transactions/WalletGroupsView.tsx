import React, { useState } from 'react';
import { useFinance } from '../../contexts/FinanceContext';
import { Card, CardContent } from '@/components/ui/card';
import { Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const WalletGroupsView: React.FC = () => {
  const { wallets, getWalletBalance } = useFinance();
  const navigate = useNavigate();

  // Get unique wallet groups and ensure "Lainnya" is the fallback
  const uniqueGroups = Array.from(new Set(wallets.map(w => w.group || 'Lainnya')));
  const allTabs = ['Semua Dompet', ...uniqueGroups];
  const [activeTab, setActiveTab] = useState<string>('Semua Dompet');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (wallets.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">Belum ada dompet.</div>;
  }

  return (
    <div className="mt-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto bg-transparent p-0 space-x-2 h-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {allTabs.map(tab => (
            <TabsTrigger 
              key={tab} 
              value={tab}
              className="data-[state=active]:bg-finance-primary data-[state=active]:text-white rounded-full px-5 py-2.5 bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-foreground transition-all shadow-sm"
            >
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {allTabs.map(tab => (
          <TabsContent key={tab} value={tab} className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {wallets
                .filter(w => tab === 'Semua Dompet' || (w.group || 'Lainnya') === tab)
                .map(wallet => (
                <Card 
                  key={wallet.id} 
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => navigate(`/wallets/${wallet.id}`)}
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: wallet.color + '20' }}
                      >
                        <Wallet className="w-5 h-5" style={{ color: wallet.color }} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{wallet.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(getWalletBalance(wallet.id))}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default WalletGroupsView;
