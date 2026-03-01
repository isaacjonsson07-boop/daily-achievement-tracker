import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignIn: (email: string, password: string) => Promise<any>;
  onSignUp: (email: string, password: string) => Promise<any>;
}

export function AuthModal({ isOpen, onClose, onSignIn, onSignUp }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [signUpSuccess, setSignUpSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signin') {
        const { error } = await onSignIn(email, password);
        if (error) {
          setError(error.message || 'Sign in failed');
        } else {
          onClose();
          resetForm();
        }
      } else {
        const { error } = await onSignUp(email, password);
        if (error) {
          setError(error.message || 'Sign up failed');
        } else {
          setSignUpSuccess(true);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setError('');
    setSignUpSuccess(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-sa-bg-warm border border-sa-border-light rounded-2xl p-8 animate-rise">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-sa-cream-faint hover:text-sa-cream transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="font-serif text-xl text-sa-cream mb-1">
          {mode === 'signin' ? 'Welcome back' : 'Create account'}
        </h2>
        <p className="text-[0.78rem] text-sa-cream-muted mb-6">
          {mode === 'signin' ? 'Sign in to sync your system.' : 'Start building your operating system.'}
        </p>

        {signUpSuccess ? (
          <div className="bg-[rgba(90,219,126,0.08)] border border-[rgba(90,219,126,0.2)] rounded-lg p-4 text-center">
            <p className="text-sa-green text-[0.88rem] font-medium mb-1">Account created</p>
            <p className="text-sa-cream-muted text-[0.78rem]">Check your email to verify, then sign in.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="w-full bg-sa-bg border border-sa-border-light rounded-lg px-4 py-3 text-[0.88rem] text-sa-cream placeholder:text-sa-cream-faint outline-none focus:border-sa-gold transition-colors"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              minLength={6}
              className="w-full bg-sa-bg border border-sa-border-light rounded-lg px-4 py-3 text-[0.88rem] text-sa-cream placeholder:text-sa-cream-faint outline-none focus:border-sa-gold transition-colors"
            />

            {error && (
              <div className="flex items-start gap-2 bg-[rgba(230,100,100,0.08)] border border-[rgba(230,100,100,0.2)] rounded-lg px-3 py-2">
                <AlertCircle className="w-4 h-4 text-sa-rose flex-shrink-0 mt-0.5" />
                <p className="text-[0.78rem] text-sa-rose">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[rgba(201,169,110,0.15)] border border-[rgba(201,169,110,0.3)] text-sa-gold rounded-lg text-[0.88rem] font-medium hover:bg-[rgba(201,169,110,0.25)] transition-colors disabled:opacity-50"
            >
              {loading ? 'Loading...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        )}

        <div className="mt-5 text-center">
          <button
            onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); setSignUpSuccess(false); }}
            className="text-[0.78rem] text-sa-cream-faint hover:text-sa-cream transition-colors"
          >
            {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}
