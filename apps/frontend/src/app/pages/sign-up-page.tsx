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
import { PaymentMethodSection } from "../components/payment-method-section";
import { setAuthToken } from "../auth";

export function SignUpPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      email: "",
      password: "",
      repeatPassword: "",
      username: "",
      termsAccepted: false,
      paymentMethod: "card",
      cardNumber: "",
      cardExpiry: "",
      cardCvc: "",
      cardholderName: "",
      postalCode: "",
      blikCode: "",
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
          name: formData.username,
          email: formData.email,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData?.detail ||
            errorData?.message ||
            "Rejestracja nie powiodła się. Spróbuj ponownie.",
        );
      }

      const data = await response.json().catch(() => null);
      if (data?.access_token) {
        setAuthToken(data.access_token);
        try {
          const meRes = await fetch(`${API_URL}/api/auth/me`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${data.access_token}`,
            },
          });
          if (meRes.ok) {
            const meData = await meRes.json();
            setStoredUser(meData);
          } else {
            setStoredUser({
              id: "",
              name: formData.username,
              email: formData.email,
              role: "user",
            });
          }
        } catch {
          setStoredUser({
            id: "",
            name: formData.username,
            email: formData.email,
            role: "user",
          });
        }
      } else {
        setAuthToken("authenticated-session");
        setStoredUser({
          id: "",
          name: formData.username,
          email: formData.email,
          role: "user",
        });
      }
      navigate("/dashboard");
    } catch (err) {
      if (err instanceof Error) {
        setServerError(err.message);
      } else {
        setServerError("Wystąpił nieoczekiwany błąd");
      }
    }
  }

  return (
    <section
      aria-labelledby="signup-title"
      className="w-full flex items-center justify-center my-4"
    >
      <div className="auth-card relative w-full max-w-4xl p-6 sm:p-9 border border-[#e5e5eb] rounded-2xl bg-white shadow-[0_10px_35px_rgba(0,0,0,0.05)] transition-all">
        <div
          className="auth-tabs grid grid-cols-2 bg-[#f4f4f7] rounded-lg p-1 mb-6 border border-[#e5e5ea]"
          role="tablist"
        >
          <Link
            to="/signup"
            role="tab"
            aria-selected={true}
            className="auth-tab-active py-2 rounded-md text-xs font-mono font-semibold tracking-wide uppercase transition-all duration-150 text-center bg-white text-[#010120] shadow-sm no-underline"
          >
            Utwórz konto
          </Link>
          <Link
            to="/login"
            role="tab"
            aria-selected={false}
            className="auth-tab-inactive py-2 rounded-md text-xs font-mono font-medium tracking-wide uppercase transition-all duration-150 text-center bg-transparent text-slate-500 hover:text-black no-underline"
          >
            Zaloguj się
          </Link>
        </div>

        <header className="mb-5">
          <p className="m-0 mb-1.5 text-[#85858e] text-[10px] font-mono tracking-widest uppercase">
            Twoja przestrzeń, twój rytm
          </p>
          <h2
            id="signup-title"
            className="m-0 mb-1 text-2xl font-semibold tracking-tight text-black dark:text-white"
          >
            Utwórz konto
          </h2>
          <p className="m-0 text-[#777781] dark:text-[#a0a0ab] text-sm tracking-tight">
            Masz już profil?{" "}
            <Link
              to="/login"
              className="p-0 border-0 bg-transparent text-black dark:text-white font-semibold underline underline-offset-4 hover:text-blue-600 dark:hover:text-blue-400"
            >
              Zaloguj się
            </Link>
          </p>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3.5">
          {serverError && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {serverError}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-3.5">
            <div className="flex flex-col w-full gap-3.5 items-start">
              <label className="grid gap-1.5 w-full">
                <span className="text-slate-500 dark:text-slate-400 text-[10px] font-mono font-medium tracking-wider uppercase">
                  ADRES E-MAIL
                </span>
                <input
                  {...register("email")}
                  type="email"
                  disabled={isSubmitting}
                  placeholder="imie@domena.pl"
                  autoComplete="email"
                  className={`w-full h-11 px-3.5 border rounded bg-white text-black dark:bg-[#161622] dark:text-white text-sm tracking-tight outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-[#010120]/10 transition-all duration-150 ${
                    errors.email
                      ? "border-red-500"
                      : "border-[#e9e9eb] dark:border-white/10 focus:border-slate-500"
                  }`}
                />

                {errors.email && (
                  <p className="text-red-500 text-xs mt-1 m-0">
                    {errors.email.message}
                  </p>
                )}
              </label>

              <label className="grid gap-1.5 w-full">
                <span className="text-slate-500 dark:text-slate-400 text-[10px] font-mono font-medium tracking-wider uppercase">
                  HASŁO
                </span>
                <PasswordInput
                  {...register("password")}
                  error={errors.password != null}
                  placeholder="Utwórz hasło"
                  disabled={isSubmitting}
                  autoComplete="new-password"
                />
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1 m-0">
                    {errors.password.message}
                  </p>
                )}
              </label>

              <label className="grid gap-1.5 w-full">
                <span className="text-slate-500 dark:text-slate-400 text-[10px] font-mono font-medium tracking-wider uppercase">
                  POWTÓRZ HASŁO
                </span>
                <PasswordInput
                  {...register("repeatPassword")}
                  error={errors.repeatPassword != null}
                  placeholder="Potwierdź hasło"
                  disabled={isSubmitting}
                  autoComplete="new-password"
                />
                {errors.repeatPassword && (
                  <p className="text-red-500 text-xs mt-1 m-0">
                    {errors.repeatPassword.message}
                  </p>
                )}
              </label>

              <label className="grid gap-1.5 w-full">
                <span className="text-slate-500 dark:text-slate-400 text-[10px] font-mono font-medium tracking-wider uppercase">
                  PSEUDONIM ANONIMOWY{" "}
                  <em className="not-italic opacity-70">
                    (WIDOCZNY DLA SPOŁECZNOŚCI)
                  </em>
                </span>
                <input
                  {...register("username")}
                  type="text"
                  placeholder="np. Phoenix2026"
                  disabled={isSubmitting}
                  autoComplete="username"
                  className={`w-full h-11 px-3.5 border rounded bg-white text-black dark:bg-[#161622] dark:text-white text-sm tracking-tight outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-[#010120]/10 transition-all duration-150 ${
                    errors.username
                      ? "border-red-500"
                      : "border-[#e9e9eb] dark:border-white/10 focus:border-slate-500"
                  }`}
                />

                {errors.username && (
                  <p className="text-red-500 text-xs mt-1 m-0">
                    {errors.username.message}
                  </p>
                )}
              </label>
              <label className="my-3 text-xs leading-relaxed text-[#010120] cursor-pointer">
                <div className="flex items-start gap-2 w-full">
                  <input
                    {...register("termsAccepted")}
                    type="checkbox"
                    disabled={isSubmitting}
                    className={`size-4 mt-0.5 rounded border accent-[#010120] cursor-pointer ${
                      errors.termsAccepted
                        ? "outline-2 outline-red-500 ring-2 ring-red-500/20"
                        : "border-slate-300"
                    }`}
                  />
                  <span className="text-[#010120] font-normal leading-relaxed">
                    Akceptuję{" "}
                    <a
                      href="#terms"
                      onClick={(e) => e.preventDefault()}
                      className="text-[#010120] font-bold underline underline-offset-2 hover:opacity-80"
                    >
                      regulamin
                    </a>{" "}
                    oraz potwierdzam, że zapoznałem się z{" "}
                    <a
                      href="#privacy"
                      onClick={(e) => e.preventDefault()}
                      className="text-[#010120] font-bold underline underline-offset-2 hover:opacity-80"
                    >
                      polityką prywatności
                    </a>
                    .
                  </span>
                </div>

                {errors.termsAccepted && (
                  <p className="text-red-500 text-xs mt-1 m-0">
                    {errors.termsAccepted.message}
                  </p>
                )}
              </label>
            </div>

            <PaymentMethodSection
              register={register}
              errors={errors}
              setValue={setValue}
              watch={watch}
              disabled={isSubmitting}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="auth-submit-btn group w-full h-12 flex items-center justify-center gap-2 border border-[#010120] rounded-lg bg-[#010120] text-white hover:bg-[#1a1a36] active:translate-y-0 font-mono text-xs font-semibold tracking-wider uppercase shadow-md transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lg cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed mt-1"
          >
            {isSubmitting ? (
              <span className="text-white font-semibold">REJESTRACJA...</span>
            ) : (
              <>
                <LogIn className="size-4 text-white" />
                <span className="text-white font-bold tracking-wider">
                  ZAREJESTRUJ SIĘ
                </span>
              </>
            )}
          </button>
        </form>
      </div>
    </section>
  );
}

export default SignUpPage;
