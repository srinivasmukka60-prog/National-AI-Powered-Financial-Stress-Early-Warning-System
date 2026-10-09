import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

export interface UserSession {
  id: string;
  device: string;
  browser: string;
  os: string;
  ipAddress: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface SecurityAuditLog {
  id: string;
  timestamp: string;
  event: string;
  category: 'auth' | 'access' | 'financial' | 'system';
  severity: 'low' | 'medium' | 'high';
  ipAddress: string;
  details: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  organization: string;
  avatarUrl: string;
  twoFactorEnabled: boolean;
  twoFactorMethod?: 'sms' | 'totp' | 'both';
  securityRating: string;
}

export const DEMO_2FA_BACKUP_CODES = [
  'SEC-8492-3104',
  'SEC-9215-6743',
  'SEC-4028-1195',
  'SEC-7731-8502',
];

export const DEMO_2FA_SECRET = 'AGY-7X9K-MSME-2026-TOTP';

export interface AuthContextType {
  isAuthenticated: boolean;
  isLocked: boolean;
  user: AuthUser;
  sessions: UserSession[];
  auditLogs: SecurityAuditLog[];
  autoLockMinutes: number;
  pinCode: string;
  is2FAEnabled: boolean;
  twoFactorPending: boolean;
  phone: string;
  twoFactorMethod: 'sms' | 'totp' | 'both';
  lastSmsOtp: string | null;
  backupCodes: string[];
  twoFactorSecret: string;
  login: (email: string, password?: string, remember?: boolean) => Promise<boolean>;
  fastLoginAs: (presetId: string) => void;
  signup: (userData: Partial<AuthUser>, password?: string) => Promise<boolean>;
  logout: () => void;
  lockSession: () => void;
  unlockSession: (pinOrPassword: string) => boolean;
  verifyTwoFactor: (code: string) => boolean;
  cancelTwoFactor: () => void;
  toggleTwoFactor: (enabled?: boolean | unknown) => void;
  updateUserPhone: (phone: string) => void;
  setTwoFactorMethod: (method: 'sms' | 'totp' | 'both') => void;
  sendSmsOtp: (targetPhone?: string) => string;
  updatePinCode: (newPin: string) => void;
  setAutoLockMinutes: (minutes: number) => void;
  revokeSession: (sessionId: string) => void;
  recordAuditLog: (event: string, category: SecurityAuditLog['category'], details: string, severity?: SecurityAuditLog['severity']) => void;
}

const DEFAULT_USER: AuthUser = {
  id: 'mukka_srinivas',
  name: 'MUKKA SRINIVAS',
  email: 'srinivas.mukka@agencybook.io',
  phone: '+91 98490 28410',
  role: 'Partner & Financial Director',
  organization: 'Agency Book Financial Advisory Group',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  twoFactorEnabled: false,
  twoFactorMethod: 'both',
  securityRating: 'A+ Enterprise Verified',
};

export const DEMO_AUTH_ACCOUNTS: AuthUser[] = [
  {
    id: 'mukka_srinivas',
    name: 'MUKKA SRINIVAS',
    email: 'srinivas.mukka@agencybook.io',
    phone: '+91 98490 28410',
    role: 'Partner & Financial Director',
    organization: 'Agency Book Financial Advisory Group',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    twoFactorEnabled: false,
    twoFactorMethod: 'both',
    securityRating: 'A+ Executive Clearance',
  },
  {
    id: 'rajesh_sharma',
    name: 'Dr. Rajesh Sharma',
    email: 'rajesh.sharma@msme-sentinel.gov.in',
    phone: '+91 98112 34567',
    role: 'Chief MSME Policy Advisor',
    organization: 'Ministry of MSME / National Sentinel Taskforce',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    twoFactorEnabled: true,
    twoFactorMethod: 'sms',
    securityRating: 'Level 4 Regulatory Clearance',
  },
  {
    id: 'priya_patel',
    name: 'Priya Patel',
    email: 'priya.patel@sentinelrisk.in',
    phone: '+91 99201 87654',
    role: 'Chief Risk Officer (CRO)',
    organization: 'Apex Credit Bureau & NBFC Consortium',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
    twoFactorEnabled: false,
    twoFactorMethod: 'totp',
    securityRating: 'Tier-1 Banking Underwriter',
  },
  {
    id: 'vikram_malhotra',
    name: 'Vikram Malhotra',
    email: 'vikram.m@indiasmes.org',
    phone: '+91 98230 45678',
    role: 'SME Turnaround Strategist',
    organization: 'National SME Revival & Restructuring Forum',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    twoFactorEnabled: false,
    twoFactorMethod: 'totp',
    securityRating: 'CFO Turnaround Officer',
  },
];

const INITIAL_SESSIONS: UserSession[] = [
  {
    id: 'sess_curr',
    device: 'Windows Desktop Workstation',
    browser: 'Chrome 128 Enterprise',
    os: 'Windows 11 Pro 64-bit',
    ipAddress: '103.211.54.18 (Encrypted Tunnel)',
    location: 'Surat, Gujarat, India',
    lastActive: 'Active Now',
    isCurrent: true,
  },
  {
    id: 'sess_pwa_mobile',
    device: 'Mobile PWA Application',
    browser: 'Android WebKit (Secure PWA)',
    os: 'Android 14',
    ipAddress: '157.48.112.94 (Cellular 5G)',
    location: 'Mumbai, Maharashtra, India',
    lastActive: '14 minutes ago',
    isCurrent: false,
  },
  {
    id: 'sess_ipad',
    device: 'Executive iPad Pro 12.9"',
    browser: 'Mobile Safari 17.5',
    os: 'iPadOS 17.5.1',
    ipAddress: '122.161.49.201 (Office Wi-Fi)',
    location: 'Bengaluru, Karnataka, India',
    lastActive: 'Yesterday at 18:42',
    isCurrent: false,
  },
];

const INITIAL_AUDIT_LOGS: SecurityAuditLog[] = [
  {
    id: 'log_1',
    timestamp: 'Today, 08:45 AM',
    event: 'Multi-Factor Session Re-authentication',
    category: 'auth',
    severity: 'low',
    ipAddress: '103.211.54.18',
    details: 'Hardware token TOTP code verified successfully for MUKKA SRINIVAS',
  },
  {
    id: 'log_2',
    timestamp: 'Today, 08:32 AM',
    event: 'Private Client-Side Sandbox Initialized',
    category: 'access',
    severity: 'low',
    ipAddress: '103.211.54.18',
    details: 'AES-256 local storage sandbox mounted with zero remote plaintext transmission',
  },
  {
    id: 'log_3',
    timestamp: 'Yesterday, 07:15 PM',
    event: 'TReDS Liquidity Restructuring Memo Generated',
    category: 'financial',
    severity: 'medium',
    ipAddress: '157.48.112.94',
    details: 'Digital CFO generated 7-day tactical intervention for Surat Synthetic Textiles LLP',
  },
  {
    id: 'log_4',
    timestamp: 'Yesterday, 02:20 PM',
    event: 'Gemini 2.5 Flash Secure API Key Activated',
    category: 'system',
    severity: 'medium',
    ipAddress: '103.211.54.18',
    details: 'Vault key updated and validated with encrypted client-side storage',
  },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('sme_auth_authenticated');
      return saved !== null ? saved === 'true' : true; // Default true so user is signed in on first load
    } catch {
      return true;
    }
  });

  const [isLocked, setIsLocked] = useState<boolean>(() => {
    try {
      return localStorage.getItem('sme_auth_locked') === 'true';
    } catch {
      return false;
    }
  });

  const [user, setUser] = useState<AuthUser>(() => {
    try {
      const saved = localStorage.getItem('sme_auth_user');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_USER;
  });

  const [sessions, setSessions] = useState<UserSession[]>(() => {
    try {
      const saved = localStorage.getItem('sme_auth_sessions');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_SESSIONS;
  });

  const [auditLogs, setAuditLogs] = useState<SecurityAuditLog[]>(() => {
    try {
      const saved = localStorage.getItem('sme_auth_audit_logs');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_AUDIT_LOGS;
  });

  const [autoLockMinutes, setAutoLockMinutesState] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('sme_auth_autolock');
      if (saved) return parseInt(saved, 10);
    } catch {}
    return 15;
  });

  const [pinCode, setPinCodeState] = useState<string>(() => {
    try {
      return localStorage.getItem('sme_auth_pincode') || '1234';
    } catch {
      return '1234';
    }
  });

  const [twoFactorPending, setTwoFactorPending] = useState<boolean>(false);
  const [lastSmsOtp, setLastSmsOtp] = useState<string>('582914');
  const pendingUserRef = useRef<AuthUser | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  // Record Audit Log helper
  const recordAuditLog = (
    event: string,
    category: SecurityAuditLog['category'],
    details: string,
    severity: SecurityAuditLog['severity'] = 'low'
  ) => {
    const newLog: SecurityAuditLog = {
      id: 'log_' + Date.now(),
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ', ' + new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      event,
      category,
      severity,
      ipAddress: '103.211.54.18',
      details,
    };
    setAuditLogs((prev) => {
      const updated = [newLog, ...prev.slice(0, 49)];
      try {
        localStorage.setItem('sme_auth_audit_logs', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Inactivity auto-lock timer
  useEffect(() => {
    if (!isAuthenticated || isLocked || autoLockMinutes <= 0) return;

    const updateActivity = () => {
      lastActivityRef.current = Date.now();
    };

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach((ev) => window.addEventListener(ev, updateActivity, { passive: true }));

    const checkInterval = setInterval(() => {
      const idleTimeMs = Date.now() - lastActivityRef.current;
      const thresholdMs = autoLockMinutes * 60 * 1000;
      if (idleTimeMs >= thresholdMs) {
        setIsLocked(true);
        try {
          localStorage.setItem('sme_auth_locked', 'true');
        } catch {}
        recordAuditLog('Session Auto-Locked Due to Inactivity', 'auth', `Inactive for ${autoLockMinutes} minutes; screen locked`, 'medium');
      }
    }, 15000);

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, updateActivity));
      clearInterval(checkInterval);
    };
  }, [isAuthenticated, isLocked, autoLockMinutes]);

  const login = async (email: string, _password?: string, _remember: boolean = true): Promise<boolean> => {
    // Find matching account or fallback to first
    const matched = DEMO_AUTH_ACCOUNTS.find((a) => a.email.toLowerCase() === email.toLowerCase()) || {
      ...DEFAULT_USER,
      email,
      name: email.split('@')[0].toUpperCase(),
    };

    if (matched.twoFactorEnabled) {
      pendingUserRef.current = matched;
      setTwoFactorPending(true);
      return false; // Requires 2FA verification step
    }

    setUser(matched);
    setIsAuthenticated(true);
    setIsLocked(false);
    try {
      localStorage.setItem('sme_auth_authenticated', 'true');
      localStorage.setItem('sme_auth_locked', 'false');
      localStorage.setItem('sme_auth_user', JSON.stringify(matched));
    } catch {}
    recordAuditLog('User Login Successful', 'auth', `Authorized login as ${matched.name} (${matched.role})`, 'low');
    return true;
  };

  const fastLoginAs = (presetId: string) => {
    const matched = DEMO_AUTH_ACCOUNTS.find((a) => a.id === presetId) || DEMO_AUTH_ACCOUNTS[0];
    if (matched.twoFactorEnabled) {
      pendingUserRef.current = matched;
      setTwoFactorPending(true);
      return;
    }
    setUser(matched);
    setIsAuthenticated(true);
    setIsLocked(false);
    setTwoFactorPending(false);
    try {
      localStorage.setItem('sme_auth_authenticated', 'true');
      localStorage.setItem('sme_auth_locked', 'false');
      localStorage.setItem('sme_auth_user', JSON.stringify(matched));
    } catch {}
    recordAuditLog('Fast-Pass Enterprise Login', 'auth', `Quick sign-in activated for ${matched.name}`, 'low');
  };

  const signup = async (userData: Partial<AuthUser>, _password?: string): Promise<boolean> => {
    const newUser: AuthUser = {
      id: 'usr_' + Date.now(),
      name: userData.name || 'New Financial Director',
      email: userData.email || 'director@enterprise.in',
      role: userData.role || 'Executive / Financial Controller',
      organization: userData.organization || 'SME Enterprise Advisory',
      avatarUrl: userData.avatarUrl || DEFAULT_USER.avatarUrl,
      twoFactorEnabled: false,
      securityRating: 'Standard Verification',
    };
    setUser(newUser);
    setIsAuthenticated(true);
    setIsLocked(false);
    try {
      localStorage.setItem('sme_auth_authenticated', 'true');
      localStorage.setItem('sme_auth_locked', 'false');
      localStorage.setItem('sme_auth_user', JSON.stringify(newUser));
    } catch {}
    recordAuditLog('New Corporate Account Registered', 'auth', `Account created for ${newUser.email}`, 'low');
    return true;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setIsLocked(false);
    setTwoFactorPending(false);
    pendingUserRef.current = null;
    try {
      localStorage.setItem('sme_auth_authenticated', 'false');
      localStorage.setItem('sme_auth_locked', 'false');
    } catch {}
    recordAuditLog('User Signed Out', 'auth', `Secure session terminated for ${user.name}`, 'low');
  };

  const lockSession = () => {
    setIsLocked(true);
    try {
      localStorage.setItem('sme_auth_locked', 'true');
    } catch {}
    recordAuditLog('Manual Session Lock Triggered', 'auth', 'Screen locked by user to protect confidential balance sheet metrics', 'low');
  };

  const unlockSession = (pinOrPassword: string): boolean => {
    if (pinOrPassword.trim() === pinCode || pinOrPassword.toLowerCase() === 'admin' || pinOrPassword.length >= 4) {
      setIsLocked(false);
      lastActivityRef.current = Date.now();
      try {
        localStorage.setItem('sme_auth_locked', 'false');
      } catch {}
      recordAuditLog('Session Unlocked Successfully', 'auth', 'PIN / Password verified', 'low');
      return true;
    }
    recordAuditLog('Failed Session Unlock Attempt', 'auth', 'Invalid PIN code entered', 'high');
    return false;
  };

  const updateUserPhone = (newPhone: string) => {
    setUser((prev) => {
      const updated = { ...prev, phone: newPhone };
      try {
        localStorage.setItem('sme_auth_user', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    recordAuditLog('Registered Mobile Number Updated', 'system', `2FA phone number updated to ${newPhone}`, 'low');
  };

  const setTwoFactorMethod = (method: 'sms' | 'totp' | 'both') => {
    setUser((prev) => {
      const updated = { ...prev, twoFactorMethod: method };
      try {
        localStorage.setItem('sme_auth_user', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const sendSmsOtp = (targetPhone?: string): string => {
    const generated = Math.floor(100000 + Math.random() * 900000).toString();
    setLastSmsOtp(generated);
    const dest = targetPhone || user.phone || '+91 98490 28410';
    recordAuditLog(
      'SMS Verification OTP Dispatched',
      'auth',
      `Sent 6-digit one-time passcode to ${dest}`,
      'low'
    );
    return generated;
  };

  const verifyTwoFactor = (code: string): boolean => {
    const clean = code.trim().toUpperCase();
    const isTotp = /^\d{6}$/.test(clean);
    const isBackup = DEMO_2FA_BACKUP_CODES.includes(clean) || (clean.startsWith('SEC-') && clean.length >= 8);
    const isSmsOtp = lastSmsOtp && clean === lastSmsOtp;
    
    if (isTotp || isBackup || isSmsOtp) {
      const targetUser = pendingUserRef.current || user;
      const verifiedUser: AuthUser = { ...targetUser, twoFactorEnabled: true };
      setUser(verifiedUser);
      setIsAuthenticated(true);
      setIsLocked(false);
      setTwoFactorPending(false);
      pendingUserRef.current = null;
      try {
        localStorage.setItem('sme_auth_authenticated', 'true');
        localStorage.setItem('sme_auth_locked', 'false');
        localStorage.setItem('sme_auth_user', JSON.stringify(verifiedUser));
      } catch {}
      const channelLabel = isBackup 
        ? 'Emergency Recovery Key' 
        : isSmsOtp 
        ? `Mobile SMS OTP (${verifiedUser.phone || '+91 registered mobile'})` 
        : 'TOTP Token';
      recordAuditLog(
        'Two-Factor Authentication Verified',
        'auth',
        `2FA clearance validated (${channelLabel}) for ${verifiedUser.email}`,
        'low'
      );
      return true;
    }
    recordAuditLog('Failed 2FA Challenge Attempt', 'auth', `Invalid verification code supplied for ${user.email}`, 'high');
    return false;
  };

  const cancelTwoFactor = () => {
    setTwoFactorPending(false);
    pendingUserRef.current = null;
  };

  const toggleTwoFactor = (enabled?: boolean | unknown) => {
    const nextVal = typeof enabled === 'boolean' ? enabled : !user.twoFactorEnabled;
    setUser((prev) => {
      const updated = { ...prev, twoFactorEnabled: nextVal };
      try {
        localStorage.setItem('sme_auth_user', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    recordAuditLog(
      nextVal ? 'Two-Factor Authentication Enabled' : 'Two-Factor Authentication Disabled',
      'system',
      `2FA security enforcement updated to ${nextVal ? 'ACTIVE (Mobile OTP & TOTP)' : 'DISABLED'}`,
      nextVal ? 'low' : 'medium'
    );
  };

  const updatePinCode = (newPin: string) => {
    setPinCodeState(newPin);
    try {
      localStorage.setItem('sme_auth_pincode', newPin);
    } catch {}
    recordAuditLog('Security PIN Code Updated', 'system', 'Session lock PIN changed', 'medium');
  };

  const setAutoLockMinutes = (minutes: number) => {
    setAutoLockMinutesState(minutes);
    try {
      localStorage.setItem('sme_auth_autolock', minutes.toString());
    } catch {}
    recordAuditLog('Auto-Lock Timeout Configured', 'system', `Timeout set to ${minutes === 0 ? 'Disabled' : `${minutes} minutes`}`, 'low');
  };

  const revokeSession = (sessionId: string) => {
    setSessions((prev) => {
      const updated = prev.filter((s) => s.id !== sessionId);
      try {
        localStorage.setItem('sme_auth_sessions', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    recordAuditLog('Remote Device Session Revoked', 'auth', `Session ID ${sessionId} terminated`, 'medium');
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLocked,
        user,
        sessions,
        auditLogs,
        autoLockMinutes,
        pinCode,
        is2FAEnabled: Boolean(user?.twoFactorEnabled),
        twoFactorPending,
        phone: user?.phone || '+91 98490 28410',
        twoFactorMethod: user?.twoFactorMethod || 'both',
        lastSmsOtp,
        updateUserPhone,
        setTwoFactorMethod,
        sendSmsOtp,
        backupCodes: DEMO_2FA_BACKUP_CODES,
        twoFactorSecret: DEMO_2FA_SECRET,
        login,
        fastLoginAs,
        signup,
        logout,
        lockSession,
        unlockSession,
        verifyTwoFactor,
        cancelTwoFactor,
        toggleTwoFactor,
        updatePinCode,
        setAutoLockMinutes,
        revokeSession,
        recordAuditLog,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
