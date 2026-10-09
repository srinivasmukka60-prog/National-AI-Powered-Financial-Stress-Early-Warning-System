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
} from 'lucide-react';
import { useAuth, DEMO_AUTH_ACCOUNTS } from '../context/AuthContext';

interface AuthModalProps {
  darkMode: boolean;
  isOpen: boolean;
  onClose?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ darkMode, isOpen, onClose }) => {
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
  } = useAuth();

  const [tab, setTab] = useState<'signin' | 'fastpass' | 'signup'>('fastpass');
  const [email, setEmail] = useState('srinivas.mukka@agencybook.io');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [organization, setOrganization] = useState('');
  const [role, setRole] = useState('Executive / Financial Director');
  const [rememberMe, setRememberMe] = useState(true);
  const [otpCode, setOtpCode] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [smsNotice, setSmsNotice] = useState<string | null>(null);
  const [sendingSms, setSendingSms] = useState(false);

  if (!isOpen) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!email.trim()) {
      setErrorMsg('Please enter your corporate email address.');
      return;
    }
    setLoading(true);
    try {
      const success = await login(email, password, rememberMe);
      if (success && onClose) {
        onClose();
      }
    } catch {
      setErrorMsg('Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!email.trim() || !name.trim()) {
      setErrorMsg('Please provide your full name and corporate email.');
      return;
    }
    setLoading(true);
    try {
      const success = await signup({ name, email, role, organization }, password);
      if (success && onClose) {
        onClose();
      }
    } catch {
      setErrorMsg('Account registration error. Please try again.');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col transition-all ${
          darkMode ? 'bg-[#121722] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header Bar */}
        <div className={`p-6 border-b flex items-center justify-between ${
          darkMode ? 'border-slate-800/80 bg-[#151c28]' : 'border-slate-100 bg-slate-50'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-600/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight">SME-SENTINEL Access Gateway</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-950/40 text-emerald-300 border border-emerald-800/40">
                  AES-256 Active
                </span>
              </div>
              <p className={`text-xs mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Confidential Treasury & Financial Stress Early-Warning Portal
              </p>
            </div>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                darkMode ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
              }`}
              title="Close Dialog"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* 2FA Verification View */}
        {twoFactorPending ? (
          <div className="p-6 md:p-8 space-y-5">
            <div className="text-center space-y-1.5">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-400 mx-auto flex items-center justify-center">
                <Smartphone className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="text-base font-bold">Two-Factor Authentication Required</h3>
              <p className={`text-xs max-w-sm mx-auto leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Enter the 6-digit TOTP code, mobile SMS OTP, or an emergency backup recovery key.
              </p>
            </div>

            {/* Mobile SMS OTP Dispatcher */}
            <div className={`p-3.5 rounded-xl border space-y-2.5 ${
              darkMode ? 'bg-[#151c27] border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
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

              <div className="flex items-center gap-2">
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
              </div>

              {smsNotice && (
                <div className="p-2.5 rounded-lg bg-sky-950/40 border border-sky-500/30 text-sky-200 text-xs flex items-center justify-between gap-2 animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <span className="text-base">💬</span>
                    <div>
                      <p className="font-bold text-[11px] text-sky-300">New Message · SME-SENTINEL</p>
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
                <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Verification Code or Recovery Key
                </label>
                <input
                  type="text"
                  maxLength={16}
                  placeholder="123456 or SEC-XXXX-XXXX"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.toUpperCase())}
                  className={`w-full px-4 py-3 rounded-xl border text-center text-lg font-mono tracking-widest font-bold focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all ${
                    darkMode ? 'bg-[#18202d] border-slate-700 text-white placeholder-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900'
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

              {/* Demo Quick-Fill Helpers */}
              <div className="flex items-center justify-between gap-2 pt-1 text-[11px] flex-wrap">
                {lastSmsOtp && (
                  <button
                    type="button"
                    onClick={() => setOtpCode(lastSmsOtp)}
                    className="font-semibold text-emerald-400 hover:text-emerald-300 cursor-pointer transition-colors"
                  >
                    📱 Fill SMS ({lastSmsOtp})
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setOtpCode('123456')}
                  className={`font-semibold cursor-pointer transition-colors ${
                    darkMode ? 'text-sky-400 hover:text-sky-300' : 'text-sky-600 hover:text-sky-800'
                  }`}
                >
                  ⚡ Fill TOTP (123456)
                </button>
                <button
                  type="button"
                  onClick={() => setOtpCode('SEC-8492-3104')}
                  className={`font-semibold cursor-pointer transition-colors ${
                    darkMode ? 'text-amber-400 hover:text-amber-300' : 'text-amber-600 hover:text-amber-800'
                  }`}
                >
                  🔑 Fill Backup Key
                </button>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={cancelTwoFactor}
                  className={`flex-1 py-2.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                    darkMode ? 'border-slate-700 hover:bg-slate-800 text-slate-300' : 'border-slate-300 hover:bg-slate-100 text-slate-700'
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
          <div className="p-6 md:p-8 space-y-6">
            {/* Top Navigation Tabs */}
            <div className={`p-1 rounded-xl border flex items-center gap-1 ${
              darkMode ? 'bg-[#151c27] border-slate-800' : 'bg-slate-100 border-slate-200'
            }`}>
              <button
                type="button"
                onClick={() => { setTab('fastpass'); setErrorMsg(null); }}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  tab === 'fastpass'
                    ? darkMode
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'bg-white text-sky-700 shadow-xs border border-sky-100'
                    : darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Enterprise Fast-Pass</span>
              </button>

              <button
                type="button"
                onClick={() => { setTab('signin'); setErrorMsg(null); }}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  tab === 'signin'
                    ? darkMode
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'bg-white text-sky-700 shadow-xs border border-sky-100'
                    : darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Password Sign In</span>
              </button>

              <button
                type="button"
                onClick={() => { setTab('signup'); setErrorMsg(null); }}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  tab === 'signup'
                    ? darkMode
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'bg-white text-sky-700 shadow-xs border border-sky-100'
                    : darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Register</span>
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Tab 1: Enterprise Fast-Pass (1-Click Roles) */}
            {tab === 'fastpass' && (
              <div className="space-y-3.5">
                <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Select an authorized corporate or government clearance profile for immediate, one-click role-based sign in:
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
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 group ${
                        darkMode
                          ? 'bg-[#18202d] border-slate-700/80 hover:border-sky-500/50 hover:bg-[#1e2838]'
                          : 'bg-slate-50 border-slate-200 hover:border-sky-400 hover:bg-white shadow-xs'
                      }`}
                    >
                      <img
                        src={acc.avatarUrl}
                        alt={acc.name}
                        className="w-9 h-9 rounded-full object-cover border border-slate-600 shrink-0 mt-0.5"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-bold truncate ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                            {acc.name}
                          </span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded font-bold uppercase bg-sky-950/40 text-sky-300 border border-sky-800/40 shrink-0">
                            Clearance
                          </span>
                        </div>
                        <div className={`text-[10px] truncate font-medium mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                          {acc.role}
                        </div>
                        <div className={`text-[9px] truncate ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                          {acc.organization}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 2: Password Sign In */}
            {tab === 'signin' && (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    Corporate Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@agencybook.io"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all ${
                        darkMode ? 'bg-[#18202d] border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className={`text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
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
                      placeholder="••••••••••••"
                      className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all ${
                        darkMode ? 'bg-[#18202d] border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-300 text-slate-900'
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
                    <span className={darkMode ? 'text-slate-300' : 'text-slate-600'}>Remember session on this device</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs tracking-wide shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>{loading ? 'Authenticating...' : 'Sign In to Terminal'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}

            {/* Tab 3: Register */}
            {tab === 'signup' && (
              <form onSubmit={handleSignUp} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. S. Mukka"
                      className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                        darkMode ? 'bg-[#18202d] border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      Enterprise / Entity
                    </label>
                    <input
                      type="text"
                      required
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      placeholder="e.g. Surat Textiles Ltd"
                      className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                        darkMode ? 'bg-[#18202d] border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    Corporate Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="director@enterprise.in"
                    className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                      darkMode ? 'bg-[#18202d] border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    Role Clearance
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                      darkMode ? 'bg-[#18202d] border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="Executive / Financial Director">Executive / Financial Director (Full CFO & Treasury Access)</option>
                    <option value="Senior Credit Underwriter">Senior Credit Underwriter (Bank & DSCR Covenant Analysis)</option>
                    <option value="Regulatory Policy Lead">Regulatory Policy Lead (Ministry of MSME Liaison)</option>
                    <option value="Financial Risk Analyst">Financial Risk Analyst (Stress Simulators & Forecasting)</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    Create Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                      darkMode ? 'bg-[#18202d] border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs tracking-wide shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Create Account & Mount Sandbox</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}

            {/* Bottom Security Assurance Banner */}
            <div className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-[11px] ${
              darkMode ? 'bg-[#151c27] border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero Cloud Plaintext Storage · Confidential MSME Sandbox</span>
              </div>
              <span className="font-mono text-emerald-400 font-bold shrink-0">100% PRIVATE</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
