
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FinanceProvider } from "./contexts/FinanceContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./hooks/useTheme";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Transactions from "./pages/Transactions";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import WalletDetails from "./pages/WalletDetails";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <FinanceProvider>
                    <Layout>
                      <Home />
                    </Layout>
                  </FinanceProvider>
                </ProtectedRoute>
              } />
              <Route path="/transactions" element={
                <ProtectedRoute>
                  <FinanceProvider>
                    <Layout>
                      <Transactions />
                    </Layout>
                  </FinanceProvider>
                </ProtectedRoute>
              } />
              <Route path="/wallets/:id" element={
                <ProtectedRoute>
                  <FinanceProvider>
                    <Layout>
                      <WalletDetails />
                    </Layout>
                  </FinanceProvider>
                </ProtectedRoute>
              } />
              <Route path="/analytics" element={
                <ProtectedRoute>
                  <FinanceProvider>
                    <Layout>
                      <Analytics />
                    </Layout>
                  </FinanceProvider>
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <FinanceProvider>
                    <Layout>
                      <Settings />
                    </Layout>
                  </FinanceProvider>
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
