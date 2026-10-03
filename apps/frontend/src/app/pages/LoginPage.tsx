import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { EyeIcon } from '../components/EyeIcon';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'demo'; text: string } | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    setTimeout(() => {
      setIsSubmitting(false);
      setFeedback({
        type: 'success',
        text: '✨ Welcome back! Your secure personal sanctuary is authenticated.',
      });
    }, 700);
  }

  function handleSocialLogin(provider: string) {
    setFeedback({
      type: 'demo',
      text: `Connecting with ${provider} OAuth (demo mode)...`,
    });
  }

  return (
    <section aria-labelledby="login-title" className="w-full flex items-center justify-center">
      <div className="relative w-full max-w-[28rem] p-6 sm:p-9 border border-white/10 rounded bg-white shadow-[0_16px_36px_rgba(0,0,0,0.35)]">
        {/* Router Tab Links */}
        <div className="grid grid-cols-2 bg-[#f1f2f5] rounded p-1 mb-6" role="tablist">
          <Link
            to="/signup"
            role="tab"
            aria-selected={false}
            className="py-2 rounded text-xs font-mono font-medium tracking-wide uppercase transition-all duration-150 text-center bg-transparent text-zinc-500 hover:text-zinc-800 no-underline"
          >
            Create Account
          </Link>
          <Link
            to="/login"
            role="tab"
            aria-selected={true}
            className="py-2 rounded text-xs font-mono font-medium tracking-wide uppercase transition-all duration-150 text-center bg-white text-black shadow-sm no-underline"
          >
            Log In
          </Link>
        </div>

        <header className="mb-5">
          <p className="m-0 mb-1.5 text-[#85858e] text-[10px] font-mono tracking-widest uppercase">
            Resume progress
          </p>
          <h2 id="login-title" className="m-0 mb-1 text-2xl font-semibold tracking-tight text-black">
            Welcome back
          </h2>
          <p className="m-0 text-[#777781] text-sm tracking-tight">
            Need a private account?{' '}
            <Link
              to="/signup"
              className="p-0 border-0 bg-transparent text-black font-semibold underline underline-offset-4 hover:text-blue-600"
            >
              Sign up
            </Link>
          </p>
        </header>

        {/* Social Logins */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            className="h-11 flex items-center justify-center gap-2 border border-[#e9e9eb] rounded bg-white hover:bg-neutral-50 hover:border-neutral-400 text-neutral-900 text-xs font-mono font-medium tracking-wide transition-all duration-150 hover:-translate-y-0.5 cursor-pointer"
            onClick={() => handleSocialLogin('Google')}
          >
            <span className="w-4 text-sm font-bold text-[#4285f4]">G</span>
            <span>Google</span>
          </button>
          <button
            type="button"
            className="h-11 flex items-center justify-center gap-2 border border-[#e9e9eb] rounded bg-white hover:bg-neutral-50 hover:border-neutral-400 text-neutral-900 text-xs font-mono font-medium tracking-wide transition-all duration-150 hover:-translate-y-0.5 cursor-pointer"
            onClick={() => handleSocialLogin('Apple')}
          >
            <span className="w-4 text-base font-bold text-neutral-900"></span>
            <span>Apple</span>
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <span className="h-px flex-1 bg-[#e9e9eb]" />
          <p className="m-0 whitespace-nowrap text-[#97979f] text-[9px] font-mono tracking-widest uppercase">
            Or traditionally via email
          </p>
          <span className="h-px flex-1 bg-[#e9e9eb]" />
        </div>

        {/* Log In Form */}
        <form onSubmit={handleSubmit}>
          <div className="grid gap-3.5">
            <label className="grid gap-1.5">
              <span className="text-slate-500 text-[10px] font-mono font-medium tracking-wider uppercase">
                EMAIL ADDRESS
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                required
                autoComplete="email"
                className="w-full h-11 px-3.5 border border-[#e9e9eb] rounded bg-white text-black text-sm tracking-tight outline-none placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-[#010120]/10 transition-all duration-150"
              />
            </label>

            <label className="grid gap-1.5">
              <span className="text-slate-500 text-[10px] font-mono font-medium tracking-wider uppercase">
                PASSWORD
              </span>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  autoComplete="current-password"
                  className="w-full h-11 pl-3.5 pr-11 border border-[#e9e9eb] rounded bg-white text-black text-sm tracking-tight outline-none placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-[#010120]/10 transition-all duration-150"
                />
                <button
                  type="button"
                  className="absolute top-0 right-0 w-11 h-11 flex items-center justify-center border-0 bg-transparent text-slate-500 hover:text-black transition-colors cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
            </label>
          </div>

          {/* Remember Me / Forgot Password */}
          <div className="flex justify-between items-center my-3 text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-slate-500">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border border-slate-300 accent-black cursor-pointer"
              />
              <span>Remember this device</span>
            </label>
            <a
              href="#forgot"
              className="text-slate-500 hover:text-black hover:underline"
              onClick={(e) => {
                e.preventDefault();
                setFeedback({
                  type: 'demo',
                  text: 'Password reset link sent to demo email address.',
                });
              }}
            >
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="group w-full h-12 flex items-center justify-center gap-2 border border-black rounded bg-black hover:bg-neutral-800 active:translate-y-0 text-white font-mono text-xs font-medium tracking-wider uppercase shadow-md transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lg cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed mt-4"
          >
            {isSubmitting ? (
              <span>AUTHENTICATING...</span>
            ) : (
              <>
                <span>ENTER SANCTUARY</span>
                <span className="text-base transition-transform duration-150 group-hover:translate-x-1">→</span>
              </>
            )}
          </button>
        </form>

        {feedback && (
          <div
            className={`mt-4 p-3 rounded text-xs text-center border animate-in fade-in duration-200 ${
              feedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-blue-50 border-blue-200 text-blue-800'
            }`}
            role="status"
          >
            {feedback.text}
          </div>
        )}
      </div>
    </section>
  );
}

export default LoginPage;
