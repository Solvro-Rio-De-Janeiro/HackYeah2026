import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { LoginFormData, loginFormSchema } from "../schemas/login-form-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { LogIn } from "lucide-react";
import { PasswordInput } from "../components/password-input";
import { setAuthToken, setStoredUser } from "../auth";

export function LoginPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  async function onSubmit(formData: LoginFormData) {
    const API_URL = import.meta.env.VITE_API_URL || "";
    setServerError(null);
    const { email, password } = formData;

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Invalid email or password");
        }
        throw new Error("Something went wrong. Please try again later.");
      }

      const data = await response.json().catch(() => null);
      if (data?.access_token) {
        setAuthToken(data.access_token);
        try {
          const meRes = await fetch(`${API_URL}/api/auth/me`, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${data.access_token}`,
            },
          });
          if (meRes.ok) {
            const meData = await meRes.json();
            setStoredUser(meData);
          } else {
            setStoredUser({ id: '', name: email.split('@')[0], email, role: 'user' });
          }
        } catch {
          setStoredUser({ id: '', name: email.split('@')[0], email, role: 'user' });
        }
      } else {
        setAuthToken('authenticated-session');
        setStoredUser({ id: '', name: email.split('@')[0], email, role: 'user' });
      }
      navigate("/dashboard");
    } catch (err) {
      if (err instanceof Error) {
        setServerError(err.message);
      }
    }
  }

  return (
    <section
      aria-labelledby="login-title"
      className="w-full flex items-center justify-center my-4"
    >
      <div className="auth-card relative w-full max-w-md p-6 sm:p-9 border border-[#e5e5eb] rounded-2xl bg-white shadow-[0_10px_35px_rgba(0,0,0,0.05)] transition-all">
        <div
          className="auth-tabs grid grid-cols-2 bg-[#f4f4f7] rounded-lg p-1 mb-6 border border-[#e5e5ea]"
          role="tablist"
        >
          <Link
            to="/signup"
            role="tab"
            aria-selected={false}
            className="auth-tab-inactive py-2 rounded-md text-xs font-mono font-medium tracking-wide uppercase transition-all duration-150 text-center bg-transparent text-slate-500 hover:text-black no-underline"
          >
            Create Account
          </Link>
          <Link
            to="/login"
            role="tab"
            aria-selected={true}
            className="auth-tab-active py-2 rounded-md text-xs font-mono font-semibold tracking-wide uppercase transition-all duration-150 text-center bg-white text-[#010120] shadow-sm no-underline"
          >
            Log In
          </Link>
        </div>

        <header className="mb-5">
          <p className="m-0 mb-1.5 text-[#85858e] text-[10px] font-mono tracking-widest uppercase">
            Resume progress
          </p>
          <h2
            id="login-title"
            className="m-0 mb-1 text-2xl font-bold tracking-tight text-[#010120] dark:text-white"
          >
            Welcome back
          </h2>
          <p className="m-0 text-[#777781] dark:text-[#a0a0ab] text-sm tracking-tight">
            Need a private account?{" "}
            <Link
              to="/signup"
              className="p-0 border-0 bg-transparent text-[#010120] dark:text-white font-semibold underline underline-offset-4 hover:text-[#7472d5] dark:hover:text-[#bdbbff]"
            >
              Sign up
            </Link>
          </p>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3.5">
          {serverError && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {serverError}
            </div>
          )}

          <div className="grid gap-3.5">
            <label className="grid gap-1.5">
              <span className="text-slate-500 dark:text-slate-400 text-[10px] font-mono font-medium tracking-wider uppercase">
                EMAIL ADDRESS
              </span>
              <input
                {...register("email")}
                type="email"
                placeholder="name@domain.com"
                autoComplete="email"
                className={`w-full h-11 px-3.5 border rounded-lg bg-white text-black dark:bg-[#161622] dark:text-white text-sm tracking-tight outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-[#010120]/10 transition-all duration-150 ${
                  errors.email
                    ? "border-red-500"
                    : "border-[#e5e5eb] dark:border-white/10 focus:border-slate-500"
                }`}
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1 m-0">
                  {errors.email.message}
                </p>
              )}
            </label>

            <label className="grid gap-1.5">
              <span className="text-slate-500 dark:text-slate-400 text-[10px] font-mono font-medium tracking-wider uppercase">
                PASSWORD
              </span>

              <PasswordInput
                {...register("password")}
                error={errors.password != null}
                disabled={isSubmitting}
                autoComplete="current-password"
                placeholder="Enter password"
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1 m-0">
                  {errors.password.message}
                </p>
              )}
            </label>
          </div>

          <div className="flex justify-between items-center my-3 text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400">
              <input
                {...register("rememberMe")}
                type="checkbox"
                className="w-4 h-4 rounded border border-slate-300 accent-[#010120] cursor-pointer"
                disabled={isSubmitting}
              />
              <span>Remember me</span>
            </label>
            <Link
              to="/forgot-password"
              className="text-slate-500 dark:text-slate-400 hover:text-[#010120] dark:hover:text-white hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="auth-submit-btn group w-full h-12 flex items-center justify-center gap-2 border border-black rounded-lg bg-black text-white hover:bg-neutral-800 active:translate-y-0 font-mono text-xs font-semibold tracking-wider uppercase shadow-md transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lg cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed mt-4"
          >
            {isSubmitting ? (
              <span>AUTHENTICATING...</span>
            ) : (
              <>
                <LogIn className="size-4" />
                LOG IN
              </>
            )}
          </button>
        </form>
      </div>
    </section>
  );
}

export default LoginPage;
