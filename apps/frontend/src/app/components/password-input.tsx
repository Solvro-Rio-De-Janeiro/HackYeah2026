import { useState, ComponentPropsWithoutRef, forwardRef } from "react";
import { Eye, EyeOff } from "lucide-react";

interface PasswordInputProps extends Omit<
  ComponentPropsWithoutRef<"input">,
  "type"
> {
  error?: boolean;
}

export function PasswordInput({
  error,
  className = "",
  disabled,
  ...props
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <input
        {...props}
        type={showPassword ? "text" : "password"}
        disabled={disabled}
        autoComplete="current-password"
        className={`w-full h-11 pl-3.5 pr-11 border rounded bg-white text-black text-sm tracking-tight outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-[#010120]/10 transition-all duration-150 ${
          error ? "border-red-500" : "border-[#e9e9eb] focus:border-slate-500"
        } ${className}`}
      />
      <button
        type="button"
        disabled={disabled}
        className="absolute top-0 right-0 w-11 h-11 flex items-center justify-center border-0 bg-transparent text-slate-500 hover:text-black transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => setShowPassword((prev) => !prev)}
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? (
          <EyeOff className="size-6" />
        ) : (
          <Eye className="size-6" />
        )}
      </button>
    </div>
  );
}

PasswordInput.displayName = "PasswordInput";
