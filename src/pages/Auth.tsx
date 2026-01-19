import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Lock, User, ArrowLeft, Eye, EyeOff, Check, ShieldCheck, Plus } from 'lucide-react';

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-12 w-12 animate-spin text-[#10605B]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4 font-sans">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">

        {/* Lado Esquerdo - Formulário */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col relative">

          {/* Logo Box */}
          <div className="mb-8">
            <div className="h-12 w-12 bg-[#10605B] rounded-lg flex items-center justify-center shadow-lg">
              <Plus className="h-6 w-6 text-white" strokeWidth={3} />
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            {/* View: LOGIN */}
            {activeView === 'login' && (
              <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Acesso ao Portal</h2>
                  <p className="text-gray-500">Utilize seu email e senha para entrar.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-1">
                    <Label htmlFor="login-email" className="text-xs font-bold text-gray-500 tracking-wider">EMAIL</Label>
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
                        className="pl-10 h-12 bg-blue-50/30 border-gray-200 focus:border-[#10605B] focus:ring-[#10605B] rounded-lg transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="login-password" className="text-xs font-bold text-gray-500 tracking-wider">SENHA</Label>
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
                        className="pl-10 pr-10 h-12 bg-blue-50/30 border-gray-200 focus:border-[#10605B] focus:ring-[#10605B] rounded-lg transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveView('reset')}
                      className="text-sm font-medium text-[#10605B] hover:underline"
                    >
                      Esqueceu a senha?
                    </button>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 text-base font-bold rounded-lg mt-4 shadow-lg hover:shadow-xl transition-all duration-300"
                    style={{ backgroundColor: '#10605B' }}
                    disabled={loading}
                  >
                    {loading ? (
                      <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Entrando...</>
                    ) : (
                      'Entrar no Sistema'
                    )}
                  </Button>
                </form>

                <div className="mt-8 text-center text-sm">
                  <span className="text-gray-500">Primeiro acesso? </span>
                  <button
                    onClick={() => setActiveView('signup')}
                    className="font-bold text-[#10605B] hover:underline"
                  >
                    Cadastre-se aqui
                  </button>
                </div>
              </div>
            )}

            {/* View: SIGNUP */}
            {activeView === 'signup' && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center mb-6">
                  <button onClick={() => setActiveView('login')} className="mr-2 p-1 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft className="h-5 w-5 text-gray-600" />
                  </button>
                  <h2 className="text-2xl font-bold text-gray-900">Criar Conta</h2>
                </div>

                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-gray-500 tracking-wider">NOME COMPLETO</Label>
                    <Input
                      type="text"
                      placeholder="Seu nome"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      required
                      className="h-11 bg-blue-50/30 border-gray-200 focus:border-[#10605B] focus:ring-[#10605B]"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-gray-500 tracking-wider">EMAIL</Label>
                    <Input
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-11 bg-blue-50/30 border-gray-200 focus:border-[#10605B] focus:ring-[#10605B]"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-gray-500 tracking-wider">SENHA</Label>
                    <Input
                      type="password"
                      placeholder="Criar senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-11 bg-blue-50/30 border-gray-200 focus:border-[#10605B] focus:ring-[#10605B]"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-gray-500 tracking-wider">CONFIRMAR SENHA</Label>
                    <Input
                      type="password"
                      placeholder="Repetir senha"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="h-11 bg-blue-50/30 border-gray-200 focus:border-[#10605B] focus:ring-[#10605B]"
                    />
                  </div>
                  <Button type="submit" className="w-full h-12 font-bold bg-[#10605B] hover:bg-[#0d4e4a] mt-2">
                    {loading ? <Loader2 className="animate-spin" /> : 'Criar Conta'}
                  </Button>
                </form>
              </div>
            )}

            {/* View: RESET / UPDATE - Simplified similar to Signup */}
            {(activeView === 'reset' || activeView === 'update') && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center mb-6">
                  <button onClick={() => setActiveView('login')} className="mr-2 p-1 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft className="h-5 w-5 text-gray-600" />
                  </button>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {activeView === 'reset' ? 'Recuperar Senha' : 'Redefinir Senha'}
                  </h2>
                </div>

                <form onSubmit={activeView === 'reset' ? handlePasswordReset : handleUpdatePassword} className="space-y-4">
                  {activeView === 'reset' ? (
                    <div className="space-y-1">
                      <Label className="text-xs font-bold text-gray-500 tracking-wider">EMAIL</Label>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-11 bg-blue-50/30 border-gray-200 focus:border-[#10605B] focus:ring-[#10605B]"
                      />
                    </div>
                  ) : (
                    <>
                      <div className="space-y-1">
                        <Label className="text-xs font-bold text-gray-500 tracking-wider">NOVA SENHA</Label>
                        <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required className="h-11 bg-blue-50/30" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-bold text-gray-500 tracking-wider">CONFIRMAR</Label>
                        <Input type="password" value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} required className="h-11 bg-blue-50/30" />
                      </div>
                    </>
                  )}

                  <Button type="submit" className="w-full h-12 font-bold bg-[#10605B] hover:bg-[#0d4e4a] mt-2">
                    {loading ? <Loader2 className="animate-spin" /> : (activeView === 'reset' ? 'Enviar Link' : 'Salvar Nova Senha')}
                  </Button>
                </form>
              </div>
            )}
          </div>

          <div className="mt-auto pt-6 text-center md:text-left">
            <button className="text-[10px] font-bold text-gray-400 hover:text-[#10605B] tracking-widest uppercase transition-colors">
              Acesso Rápido - Recepção
            </button>
          </div>
        </div>

        {/* Lado Direito - Branding */}
        <div className="hidden md:flex w-1/2 bg-[#10605B] p-12 flex-col justify-between relative overflow-hidden">
          {/* Decorative Background Elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 translate-y-1/2 blur-2xl pointer-events-none" />

          {/* Top Badge */}
          <div className="self-end">
            <span className="px-4 py-1.5 border border-white/30 rounded-full text-[10px] font-semibold text-white tracking-widest uppercase">
              Unimed Bauru
            </span>
          </div>

          {/* Center Content */}
          <div className="flex flex-col items-center text-center z-10 px-8">
            <div className="w-20 h-20 rounded-2xl border border-white/20 flex items-center justify-center mb-8 bg-white/5 backdrop-blur-sm shadow-2xl">
              <div className="text-white">
                {/* Hexagon/Box Icon */}
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                  <line x1="12" y1="22.08" x2="12" y2="12"></line>
                </svg>
              </div>
            </div>

            <h1 className="text-4xl font-bold text-white mb-6 leading-tight">
              Equipe de<br />Agendamento CDU
            </h1>

            <p className="text-white/80 text-lg font-light leading-relaxed max-w-sm">
              Scripts, fluxos e atualizações em um só lugar.
            </p>
          </div>

          {/* Bottom Badge */}
          <div className="flex items-center gap-2 text-white/60 text-xs font-medium self-start">
            <ShieldCheck className="h-4 w-4" />
            <span>Acesso seguro e monitorado.</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Auth;