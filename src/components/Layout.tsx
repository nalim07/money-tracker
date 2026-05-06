import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Home, List, BarChart3, Settings } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import UserProfile from './UserProfile';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/transactions', icon: List, label: 'Transaksi' },
    { path: '/analytics', icon: BarChart3, label: 'Analisis' },
    { path: '/settings', icon: Settings, label: 'Setting' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-background dark:via-background dark:to-background">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-md border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h1 className="text-xl font-bold text-gray-800 dark:text-white">Money Tracker</h1>
            </div>
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              <UserProfile />
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Desktop Navigation */}
        <nav className="hidden lg:block lg:w-64 lg:bg-card/80 lg:backdrop-blur-md lg:border-r lg:border-border lg:p-6">
          <div className="space-y-2">
            {navItems.map(({ path, icon: Icon, label }) => {
              const isActive = location.pathname === path || (path === '/transactions' && location.pathname.startsWith('/wallets/'));
              return (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center space-x-3 py-3 px-4 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'text-finance-primary bg-finance-accent dark:bg-finance-primary/20 border border-finance-primary/20'
                      : 'text-muted-foreground hover:text-finance-primary hover:bg-finance-accent/50 dark:hover:bg-finance-primary/10'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 min-w-0 px-4 py-6 pb-20 lg:pb-6">
          {children}
        </main>
      </div>

      {/* Bottom Navigation (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border lg:hidden">
        <div className="flex items-center justify-around py-2">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path || (path === '/transactions' && location.pathname.startsWith('/wallets/'));
            return (
              <Link
                key={path}
                to={path}
                className={`flex flex-col items-center py-2 px-4 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'text-finance-primary bg-finance-accent dark:bg-finance-primary/20'
                    : 'text-muted-foreground hover:text-finance-primary'
                }`}
              >
                <Icon size={20} />
                <span className="text-xs mt-1 font-medium">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Layout;
