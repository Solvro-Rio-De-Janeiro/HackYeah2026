import React, { useState } from "react";
import {
  UseFormRegister,
  FieldErrors,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import { RegisterFormData } from "../schemas/register-form-schema";
import {
  CreditCard,
  Lock,
  ShieldCheck,
  Sparkles,
  Check,
  Clock,
} from "lucide-react";
import PaymentTimerModal from "./common/PaymentTimerModal";

interface PaymentMethodSectionProps {
  register: UseFormRegister<RegisterFormData>;
  errors: FieldErrors<RegisterFormData>;
  setValue: UseFormSetValue<RegisterFormData>;
  watch: UseFormWatch<RegisterFormData>;
  disabled?: boolean;
}

export function PaymentMethodSection({
  register,
  errors,
  setValue,
  watch,
  disabled = false,
}: PaymentMethodSectionProps) {
  const selectedMethod = watch("paymentMethod") || "card";
  const cardNumberValue = watch("cardNumber") || "";
  const cardExpiryValue = watch("cardExpiry") || "";
  const blikCodeValue = watch("blikCode") || "742 819";
  const [testCardLoaded, setTestCardLoaded] = useState(false);
  const [showTimerModal, setShowTimerModal] = useState(false);
  const [timerConfirmed, setTimerConfirmed] = useState(false);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Detect card brand from first digits
  const getCardBrand = (number: string) => {
    const clean = number.replace(/\D/g, "");
    if (clean.startsWith("4")) return "visa";
    if (/^(5[1-5]|2[2-7])/.test(clean)) return "mastercard";
    if (/^3[47]/.test(clean)) return "amex";
    return "generic";
  };

  const cardBrand = getCardBrand(cardNumberValue);

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "").slice(0, 16);
    // Format into groups of 4 digits: XXXX XXXX XXXX XXXX
    const parts = value.match(/.{1,4}/g);
    const formatted = parts ? parts.join(" ") : value;
    setValue("cardNumber", formatted, { shouldValidate: true });
    setTestCardLoaded(false);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (value.length > 2) {
      value = `${value.slice(0, 2)}/${value.slice(2)}`;
    }
    setValue("cardExpiry", value, { shouldValidate: true });
    setTestCardLoaded(false);
  };

  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 4);
    setValue("cardCvc", value, { shouldValidate: true });
    setTestCardLoaded(false);
  };

  const handleFillTestCard = () => {
    setValue("paymentMethod", "card", { shouldValidate: true });
    setValue("cardholderName", "Jan Kowalski", { shouldValidate: true });
    setValue("cardNumber", "4242 4242 4242 4242", { shouldValidate: true });
    setValue("cardExpiry", "12/28", { shouldValidate: true });
    setValue("cardCvc", "424", { shouldValidate: true });
    setValue("postalCode", "00-001", { shouldValidate: true });
    setTestCardLoaded(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setTestCardLoaded(false), 3000);
  };

  return (
    <div className="payment-method-section border border-slate-200 dark:border-white/10 rounded-lg p-4 bg-slate-50/70 dark:bg-white/[0.03] mt-2 transition-colors">
      {/* Header with Stripe badge */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-1.5">
          <CreditCard className="size-4 text-slate-700 dark:text-white" />
          <span className="text-slate-700 dark:text-white text-[11px] font-mono font-bold tracking-wider uppercase">
            PAYMENT METHOD
          </span>
        </div>

        <div
          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#635bff]/10 border border-[#635bff]/30 text-[#635bff] text-[10px] font-mono font-medium tracking-wide"
          title="Powered by Stripe"
        >
          <Lock className="size-2.5" />
          <span>Stripe Secure</span>
        </div>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 leading-relaxed m-0">
        Connected for daily group accountability pledge deposits. You won't be
        charged upon sign up.
      </p>

      {/* Payment Method Selector Tabs */}
      <div
        className="grid grid-cols-2 gap-1.5 p-1 bg-slate-200/80 dark:bg-white/10 rounded mb-4"
        role="radiogroup"
        aria-label="Wybierz metodę płatności"
      >
        <button
          type="button"
          role="radio"
          aria-checked={selectedMethod === "card"}
          disabled={disabled}
          onClick={() => setValue("paymentMethod", "card")}
          className={`py-1.5 px-2 rounded text-xs font-mono font-medium transition-all duration-150 flex items-center justify-center gap-1 cursor-pointer ${
            selectedMethod === "card"
              ? "bg-white dark:bg-white/20 text-black dark:text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white"
          }`}
        >
          <CreditCard className="size-3.5" />
          <span>Card</span>
        </button>

        <button
          type="button"
          role="radio"
          aria-checked={selectedMethod === "blik"}
          disabled={disabled}
          onClick={() => setValue("paymentMethod", "blik")}
          className={`py-1.5 px-2 rounded text-xs font-mono font-medium transition-all duration-150 flex items-center justify-center gap-1 cursor-pointer ${
            selectedMethod === "blik"
              ? "bg-white dark:bg-white/20 text-black dark:text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white"
          }`}
        >
          <span className="font-bold tracking-tighter text-[#e0004d]">BLIK</span>
        </button>
      </div>

      {/* Hidden input to register paymentMethod field */}
      <input type="hidden" {...register("paymentMethod")} />

      {/* CARD PAYMENT ELEMENT */}
      {selectedMethod === "card" && (
        <div className="grid gap-3">
          {/* Test Card Quick Fill Button */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleFillTestCard}
              disabled={disabled}
              className="text-[11px] font-mono text-[#635bff] dark:text-[#a594fd] hover:underline flex items-center gap-1 bg-[#635bff]/5 dark:bg-[#635bff]/20 border border-[#635bff]/20 px-2 py-0.5 rounded cursor-pointer transition-all"
            >
              {testCardLoaded ? (
                <>
                  <Check className="size-3 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-600 dark:text-emerald-400">
                    Loaded test card!
                  </span>
                </>
              ) : (
                <>
                  <Sparkles className="size-3" />
                  <span>Use Stripe test card (4242)</span>
                </>
              )}
            </button>
          </div>

          {/* Cardholder Name */}
          <label className="grid gap-1">
            <span className="text-slate-500 dark:text-slate-400 text-[10px] font-mono font-medium tracking-wider uppercase">
              CARDHOLDER NAME
            </span>
            <input
              {...register("cardholderName")}
              type="text"
              placeholder="e.g. Jan Kowalski"
              disabled={disabled}
              autoComplete="cc-name"
              className={`w-full h-10 px-3 border rounded bg-white text-black dark:bg-[#161622] dark:text-white text-sm tracking-tight outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-[#010120]/10 transition-all ${
                errors.cardholderName
                  ? "border-red-500"
                  : "border-[#e9e9eb] dark:border-white/10 focus:border-slate-500"
              }`}
            />
            {errors.cardholderName && (
              <p className="text-red-500 text-xs m-0">
                {errors.cardholderName.message}
              </p>
            )}
          </label>

          {/* Card Number with brand detection */}
          <label className="grid gap-1">
            <span className="text-slate-500 dark:text-slate-400 text-[10px] font-mono font-medium tracking-wider uppercase">
              CARD NUMBER
            </span>
            <div className="relative flex items-center">
              <CreditCard className="absolute left-3 size-4 text-slate-400 pointer-events-none shrink-0" />
              <input
                {...register("cardNumber")}
                type="text"
                value={cardNumberValue}
                onChange={handleCardNumberChange}
                placeholder="4242 •••• •••• 4242"
                disabled={disabled}
                autoComplete="cc-number"
                maxLength={19}
                className={`w-full h-10 pl-9.5 pr-16 border rounded bg-white text-black dark:bg-[#161622] dark:text-white text-sm font-mono tracking-wider outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-[#010120]/10 transition-all ${
                  errors.cardNumber
                    ? "border-red-500"
                    : "border-[#e9e9eb] dark:border-white/10 focus:border-slate-500"
                }`}
              />
              <div className="absolute right-2.5 flex items-center gap-1 pointer-events-none">
                {cardBrand === "visa" && (
                  <span className="text-[11px] font-extrabold italic text-blue-600 bg-blue-50 dark:bg-blue-950/80 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                    VISA
                  </span>
                )}
                {cardBrand === "mastercard" && (
                  <span className="text-[10px] font-bold text-orange-600 bg-orange-50 dark:bg-orange-950/80 px-1.5 py-0.5 rounded border border-orange-200 dark:border-orange-800 flex items-center gap-0.5">
                    <span className="w-2 h-2 rounded-full bg-red-500 inline-block -mr-1" />
                    <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                    <span className="ml-1">MC</span>
                  </span>
                )}
                {cardBrand === "amex" && (
                  <span className="text-[10px] font-bold text-sky-700 bg-sky-50 dark:bg-sky-950/80 px-1.5 py-0.5 rounded border border-sky-200">
                    AMEX
                  </span>
                )}
              </div>
            </div>
            {errors.cardNumber && (
              <p className="text-red-500 text-xs m-0">
                {errors.cardNumber.message}
              </p>
            )}
          </label>

          {/* Expiry, CVC & ZIP in a 3-column row */}
          <div className="grid grid-cols-3 gap-2">
            <label className="grid gap-1">
              <span className="text-slate-500 dark:text-slate-400 text-[10px] font-mono font-medium tracking-wider uppercase">
                EXPIRES
              </span>
              <input
                {...register("cardExpiry")}
                type="text"
                value={cardExpiryValue}
                onChange={handleExpiryChange}
                placeholder="MM/YY"
                disabled={disabled}
                autoComplete="cc-exp"
                maxLength={5}
                className={`w-full h-10 px-2.5 border rounded bg-white text-black dark:bg-[#161622] dark:text-white text-sm font-mono tracking-wider outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-[#010120]/10 transition-all ${
                  errors.cardExpiry
                    ? "border-red-500"
                    : "border-[#e9e9eb] dark:border-white/10 focus:border-slate-500"
                }`}
              />
              {errors.cardExpiry && (
                <p className="text-red-500 text-[10px] m-0 leading-tight">
                  {errors.cardExpiry.message}
                </p>
              )}
            </label>

            <label className="grid gap-1">
              <span className="text-slate-500 dark:text-slate-400 text-[10px] font-mono font-medium tracking-wider uppercase">
                CVC / CVV
              </span>
              <div className="relative flex items-center">
                <input
                  {...register("cardCvc")}
                  type="password"
                  onChange={handleCvcChange}
                  placeholder="•••"
                  disabled={disabled}
                  autoComplete="cc-csc"
                  maxLength={4}
                  className={`w-full h-10 pl-2.5 pr-7 border rounded bg-white text-black dark:bg-[#161622] dark:text-white text-sm font-mono tracking-wider outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-[#010120]/10 transition-all ${
                    errors.cardCvc
                      ? "border-red-500"
                      : "border-[#e9e9eb] dark:border-white/10 focus:border-slate-500"
                  }`}
                />
                <Lock className="absolute right-2 size-3.5 text-slate-400 pointer-events-none" />
              </div>
              {errors.cardCvc && (
                <p className="text-red-500 text-[10px] m-0 leading-tight">
                  {errors.cardCvc.message}
                </p>
              )}
            </label>

            <label className="grid gap-1">
              <span className="text-slate-500 dark:text-slate-400 text-[10px] font-mono font-medium tracking-wider uppercase">
                POSTAL CODE
              </span>
              <input
                {...register("postalCode")}
                type="text"
                placeholder="00-001"
                disabled={disabled}
                autoComplete="postal-code"
                maxLength={8}
                className="w-full h-10 px-2.5 border border-[#e9e9eb] dark:border-white/10 rounded bg-white text-black dark:bg-[#161622] dark:text-white text-sm font-mono tracking-wider outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-[#010120]/10 focus:border-slate-500 transition-all"
              />
            </label>
          </div>
        </div>
      )}

      {/* BLIK PAYMENT ELEMENT */}
      {selectedMethod === "blik" && (
        <div className="grid gap-3 py-1">
          <label className="grid gap-1">
            <span className="text-slate-500 dark:text-slate-400 text-[10px] font-mono font-medium tracking-wider uppercase">
              KOD BLIK (6 CYFR)
            </span>
            <div className="relative flex items-center">
              <input
                {...register("blikCode")}
                type="text"
                placeholder="123 456"
                disabled={disabled}
                maxLength={7}
                className={`w-full h-11 px-3 border rounded bg-white text-black dark:bg-[#161622] dark:text-white text-base font-mono tracking-widest outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-[#e0004d]/20 transition-all text-center ${
                  errors.blikCode
                    ? "border-red-500"
                    : "border-[#e9e9eb] dark:border-white/10 focus:border-[#e0004d]"
                }`}
              />
            </div>
            {errors.blikCode && (
              <p className="text-red-500 text-xs m-0">
                {errors.blikCode.message}
              </p>
            )}
          </label>
          <p className="text-xs text-slate-500 dark:text-slate-400 m-0 leading-relaxed">
            Przepisz kod z aplikacji bankowej. Po rejestracji i utworzeniu
            pierwszego celu otrzymasz powiadomienie o autoryzacji w telefonie.
          </p>

          <button
            type="button"
            onClick={() => setShowTimerModal(true)}
            className="w-full py-2 px-3 border border-dashed border-[#e0004d]/40 hover:border-[#e0004d] hover:bg-[#e0004d]/5 rounded text-xs font-mono text-[#e0004d] transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Clock className="size-3.5" />
            <span>Przetestuj autoryzację BLIK ⏱</span>
          </button>

          {timerConfirmed && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded text-emerald-800 text-xs font-mono flex items-center gap-2">
              <Check className="size-3.5 text-emerald-600 shrink-0" />
              <span>Autoryzacja BLIK potwierdzona (symulacja)!</span>
            </div>
          )}
        </div>
      )}

      {/* Security Assurance Footer */}
      <div className="flex items-center gap-2 pt-3 mt-3 border-t border-slate-200/80 dark:border-white/10 text-slate-500 dark:text-slate-400 text-[11px] leading-tight">
        <ShieldCheck className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
        <span>
          End-to-end 256-bit encryption. Payment info tokenized directly by
          Stripe (PCI-DSS Level 1 certified).
        </span>
      </div>

      {/* BLIK Payment Waiting Timer Demo Modal */}
      <PaymentTimerModal
        isOpen={showTimerModal}
        onClose={() => setShowTimerModal(false)}
        onSuccess={() => {
          setTimerConfirmed(true);
        }}
        amount={30}
        method="blik"
        blikCode={blikCodeValue}
        title="Weryfikacja metody płatności"
        groupName="Rejestracja profilu"
        durationSeconds={120}
      />
    </div>
  );
}

export default PaymentMethodSection;
