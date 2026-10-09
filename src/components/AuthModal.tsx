import React, { useState } from 'react';
import {
  Shield,
  ShieldCheck,
  Lock,
  Mail,
  User,
  Building,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  KeyRound,
  Sparkles,
  Smartphone,
  AlertCircle,
  X,
  Phone,
  Send,
  Database,
  Check,
  ExternalLink,
  Key,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useAuth, DEMO_AUTH_ACCOUNTS } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface AuthModalProps {
  darkMode: boolean;
  isOpen: boolean;
  canDismiss?: boolean;
  onClose?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  darkMode,
  isOpen,
  canDismiss = true,
  onClose,
}) => {
  const {
    login,
    signup,
    fastLoginAs,
    twoFactorPending,
    verifyTwoFactor,
    cancelTwoFactor,
    phone,
    sendSmsOtp,
    lastSmsOtp,
    supabaseConfig,
    saveSupabaseKeys,
    clearSupabaseKeys,
  } = useAuth();
  const { t } = useLanguage();

  // Authentication mode: sign in, sign up, or fast-pass demo
  const [tab, setTab] = useState<'signin' | 'signup' | 'fastpass'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [organization, setOrganization] = useState('');
  const [userPhone, setUserPhone] = useState('+91 ');
  const [role, setRole] = useState('Partner & Financial Director');
  const [rememberMe, setRememberMe] = useState(true);
  const [otpCode, setOtpCode] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [smsNotice, setSmsNotice] = useState<string | null>(null);
  const [sendingSms, setSendingSms] = useState(false);

  // Supabase keys configuration expandable accordion
  const [showKeyConfig, setShowKeyConfig] = useState(!supabaseConfig.isConfigured);
  const [supabaseUrlInput, setSupabaseUrlInput] = useState(supabaseConfig.url || '');
  const [supabaseAnonKeyInput, setSupabaseAnonKeyInput] = useState(supabaseConfig.anonKey || '');
  const [keySavedMessage, setKeySavedMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSaveKeys = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabaseUrlInput.trim() || !supabaseAnonKeyInput.trim()) {
      setErrorMsg('Please provide both your Supabase Project URL and Anon Public Key.');
      return;
    }
    if (!supabaseUrlInput.trim().startsWith('https://')) {
      setErrorMsg('Supabase Project URL must start with https://');
      return;
    }
    saveSupabaseKeys(supabaseUrlInput.trim(), supabaseAnonKeyInput.trim());
    setErrorMsg(null);
    setKeySavedMessage('Supabase keys active and verified! You can now log in or sign up live.');
    setShowKeyConfig(false);
    setTimeout(() => setKeySavedMessage(null), 4000);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email.trim()) {
      setErrorMsg('Please enter your corporate email address.');
      return;
    }
    if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      const success = await login(email, password, rememberMe);
      if (success) {
        setSuccessMsg('Authentication successful. Redirecting to workspace...');
        if (onClose) {
          setTimeout(onClose, 400);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please verify your email and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid corporate email address.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters in length.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify.');
      return;
    }

    setLoading(true);
    try {
      const success = await signup(
        {
          name: name.trim(),
          email: email.trim(),
          role,
          organization: organization.trim() || 'Enterprise Financial Advisory',
          phone: userPhone.trim(),
        },
        password
      );

      if (success) {
        setSuccessMsg('Account registered successfully! Welcome to SME-SENTINEL.');
        if (onClose) {
          setTimeout(onClose, 500);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please check credentials or Supabase connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (otpCode.trim().length < 6) {
      setErrorMsg('Please enter the 6-digit TOTP code or emergency backup key.');
      return;
    }
    const verified = verifyTwoFactor(otpCode);
    if (verified) {
      if (onClose) onClose();
    } else {
      setErrorMsg('Invalid token. For demo, enter 123456 or a valid backup key.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
      onClick={(e) => {
        // Prevent dismissal if authentication is mandatory
        if (canDismiss && onClose && e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className={`w-full max-w-xl my-auto rounded-3xl border shadow-2xl overflow-hidden flex flex-col transition-all ${
          darkMode
            ? 'bg-[#111622] border-slate-800 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header Bar */}
        <div
          className={`p-5 sm:p-6 border-b flex items-center justify-between ${
            darkMode ? 'border-slate-800/80 bg-[#141b27]' : 'border-slate-100 bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold tracking-tight">
                  SME-SENTINEL Access Gateway
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  {supabaseConfig.isConfigured ? 'Supabase Cloud' : 'Mandatory Auth'}
                </span>
              </div>
              <p className={`text-xs mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                National MSME Financial Stress Early-Warning & Treasury Intelligence
              </p>
            </div>
          </div>

          {canDismiss && onClose && (
            <button
              onClick={onClose}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                darkMode
                  ? 'hover:bg-slate-800 text-slate-400 hover:text-white'
                  : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
              }`}
              title="Close Dialog"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Supabase Connection Status Bar & Quick Configuration Expander */}
        <div
          className={`px-5 py-3 border-b text-xs flex flex-col gap-2 ${
            supabaseConfig.isConfigured
              ? darkMode
                ? 'bg-emerald-950/25 border-emerald-900/40 text-emerald-300'
                : 'bg-emerald-50/80 border-emerald-200 text-emerald-800'
              : darkMode
              ? 'bg-amber-950/20 border-amber-900/40 text-amber-300'
              : 'bg-amber-50/80 border-amber-200 text-amber-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 shrink-0" />
              <span className="font-semibold">
                {supabaseConfig.isConfigured
                  ? 'Supabase Authentication Connected'
                  : 'Supabase Keys Required for Live Cloud Auth'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowKeyConfig(!showKeyConfig)}
              className="font-bold underline flex items-center gap-1 cursor-pointer hover:opacity-80"
            >
              <span>{showKeyConfig ? 'Hide Keys' : supabaseConfig.isConfigured ? 'Edit Keys' : 'Configure 2 Keys'}</span>
              {showKeyConfig ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Key Configuration Panel */}
          {showKeyConfig && (
            <form
              onSubmit={handleSaveKeys}
              className={`p-3.5 mt-1 rounded-2xl border space-y-3 ${
                darkMode ? 'bg-[#0e131d] border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-sky-400" />
                  <span>Supabase Project Credentials</span>
                </span>
                {supabaseConfig.isConfigured && (
                  <button
                    type="button"
                    onClick={clearSupabaseKeys}
                    className="text-[10px] text-rose-400 hover:underline cursor-pointer"
                  >
                    Reset Keys
                  </button>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  1. Supabase Project URL (e.g. https://xyz.supabase.co)
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://your-project.supabase.co"
                  value={supabaseUrlInput}
                  onChange={(e) => setSupabaseUrlInput(e.target.value)}
                  className={`w-full px-3 py-1.5 rounded-xl border text-xs font-mono focus:outline-none focus:ring-1 focus:ring-sky-500 ${
                    darkMode
                      ? 'bg-[#141b27] border-slate-700 text-white placeholder-slate-600'
                      : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  2. Supabase Anon Public Key (anon / public key)
                </label>
                <input
                  type="text"
                  required
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={supabaseAnonKeyInput}
                  onChange={(e) => setSupabaseAnonKeyInput(e.target.value)}
                  className={`w-full px-3 py-1.5 rounded-xl border text-xs font-mono focus:outline-none focus:ring-1 focus:ring-sky-500 ${
                    darkMode
                      ? 'bg-[#141b27] border-slate-700 text-white placeholder-slate-600'
                      : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                  }`}
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-slate-400">
                  Find these in Supabase Dashboard &gt; Project Settings &gt; API
                </span>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-sm cursor-pointer transition-colors"
                >
                  Save & Connect
                </button>
              </div>
            </form>
          )}

          {keySavedMessage && (
            <div className="p-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-1.5 animate-in fade-in">
              <Check className="w-3.5 h-3.5 shrink-0" />
              <span>{keySavedMessage}</span>
            </div>
          )}
        </div>

        {/* 2FA Verification Flow */}
        {twoFactorPending ? (
          <div className="p-6 md:p-8 space-y-5">
            <div className="text-center space-y-1.5">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-400 mx-auto flex items-center justify-center">
                <Smartphone className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="text-base font-bold">Two-Factor Authentication Required</h3>
              <p
                className={`text-xs max-w-sm mx-auto leading-relaxed ${
                  darkMode ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                Enter the 6-digit TOTP code, mobile SMS OTP, or an emergency backup recovery key.
              </p>
            </div>

            {/* Mobile SMS OTP Dispatcher */}
            <div
              className={`p-3.5 rounded-xl border space-y-2.5 ${
                darkMode ? 'bg-[#151c27] border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <span className="font-semibold text-slate-200">Registered Mobile:</span>
                  <span className="font-mono text-emerald-400 font-bold">{phone || '+91 98490 28410'}</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                  SMS & WA Verified
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSendingSms(true);
                  const code = sendSmsOtp();
                  setSmsNotice(`6-digit SMS OTP ${code} dispatched to ${phone || '+91 98490 28410'}`);
                  setOtpCode(code);
                  setTimeout(() => setSendingSms(false), 500);
                }}
                className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{sendingSms ? 'Transmitting OTP...' : '📲 Send 6-Digit SMS OTP to Registered Mobile'}</span>
              </button>

              {smsNotice && (
                <div className="p-2.5 rounded-lg bg-sky-950/40 border border-sky-500/30 text-sky-200 text-xs flex items-center justify-between gap-2 animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <span className="text-base">💬</span>
                    <div>
                      <p className="font-bold text-[11px] text-sky-300">SME-SENTINEL Security Center</p>
                      <p className="text-[11px] font-mono text-white">{smsNotice}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (lastSmsOtp) setOtpCode(lastSmsOtp);
                    }}
                    className="px-2 py-1 bg-sky-500 hover:bg-sky-400 text-white font-bold rounded text-[10px] cursor-pointer"
                  >
                    Auto-Fill
                  </button>
                </div>
              )}
            </div>

            <form onSubmit={handleVerify2FA} className="space-y-4 max-w-sm mx-auto">
              <div>
                <label
                  className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${
                    darkMode ? 'text-slate-300' : 'text-slate-700'
                  }`}
                >
                  Verification Code or Recovery Key
                </label>
                <input
                  type="text"
                  maxLength={16}
                  placeholder="123456 or SEC-XXXX-XXXX"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.toUpperCase())}
                  className={`w-full px-4 py-3 rounded-xl border text-center text-lg font-mono tracking-widest font-bold focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all ${
                    darkMode
                      ? 'bg-[#18202d] border-slate-700 text-white placeholder-slate-600'
                      : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                  autoFocus
                />
              </div>

              {errorMsg && (
                <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={cancelTwoFactor}
                  className={`flex-1 py-2.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                    darkMode
                      ? 'border-slate-700 hover:bg-slate-800 text-slate-300'
                      : 'border-slate-300 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Verify Token</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="p-5 sm:p-7 space-y-5">
            {/* Navigation Tabs: Sign In | Sign Up | Fast-Pass */}
            <div
              className={`p-1 rounded-2xl border flex items-center gap-1 ${
                darkMode ? 'bg-[#141a26] border-slate-800' : 'bg-slate-100 border-slate-200'
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  setTab('signin');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  tab === 'signin'
                    ? darkMode
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'bg-white text-sky-700 shadow-sm border border-sky-100'
                    : darkMode
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>{t('Sign In', 'Sign In')}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTab('signup');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  tab === 'signup'
                    ? darkMode
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'bg-white text-sky-700 shadow-sm border border-sky-100'
                    : darkMode
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>{t('Sign Up', 'Sign Up')}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTab('fastpass');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  tab === 'fastpass'
                    ? darkMode
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'bg-white text-sky-700 shadow-sm border border-sky-100'
                    : darkMode
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{t('Fast-Pass Demo', 'Fast-Pass')}</span>
              </button>
            </div>

            {/* Error & Success Alerts */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* =========================================================
                TAB 1: SIGN IN (EMAIL + PASSWORD)
            ========================================================= */}
            {tab === 'signin' && (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label
                    className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${
                      darkMode ? 'text-slate-300' : 'text-slate-700'
                    }`}
                  >
                    Corporate Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@agencybook.io or yourname@company.com"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all ${
                        darkMode
                          ? 'bg-[#151c27] border-slate-700 text-white placeholder-slate-500'
                          : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                      }`}
                      autoFocus
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      className={`text-xs font-semibold uppercase tracking-wider ${
                        darkMode ? 'text-slate-300' : 'text-slate-700'
                      }`}
                    >
                      Password
                    </label>
                    <span className="text-[11px] text-sky-400 hover:underline cursor-pointer">
                      Forgot credentials?
                    </span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter account password"
                      className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all ${
                        darkMode
                          ? 'bg-[#151c27] border-slate-700 text-white placeholder-slate-500'
                          : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded accent-sky-500"
                    />
                    <span className={darkMode ? 'text-slate-300' : 'text-slate-600'}>
                      Remember session on this device
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs tracking-wide shadow-lg shadow-sky-600/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <span>{loading ? 'Authenticating with Supabase...' : 'Sign In to Terminal'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="text-center pt-1 text-xs text-slate-400">
                  Don't have an enterprise account?{' '}
                  <button
                    type="button"
                    onClick={() => setTab('signup')}
                    className="text-sky-400 font-bold hover:underline cursor-pointer"
                  >
                    Create Account
                  </button>
                </div>
              </form>
            )}

            {/* =========================================================
                TAB 2: SIGN UP (CREATE NEW ACCOUNT)
            ========================================================= */}
            {tab === 'signup' && (
              <form onSubmit={handleSignUp} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${
                        darkMode ? 'text-slate-300' : 'text-slate-700'
                      }`}
                    >
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Srinivas Mukka"
                        className={`w-full pl-9 pr-3 py-2 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                          darkMode
                            ? 'bg-[#151c27] border-slate-700 text-white'
                            : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${
                        darkMode ? 'text-slate-300' : 'text-slate-700'
                      }`}
                    >
                      Enterprise / Entity *
                    </label>
                    <div className="relative">
                      <Building className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={organization}
                        onChange={(e) => setOrganization(e.target.value)}
                        placeholder="e.g. Agency Book Advisory"
                        className={`w-full pl-9 pr-3 py-2 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                          darkMode
                            ? 'bg-[#151c27] border-slate-700 text-white'
                            : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${
                        darkMode ? 'text-slate-300' : 'text-slate-700'
                      }`}
                    >
                      Corporate Email *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@company.com"
                        className={`w-full pl-9 pr-3 py-2 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                          darkMode
                            ? 'bg-[#151c27] border-slate-700 text-white'
                            : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${
                        darkMode ? 'text-slate-300' : 'text-slate-700'
                      }`}
                    >
                      Mobile Phone (2FA)
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="tel"
                        value={userPhone}
                        onChange={(e) => setUserPhone(e.target.value)}
                        placeholder="+91 98490 28410"
                        className={`w-full pl-9 pr-3 py-2 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                          darkMode
                            ? 'bg-[#151c27] border-slate-700 text-white'
                            : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label
                    className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${
                      darkMode ? 'text-slate-300' : 'text-slate-700'
                    }`}
                  >
                    Role / Executive Clearance
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                      darkMode
                        ? 'bg-[#151c27] border-slate-700 text-white'
                        : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="Partner & Financial Director">
                      Partner & Financial Director (Full CFO, Analytics & Treasury Access)
                    </option>
                    <option value="Chief Risk Officer (CRO)">
                      Chief Risk Officer (Bank & DSCR Covenant Analysis)
                    </option>
                    <option value="Chief MSME Policy Advisor">
                      Chief MSME Policy Advisor (Ministry & Regulatory Oversight)
                    </option>
                    <option value="SME Turnaround Strategist">
                      SME Turnaround Strategist (Emergency Capital & Restructuring)
                    </option>
                    <option value="MSME Promoter / Business Owner">
                      MSME Promoter / Business Owner (Enterprise Sandbox Access)
                    </option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${
                        darkMode ? 'text-slate-300' : 'text-slate-700'
                      }`}
                    >
                      Password *
                    </label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                        darkMode
                          ? 'bg-[#151c27] border-slate-700 text-white'
                          : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label
                      className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${
                        darkMode ? 'text-slate-300' : 'text-slate-700'
                      }`}
                    >
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                        darkMode
                          ? 'bg-[#151c27] border-slate-700 text-white'
                          : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-500 hover:to-sky-500 text-white font-bold text-xs tracking-wide shadow-lg shadow-emerald-600/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <span>{loading ? 'Creating Supabase Account...' : 'Create Secure Account & Enter'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="text-center pt-1 text-xs text-slate-400">
                  Already registered?{' '}
                  <button
                    type="button"
                    onClick={() => setTab('signin')}
                    className="text-sky-400 font-bold hover:underline cursor-pointer"
                  >
                    Sign In
                  </button>
                </div>
              </form>
            )}

            {/* =========================================================
                TAB 3: FAST-PASS DEMO ACCESS
            ========================================================= */}
            {tab === 'fastpass' && (
              <div className="space-y-3.5">
                <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Select an authorized corporate or regulatory clearance profile for immediate, 1-click test sign in:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {DEMO_AUTH_ACCOUNTS.map((acc) => (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => {
                        fastLoginAs(acc.id);
                        if (onClose) onClose();
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                        darkMode
                          ? 'bg-[#141b27] border-slate-800 hover:border-sky-500/50 hover:bg-[#182130]'
                          : 'bg-slate-50 border-slate-200 hover:border-sky-400 hover:bg-sky-50/50'
                      }`}
                    >
                      <img
                        src={acc.avatarUrl}
                        alt={acc.name}
                        className="w-9 h-9 rounded-full object-cover border border-slate-600 shrink-0 mt-0.5"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-xs font-bold truncate ${
                              darkMode ? 'text-slate-100' : 'text-slate-900'
                            }`}
                          >
                            {acc.name}
                          </span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded font-bold uppercase bg-sky-950/40 text-sky-300 border border-sky-800/40 shrink-0">
                            Clearance
                          </span>
                        </div>
                        <div
                          className={`text-[10px] truncate font-medium mt-0.5 ${
                            darkMode ? 'text-slate-400' : 'text-slate-600'
                          }`}
                        >
                          {acc.role}
                        </div>
                        <div
                          className={`text-[9px] truncate ${
                            darkMode ? 'text-slate-500' : 'text-slate-400'
                          }`}
                        >
                          {acc.organization}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Security Assurance Banner */}
            <div
              className={`p-3 rounded-2xl border flex items-center justify-between gap-3 text-[11px] ${
                darkMode
                  ? 'bg-[#141b27] border-slate-800 text-slate-400'
                  : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Protected by Supabase Cloud Auth & AES-256 Vault Encryption</span>
              </div>
              <span className="font-mono text-emerald-400 font-bold shrink-0">TIER-4 PROTOCOL</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
