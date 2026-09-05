import React, { useState } from 'react';
import { X, Mail, Lock, LogIn, UserPlus, Sparkles, Shield, AlertCircle, CheckCircle2 } from 'lucide-react';
import { 
  loginWithEmail, 
  registerWithEmail, 
  loginWithGoogle, 
  isFirebaseConfigured,
  setStoredLocalUser 
} from '../lib/firebase';
import { UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onUserChange: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserChange,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      let user: UserProfile;
      if (mode === 'login') {
        user = await loginWithEmail(email, password);
      } else {
        user = await registerWithEmail(email, password);
      }
      onUserChange(user);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const user = await loginWithGoogle();
      onUserChange(user);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Google sign-in cancelled or failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDemoProfile = (name: string, demoEmail: string, uid: string) => {
    const user: UserProfile = {
      uid,
      email: demoEmail,
      displayName: name,
      photoURL: null,
    };
    setStoredLocalUser(user);
    onUserChange(user);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div 
        id="auth-modal-card"
        className="bg-[#161618] border border-[#2D2D33] rounded-2xl w-full max-w-md p-6 shadow-2xl relative"
      >
        <button
          id="close-auth-modal-btn"
          onClick={onClose}
          className="absolute top-4 right-4 text-[#71717A] hover:text-[#EDEDED] p-1.5 rounded-lg hover:bg-[#202024] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] flex items-center justify-center font-bold">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[#EDEDED]">
              {mode === 'login' ? 'Sign In to Your Account' : 'Create an Account'}
            </h2>
            <p className="text-xs text-[#71717A]">
              Per-user isolated financial data & Gemini insights
            </p>
          </div>
        </div>

        {/* Firebase Live Badge */}
        <div className="mb-4 px-3 py-2 rounded-xl bg-[#0E0E10] border border-[#1F1F22] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isFirebaseConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
            <span className="text-[#A1A1AA]">
              {isFirebaseConfigured ? 'Live Firebase Auth Enabled' : 'Simulated / Offline Multi-User Mode'}
            </span>
          </div>
          <span className="text-[10px] text-[#71717A] px-2 py-0.5 rounded bg-[#161618] border border-[#2D2D33]">
            {isFirebaseConfigured ? 'GCP Connected' : 'Hackathon Ready'}
          </span>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Google Sign In */}
        <button
          id="google-signin-btn"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full mb-4 py-2.5 px-4 rounded-xl border border-[#2D2D33] bg-[#0E0E10] hover:bg-[#202024] text-[#EDEDED] text-sm font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Continue with Google
        </button>

        <div className="flex items-center my-4">
          <div className="flex-1 border-t border-[#1F1F22]"></div>
          <span className="px-3 text-xs text-[#71717A]">or with email</span>
          <div className="flex-1 border-t border-[#1F1F22]"></div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs text-[#A1A1AA] mb-1 font-medium">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#71717A] absolute left-3 top-3" />
              <input
                id="auth-email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full bg-[#0E0E10] border border-[#2D2D33] rounded-xl pl-9 pr-3 py-2 text-sm text-[#EDEDED] focus:outline-none focus:border-[#10B981]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-[#A1A1AA] mb-1 font-medium">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#71717A] absolute left-3 top-3" />
              <input
                id="auth-password-input"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#0E0E10] border border-[#2D2D33] rounded-xl pl-9 pr-3 py-2 text-sm text-[#EDEDED] focus:outline-none focus:border-[#10B981]"
              />
            </div>
          </div>

          <button
            id="auth-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 px-4 rounded-xl bg-[#10B981] hover:bg-[#0ea371] text-[#0A0A0B] text-sm font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
            ) : mode === 'login' ? (
              <>
                <LogIn className="w-4 h-4" /> Sign In
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" /> Create Account
              </>
            )}
          </button>
        </form>

        <div className="mt-3 text-center">
          <button
            type="button"
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="text-xs text-[#A1A1AA] hover:text-[#EDEDED] transition-colors"
          >
            {mode === 'login' 
              ? "Don't have an account? Create one" 
              : "Already have an account? Sign in"}
          </button>
        </div>

        {/* Demo Users Switcher (Perfect for Hackathon Showcase) */}
        <div className="mt-5 pt-4 border-t border-[#1F1F22]">
          <span className="text-[11px] uppercase tracking-wider text-[#71717A] font-semibold block mb-2">
            Hackathon Demo Profiles (Test Per-User Isolation)
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleSelectDemoProfile('Alex Morgan', 'alex.morgan@hackathon.dev', 'user_alex_101')}
              className={`p-2 text-left rounded-xl border text-xs transition-colors ${
                currentUser?.uid === 'user_alex_101' 
                  ? 'bg-[#10B981]/10 border-[#10B981]/40 text-[#10B981]' 
                  : 'bg-[#0E0E10] border-[#2D2D33] text-[#A1A1AA] hover:text-[#EDEDED]'
              }`}
            >
              <div className="font-semibold text-[#EDEDED] truncate">Alex Morgan</div>
              <div className="text-[10px] text-[#71717A] truncate">alex.morgan@hackathon.dev</div>
            </button>

            <button
              onClick={() => handleSelectDemoProfile('Jordan Lee', 'jordan.lee@hackathon.dev', 'user_jordan_202')}
              className={`p-2 text-left rounded-xl border text-xs transition-colors ${
                currentUser?.uid === 'user_jordan_202' 
                  ? 'bg-[#10B981]/10 border-[#10B981]/40 text-[#10B981]' 
                  : 'bg-[#0E0E10] border-[#2D2D33] text-[#A1A1AA] hover:text-[#EDEDED]'
              }`}
            >
              <div className="font-semibold text-[#EDEDED] truncate">Jordan Lee</div>
              <div className="text-[10px] text-[#71717A] truncate">jordan.lee@hackathon.dev</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
