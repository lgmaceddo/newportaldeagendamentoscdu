import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Lock, User, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import unimedLogo from '@/assets/unimed-bauru-logo-edited.png';

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signUp, user, loading: authLoading, updatePassword, resetPassword } = useAuth();
  const { toast } = useToast();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeView, setActiveView] = useState<'login' | 'signup' | 'reset' | 'update'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Check for password reset parameters in URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const type = params.get('type');
    
    if (type === 'recovery') {
      setActiveView('update');
    }
  }, [location]);

  useEffect(() => {
    if (user && !authLoading && activeView !== 'update') {
      navigate('/');
    }
  }, [user, authLoading, navigate, activeView]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) {
      toast({
        title: 'Erro ao entrar',
        description: error,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Bem-vindo!',
        description: 'Login realizado com sucesso.',
      });
      navigate('/');
    }
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      toast({
        title: 'Erro',
        description: 'Por favor, informe seu nome completo.',
        variant: 'destructive',
      });
      return;
    }
    if (password !== confirmPassword) {
      toast({
        title: 'Erro',
        description: 'As senhas não coincidem.',
        variant: 'destructive',
      });
      return;
    }
    setLoading(true);
    const { error } = await signUp(email, password, displayName.trim());
    if (error) {
      toast({
        title: 'Erro ao cadastrar',
        description: error,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Cadastro realizado!',
        description: 'Verifique seu email para confirmar o cadastro.',
      });
      setActiveView('login');
      setPassword('');
      setConfirmPassword('');
      setDisplayName('');
    }
    setLoading(false);
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await resetPassword(email);
    if (error) {
      toast({
        title: 'Erro ao solicitar recuperação',
        description: error,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Email de recuperação enviado!',
        description: 'Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.',
      });
      setActiveView('login');
    }
    setLoading(false);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      toast({
        title: 'Erro',
        description: 'As senhas não coincidem.',
        variant: 'destructive',
      });
      return;
    }
    if (newPassword.length < 6) {
      toast({
        title: 'Erro',
        description: 'A senha deve ter pelo menos 6 caracteres.',
        variant: 'destructive',
      });
      return;
    }
    setLoading(true);
    const { error } = await updatePassword(newPassword);
    if (error) {
      toast({
        title: 'Erro ao redefinir senha',
        description: error,
        variant: 'destructive',
      });
      setLoading(false);
    } else {
      toast({
        title: 'Senha redefinida com sucesso!',
        description: 'Você já pode fazer login com sua nova senha.',
      });
      setActiveView('login');
      setNewPassword('');
      setConfirmNewPassword('');
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #10605B 0%, #0F766E 100%)' }}>
        <Loader2 className="h-12 w-12 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #10605B 0%, #0F766E 100%)' }}>
      {/* Decorative circles */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl" />
      
      <div className="w-full max-w-md relative z-10">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-block bg-white/10 backdrop-blur-sm p-4 rounded-2xl mb-4">
            <img
              src={unimedLogo}
              alt="Unimed Bauru CDU"
              className="h-16 w-auto object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Portal CDU</h1>
          <p className="text-white/80 text-sm">Centro de Diagnóstico Unimed</p>
        </div>

        {/* Auth Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
          {/* Login View */}
          {activeView === 'login' && (
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Entrar</h2>
                <p className="text-sm text-gray-600 mt-1">Acesse sua conta</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-email" className="text-gray-700 font-medium">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="pl-10 h-12 border-gray-300 focus:border-primary focus:ring-primary"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password" className="text-gray-700 font-medium">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="pl-10 pr-10 h-12 border-gray-300 focus:border-primary focus:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-base font-semibold" 
                style={{ backgroundColor: '#10605B' }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  'Entrar'
                )}
              </Button>

              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={() => setActiveView('reset')}
                  className="text-primary hover:underline font-medium"
                >
                  Esqueci minha senha
                </button>
                <button
                  type="button"
                  onClick={() => setActiveView('signup')}
                  className="text-primary hover:underline font-medium"
                >
                  Criar conta
                </button>
              </div>
            </form>
          )}

          {/* Signup View */}
          {activeView === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-5">
              <div className="flex items-center mb-6">
                <button
                  type="button"
                  onClick={() => setActiveView('login')}
                  className="mr-3 text-gray-600 hover:text-gray-800"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Criar Conta</h2>
                  <p className="text-sm text-gray-600">Preencha seus dados</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-name" className="text-gray-700 font-medium">Nome Completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Seu nome completo"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                    disabled={loading}
                    className="pl-10 h-12 border-gray-300 focus:border-primary focus:ring-primary"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email" className="text-gray-700 font-medium">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="pl-10 h-12 border-gray-300 focus:border-primary focus:ring-primary"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password" className="text-gray-700 font-medium">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    minLength={6}
                    className="pl-10 pr-10 h-12 border-gray-300 focus:border-primary focus:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-confirm" className="text-gray-700 font-medium">Confirmar Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="signup-confirm"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Repita a senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="pl-10 pr-10 h-12 border-gray-300 focus:border-primary focus:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-base font-semibold" 
                style={{ backgroundColor: '#10605B' }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Cadastrando...
                  </>
                ) : (
                  'Criar Conta'
                )}
              </Button>
            </form>
          )}

          {/* Reset Password View */}
          {activeView === 'reset' && (
            <form onSubmit={handlePasswordReset} className="space-y-5">
              <div className="flex items-center mb-6">
                <button
                  type="button"
                  onClick={() => setActiveView('login')}
                  className="mr-3 text-gray-600 hover:text-gray-800"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Recuperar Senha</h2>
                  <p className="text-sm text-gray-600">Enviaremos um link para seu email</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reset-email" className="text-gray-700 font-medium">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="pl-10 h-12 border-gray-300 focus:border-primary focus:ring-primary"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-base font-semibold" 
                style={{ backgroundColor: '#10605B' }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Enviar Link de Recuperação'
                )}
              </Button>
            </form>
          )}

          {/* Update Password View */}
          {activeView === 'update' && (
            <form onSubmit={handleUpdatePassword} className="space-y-5">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Redefinir Senha</h2>
                <p className="text-sm text-gray-600 mt-1">Crie uma nova senha segura</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password" className="text-gray-700 font-medium">Nova Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 6 caracteres"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    disabled={loading}
                    minLength={6}
                    className="pl-10 pr-10 h-12 border-gray-300 focus:border-primary focus:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-new-password" className="text-gray-700 font-medium">Confirmar Nova Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="confirm-new-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Repita a senha"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="pl-10 pr-10 h-12 border-gray-300 focus:border-primary focus:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-base font-semibold" 
                style={{ backgroundColor: '#10605B' }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Redefinindo...
                  </>
                ) : (
                  'Redefinir Senha'
                )}
              </Button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-white/80 text-sm">
          <p>© 2026 Unimed Bauru - Centro de Diagnóstico</p>
        </div>
      </div>
    </div>
  );
};

export default Auth;