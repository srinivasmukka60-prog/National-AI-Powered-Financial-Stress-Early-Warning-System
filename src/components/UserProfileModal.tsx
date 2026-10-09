import React, { useState, useRef } from 'react';
import {
  X,
  User,
  Mail,
  Building,
  Shield,
  Camera,
  Check,
  Save,
  Award,
  Upload,
  Sparkles,
  LogOut,
  Lock,
  Phone,
  Database,
  Settings as SettingsIcon,
} from 'lucide-react';
import { useUserProfile, PRESET_AVATARS } from '../context/UserProfileContext';
import { useAuth } from '../context/AuthContext';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
  onOpenSettings?: () => void;
  onLogout?: () => void;
  onOpenSecurityCenter?: () => void;
  onLockSession?: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  darkMode,
  onOpenSettings,
  onLogout,
  onOpenSecurityCenter,
  onLockSession,
}) => {
  const { profile, updateProfile } = useUserProfile();
  const { user, supabaseConfig } = useAuth();

  const [name, setName] = useState(profile.name);
  const [title, setTitle] = useState(profile.title);
  const [email, setEmail] = useState(profile.email);
  const [role, setRole] = useState(profile.role);
  const [organization, setOrganization] = useState(profile.organization);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl);

  const [isEditing, setIsEditing] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state if external profile changed
  React.useEffect(() => {
    setName(profile.name);
    setTitle(profile.title);
    setEmail(profile.email);
    setRole(profile.role);
    setOrganization(profile.organization);
    setAvatarUrl(profile.avatarUrl);
  }, [profile]);

  if (!isOpen) return null;

  const handleSave = () => {
    updateProfile({
      name,
      title,
      email,
      role,
      organization,
      avatarUrl,
    });
    setIsEditing(false);
    setSavedSuccess('Profile updated and saved successfully.');
    setTimeout(() => setSavedSuccess(null), 3000);
  };

  const handleAvatarSelect = (url: string) => {
    setAvatarUrl(url);
    updateProfile({ avatarUrl: url });
    setSavedSuccess('Profile avatar updated!');
    setTimeout(() => setSavedSuccess(null), 2500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setAvatarUrl(result);
        updateProfile({ avatarUrl: result });
        setSavedSuccess('Custom avatar uploaded and applied!');
        setTimeout(() => setSavedSuccess(null), 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-all ${
          darkMode ? 'bg-[#0f1319] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Banner with Profile Photo & Close Button */}
        <div className="relative h-28 bg-gradient-to-r from-sky-600 via-indigo-600 to-sky-700 p-4 flex justify-between items-start">
          <div className="text-white/80 text-[11px] font-semibold tracking-wider uppercase flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Executive Profile Console
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Profile Picture Overlay */}
          <div className="absolute -bottom-10 left-6 flex items-end gap-4">
            <div className="relative group">
              <img
                src={avatarUrl}
                alt={name}
                className="w-20 h-20 rounded-full object-cover border-4 border-[#0f1319] shadow-xl bg-slate-800"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-1.5 rounded-full bg-sky-500 text-white shadow-lg cursor-pointer hover:bg-sky-400 transition-colors"
                title="Upload Photo"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
            <div className="mb-2">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active Session
              </span>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="pt-14 p-6 space-y-5 overflow-y-auto flex-1">
          {/* Header row with Name and Edit Toggle */}
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold tracking-tight">{name}</h2>
              <p className={`text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {title} · <span className="text-sky-400 font-semibold">{organization}</span>
              </p>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                isEditing
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
                  : darkMode
                  ? 'border-sky-500/30 bg-sky-500/10 text-sky-400 hover:bg-sky-500/20'
                  : 'border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100'
              }`}
            >
              {isEditing ? 'Cancel Edit' : 'Edit Details'}
            </button>
          </div>

          {/* Alert Banner */}
          {savedSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{savedSuccess}</span>
            </div>
          )}

          {/* Quick Avatar Gallery Switcher */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-[11px] font-bold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Change Avatar Portrait
              </span>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-[11px] text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Upload className="w-3 h-3" />
                Upload Custom Photo
              </button>
            </div>
            <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
              {PRESET_AVATARS.map((av) => {
                const isSelected = avatarUrl === av.url;
                return (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => handleAvatarSelect(av.url)}
                    className={`relative rounded-full p-0.5 border-2 transition-all cursor-pointer shrink-0 ${
                      isSelected
                        ? 'border-sky-400 scale-105 shadow-md shadow-sky-500/30'
                        : 'border-transparent hover:border-slate-500 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={av.url}
                      alt={av.name}
                      className="w-11 h-11 rounded-full object-cover"
                    />
                    {isSelected && (
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-sky-500 rounded-full flex items-center justify-center text-white border-2 border-[#0f1319]">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Edit Form or Readonly Information */}
          {isEditing ? (
            <div className="space-y-3.5 pt-1 border-t border-slate-800/80 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={`block text-[11px] font-semibold uppercase tracking-wider mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                      darkMode ? 'bg-[#151a24] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-[11px] font-semibold uppercase tracking-wider mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Job Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                      darkMode ? 'bg-[#151a24] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={`block text-[11px] font-semibold uppercase tracking-wider mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                      darkMode ? 'bg-[#151a24] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-[11px] font-semibold uppercase tracking-wider mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Organization / Ministry
                  </label>
                  <input
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                      darkMode ? 'bg-[#151a24] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-[11px] font-semibold uppercase tracking-wider mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Role & Permissions
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                    darkMode ? 'bg-[#151a24] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={handleSave}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs transition-all cursor-pointer shadow-md shadow-sky-500/20"
                >
                  <Save className="w-4 h-4" />
                  Save & Apply Changes
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5 pt-1 border-t border-slate-800/80">
              <div
                className={`p-3 rounded-xl border flex items-center gap-3 ${
                  darkMode ? 'bg-[#141924] border-slate-800' : 'bg-slate-50 border-slate-100'
                }`}
              >
                <Mail className="w-4 h-4 text-sky-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className={`text-[10px] uppercase font-bold tracking-wider ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                    Email
                  </div>
                  <div className="text-xs font-medium font-mono truncate">{email}</div>
                </div>
              </div>

              <div
                className={`p-3 rounded-xl border flex items-center gap-3 ${
                  darkMode ? 'bg-[#141924] border-slate-800' : 'bg-slate-50 border-slate-100'
                }`}
              >
                <Building className="w-4 h-4 text-indigo-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className={`text-[10px] uppercase font-bold tracking-wider ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                    Organization
                  </div>
                  <div className="text-xs font-medium truncate">{organization}</div>
                </div>
              </div>

              <div
                className={`p-3 rounded-xl border flex items-center gap-3 ${
                  darkMode ? 'bg-[#141924] border-slate-800' : 'bg-slate-50 border-slate-100'
                }`}
              >
                <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className={`text-[10px] uppercase font-bold tracking-wider ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                    Role & Permissions
                  </div>
                  <div className="text-xs font-medium truncate">{role}</div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold shrink-0">
                  {user?.securityRating || 'Tier-4 Active'}
                </span>
              </div>

              {/* Phone and Supabase Auth Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div
                  className={`p-3 rounded-xl border flex items-center gap-3 ${
                    darkMode ? 'bg-[#141924] border-slate-800' : 'bg-slate-50 border-slate-100'
                  }`}
                >
                  <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className={`text-[10px] uppercase font-bold tracking-wider ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                      2FA Phone
                    </div>
                    <div className="text-xs font-mono font-medium truncate">{user?.phone || '+91 98490 28410'}</div>
                  </div>
                </div>

                <div
                  className={`p-3 rounded-xl border flex items-center gap-3 ${
                    darkMode ? 'bg-[#141924] border-slate-800' : 'bg-slate-50 border-slate-100'
                  }`}
                >
                  <Database className="w-4 h-4 text-sky-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className={`text-[10px] uppercase font-bold tracking-wider ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                      Auth Provider
                    </div>
                    <div className="text-xs font-semibold text-sky-400 truncate">
                      {supabaseConfig.isConfigured ? 'Supabase Cloud Auth' : 'Local Sandbox Mode'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className={`p-2.5 rounded-xl border text-center ${darkMode ? 'bg-[#151a24] border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
              <div className="text-lg font-bold font-mono text-sky-400">24</div>
              <div className={`text-[10px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Active Clients</div>
            </div>
            <div className={`p-2.5 rounded-xl border text-center ${darkMode ? 'bg-[#151a24] border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
              <div className="text-lg font-bold font-mono text-emerald-400">142</div>
              <div className={`text-[10px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Scorecards</div>
            </div>
            <div className={`p-2.5 rounded-xl border text-center ${darkMode ? 'bg-[#151a24] border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
              <div className="text-lg font-bold font-mono text-amber-400">99.4%</div>
              <div className={`text-[10px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>AI Precision</div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div
          className={`p-4 border-t flex items-center justify-between gap-3 ${
            darkMode ? 'bg-[#0d1117] border-slate-800/80' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {onOpenSettings && (
              <button
                onClick={() => {
                  onClose();
                  onOpenSettings();
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                  darkMode ? 'border-slate-700 hover:bg-slate-800 text-slate-300' : 'border-slate-200 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <SettingsIcon className="w-3.5 h-3.5" />
                <span>Settings</span>
              </button>
            )}

            {onOpenSecurityCenter && (
              <button
                onClick={() => {
                  onClose();
                  onOpenSecurityCenter();
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                  darkMode ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
                title="Security Center, 2FA & Audit Logs"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Security</span>
              </button>
            )}

            {onLockSession && (
              <button
                onClick={() => {
                  onClose();
                  onLockSession();
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                  darkMode ? 'border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20' : 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
                }`}
                title="Lock Terminal PIN Screen"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Lock</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                if (onLogout) onLogout();
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-bold transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
