import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PasswordInput } from "../components/password-input";
import { LogIn } from "lucide-react";
import {
  RegisterFormData,
  registerFormSchema,
} from "../schemas/register-form-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

export function SignUpPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      email: "",
      password: "",
      repeatPassword: "",
      username: "",
      termsAccepted: false,
    },
  });

  async function onSubmit(formData: RegisterFormData) {
    setServerError(null);

    const API_URL = import.meta.env.VITE_API_URL || "";

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData?.message || "Registration failed. Please try again.",
        );
      }

      navigate("/dashboard");
    } catch (err) {
      if (err instanceof Error) {
        setServerError(err.message);
      } else {
        setServerError("An unexpected error occurred");
      }
    }
  }

  return (
    <section
      aria-labelledby="signup-title"
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
            aria-selected={true}
            className="py-2 rounded text-xs font-mono font-medium tracking-wide uppercase transition-all duration-150 text-center bg-white text-black shadow-sm no-underline"
          >
            Create Account
          </Link>
          <Link
            to="/login"
            role="tab"
            aria-selected={false}
            className="py-2 rounded text-xs font-mono font-medium tracking-wide uppercase transition-all duration-150 text-center bg-transparent text-zinc-500 hover:text-zinc-800 no-underline"
          >
            Log In
          </Link>
        </div>

        <header className="mb-5">
          <p className="m-0 mb-1.5 text-[#85858e] text-[10px] font-mono tracking-widest uppercase">
            Your space, your pace
          </p>
          <h2
            id="signup-title"
            className="m-0 mb-1 text-2xl font-semibold tracking-tight text-black"
          >
            Create an account
          </h2>
          <p className="m-0 text-[#777781] text-sm tracking-tight">
            Already have a profile?{" "}
            <Link
              to="/login"
              className="p-0 border-0 bg-transparent text-black font-semibold underline underline-offset-4 hover:text-blue-600"
            >
              Log in
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
                disabled={isSubmitting}
                placeholder="name@domain.com"
                autoComplete="email"
                className={`w-full h-11 px-3.5 border rounded bg-white text-black text-sm tracking-tight outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-[#010120]/10 transition-all duration-150 ${
                  errors.email
                    ? "border-red-500"
                    : "border-[#e9e9eb] focus:border-slate-500"
                }`}
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
                placeholder="Create a password"
                disabled={isSubmitting}
                autoComplete="new-password"
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.password.message}
                </p>
              )}
            </label>

            <label className="grid gap-1.5">
              <span className="text-slate-500 text-[10px] font-mono font-medium tracking-wider uppercase">
                REPEAT PASSWORD
              </span>
              <PasswordInput
                {...register("repeatPassword")}
                error={errors.repeatPassword != null}
                placeholder="Confirm your password"
                disabled={isSubmitting}
                autoComplete="new-password"
              />
              {errors.repeatPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.repeatPassword.message}
                </p>
              )}
            </label>

            <label className="grid gap-1.5">
              <span className="text-slate-500 text-[10px] font-mono font-medium tracking-wider uppercase">
                ANONYMOUS ALIAS{" "}
                <em className="not-italic opacity-70">(COMMUNITY VISIBLE)</em>
              </span>
              <input
                {...register("username")}
                type="text"
                placeholder="e.g. Phoenix2026"
                disabled={isSubmitting}
                autoComplete="username"
                className={`w-full h-11 px-3.5 border rounded bg-white text-black text-sm tracking-tight outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-[#010120]/10 transition-all duration-150" ${
                  errors.username
                    ? "border-red-500"
                    : "border-[#e9e9eb] focus:border-slate-500"
                }`}
              />

              {errors.username && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.username.message}
                </p>
              )}
            </label>
          </div>

          <label className="my-4 text-xs leading-relaxed text-[#777781] cursor-pointer">
            <div className="flex items-start gap-2 w-full">
              <input
                {...register("termsAccepted")}
                type="checkbox"
                disabled={isSubmitting}
                className={`size-4 mt-0.5 rounded border accent-black cursor-pointer ${
                  errors.username
                    ? "outline-2 outline-red-500 ring-2 ring-red-500/20"
                    : "border-slate-300"
                }`}
              />
              <span>
                I accept the{" "}
                <a
                  href="#terms"
                  onClick={(e) => e.preventDefault()}
                  className="text-black underline underline-offset-2"
                >
                  Terms
                </a>{" "}
                and confirm I have read the{" "}
                <a
                  href="#privacy"
                  onClick={(e) => e.preventDefault()}
                  className="text-black underline underline-offset-2"
                >
                  Sensitive Data Privacy Policy
                </a>
                .
              </span>
            </div>

            {errors.termsAccepted && (
              <p className="text-red-500 text-xs mt-1">
                {errors.termsAccepted.message}
              </p>
            )}
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="group w-full h-12 flex items-center justify-center gap-2 border border-black rounded bg-black hover:bg-neutral-800 active:translate-y-0 text-white font-mono text-xs font-medium tracking-wider uppercase shadow-md transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lg cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed mt-1"
          >
            {isSubmitting ? (
              <span>AUTHENTICATING...</span>
            ) : (
              <>
                <LogIn className="size-4" />
                <span>START YOUR JOURNEY</span>
              </>
            )}
          </button>
        </form>
      </div>
    </section>
  );
}

export default SignUpPage;
