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
  const primaryLabel = user ? "Kembali ke Dashboard" : "Masuk ke Mooney Tracker";

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 px-4 py-10 text-foreground dark:from-background dark:via-background dark:to-background">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-3xl items-center justify-center">
        <Card className="relative w-full overflow-hidden border-finance-primary/20 bg-card/90 shadow-xl backdrop-blur-sm dark:border-finance-primary/30">
          <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-finance-primary/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-teal-400/10 blur-3xl" />

          <CardHeader className="relative items-center space-y-5 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-finance-accent text-finance-primary shadow-sm dark:bg-finance-primary/15">
              <SearchX className="h-8 w-8" aria-hidden="true" />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-finance-primary">
                Error 404
              </p>
              <CardTitle className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                Halaman tidak ditemukan
              </CardTitle>
              <CardDescription className="mx-auto max-w-xl text-base leading-relaxed text-muted-foreground">
                Link yang Anda buka tidak tersedia, sudah dipindahkan, atau alamatnya salah.
                Silakan kembali ke halaman utama Mooney Tracker.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="relative space-y-6 text-center">
            <div className="mx-auto flex max-w-lg items-center gap-3 rounded-xl border border-dashed border-finance-primary/30 bg-finance-accent/50 p-4 text-left dark:bg-finance-primary/10">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-finance-primary shadow-sm dark:bg-background">
                <Wallet className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Tidak ada data keuangan yang berubah.
                </p>
                <p className="text-sm text-muted-foreground">
                  Ini hanya halaman fallback untuk URL yang tidak dikenal.
                </p>
              </div>
            </div>

            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild className="bg-finance-primary text-white hover:bg-finance-secondary">
                <Link to={primaryRoute}>
                  <Home className="h-4 w-4" aria-hidden="true" />
                  {primaryLabel}
                </Link>
              </Button>

              <Button variant="outline" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Kembali ke halaman sebelumnya
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              URL yang dicoba: <span className="font-mono">{location.pathname}</span>
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default NotFound;
