import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { 
  Home, Wallet, Plus, List, Settings, BarChart3, 
  ChevronLeft, ChevronRight, LogOut, Menu
} from 'lucide-react';
import { Dialog, DialogContent } from './ui/dialog';
import AddTransactionForm from './AddTransactionForm';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const pathname = location.pathname;
  const search = location.search;

  // Active status helpers
  const isHomeActive = pathname === '/';
  const isKantongActive = 
    pathname === '/kantong' ||
    pathname.startsWith('/wallets/');
  const isTransaksiActive = pathname === '/transactions';
  const isAnalisisActive = pathname === '/analytics';
  const isSettingsActive = pathname === '/settings';

  const navItems = [
    { path: '/', label: 'Beranda', icon: Home, active: isHomeActive },
    { path: '/kantong', label: 'Kantong', icon: Wallet, active: isKantongActive },
    { path: '/transactions', label: 'Transaksi', icon: List, active: isTransaksiActive },
    { path: '/analytics', label: 'Analisis', icon: BarChart3, active: isAnalisisActive },
    { path: '/settings', label: 'Pengaturan', icon: Settings, active: isSettingsActive },
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F8F9FB] dark:bg-[#09090B] text-foreground font-sans antialiased">
      
      {/* DESKTOP SIDEBAR NAVIGATION */}
      <aside className={`hidden lg:flex lg:flex-col lg:bg-white lg:dark:bg-[#121214] lg:border-r lg:border-gray-100 dark:lg:border-zinc-900 shrink-0 h-screen sticky top-0 transition-all duration-300 ${
        isCollapsed ? 'lg:w-20 lg:p-4' : 'lg:w-64 lg:p-6'
      }`}>
        {/* Brand Logo & Collapse Toggle */}
        <div className="flex items-center gap-2.5 mb-6 px-2 min-w-0">
          <img src="/logo.png" alt="Money Tracker Logo" className="w-8 h-8 rounded-xl object-contain flex-shrink-0" />
          {!isCollapsed && (
            <span className="font-black text-sm sm:text-base tracking-tight text-foreground truncate">
              Money Tracker
            </span>
          )}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)} 
            className="p-1.5 hover:bg-muted text-muted-foreground rounded-lg ml-auto hidden lg:inline-flex"
            title={isCollapsed ? "Buka Sidebar" : "Tutup Sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className={`flex items-center justify-center gap-2 mb-6 rounded-2xl bg-primary hover:bg-primary/95 text-white font-bold transition-all duration-200 shadow-[0_4px_12px_hsl(var(--primary)/0.15)] hover:-translate-y-0.5 active:translate-y-0 ${
            isCollapsed ? 'w-10 h-10 p-0 mx-auto rounded-full' : 'w-full py-3 px-4'
          }`}
          title="Catat Transaksi"
        >
          <Plus className="w-5 h-5 stroke-[2.5px] flex-shrink-0" />
          {!isCollapsed && <span>Catat Transaksi</span>}
        </button>

        {/* Sidebar Nav Items */}
        <nav className="flex-1 space-y-1.5">
          {navItems.map((item, idx) => (
            <Link
              key={idx}
              to={item.path}
              className={`flex items-center rounded-2xl transition-all duration-200 ${
                isCollapsed ? 'justify-center p-3' : 'space-x-3 py-3 px-4'
              } ${
                item.active
                  ? 'text-primary bg-primary/10 font-bold border border-primary/20'
                  : 'text-muted-foreground hover:text-primary hover:bg-gray-50 dark:hover:bg-zinc-800/40'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!isCollapsed && <span className="text-sm font-semibold">{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Sidebar Footer Section (Profile + theme + logout grouped together) */}
        <div className="mt-auto pt-4 border-t border-gray-100 dark:border-zinc-900 space-y-4">
          {/* Profile Section */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={`w-full flex items-center gap-3 p-1.5 rounded-2xl hover:bg-muted transition-all text-left ${
                  isCollapsed ? 'justify-center' : ''
                }`}>
                  <Avatar className="h-9 w-9 border border-gray-100 dark:border-zinc-900">
                    <AvatarFallback className="bg-primary text-white font-extrabold text-sm">
                      {user.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {!isCollapsed && (
                    <div className="truncate flex-1 min-w-0">
                      <p className="text-xs font-extrabold text-foreground truncate">
                        {user.user_metadata?.full_name || 'User'}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                        {user.email}
                      </p>
                    </div>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="start" side="right" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.user_metadata?.full_name || 'User'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Keluar</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </aside>

      {/* RIGHT SIDE MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        


        {/* PRIMARY VIEWPORT CONTAINER */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-28 lg:pb-8">
          {children}
        </main>

        {/* BANANI MOBILE BOTTOM NAVIGATION */}
        <nav className="fixed bottom-0 left-0 right-0 h-[76px] bg-white dark:bg-[#121214] border-t border-gray-100 dark:border-zinc-800/60 flex lg:hidden items-center justify-around px-2 shadow-[0_-8px_24px_rgba(0,0,0,0.03)] rounded-t-[24px] z-30 shrink-0">
          {/* Beranda */}
          <Link
            to="/"
            className="flex flex-col items-center justify-center py-2 flex-1 group transition-all"
          >
            <Home 
              className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                isHomeActive ? 'text-primary stroke-[2.5px]' : 'text-gray-400 dark:text-zinc-500'
              }`} 
            />
            <span className={`text-[10px] mt-1 font-bold tracking-tight ${
              isHomeActive ? 'text-primary' : 'text-gray-400 dark:text-zinc-500'
            }`}>
              Beranda
            </span>
          </Link>

          {/* Kantong */}
          <Link
            to="/kantong"
            className="flex flex-col items-center justify-center py-2 flex-1 group transition-all"
          >
            <Wallet 
              className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                isKantongActive ? 'text-primary stroke-[2.5px]' : 'text-gray-400 dark:text-zinc-500'
              }`} 
            />
            <span className={`text-[10px] mt-1 font-bold tracking-tight ${
              isKantongActive ? 'text-primary' : 'text-gray-400 dark:text-zinc-500'
            }`}>
              Kantong
            </span>
          </Link>

          {/* Middle Floating FAB button "+" */}
          <div className="flex-1 flex justify-center items-center relative -top-3">
            <button
              onClick={() => setIsAddOpen(true)}
              className="w-12 h-12 bg-primary hover:bg-primary/95 text-white rounded-full flex items-center justify-center shadow-[0_6px_20px_hsl(var(--primary)/0.3)] hover:shadow-[0_8px_24px_hsl(var(--primary)/0.45)] transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <Plus className="w-6 h-6 stroke-[3px]" />
            </button>
          </div>

          {/* Transaksi */}
          <Link
            to="/transactions"
            className="flex flex-col items-center justify-center py-2 flex-1 group transition-all"
          >
            <List 
              className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                isTransaksiActive ? 'text-primary stroke-[2.5px]' : 'text-gray-400 dark:text-zinc-500'
              }`} 
            />
            <span className={`text-[10px] mt-1 font-bold tracking-tight ${
              isTransaksiActive ? 'text-primary' : 'text-gray-400 dark:text-zinc-500'
            }`}>
              Transaksi
            </span>
          </Link>

          {/* Lainnya (Settings) */}
          <Link
            to="/settings"
            className="flex flex-col items-center justify-center py-2 flex-1 group transition-all"
          >
            <Settings 
              className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                isSettingsActive ? 'text-primary stroke-[2.5px]' : 'text-gray-400 dark:text-zinc-500'
              }`} 
            />
            <span className={`text-[10px] mt-1 font-bold tracking-tight ${
              isSettingsActive ? 'text-primary' : 'text-gray-400 dark:text-zinc-500'
            }`}>
              Lainnya
            </span>
          </Link>
        </nav>

      </div>

      {/* Global Add Transaction Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="w-[95vw] max-w-md mx-auto rounded-3xl">
          <AddTransactionForm onClose={() => setIsAddOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Layout;
