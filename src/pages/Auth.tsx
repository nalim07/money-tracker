import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, Sparkles } from 'lucide-react';

const Auth = () => {
  const { signIn, signUp, user, loading } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Signup form state
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupFullName, setSignupFullName] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !loading) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) return;

    setIsSubmitting(true);
    const { error } = await signIn(loginEmail, loginPassword);
    
    if (!error) {
      navigate('/');
    }
    setIsSubmitting(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupEmail || !signupPassword) return;

    setIsSubmitting(true);
    const { error } = await signUp(signupEmail, signupPassword, signupFullName);
    
    if (!error) {
      setSignupEmail('');
      setSignupPassword('');
      setSignupFullName('');
    }
    setIsSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FB] dark:bg-[#09090B]">
        <div className="flex flex-col items-center gap-3">
          <Sparkles className="h-8 w-8 animate-spin text-[#FFB400]" />
          <p className="text-muted-foreground text-sm font-semibold">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-50 via-[#FFFBEB] to-[#F5F3FF] dark:from-[#09090B] dark:via-zinc-950 dark:to-zinc-900 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-gradient-to-br from-[#FFB400] to-[#7357FF] p-[2.5px] rounded-2xl mx-auto shadow-md flex items-center justify-center">
            <div className="bg-white dark:bg-[#09090B] w-full h-full rounded-2xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-[#FFB400]" />
            </div>
          </div>
          <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center justify-center gap-1">
            FINADI
          </h1>
          <p className="text-xs text-muted-foreground">Kelola keuangan Anda dengan cerdas dan mudah</p>
        </div>

        <Card className="border border-gray-100 dark:border-zinc-800 shadow-xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md rounded-3xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-extrabold text-center text-foreground">
              Selamat Datang
            </CardTitle>
            <CardDescription className="text-center text-xs text-muted-foreground">
              Masuk ke akun Anda atau buat akun baru
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted/65 p-1 rounded-xl">
                <TabsTrigger value="login" className="rounded-lg text-xs font-bold">Masuk</TabsTrigger>
                <TabsTrigger value="signup" className="rounded-lg text-xs font-bold">Daftar</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-xs font-bold">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="nama@email.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                      disabled={isSubmitting}
                      className="rounded-xl border-gray-200 focus-visible:ring-[#FFB400] h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-xs font-bold">Password</Label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Password Anda"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                        disabled={isSubmitting}
                        className="rounded-xl border-gray-200 focus-visible:ring-[#FFB400] h-10 pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-muted-foreground hover:text-foreground"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isSubmitting}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </Button>
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary/95 text-white font-bold h-10 rounded-xl transition-all shadow-[0_4px_12px_hsl(var(--primary)/0.2)]"
                    disabled={isSubmitting || !loginEmail || !loginPassword}
                  >
                    {isSubmitting ? 'Memproses...' : 'Masuk'}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name" className="text-xs font-bold">Nama Lengkap (Opsional)</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Nama Lengkap Anda"
                      value={signupFullName}
                      onChange={(e) => setSignupFullName(e.target.value)}
                      disabled={isSubmitting}
                      className="rounded-xl border-gray-200 focus-visible:ring-[#FFB400] h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-xs font-bold">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="nama@email.com"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      required
                      disabled={isSubmitting}
                      className="rounded-xl border-gray-200 focus-visible:ring-[#FFB400] h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-xs font-bold">Password</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Minimal 6 karakter"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        required
                        minLength={6}
                        disabled={isSubmitting}
                        className="rounded-xl border-gray-200 focus-visible:ring-[#FFB400] h-10 pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-muted-foreground hover:text-foreground"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isSubmitting}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </Button>
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary/95 text-white font-bold h-10 rounded-xl transition-all shadow-[0_4px_12px_hsl(var(--primary)/0.2)]"
                    disabled={isSubmitting || !signupEmail || !signupPassword}
                  >
                    {isSubmitting ? 'Mendaftarkan...' : 'Daftar'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
