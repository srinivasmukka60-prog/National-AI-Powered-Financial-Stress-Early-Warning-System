import React, { useState } from 'react';
import {
  Download,
  X,
  Monitor,
  Smartphone,
  Copy,
  Check,
  Globe,
  Sparkles,
  QrCode,
  Share2,
  ShieldCheck,
  Terminal,
  ExternalLink,
  ChevronRight,
  Info,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import {
  downloadWindowsShortcut,
  downloadWindowsBatchLauncher,
  downloadMobileShortcutHtml,
  shareToMobileDevice,
  promptPWAInstall,
  getInstallPrompt,
} from '../utils/appShortcut';

interface InstallShortcutModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode?: boolean;
}

export const InstallShortcutModal: React.FC<InstallShortcutModalProps> = ({
  isOpen,
  onClose,
  darkMode = true,
}) => {
  const { t } = useLanguage();
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [pwaInstalled, setPwaInstalled] = useState<boolean>(false);
  const [activePlatform, setActivePlatform] = useState<'all' | 'windows' | 'mobile' | 'pwa'>('mobile');

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'http://localhost:3000/';
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=8&data=${encodeURIComponent(currentUrl)}`;

  const handleDownloadWindowsShortcut = () => {
    downloadWindowsShortcut(currentUrl, 'SME-Sentinel-Early-Warning.url');
    setDownloadSuccess(t('install_app_success', 'Shortcut downloaded! Move to Desktop for 1-click launch.'));
    setTimeout(() => setDownloadSuccess(null), 4000);
  };

  const handleDownloadMobileBookmark = () => {
    downloadMobileShortcutHtml(currentUrl, 'SME-Sentinel-Mobile.html');
    setDownloadSuccess('Mobile shortcut downloaded! Transfer or open on your phone for full-screen access.');
    setTimeout(() => setDownloadSuccess(null), 4000);
  };

  const handleDownloadBatch = () => {
    downloadWindowsBatchLauncher(currentUrl, 'Launch-SME-Sentinel.bat');
    setDownloadSuccess('Launcher script downloaded! Double click to launch.');
    setTimeout(() => setDownloadSuccess(null), 4000);
  };

  const handleShareMobile = async () => {
    const shared = await shareToMobileDevice(currentUrl);
    if (!shared) {
      handleCopyLink();
    }
  };

  const handlePWAInstall = async () => {
    const installed = await promptPWAInstall();
    if (installed) {
      setPwaInstalled(true);
      setDownloadSuccess('SME-Sentinel installed successfully as an application!');
      setTimeout(() => setDownloadSuccess(null), 4000);
    } else {
      handleDownloadWindowsShortcut();
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const canPromptPwa = Boolean(getInstallPrompt());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[92vh] transition-all ${
          darkMode
            ? 'bg-[#0f141c] border-slate-800 text-white'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between bg-gradient-to-r from-sky-500/10 via-transparent to-indigo-500/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 via-indigo-600 to-sky-700 flex items-center justify-center shadow-lg shadow-sky-500/20 text-white">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base flex items-center gap-2">
                {t('download_app_shortcut', 'Download App Shortcut')}
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Mobile, Desktop & PWA
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                SME-SENTINEL AI Early Warning System
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Alert Banner */}
        {downloadSuccess && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in slide-in-from-top-2">
            <Check className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{downloadSuccess}</span>
          </div>
        )}

        {/* Platform Selection Tabs */}
        <div className={`flex border-b px-5 gap-2 pt-3 ${darkMode ? 'border-slate-800 bg-[#0c1017]' : 'border-slate-200 bg-slate-50'}`}>
          {[
            { id: 'mobile', label: 'Mobile Phone (iOS / Android)', icon: Smartphone, badge: 'Popular' },
            { id: 'windows', label: 'Windows Desktop (.URL)', icon: Monitor },
            { id: 'pwa', label: 'Standalone Web App (PWA)', icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activePlatform === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActivePlatform(tab.id as any)}
                className={`flex items-center gap-2 py-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  isActive
                    ? 'border-sky-400 text-sky-400'
                    : darkMode
                    ? 'border-transparent text-slate-400 hover:text-slate-200'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 font-bold hidden sm:inline">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* TAB 1: MOBILE PHONE INSTALLATION (Primary requested feature) */}
          {activePlatform === 'mobile' && (
            <div className="space-y-4 animate-in fade-in">
              <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-gradient-to-br from-[#121927] to-[#0e131d] border-sky-500/30' : 'bg-sky-50/70 border-sky-200'}`}>
                <div className="flex flex-col sm:flex-row items-center gap-5">
                  {/* Real Live QR Code Box */}
                  <div className="relative shrink-0 p-2.5 rounded-2xl bg-white shadow-xl flex flex-col items-center justify-center">
                    <img
                      src={qrCodeUrl}
                      alt="Scan QR code with mobile phone"
                      className="w-36 h-36 rounded-lg object-contain"
                    />
                    <span className="text-[10px] font-bold text-slate-900 mt-1 flex items-center gap-1">
                      <QrCode className="w-3 h-3 text-sky-600" />
                      Scan with Phone Camera
                    </span>
                  </div>

                  {/* Mobile Instructions & Quick Actions */}
                  <div className="space-y-2.5 flex-1 text-center sm:text-left">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30">
                        Instant Mobile Launch
                      </span>
                      <h4 className="text-sm font-bold mt-1 text-white">
                        {t('install_mobile_btn', 'Download & Install on Mobile Phone')}
                      </h4>
                      <p className={`text-xs mt-1 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                        {t('scan_qr_desc', 'Scan this QR code with your phone camera to launch & install SME-Sentinel instantly.')}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                      <button
                        onClick={handleShareMobile}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold transition-all shadow-md shadow-sky-500/20 cursor-pointer"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>{t('share_to_phone_btn', 'Send Link to Phone')}</span>
                      </button>

                      <button
                        onClick={handleDownloadMobileBookmark}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          darkMode
                            ? 'border-slate-700 bg-slate-800 text-slate-200 hover:border-slate-600'
                            : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Mobile Bookmark (.html)</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step-by-step Mobile Install Instructions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Android Guide */}
                <div className={`p-3.5 rounded-xl border ${darkMode ? 'bg-[#131822] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-center gap-2 mb-2 font-bold text-xs text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Android (Google Chrome)
                  </div>
                  <ol className="text-[11px] text-slate-300 space-y-1.5 list-decimal list-inside leading-relaxed">
                    <li>Scan QR code or open link in Chrome.</li>
                    <li>Tap the <strong>⋮ (three dots)</strong> menu in top-right.</li>
                    <li>Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</li>
                    <li>App icon appears on your phone screen!</li>
                  </ol>
                </div>

                {/* iPhone Guide */}
                <div className={`p-3.5 rounded-xl border ${darkMode ? 'bg-[#131822] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-center gap-2 mb-2 font-bold text-xs text-sky-400">
                    <span className="w-2 h-2 rounded-full bg-sky-400" />
                    iPhone & iPad (Safari)
                  </div>
                  <ol className="text-[11px] text-slate-300 space-y-1.5 list-decimal list-inside leading-relaxed">
                    <li>Open your camera and scan the QR code.</li>
                    <li>In Safari, tap the <strong>Share button</strong> (box with arrow).</li>
                    <li>Scroll down and tap <strong>"Add to Home Screen" ➕</strong>.</li>
                    <li>Tap <strong>Add</strong> to use full-screen anytime.</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: WINDOWS DESKTOP SHORTCUT */}
          {activePlatform === 'windows' && (
            <div className="space-y-3.5 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Windows .URL */}
                <button
                  onClick={handleDownloadWindowsShortcut}
                  className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all hover:scale-[1.02] cursor-pointer group ${
                    darkMode
                      ? 'bg-gradient-to-br from-[#162030] to-[#121924] border-sky-500/40 hover:border-sky-400 hover:shadow-lg hover:shadow-sky-500/10'
                      : 'bg-sky-50 border-sky-200 hover:border-sky-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center group-hover:bg-sky-500 group-hover:text-white transition-colors">
                      <Monitor className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-500/10 text-sky-400">
                      .URL SHORTCUT
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-sky-300 transition-colors">
                      {t('desktop_shortcut_btn', 'Download Windows Shortcut')}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {t('desktop_shortcut_hint', 'Double-click to launch SME-Sentinel instantly.')}
                    </p>
                  </div>
                </button>

                {/* Batch Launcher */}
                <button
                  onClick={handleDownloadBatch}
                  className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all hover:scale-[1.02] cursor-pointer group ${
                    darkMode
                      ? 'bg-gradient-to-br from-[#1c1a30] to-[#141426] border-indigo-500/40 hover:border-indigo-400 hover:shadow-lg hover:shadow-indigo-500/10'
                      : 'bg-indigo-50 border-indigo-200 hover:border-indigo-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                      <Terminal className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400">
                      .BAT LAUNCHER
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {t('batch_launcher_btn', 'Download Quick Launcher (.bat)')}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1">
                      1-click Windows terminal quick launcher script.
                    </p>
                  </div>
                </button>
              </div>

              <div className={`p-3 rounded-xl border text-xs text-slate-400 ${darkMode ? 'bg-[#111621] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <strong>How to use on Windows:</strong> After downloading, move the <code>SME-Sentinel-Early-Warning.url</code> file to your Desktop. Double-clicking it launches SME-Sentinel directly in your default browser.
              </div>
            </div>
          )}

          {/* TAB 3: STANDALONE PWA WEB APP */}
          {activePlatform === 'pwa' && (
            <div className="space-y-3.5 animate-in fade-in">
              <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
                darkMode ? 'bg-gradient-to-br from-[#161a29] to-[#101421] border-indigo-500/30' : 'bg-indigo-50 border-indigo-200'
              }`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">
                      Install as Standalone Progressive Web App
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Runs in its own window without browser toolbars, pinned to your Taskbar or App Drawer.
                    </p>
                  </div>
                </div>

                <button
                  onClick={canPromptPwa ? handlePWAInstall : handleDownloadWindowsShortcut}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-sky-500 text-white text-xs font-bold shrink-0 hover:opacity-90 transition-opacity shadow-md shadow-indigo-500/20 cursor-pointer"
                >
                  {canPromptPwa ? t('install_pwa_btn', 'Install Web App (PWA)') : 'Download Desktop App'}
                </button>
              </div>

              <div className={`p-3.5 rounded-xl border text-xs space-y-2 ${darkMode ? 'bg-[#10141d]/70 border-slate-800/80 text-slate-400' : 'bg-slate-100 text-slate-600'}`}>
                <div className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                  <span>{t('how_to_install', 'Browser Shortcut Instructions')}</span>
                </div>
                <ul className="space-y-1.5 text-[11px] list-disc list-inside text-slate-400">
                  <li>
                    <strong className="text-slate-300">Chrome / Edge:</strong> {t('chrome_edge_instruction')}
                  </li>
                  <li>
                    <strong className="text-slate-300">Offline Ready:</strong> Cached static resources enable instant launch.
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Quick Copy URL Row (Always visible) */}
          <div
            className={`p-3 rounded-xl border flex items-center justify-between gap-2 ${
              darkMode ? 'bg-[#141923] border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center gap-2 overflow-hidden flex-1">
              <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-xs font-mono text-slate-300 truncate">
                {currentUrl}
              </span>
            </div>
            <button
              onClick={handleCopyLink}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">{t('url_copied', 'Copied')}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{t('copy_link_btn', 'Copy Link')}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`p-4 border-t flex items-center justify-between text-xs ${
            darkMode ? 'bg-[#0d1117] border-slate-800/80 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
          }`}
        >
          <span className="text-[11px] text-slate-500">
            SME-SENTINEL v2.4 · Multi-Platform Desktop & Mobile Ready
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-white transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
