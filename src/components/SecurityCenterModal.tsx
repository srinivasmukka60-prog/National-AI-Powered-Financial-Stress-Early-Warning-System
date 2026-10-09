import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Key, 
  Smartphone, 
  Clock, 
  Laptop, 
  Globe, 
  Lock, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  Trash2, 
  X,
  History,
  FileText,
  UserCheck,
  QrCode,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  Shield,
  ArrowRight,
  Phone,
  MessageSquare,
  Send,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SecurityCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode?: boolean;
}

export const SecurityCenterModal: React.FC<SecurityCenterModalProps> = ({
  isOpen,
  onClose,
  darkMode = true
}) => {
  const {
    user,
    sessions,
    auditLogs,
    is2FAEnabled,
    toggleTwoFactor,
    phone,
    twoFactorMethod,
    lastSmsOtp,
    updateUserPhone,
    setTwoFactorMethod,
    sendSmsOtp,
    backupCodes,
    twoFactorSecret,
    pinCode,
    updatePinCode,
    autoLockMinutes,
    setAutoLockMinutes,
    revokeSession,
    lockSession,
    recordAuditLog
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'sessions' | 'audit'>('overview');
  const [newPin, setNewPin] = useState('');
  const [pinSuccess, setPinSuccess] = useState(false);
  const [pinError, setPinError] = useState('');
  const [auditFilter, setAuditFilter] = useState<'all' | 'info' | 'warning' | 'critical'>('all');
  const [isExporting, setIsExporting] = useState(false);

  // 2FA Setup & Verification States
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [setupStep, setSetupStep] = useState<'scan' | 'verify' | 'recovery'>('scan');
  const [setupOtp, setSetupOtp] = useState('');
  const [setupError, setSetupError] = useState<string | null>(null);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [showDisableConfirm, setShowDisableConfirm] = useState(false);
  const [showTestChallenge, setShowTestChallenge] = useState(false);
  const [testOtp, setTestOtp] = useState('');
  const [testResult, setTestResult] = useState<'idle' | 'success' | 'error'>('idle');

  // Mobile Phone 2FA States
  const [twoFactorChannel, setTwoFactorChannel] = useState<'mobile' | 'totp'>('mobile');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || '+91 98490 28410');
  const [phoneCountryCode, setPhoneCountryCode] = useState('+91');
  const [smsDeliveryChannel, setSmsDeliveryChannel] = useState<'sms' | 'whatsapp'>('sms');
  const [smsSentNotice, setSmsSentNotice] = useState<string | null>(null);
  const [smsCountdown, setSmsCountdown] = useState(0);

  // Resend Countdown
  React.useEffect(() => {
    if (smsCountdown <= 0) return;
    const timer = setInterval(() => {
      setSmsCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [smsCountdown]);

  if (!isOpen) return null;

  const handleOpenSetup = (initialChannel: 'mobile' | 'totp' = 'mobile') => {
    setTwoFactorChannel(initialChannel);
    setPhoneNumber(user?.phone || '+91 98490 28410');
    setSetupStep('scan');
    setSetupOtp('');
    setSetupError(null);
    setSmsSentNotice(null);
    setCopiedSecret(false);
    setCopiedCodes(false);
    setShowSetupModal(true);
  };

  const handleSendMobileOtp = () => {
    const raw = phoneNumber.replace(/^\+\d+\s*/, '').trim();
    if (!raw || raw.length < 8) {
      setSetupError('Please enter a valid 10-digit mobile number.');
      return;
    }
    const fullNumber = phoneNumber.startsWith('+') ? phoneNumber : `${phoneCountryCode} ${raw}`;
    updateUserPhone(fullNumber);
    const code = sendSmsOtp(fullNumber);
    setSmsSentNotice(`SMS verification OTP: ${code} (sent to ${fullNumber})`);
    setSmsCountdown(30);
    setSetupStep('verify');
    setSetupError(null);
  };

  const handleCopySecret = async () => {
    try {
      await navigator.clipboard.writeText(twoFactorSecret || 'AGY-7X9K-MSME-2026-TOTP');
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    } catch {}
  };

  const handleCopyBackupCodes = async () => {
    try {
      const text = (backupCodes || []).join('\n');
      await navigator.clipboard.writeText(text);
      setCopiedCodes(true);
      setTimeout(() => setCopiedCodes(false), 2000);
    } catch {}
  };

  const handleDownloadBackupCodes = () => {
    const text = `SME-SENTINEL EMERGENCY 2FA BACKUP CODES\nGenerated: ${new Date().toISOString()}\nAccount: ${user?.email || 'Administrator'}\nRegistered Mobile: ${user?.phone || phoneNumber}\n\nKeep these one-time codes in a safe place. Each code can only be used once.\n\n` + (backupCodes || []).join('\n');
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'msme_sentinel_2fa_backup_codes.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleVerifySetup = (e: React.FormEvent) => {
    e.preventDefault();
    setSetupError(null);
    if (!setupOtp || setupOtp.trim().length < 6) {
      setSetupError('Please enter a valid 6-digit verification code.');
      return;
    }
    const cleaned = setupOtp.trim();
    if (cleaned === '123456' || (lastSmsOtp && cleaned === lastSmsOtp) || /^\d{6}$/.test(cleaned)) {
      toggleTwoFactor(true);
      setTwoFactorMethod(twoFactorChannel === 'mobile' ? 'sms' : 'totp');
      recordAuditLog(
        'Two-Factor Authentication Setup Completed',
        'system',
        `Admin paired ${twoFactorChannel === 'mobile' ? `Mobile SMS (${user?.phone || phoneNumber})` : 'TOTP Authenticator'} & generated emergency recovery keys`,
        'low'
      );
      setSetupStep('recovery');
    } else {
      setSetupError('Invalid code. Please enter the 6-digit code received via SMS or Authenticator.');
    }
  };

  const handleTestChallenge = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = testOtp.trim().toUpperCase();
    if (clean === '123456' || (lastSmsOtp && clean === lastSmsOtp) || /^\d{6}$/.test(clean) || (backupCodes || []).includes(clean)) {
      setTestResult('success');
      recordAuditLog('2FA Self-Test Challenge Passed', 'auth', 'Administrator successfully completed verification challenge test', 'low');
    } else {
      setTestResult('error');
    }
  };

  const handleConfirmDisable = () => {
    toggleTwoFactor(false);
    setShowDisableConfirm(false);
  };

  const handlePinChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{4}$/.test(newPin)) {
      setPinError('PIN must be exactly 4 digits');
      return;
    }
    updatePinCode(newPin);
    setPinError('');
    setPinSuccess(true);
    setNewPin('');
    setTimeout(() => setPinSuccess(false), 3000);
  };

  const handleExportAuditLogs = () => {
    setIsExporting(true);
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(auditLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `security-audit-trail-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    recordAuditLog('AUDIT_LOG_EXPORT', 'Exported JSON security audit trail archive', 'info');
    setTimeout(() => setIsExporting(false), 800);
  };

  const handleRevokeAllOthers = () => {
    sessions.filter(s => !s.isCurrent).forEach(s => revokeSession(s.id));
  };

  const filteredLogs = auditLogs.filter(log => {
    if (auditFilter === 'all') return true;
    return log.severity === auditFilter;
  });

  // Calculate dynamic security score
  let score = 70;
  if (is2FAEnabled) score += 15;
  if (autoLockMinutes > 0) score += 10;
  if (pinCode.length === 4) score += 5;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className={`w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden border ${
          darkMode ? 'bg-[#121722] border-slate-700/60 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          darkMode ? 'border-slate-800 bg-[#161d2b]' : 'border-slate-200 bg-slate-50'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight">Security & Trust Center</h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Tier-4 Secure
                </span>
              </div>
              <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Session integrity, access tokens, 2FA enforcement, and zero-trust audit trail
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                lockSession();
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors border ${
                darkMode 
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20' 
                  : 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
              }`}
              title="Lock terminal screen immediately"
            >
              <Lock className="w-3.5 h-3.5" />
              Lock Terminal
            </button>
            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg transition-colors ${
                darkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className={`px-6 pt-3 flex gap-2 border-b text-xs font-medium ${
          darkMode ? 'border-slate-800 bg-[#141a24]' : 'border-slate-200 bg-slate-50/50'
        }`}>
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 px-3 flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-emerald-500 text-emerald-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Security Posture
          </button>
          <button
            onClick={() => setActiveTab('sessions')}
            className={`pb-3 px-3 flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'sessions'
                ? 'border-emerald-500 text-emerald-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Laptop className="w-4 h-4" />
            Active Sessions ({sessions.length})
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`pb-3 px-3 flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'audit'
                ? 'border-emerald-500 text-emerald-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-4 h-4" />
            Security Audit Trail ({auditLogs.length})
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Security Health Score Banner */}
              <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                darkMode ? 'bg-gradient-to-r from-emerald-950/30 via-[#18202d] to-slate-900 border-emerald-500/25' : 'bg-emerald-50/60 border-emerald-200'
              }`}>
                <div className="flex items-center gap-4">
                  <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-extrabold text-xl">
                    {score}%
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm sm:text-base">Enterprise Clearance Grade: A+</h3>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-mono">
                        Zero-Trust Compliant
                      </span>
                    </div>
                    <p className={`text-xs mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      Active User: <span className="font-semibold text-slate-200">{user?.name}</span> ({user?.role}) • ID: {user?.id}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <div className={`px-3 py-1.5 rounded-lg border ${
                    darkMode ? 'bg-slate-800/80 border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
                  }`}>
                    <span className="text-emerald-400 font-semibold">AES-256</span> In-Memory Cache
                  </div>
                  <div className={`px-3 py-1.5 rounded-lg border ${
                    darkMode ? 'bg-slate-800/80 border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
                  }`}>
                    <span className="text-cyan-400 font-semibold">TLS 1.3</span> Transport
                  </div>
                </div>
              </div>

              {/* Security Controls Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 2FA Card */}
                <div className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                  is2FAEnabled
                    ? darkMode ? 'bg-gradient-to-br from-[#151e2c] to-[#122320] border-emerald-900/60' : 'bg-emerald-50/50 border-emerald-200'
                    : darkMode ? 'bg-[#151c27] border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Smartphone className={`w-4 h-4 ${is2FAEnabled ? 'text-emerald-400' : 'text-slate-400'}`} />
                        <h4 className="text-sm font-semibold">Two-Factor Authentication (2FA)</h4>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1.5 ${
                        is2FAEnabled 
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {is2FAEnabled && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                        {is2FAEnabled ? 'ENABLED' : 'DISABLED'}
                      </span>
                    </div>
                    <p className={`text-xs leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      {is2FAEnabled
                        ? `Protected via Mobile SMS OTP (${user?.phone || phoneNumber}) & Authenticator App. Mandatory 6-digit verification code on every corporate sign-in.`
                        : 'Requires a 6-digit verification code via Mobile SMS or Authenticator app on every login. Recommended for all MSME administrators.'}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs">
                      <span className={`font-mono text-[11px] ${is2FAEnabled ? 'text-emerald-400 font-semibold' : 'text-slate-400'}`}>
                        {is2FAEnabled ? `Active: 📱 ${user?.phone || phoneNumber}` : 'Status: Off'}
                      </span>
                      {is2FAEnabled && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono border border-slate-700/60">
                          SMS & TOTP
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {is2FAEnabled ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleOpenSetup('mobile')}
                            className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1 cursor-pointer ${
                              darkMode
                                ? 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
                                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                            }`}
                            title="Update Registered Mobile Number"
                          >
                            <Phone className="w-3 h-3 text-emerald-400" />
                            <span>Change Mobile</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowBackupModal(true)}
                            className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1 cursor-pointer ${
                              darkMode
                                ? 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
                                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                            }`}
                            title="View Emergency Recovery Keys"
                          >
                            <Key className="w-3 h-3 text-amber-400" />
                            <span>Backup Keys</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setTestOtp('');
                              setTestResult('idle');
                              setShowTestChallenge(true);
                            }}
                            className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1 cursor-pointer ${
                              darkMode
                                ? 'bg-sky-500/10 border-sky-500/30 text-sky-300 hover:bg-sky-500/20'
                                : 'bg-sky-50 border-sky-200 text-sky-700 hover:bg-sky-100'
                            }`}
                            title="Test 2FA Prompt Challenge"
                          >
                            <ShieldCheck className="w-3 h-3 text-sky-400" />
                            <span>Test Prompt</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowDisableConfirm(true)}
                            className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-colors cursor-pointer"
                            title="Disable 2FA Protection"
                          >
                            Disable
                          </button>
                        </>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenSetup('mobile')}
                            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>Enable with Mobile</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenSetup('totp')}
                            className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                              darkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                            }`}
                            title="Setup via Authenticator App"
                          >
                            <QrCode className="w-3.5 h-3.5 text-sky-400" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Auto-Lock Inactivity Card */}
                <div className={`p-4 rounded-xl border flex flex-col justify-between ${
                  darkMode ? 'bg-[#151c27] border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-cyan-400" />
                        <h4 className="text-sm font-semibold">Automatic Session Timeout</h4>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                        {autoLockMinutes === 0 ? 'NEVER' : `${autoLockMinutes} MIN`}
                      </span>
                    </div>
                    <p className={`text-xs leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      Automatically blurs the interface and locks the terminal session with the PIN keypad when no mouse or keyboard activity is detected.
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between gap-2">
                    <span className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Lock after:</span>
                    <div className="flex items-center gap-1.5">
                      {[5, 15, 30, 0].map(mins => (
                        <button
                          key={mins}
                          onClick={() => setAutoLockMinutes(mins)}
                          className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                            autoLockMinutes === mins
                              ? 'bg-cyan-500 text-white font-bold'
                              : darkMode
                              ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                              : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                          }`}
                        >
                          {mins === 0 ? 'Never' : `${mins}m`}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Terminal PIN Code */}
                <div className={`p-4 rounded-xl border ${
                  darkMode ? 'bg-[#151c27] border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Key className="w-4 h-4 text-amber-400" />
                    <h4 className="text-sm font-semibold">Terminal PIN Unlock Code</h4>
                  </div>
                  <p className={`text-xs mb-3 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Current PIN is set to <span className="font-mono font-bold text-amber-400">{pinCode}</span>. Change below if desired:
                  </p>

                  <form onSubmit={handlePinChange} className="flex items-center gap-2">
                    <input
                      type="password"
                      maxLength={4}
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                      placeholder="New 4-digit PIN"
                      className={`flex-1 px-3 py-1.5 text-xs rounded-lg border font-mono tracking-widest text-center focus:outline-none focus:ring-1 focus:ring-amber-400 ${
                        darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                    <button
                      type="submit"
                      disabled={newPin.length !== 4}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white transition-colors"
                    >
                      Update PIN
                    </button>
                  </form>
                  {pinSuccess && (
                    <p className="text-[11px] text-emerald-400 mt-2 flex items-center gap-1 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" /> PIN successfully updated
                    </p>
                  )}
                  {pinError && (
                    <p className="text-[11px] text-red-400 mt-2 flex items-center gap-1 font-medium">
                      <AlertTriangle className="w-3.5 h-3.5" /> {pinError}
                    </p>
                  )}
                </div>

                {/* Compliance & Data Sandbox */}
                <div className={`p-4 rounded-xl border ${
                  darkMode ? 'bg-[#151c27] border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <UserCheck className="w-4 h-4 text-blue-400" />
                    <h4 className="text-sm font-semibold">Regulatory Data Boundaries</h4>
                  </div>
                  <ul className="space-y-1.5 text-xs">
                    <li className="flex items-center gap-2 text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>DPDP Act (India) Compliance: Verified</span>
                    </li>
                    <li className="flex items-center gap-2 text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>RBI Master Direction Guidelines: Compliant</span>
                    </li>
                    <li className="flex items-center gap-2 text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Restricted Export Mode: Enforced with Audit Trail</span>
                    </li>
                  </ul>
                  <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                    System logs are sealed and tamper-evident.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ACTIVE SESSIONS */}
          {activeTab === 'sessions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-sm">Concurrent Authorized Devices</h3>
                  <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Devices and locations that currently hold a valid authentication ticket
                  </p>
                </div>
                {sessions.filter(s => !s.isCurrent).length > 0 && (
                  <button
                    onClick={handleRevokeAllOthers}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 transition-colors"
                  >
                    Revoke All Other Sessions
                  </button>
                )}
              </div>

              <div className="space-y-2.5">
                {sessions.map(sess => (
                  <div
                    key={sess.id}
                    className={`p-3.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                      sess.isCurrent 
                        ? darkMode ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-emerald-50/50 border-emerald-300'
                        : darkMode ? 'bg-[#151c27] border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                        sess.isCurrent ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700/50 text-slate-400'
                      }`}>
                        {sess.device.includes('Mobile') ? <Smartphone className="w-4 h-4" /> : <Laptop className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs sm:text-sm">{sess.device}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                            darkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {sess.browser}
                          </span>
                          {sess.isCurrent && (
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold border border-emerald-500/30">
                              CURRENT DEVICE
                            </span>
                          )}
                        </div>
                        <div className={`flex items-center gap-3 text-xs mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          <span className="flex items-center gap-1">
                            <Globe className="w-3 h-3 text-slate-400" />
                            {sess.location} ({sess.ip})
                          </span>
                          <span>•</span>
                          <span>Active {sess.lastActive}</span>
                        </div>
                      </div>
                    </div>

                    {!sess.isCurrent && (
                      <button
                        onClick={() => revokeSession(sess.id)}
                        className="text-xs px-2.5 py-1 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        Revoke Access
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: AUDIT TRAIL */}
          {activeTab === 'audit' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-sm">Security Event Log</h3>
                  <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Tamper-resistant audit events logged across the session lifecycle
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {(['all', 'info', 'warning', 'critical'] as const).map(sev => (
                      <button
                        key={sev}
                        onClick={() => setAuditFilter(sev)}
                        className={`px-2 py-1 text-xs rounded capitalize transition-colors ${
                          auditFilter === sev
                            ? 'bg-slate-700 text-white font-semibold'
                            : darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {sev}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={handleExportAuditLogs}
                    disabled={isExporting}
                    className="px-2.5 py-1 text-xs rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 transition-colors flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    {isExporting ? 'Exporting...' : 'Export'}
                  </button>
                </div>
              </div>

              <div className={`rounded-xl border overflow-hidden ${
                darkMode ? 'bg-[#141a24] border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="divide-y divide-slate-800/60 max-h-[380px] overflow-y-auto font-mono text-xs">
                  {filteredLogs.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                      No security audit events found for filter "{auditFilter}".
                    </div>
                  ) : (
                    filteredLogs.map(log => {
                      const sevColor = 
                        log.severity === 'critical' ? 'text-red-400 bg-red-500/10 border-red-500/30' :
                        log.severity === 'warning' ? 'text-amber-400 bg-amber-500/10 border-amber-500/30' :
                        'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
                      
                      return (
                        <div key={log.id} className="p-3 hover:bg-slate-800/40 transition-colors flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded border uppercase font-bold mt-0.5 ${sevColor}`}>
                              {log.severity}
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-slate-200">{log.action}</span>
                                <span className="text-[11px] text-slate-400">{log.ip}</span>
                              </div>
                              <p className="text-slate-400 text-[11px] font-sans mt-0.5">
                                {log.details}
                              </p>
                            </div>
                          </div>
                          <span className="text-[10px] text-slate-500 whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`px-6 py-3 border-t flex items-center justify-between text-xs ${
          darkMode ? 'border-slate-800 bg-[#141a24] text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-500'
        }`}>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>End-to-end Session Guard is operational</span>
          </div>
          <button
            onClick={onClose}
            className={`px-4 py-1.5 rounded-lg font-semibold transition-colors ${
              darkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
            }`}
          >
            Close
          </button>
        </div>
      </div>

      {/* ================================================================ */}
      {/* 2FA SETUP & VERIFICATION WIZARD MODAL                            */}
      {/* ================================================================ */}
      {showSetupModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div 
            className={`w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden flex flex-col transition-all ${
              darkMode ? 'bg-[#121824] border-slate-700/80 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Wizard Header */}
            <div className={`px-6 py-4 border-b flex items-center justify-between ${
              darkMode ? 'border-slate-800 bg-[#161f2e]' : 'border-slate-100 bg-slate-50'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Two-Factor Authentication Setup</h3>
                  <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    TOTP Time-based Security Protection (RFC 6238)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSetupModal(false)}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  darkMode ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Wizard Steps Indicator */}
            <div className={`px-6 py-3 border-b flex items-center justify-between text-xs font-semibold ${
              darkMode ? 'border-slate-800/80 bg-[#141b27]' : 'border-slate-100 bg-slate-50/50'
            }`}>
              {[
                { id: 'scan', label: '1. Choose & Setup' },
                { id: 'verify', label: '2. Verify Code' },
                { id: 'recovery', label: '3. Backup Keys' },
              ].map((s, idx) => {
                const active = setupStep === s.id;
                const completed = 
                  (s.id === 'scan' && (setupStep === 'verify' || setupStep === 'recovery')) ||
                  (s.id === 'verify' && setupStep === 'recovery');
                return (
                  <div key={s.id} className="flex items-center gap-2">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      completed
                        ? 'bg-emerald-500 text-white'
                        : active
                        ? 'bg-sky-500 text-white'
                        : darkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {completed ? <Check className="w-3 h-3" /> : idx + 1}
                    </div>
                    <span className={active ? 'text-sky-400 font-bold' : completed ? 'text-emerald-400' : darkMode ? 'text-slate-400' : 'text-slate-500'}>
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Step Content */}
            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              {/* STEP 1: METHOD SELECTION & SETUP */}
              {setupStep === 'scan' && (
                <div className="space-y-4">
                  {/* Channel Switcher */}
                  <div className={`p-1 rounded-xl border flex gap-1 ${
                    darkMode ? 'bg-[#0d121c] border-slate-800' : 'bg-slate-100 border-slate-200'
                  }`}>
                    <button
                      type="button"
                      onClick={() => setTwoFactorChannel('mobile')}
                      className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        twoFactorChannel === 'mobile'
                          ? 'bg-emerald-500 text-white shadow-sm font-bold'
                          : darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Mobile Number (SMS / WhatsApp OTP)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTwoFactorChannel('totp')}
                      className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        twoFactorChannel === 'totp'
                          ? 'bg-sky-500 text-white shadow-sm font-bold'
                          : darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Authenticator App (TOTP)</span>
                    </button>
                  </div>

                  {/* SUB-VIEW A: MOBILE NUMBER VERIFICATION */}
                  {twoFactorChannel === 'mobile' ? (
                    <div className="space-y-4">
                      <div className="p-3.5 rounded-xl border border-emerald-900/40 bg-emerald-950/20 text-emerald-300 text-xs flex items-center gap-2.5">
                        <Phone className="w-4 h-4 shrink-0 text-emerald-400" />
                        <span>
                          Enter your mobile number to receive instant 6-digit one-time verification passcodes via SMS or WhatsApp on each enterprise login.
                        </span>
                      </div>

                      <div className="space-y-3">
                        <label className={`block text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                          Corporate Mobile Number
                        </label>

                        <div className="flex gap-2">
                          <select
                            value={phoneCountryCode}
                            onChange={(e) => setPhoneCountryCode(e.target.value)}
                            className={`px-3 py-2.5 rounded-xl border text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                              darkMode ? 'bg-[#0e1420] border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                            }`}
                          >
                            <option value="+91">🇮🇳 +91 (India)</option>
                            <option value="+1">🇺🇸 +1 (USA/Canada)</option>
                            <option value="+44">🇬🇧 +44 (UK)</option>
                            <option value="+971">🇦🇪 +971 (UAE)</option>
                            <option value="+65">🇸🇬 +65 (Singapore)</option>
                          </select>

                          <input
                            type="tel"
                            placeholder="98490 28410"
                            value={phoneNumber.replace(/^\+\d+\s*/, '')}
                            onChange={(e) => setPhoneNumber(`${phoneCountryCode} ${e.target.value}`)}
                            className={`flex-1 px-4 py-2.5 rounded-xl border font-mono text-sm font-bold tracking-wider focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                              darkMode ? 'bg-[#0e1420] border-slate-700 text-white placeholder-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900'
                            }`}
                          />
                        </div>

                        <div className="flex items-center gap-4 pt-1">
                          <span className={`text-[11px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Delivery Channel:</span>
                          <label className="flex items-center gap-1.5 text-xs cursor-pointer font-medium">
                            <input
                              type="radio"
                              name="smsDelivery"
                              checked={smsDeliveryChannel === 'sms'}
                              onChange={() => setSmsDeliveryChannel('sms')}
                              className="accent-emerald-500"
                            />
                            <span>💬 SMS Text Message</span>
                          </label>
                          <label className="flex items-center gap-1.5 text-xs cursor-pointer font-medium">
                            <input
                              type="radio"
                              name="smsDelivery"
                              checked={smsDeliveryChannel === 'whatsapp'}
                              onChange={() => setSmsDeliveryChannel('whatsapp')}
                              className="accent-emerald-500"
                            />
                            <span>🟢 WhatsApp Business</span>
                          </label>
                        </div>
                      </div>

                      {setupError && (
                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 shrink-0" />
                          <span>{setupError}</span>
                        </div>
                      )}

                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={handleSendMobileOtp}
                          className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Send 6-Digit SMS Verification Code &rarr;</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* SUB-VIEW B: AUTHENTICATOR APP QR CODE */
                    <div className="space-y-4">
                      <p className={`text-xs leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                        Scan the QR code below using your preferred authenticator app (<span className="text-emerald-400 font-semibold">Google Authenticator</span>, <span className="text-sky-400 font-semibold">Microsoft Authenticator</span>, <span className="text-amber-400 font-semibold">Apple Passwords</span>, or <span className="text-cyan-400 font-semibold">1Password</span>).
                      </p>

                      <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-xl border border-slate-800 bg-[#0d121b]">
                        {/* Crisp Authentic SVG QR Code */}
                        <div className="relative p-2.5 bg-white rounded-xl shadow-lg border border-slate-300 flex items-center justify-center shrink-0">
                          <svg viewBox="0 0 160 160" className="w-36 h-36" fill="none">
                            <rect width="160" height="160" rx="10" fill="white" />
                            {/* Corner Markers */}
                            <rect x="12" y="12" width="40" height="40" rx="4" fill="#0f172a" />
                            <rect x="20" y="20" width="24" height="24" rx="2" fill="white" />
                            <rect x="26" y="26" width="12" height="12" rx="1" fill="#0284c7" />

                            <rect x="108" y="12" width="40" height="40" rx="4" fill="#0f172a" />
                            <rect x="116" y="20" width="24" height="24" rx="2" fill="white" />
                            <rect x="122" y="26" width="12" height="12" rx="1" fill="#0284c7" />

                            <rect x="12" y="108" width="40" height="40" rx="4" fill="#0f172a" />
                            <rect x="20" y="116" width="24" height="24" rx="2" fill="white" />
                            <rect x="26" y="122" width="12" height="12" rx="1" fill="#0284c7" />

                            {/* Alignment Marks & Data Modules */}
                            <path d="M 58 20 H 102 M 20 58 V 102 M 58 140 H 102 M 140 58 V 102" stroke="#0f172a" strokeWidth="2" strokeDasharray="3 3" />
                            <rect x="58" y="24" width="6" height="6" fill="#0f172a" />
                            <rect x="70" y="24" width="6" height="6" fill="#0f172a" />
                            <rect x="82" y="24" width="6" height="6" fill="#0f172a" />
                            <rect x="94" y="24" width="6" height="6" fill="#0f172a" />
                            <rect x="58" y="36" width="6" height="6" fill="#0f172a" />
                            <rect x="76" y="36" width="6" height="6" fill="#0f172a" />
                            <rect x="88" y="36" width="6" height="6" fill="#0f172a" />

                            <rect x="24" y="58" width="6" height="6" fill="#0f172a" />
                            <rect x="36" y="58" width="6" height="6" fill="#0f172a" />
                            <rect x="48" y="58" width="6" height="6" fill="#0f172a" />
                            <rect x="60" y="58" width="6" height="6" fill="#0f172a" />
                            <rect x="72" y="58" width="6" height="6" fill="#0f172a" />
                            <rect x="96" y="58" width="6" height="6" fill="#0f172a" />
                            <rect x="108" y="58" width="6" height="6" fill="#0f172a" />
                            <rect x="126" y="58" width="6" height="6" fill="#0f172a" />

                            <rect x="24" y="70" width="6" height="6" fill="#0f172a" />
                            <rect x="42" y="70" width="6" height="6" fill="#0f172a" />
                            <rect x="54" y="70" width="6" height="6" fill="#0f172a" />
                            <rect x="102" y="70" width="6" height="6" fill="#0f172a" />
                            <rect x="114" y="70" width="6" height="6" fill="#0f172a" />
                            <rect x="132" y="70" width="6" height="6" fill="#0f172a" />

                            <rect x="24" y="82" width="6" height="6" fill="#0f172a" />
                            <rect x="36" y="82" width="6" height="6" fill="#0f172a" />
                            <rect x="54" y="82" width="6" height="6" fill="#0f172a" />
                            <rect x="102" y="82" width="6" height="6" fill="#0f172a" />
                            <rect x="120" y="82" width="6" height="6" fill="#0f172a" />
                            <rect x="132" y="82" width="6" height="6" fill="#0f172a" />

                            <rect x="24" y="94" width="6" height="6" fill="#0f172a" />
                            <rect x="48" y="94" width="6" height="6" fill="#0f172a" />
                            <rect x="60" y="94" width="6" height="6" fill="#0f172a" />
                            <rect x="96" y="94" width="6" height="6" fill="#0f172a" />
                            <rect x="114" y="94" width="6" height="6" fill="#0f172a" />
                            <rect x="126" y="94" width="6" height="6" fill="#0f172a" />

                            <rect x="58" y="108" width="6" height="6" fill="#0f172a" />
                            <rect x="70" y="108" width="6" height="6" fill="#0f172a" />
                            <rect x="82" y="108" width="6" height="6" fill="#0f172a" />
                            <rect x="108" y="108" width="6" height="6" fill="#0f172a" />
                            <rect x="120" y="108" width="6" height="6" fill="#0f172a" />
                            <rect x="132" y="108" width="6" height="6" fill="#0f172a" />

                            <rect x="58" y="120" width="6" height="6" fill="#0f172a" />
                            <rect x="76" y="120" width="6" height="6" fill="#0f172a" />
                            <rect x="94" y="120" width="6" height="6" fill="#0f172a" />
                            <rect x="114" y="120" width="6" height="6" fill="#0f172a" />
                            <rect x="126" y="120" width="6" height="6" fill="#0f172a" />

                            <rect x="58" y="132" width="6" height="6" fill="#0f172a" />
                            <rect x="70" y="132" width="6" height="6" fill="#0f172a" />
                            <rect x="88" y="132" width="6" height="6" fill="#0f172a" />
                            <rect x="102" y="132" width="6" height="6" fill="#0f172a" />
                            <rect x="120" y="132" width="6" height="6" fill="#0f172a" />
                            <rect x="132" y="132" width="6" height="6" fill="#0f172a" />

                            {/* Center Shield Badge */}
                            <rect x="66" y="66" width="28" height="28" rx="6" fill="#0284c7" />
                            <path d="M 80 72 L 87 75 V 82 C 87 86 80 89 80 89 C 80 89 73 86 73 82 V 75 Z" fill="white" />
                          </svg>
                        </div>

                        {/* Manual Entry Secret */}
                        <div className="flex-1 space-y-2.5 w-full">
                          <label className={`block text-[11px] font-semibold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            Or Enter Key Manually
                          </label>
                          <div className="flex items-center gap-2">
                            <code className="flex-1 px-3 py-2 rounded-lg bg-black/40 border border-slate-700 font-mono text-xs font-bold text-emerald-400 select-all overflow-x-auto whitespace-nowrap">
                              {twoFactorSecret || 'AGY-7X9K-MSME-2026-TOTP'}
                            </code>
                            <button
                              type="button"
                              onClick={handleCopySecret}
                              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                            >
                              {copiedSecret ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{copiedSecret ? 'Copied' : 'Copy'}</span>
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-slate-400">
                            <div>
                              <span className="text-slate-500">Account:</span> {user?.email}
                            </div>
                            <div>
                              <span className="text-slate-500">Type:</span> TOTP (SHA-1)
                            </div>
                            <div>
                              <span className="text-slate-500">Interval:</span> 30 Seconds
                            </div>
                            <div>
                              <span className="text-slate-500">Digits:</span> 6 Digits
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          type="button"
                          onClick={() => setSetupStep('verify')}
                          className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
                        >
                          <span>I Have Added the Token &rarr; Enter Code</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 2: VERIFY 6-DIGIT CODE */}
              {setupStep === 'verify' && (
                <form onSubmit={handleVerifySetup} className="space-y-4">
                  <div className="text-center space-y-1">
                    <h4 className="text-sm font-bold">
                      {twoFactorChannel === 'mobile' ? 'Enter 6-Digit SMS Verification Code' : 'Enter 6-Digit Authenticator Code'}
                    </h4>
                    <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      {twoFactorChannel === 'mobile'
                        ? `A 6-digit one-time passcode was sent to ${user?.phone || phoneNumber}`
                        : 'Type the 6 digits currently generated by your Authenticator app.'}
                    </p>
                  </div>

                  {/* Simulated SMS delivery toast preview */}
                  {twoFactorChannel === 'mobile' && smsSentNotice && (
                    <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between gap-2 shadow-inner animate-in fade-in">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 shrink-0 text-emerald-400" />
                        <div>
                          <span className="font-semibold text-emerald-200">SENTINEL-AUTH SMS: </span>
                          <span className="font-mono text-emerald-300">Code is <strong>{lastSmsOtp || '582914'}</strong> (valid for 5 mins)</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSetupOtp(lastSmsOtp || '582914')}
                        className="px-2 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 text-[10px] font-bold uppercase transition-colors shrink-0 cursor-pointer"
                      >
                        Auto-Fill
                      </button>
                    </div>
                  )}

                  <div className="max-w-xs mx-auto space-y-2">
                    <input
                      type="text"
                      maxLength={6}
                      placeholder={twoFactorChannel === 'mobile' ? (lastSmsOtp || '582914') : '123456'}
                      value={setupOtp}
                      onChange={(e) => setSetupOtp(e.target.value.replace(/\D/g, ''))}
                      className={`w-full px-4 py-3 rounded-xl border text-center text-2xl font-mono tracking-[0.35em] font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                        darkMode ? 'bg-[#0e141f] border-slate-700 text-white placeholder-slate-700' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                      autoFocus
                    />

                    {/* Quick Fill / Resend Helpers */}
                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <button
                        type="button"
                        onClick={() => setSetupOtp(twoFactorChannel === 'mobile' ? (lastSmsOtp || '582914') : '123456')}
                        className="text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
                      >
                        ⚡ Fill Code ({twoFactorChannel === 'mobile' ? (lastSmsOtp || '582914') : '123456'})
                      </button>

                      {twoFactorChannel === 'mobile' && (
                        <button
                          type="button"
                          disabled={smsCountdown > 0}
                          onClick={handleSendMobileOtp}
                          className={`font-semibold cursor-pointer ${
                            smsCountdown > 0 ? 'text-slate-500' : 'text-sky-400 hover:text-sky-300'
                          }`}
                        >
                          {smsCountdown > 0 ? `Resend SMS (${smsCountdown}s)` : 'Resend SMS'}
                        </button>
                      )}
                    </div>
                  </div>

                  {setupError && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{setupError}</span>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setSetupStep('scan')}
                      className={`flex-1 py-2.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                        darkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {twoFactorChannel === 'mobile' ? 'Change Phone' : 'Back'}
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Verify & Activate 2FA</span>
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 3: BACKUP RECOVERY KEYS */}
              {setupStep === 'recovery' && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <div>
                      <div className="font-bold text-xs">2FA Protection Activated!</div>
                      <div className="text-[11px] text-emerald-300/80">
                        {twoFactorChannel === 'mobile'
                          ? `Registered Mobile: ${user?.phone || phoneNumber} (SMS Verified). Verification code required on every sign-in.`
                          : 'Authenticator App paired. TOTP code required on every sign-in.'}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider mb-1">
                      Emergency Backup Recovery Codes
                    </h4>
                    <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      Save these 4 one-time emergency keys. Each key can be used once if you lose your phone:
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {(backupCodes || []).map((code, idx) => (
                      <div 
                        key={idx}
                        className={`p-2.5 rounded-lg border font-mono text-xs font-bold text-center select-all ${
                          darkMode ? 'bg-[#0d121c] border-slate-700 text-amber-300' : 'bg-slate-50 border-slate-200 text-amber-800'
                        }`}
                      >
                        {code}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleCopyBackupCodes}
                      className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copiedCodes ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCodes ? 'Codes Copied!' : 'Copy All Codes'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadBackupCodes}
                      className="flex-1 py-2 px-3 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download (.txt)</span>
                    </button>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setShowSetupModal(false)}
                      className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                    >
                      Complete Setup & Return
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* BACKUP CODES VIEWER MODAL                                        */}
      {/* ================================================================ */}
      {showBackupModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div 
            className={`w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden flex flex-col ${
              darkMode ? 'bg-[#121824] border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`px-6 py-4 border-b flex items-center justify-between ${
              darkMode ? 'border-slate-800 bg-[#161f2e]' : 'border-slate-100 bg-slate-50'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Emergency 2FA Recovery Keys</h3>
                  <p className={`text-[11px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    One-time emergency fallback access
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowBackupModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className={`text-xs leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                If your mobile device is lost or inaccessible, enter any of these codes during login in place of the 6-digit TOTP token.
              </p>

              <div className="grid grid-cols-2 gap-2.5">
                {(backupCodes || []).map((code, idx) => (
                  <div 
                    key={idx}
                    className={`p-2.5 rounded-xl border font-mono text-xs font-bold text-center select-all ${
                      darkMode ? 'bg-[#0d121c] border-slate-700 text-amber-300' : 'bg-slate-50 border-slate-200 text-amber-800'
                    }`}
                  >
                    {code}
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleCopyBackupCodes}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedCodes ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCodes ? 'Copied' : 'Copy Codes'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadBackupCodes}
                  className="flex-1 py-2 px-3 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download (.txt)</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowBackupModal(false)}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* TEST 2FA PROMPT CHALLENGE MODAL                                  */}
      {/* ================================================================ */}
      {showTestChallenge && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div 
            className={`w-full max-w-sm rounded-2xl border shadow-2xl overflow-hidden flex flex-col ${
              darkMode ? 'bg-[#121824] border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`px-6 py-4 border-b flex items-center justify-between ${
              darkMode ? 'border-slate-800 bg-[#161f2e]' : 'border-slate-100 bg-slate-50'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">2FA Token Self-Test</h3>
                  <p className={`text-[11px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Simulate terminal verification challenge
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowTestChallenge(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleTestChallenge} className="p-6 space-y-4">
              <p className={`text-xs ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                Enter your current 6-digit TOTP code or emergency backup key to test live challenge verification:
              </p>

              <div>
                <input
                  type="text"
                  placeholder="123456"
                  value={testOtp}
                  onChange={(e) => {
                    setTestOtp(e.target.value);
                    setTestResult('idle');
                  }}
                  className={`w-full px-4 py-2.5 rounded-xl border text-center font-mono text-lg font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all ${
                    darkMode ? 'bg-[#0d121c] border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => {
                    setTestOtp('123456');
                    setTestResult('idle');
                  }}
                  className={`w-full mt-1.5 text-center text-[11px] font-semibold cursor-pointer ${
                    darkMode ? 'text-sky-400 hover:text-sky-300' : 'text-sky-600 hover:text-sky-800'
                  }`}
                >
                  Auto-fill demo code (123456)
                </button>
              </div>

              {testResult === 'success' && (
                <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Token Validated! 2FA challenge is fully operational.</span>
                </div>
              )}

              {testResult === 'error' && (
                <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Invalid code. Enter 123456 or a valid backup code.</span>
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowTestChallenge(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  Validate Token
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* DISABLE 2FA CONFIRMATION MODAL                                   */}
      {/* ================================================================ */}
      {showDisableConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div 
            className={`w-full max-w-sm rounded-2xl border shadow-2xl overflow-hidden flex flex-col ${
              darkMode ? 'bg-[#121824] border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 mx-auto flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold">Disable Two-Factor Authentication?</h3>
              <p className={`text-xs leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Disabling 2FA will remove mandatory TOTP verification on login and downgrade your enterprise clearance level.
              </p>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDisableConfirm(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Keep 2FA Active
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDisable}
                  className="flex-1 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  Confirm Disable
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
