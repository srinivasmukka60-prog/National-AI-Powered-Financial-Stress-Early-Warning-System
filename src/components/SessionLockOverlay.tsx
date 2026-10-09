import React, { useState } from 'react';
import { Lock, Unlock, KeyRound, LogOut, ShieldAlert, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface SessionLockOverlayProps {
  darkMode?: boolean;
}

export const SessionLockOverlay: React.FC<SessionLockOverlayProps> = ({ darkMode = true }) => {
  const { isLocked, user, unlockSession, logout, pinCode } = useAuth();
  const { t } = useLanguage();
  const [pinInput, setPinInput] = useState('');
  const [errorShake, setErrorShake] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isLocked) return null;

  const handleUnlock = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);
    const success = unlockSession(pinInput);
    if (success) {
      setPinInput('');
      setErrorMsg(null);
    } else {
      setErrorShake(true);
      setErrorMsg(`Incorrect PIN. Default Demo PIN is: ${pinCode}`);
      setTimeout(() => setErrorShake(false), 500);
    }
  };

  const handlePadPress = (num: string) => {
    if (pinInput.length < 8) {
      const updated = pinInput + num;
      setPinInput(updated);
      setErrorMsg(null);
      // Auto-unlock when reaching 4 digits if matches
      if (updated === pinCode) {
        unlockSession(updated);
        setPinInput('');
      }
    }
  };

  const handleBackspace = () => {
    setPinInput((prev) => prev.slice(0, -1));
    setErrorMsg(null);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0a0d14]/90 backdrop-blur-xl animate-in fade-in duration-300">
      <div
        className={`w-full max-w-sm rounded-3xl border shadow-2xl p-6 md:p-8 flex flex-col items-center text-center transition-all ${
          errorShake ? 'animate-bounce' : ''
        } ${
          darkMode
            ? 'bg-[#141a24] border-slate-800 text-slate-100 shadow-black/80'
            : 'bg-white border-slate-200 text-slate-900 shadow-xl'
        }`}
      >
        {/* User Avatar with Secure Badge */}
        <div className="relative mb-4">
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-20 h-20 rounded-full object-cover border-2 border-sky-500 shadow-lg"
          />
          <div className="w-7 h-7 rounded-full bg-slate-900 border border-slate-700 text-amber-400 absolute bottom-0 right-0 flex items-center justify-center shadow">
            <Lock className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* User Identity */}
        <h3 className="text-lg font-bold tracking-tight text-slate-100">{user.name}</h3>
        <p className={`text-xs mt-0.5 font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          {user.role}
        </p>
        <span className="text-[10px] mt-1 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-sky-950/40 text-sky-300 border border-sky-800/40">
          {t('Terminal Session Locked')}
        </span>

        {/* PIN Entry Display */}
        <form onSubmit={handleUnlock} className="w-full mt-6 space-y-4">
          <div className="space-y-2">
            <div className="flex justify-center items-center gap-2.5 h-8">
              {[0, 1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                    idx < pinInput.length
                      ? 'bg-sky-400 scale-110 shadow-sm shadow-sky-400/50'
                      : darkMode ? 'bg-slate-700 border border-slate-600' : 'bg-slate-200 border border-slate-300'
                  }`}
                />
              ))}
            </div>

            <input
              type="password"
              inputMode="numeric"
              placeholder={t('Enter PIN...', 'Enter PIN...')}
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              className="sr-only"
              autoFocus
            />
          </div>

          {errorMsg && (
            <div className="text-[11px] text-rose-400 font-medium flex items-center justify-center gap-1.5 animate-in fade-in">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Touch / Clickable Numeric Keypad */}
          <div className="grid grid-cols-3 gap-2.5 pt-2 max-w-[240px] mx-auto">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => handlePadPress(digit)}
                className={`h-11 rounded-xl text-base font-bold font-mono transition-all cursor-pointer border active:scale-95 ${
                  darkMode
                    ? 'bg-[#1a2230] hover:bg-[#222c3c] border-slate-700/80 text-slate-100'
                    : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800'
                }`}
              >
                {digit}
              </button>
            ))}
            <button
              type="button"
              onClick={handleBackspace}
              className={`h-11 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center justify-center active:scale-95 ${
                darkMode
                  ? 'bg-[#1a2230] hover:bg-[#222c3c] border-slate-700/80 text-slate-400'
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-600'
              }`}
            >
              DEL
            </button>
            <button
              type="button"
              onClick={() => handlePadPress('0')}
              className={`h-11 rounded-xl text-base font-bold font-mono transition-all cursor-pointer border active:scale-95 ${
                darkMode
                  ? 'bg-[#1a2230] hover:bg-[#222c3c] border-slate-700/80 text-slate-100'
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800'
              }`}
            >
              0
            </button>
            <button
              type="submit"
              className="h-11 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white transition-all cursor-pointer flex items-center justify-center shadow-md active:scale-95"
            >
              <Unlock className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Demo Helper Hint */}
          <div className="pt-2 text-[11px] text-slate-400">
            <span>Demo PIN: </span>
            <button
              type="button"
              onClick={() => {
                setPinInput(pinCode);
                unlockSession(pinCode);
              }}
              className="font-mono text-sky-400 font-bold hover:underline cursor-pointer"
            >
              {pinCode} ({t('Click to Unlock', 'Click to Unlock')})
            </button>
          </div>
        </form>

        {/* Bottom Actions */}
        <div className="mt-6 pt-4 border-t border-slate-800 w-full flex items-center justify-between text-xs">
          <button
            onClick={logout}
            className="text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{t('Switch / Sign Out')}</span>
          </button>

          <span className="text-[10px] text-slate-500">
            {t('Protected by Sentinel Shield')}
          </span>
        </div>
      </div>
    </div>
  );
};
