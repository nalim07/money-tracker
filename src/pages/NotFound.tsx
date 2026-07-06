import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Home, SearchX, Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    console.warn("404: Route tidak ditemukan", location.pathname);
  }, [location.pathname]);

  const primaryRoute = user ? "/" : "/auth";
  const primaryLabel = user ? "Kembali ke Dashboard" : "Masuk ke Finadi";

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-50 via-[#FFFBEB] to-[#F5F3FF] dark:from-[#09090B] dark:via-zinc-950 dark:to-zinc-900 px-4 py-10 text-foreground">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-3xl items-center justify-center">
        <Card className="relative w-full overflow-hidden border border-gray-100 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 shadow-xl backdrop-blur-sm rounded-3xl">
          <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#FFB400]/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-[#7357FF]/10 blur-3xl" />

          <CardHeader className="relative items-center space-y-5 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FFF4E0] dark:bg-[#FFB400]/10 text-[#FFB400] shadow-sm">
              <SearchX className="h-8 w-8" aria-hidden="true" />
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#FFB400]">
                Error 404
              </p>
              <CardTitle className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                Halaman Tidak Ditemukan
              </CardTitle>
              <CardDescription className="mx-auto max-w-xl text-xs sm:text-sm leading-relaxed text-muted-foreground">
                Link yang Anda buka tidak tersedia, sudah dipindahkan, atau alamatnya salah.
                Silakan kembali ke halaman utama Finadi.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="relative space-y-6 text-center">
            <div className="mx-auto flex max-w-lg items-center gap-3 rounded-2xl border border-dashed border-[#FFB400]/30 bg-[#FFF4E0]/50 p-4 text-left dark:bg-[#FFB400]/10">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-zinc-850 text-[#FFB400] shadow-sm">
                <Wallet className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">
                  Tidak ada data keuangan yang berubah.
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Ini hanya halaman fallback untuk URL yang tidak dikenal.
                </p>
              </div>
            </div>

            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild className="bg-[#FFB400] hover:bg-[#e09e00] text-white font-bold h-10 rounded-xl text-xs shadow-sm">
                <Link to={primaryRoute}>
                  <Home className="h-4 w-4 mr-2" aria-hidden="true" />
                  {primaryLabel}
                </Link>
              </Button>

              <Button 
                variant="outline" 
                onClick={() => navigate(-1)}
                className="h-10 rounded-xl text-xs font-bold border-gray-200"
              >
                <ArrowLeft className="h-4 w-4 mr-2" aria-hidden="true" />
                Kembali ke Halaman Sebelumnya
              </Button>
            </div>

            <p className="text-[10px] text-muted-foreground">
              URL yang dicoba: <span className="font-mono">{location.pathname}</span>
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default NotFound;
