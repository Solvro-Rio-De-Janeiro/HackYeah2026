import { useState } from "react";
import { Link, redirect } from "react-router-dom";
import { useForm } from "react-hook-form";
import { LoginFormData, loginFormSchema } from "../schemas/login-form-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { LogIn } from "lucide-react";
import { PasswordInput } from "../components/password-input";

export function LoginPage() {
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
    const { email, password, rememberMe } = formData;

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

      redirect("/dashboard");
    } catch (err) {
      if (err instanceof Error) {
        setServerError(err.message);
      }
    }
  }

  return (
    <section
      aria-labelledby="login-title"
      className="w-full flex items-center justify-center"
    >
      <div className="relative w-full max-w-md p-6 sm:p-9 border border-white/10 rounded bg-white shadow-[0_16px_36px_rgba(0,0,0,0.35)]">
        <div
          className="grid grid-cols-2 bg-[#f1f2f5] rounded p-1 mb-6"
          role="tablist"
        >
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
          <h2
            id="login-title"
            className="m-0 mb-1 text-2xl font-semibold tracking-tight text-black"
          >
            Welcome back
          </h2>
          <p className="m-0 text-[#777781] text-sm tracking-tight">
            Need a private account?{" "}
            <Link
              to="/signup"
              className="p-0 border-0 bg-transparent text-black font-semibold underline underline-offset-4 hover:text-blue-600"
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
              <span className="text-slate-500 text-[10px] font-mono font-medium tracking-wider uppercase">
                EMAIL ADDRESS
              </span>
              <input
                {...register("email")}
                type="email"
                placeholder="name@domain.com"
                autoComplete="email"
                className={`w-full h-11 px-3.5 border rounded bg-white text-black text-sm tracking-tight outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-[#010120]/10 transition-all duration-150 ${
                  errors.email
                    ? "border-red-500"
                    : "border-[#e9e9eb] focus:border-slate-500"
                }`}
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.email.message}
                </p>
              )}
            </label>

            <label className="grid gap-1.5">
              <span className="text-slate-500 text-[10px] font-mono font-medium tracking-wider uppercase">
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
                <p className="text-red-500 text-xs mt-1">
                  {errors.password.message}
                </p>
              )}
            </label>
          </div>

          <div className="flex justify-between items-center my-3 text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-slate-500">
              <input
                {...register("rememberMe")}
                type="checkbox"
                className="w-4 h-4 rounded border border-slate-300 accent-black cursor-pointer"
                disabled={isSubmitting}
              />
              <span>Remember me</span>
            </label>
            <Link
              to="/forgot-password"
              className="text-slate-500 hover:text-black hover:underline"
            >
              Forgot password?
            </Link>
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
