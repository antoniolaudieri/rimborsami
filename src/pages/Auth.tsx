import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Mail, Lock, User, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { z } from 'zod';
import Logo from '@/components/Logo';
import { Helmet } from 'react-helmet-async';

const loginSchema = z.object({
  email: z.string().email('Inserisci un indirizzo email valido'),
  password: z.string().min(6, 'La password deve avere almeno 6 caratteri'),
});

const signUpSchema = loginSchema.extend({
  fullName: z.string().min(2, 'Inserisci il tuo nome completo'),
  confirmPassword: z.string(),
  acceptPrivacy: z.literal(true, {
    errorMap: () => ({ message: 'Devi accettare la Privacy Policy per registrarti' }),
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Le password non coincidono',
  path: ['confirmPassword'],
});

export default function Auth() {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode');
  
  const [isLogin, setIsLogin] = useState(mode !== 'signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [googleLoading, setGoogleLoading] = useState(false);

  const { signIn, signUp, user, loading: authLoading } = useAuth();

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError(null);
    try {
      const { error } = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (error) {
        setError('Errore durante l\'accesso con Google. Riprova.');
        setGoogleLoading(false);
      }
      // If successful, user will be redirected
    } catch {
      setError('Errore durante l\'accesso con Google. Riprova.');
      setGoogleLoading(false);
    }
  };
  const navigate = useNavigate();

  // Redirect based on onboarding status
  useEffect(() => {
    const checkOnboardingAndRedirect = async () => {
      if (user && !authLoading) {
        // Check if user has completed onboarding
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (profile?.onboarding_completed) {
          navigate('/dashboard');
        } else {
          navigate('/quiz');
        }
      }
    };
    
    checkOnboardingAndRedirect();
  }, [user, authLoading, navigate]);
  
  // Update isLogin when URL params change
  useEffect(() => {
    setIsLogin(mode !== 'signup');
  }, [mode]);

  const validateForm = () => {
    setValidationErrors({});
    setError(null);

    try {
      if (isLogin) {
        loginSchema.parse({ email, password });
      } else {
        signUpSchema.parse({ email, password, confirmPassword, fullName, acceptPrivacy });
      }
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        err.errors.forEach((e) => {
          if (e.path[0]) {
            errors[e.path[0] as string] = e.message;
          }
        });
        setValidationErrors(errors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            setError('Email o password non corretti');
          } else {
            setError('Errore durante l\'accesso. Riprova.');
          }
        }
      } else {
        const { error } = await signUp(email, password, fullName);
        if (error) {
          if (error.message.includes('already registered')) {
            setError('Questa email è già registrata. Prova ad accedere.');
          } else {
            setError('Errore durante la registrazione. Riprova.');
          }
        } else {
          setSuccess('Account creato con successo! Stai per essere reindirizzato...');
        }
      }
    } catch {
      setError('Si è verificato un errore. Riprova.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero-bg">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-hero-bg">
      <Helmet>
        <title>{isLogin ? 'Accedi' : 'Registrati'} - Rimborsami</title>
        <meta name="description" content={isLogin ? 'Accedi al tuo account Rimborsami per gestire rimborsi, compensazioni e pratiche aperte.' : 'Crea un account gratuito su Rimborsami e scopri i rimborsi che ti spettano in 2 minuti.'} />
        <link rel="canonical" href="https://rimborsami.app/auth" />
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      {/* Header */}
      <header className="p-4 md:p-6">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Torna alla home</span>
        </Link>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-4">
                <Logo size="xl" showText={false} linkTo={undefined} />
              </div>
              <CardTitle className="text-2xl font-bold">
                {isLogin ? 'Bentornato!' : 'Crea il tuo account'}
              </CardTitle>
              <CardDescription>
                {isLogin
                  ? 'Accedi per gestire i tuoi rimborsi'
                  : 'Inizia a recuperare i soldi che ti spettano'}
              </CardDescription>
            </CardHeader>

            <CardContent>
              {/* Google Sign In */}
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full mb-4 gap-2"
                onClick={handleGoogleSignIn}
                disabled={googleLoading || loading}
              >
                {googleLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                )}
                Continua con Google
              </Button>

              <div className="relative mb-4">
                <Separator />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                  oppure
                </span>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <AnimatePresence mode="wait">
                  {!isLogin && (
                    <motion.div
                      key="fullName"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2"
                    >
                      <Label htmlFor="fullName">Nome completo</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="fullName"
                          type="text"
                          placeholder="Mario Rossi"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className={`pl-10 ${validationErrors.fullName ? 'border-destructive' : ''}`}
                        />
                      </div>
                      {validationErrors.fullName && (
                        <p className="text-xs text-destructive">{validationErrors.fullName}</p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="mario@esempio.it"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`pl-10 ${validationErrors.email ? 'border-destructive' : ''}`}
                    />
                  </div>
                  {validationErrors.email && (
                    <p className="text-xs text-destructive">{validationErrors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`pl-10 pr-10 ${validationErrors.password ? 'border-destructive' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {validationErrors.password && (
                    <p className="text-xs text-destructive">{validationErrors.password}</p>
                  )}
                </div>

                <AnimatePresence mode="wait">
                  {!isLogin && (
                    <motion.div
                      key="confirmPassword"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2"
                    >
                      <Label htmlFor="confirmPassword">Conferma password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="confirmPassword"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className={`pl-10 ${validationErrors.confirmPassword ? 'border-destructive' : ''}`}
                        />
                      </div>
                      {validationErrors.confirmPassword && (
                        <p className="text-xs text-destructive">{validationErrors.confirmPassword}</p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Privacy checkbox - solo per registrazione */}
                <AnimatePresence mode="wait">
                  {!isLogin && (
                    <motion.div
                      key="privacyCheckbox"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2"
                    >
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id="acceptPrivacy"
                          checked={acceptPrivacy}
                          onCheckedChange={(checked) => setAcceptPrivacy(checked === true)}
                          className={validationErrors.acceptPrivacy ? 'border-destructive' : ''}
                        />
                        <Label 
                          htmlFor="acceptPrivacy" 
                          className="text-sm leading-relaxed cursor-pointer"
                        >
                          Ho letto e accetto la{' '}
                          <Link 
                            to="/privacy" 
                            target="_blank"
                            className="text-primary hover:underline font-medium"
                          >
                            Privacy Policy
                          </Link>{' '}
                          e i{' '}
                          <Link 
                            to="/terms" 
                            target="_blank"
                            className="text-primary hover:underline font-medium"
                          >
                            Termini di Servizio
                          </Link>
                        </Label>
                      </div>
                      {validationErrors.acceptPrivacy && (
                        <p className="text-xs text-destructive">{validationErrors.acceptPrivacy}</p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Error message */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm"
                    >
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{error}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Success message */}
                <AnimatePresence>
                  {success && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 text-primary text-sm"
                    >
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                      <span>{success}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  {isLogin ? 'Accedi' : 'Crea account'}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  {isLogin ? 'Non hai un account?' : 'Hai già un account?'}
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setError(null);
                      setSuccess(null);
                      setValidationErrors({});
                    }}
                    className="ml-1 text-primary font-medium hover:underline"
                  >
                    {isLogin ? 'Registrati' : 'Accedi'}
                  </button>
                </p>
              </div>

              {/* Trust badges */}
              <div className="mt-6 pt-6 border-t flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-primary" />
                  GDPR compliant
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-primary" />
                  Dati criptati
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
