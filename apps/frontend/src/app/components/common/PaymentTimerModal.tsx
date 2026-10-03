import React, { useState, useEffect, useRef } from 'react';
import {
  Clock,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
  CreditCard,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { money } from '../../context/DashboardContext';

export interface PaymentTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (details: {
    amount: number;
    method: 'blik' | 'card';
    txId: string;
    paidAt: string;
  }) => void;
  amount?: number;
  method?: 'blik' | 'card';
  blikCode?: string;
  cardLast4?: string;
  title?: string;
  groupName?: string;
  durationSeconds?: number;
  autoSimulateAfterSeconds?: number;
}

export function PaymentTimerModal({
  isOpen,
  onClose,
  onSuccess,
  amount = 30,
  method = 'blik',
  blikCode = '742 819',
  cardLast4 = '4242',
  title = 'Dzienna kwota grupy',
  groupName = 'Sober // Skarbonka',
  durationSeconds = 120,
  autoSimulateAfterSeconds
}: PaymentTimerModalProps) {
  const [timeLeft, setTimeLeft] = useState(durationSeconds);
  const [status, setStatus] = useState<'waiting' | 'approved' | 'expired'>('waiting');
  const [txId, setTxId] = useState('');
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoSimulateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const successCallbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Generate transaction ID on open
  useEffect(() => {
    if (isOpen) {
      setTimeLeft(durationSeconds);
      setStatus('waiting');
      const randomCode = Math.floor(100000 + Math.random() * 900000);
      setTxId(method === 'blik' ? `BLIK-PL-${randomCode}` : `CARD-TX-${randomCode}`);
    } else {
      cleanupTimers();
    }
    return () => cleanupTimers();
  }, [isOpen, durationSeconds, method]);

  const cleanupTimers = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (autoSimulateTimeoutRef.current) {
      clearTimeout(autoSimulateTimeoutRef.current);
      autoSimulateTimeoutRef.current = null;
    }
    if (successCallbackTimeoutRef.current) {
      clearTimeout(successCallbackTimeoutRef.current);
      successCallbackTimeoutRef.current = null;
    }
  };

  // Main countdown timer
  useEffect(() => {
    if (!isOpen || status !== 'waiting') return;

    timerIntervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
          setStatus('expired');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isOpen, status]);

  // Optional auto-simulation after X seconds
  useEffect(() => {
    if (!isOpen || status !== 'waiting' || !autoSimulateAfterSeconds) return;

    autoSimulateTimeoutRef.current = setTimeout(() => {
      handleApprove();
    }, autoSimulateAfterSeconds * 1000);

    return () => {
      if (autoSimulateTimeoutRef.current) clearTimeout(autoSimulateTimeoutRef.current);
    };
  }, [isOpen, status, autoSimulateAfterSeconds]);

  // Handle successful bank approval
  const handleApprove = () => {
    cleanupTimers();
    setStatus('approved');

    successCallbackTimeoutRef.current = setTimeout(() => {
      onSuccess({
        amount,
        method,
        txId: txId || `TX-${Date.now()}`,
        paidAt: new Date().toISOString()
      });
      onClose();
    }, 1800);
  };

  // Reset timer on retry
  const handleRetry = () => {
    cleanupTimers();
    setTimeLeft(durationSeconds);
    setStatus('waiting');
  };

  // Keyboard navigation & ESC
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (status === 'approved') return;
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, status, onClose]);

  if (!isOpen) return null;

  // Formatting helpers
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // SVG Circular progress math (r = 54)
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - timeLeft / durationSeconds);

  return (
    <div
      className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#01012080] backdrop-blur-[6px] animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="payment-timer-title"
      onClick={status !== 'approved' ? onClose : undefined}
    >
      <div
        className="modal payment-timer-card relative w-full max-w-[440px] rounded-2xl bg-white dark:bg-[#161622] border border-[#e5e5eb] dark:border-white/10 p-6 sm:p-8 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        {status !== 'approved' && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Anuluj i zamknij"
            className="absolute top-4 right-4 p-2 text-[#727279] hover:text-[#010120] dark:hover:text-white rounded-full transition-colors cursor-pointer"
          >
            <X className="size-5" />
          </button>
        )}

        {/* Top Eyebrow & Brand */}
        <div className="flex items-center justify-between mb-4">
          <span className="eyebrow muted text-[10px] font-mono tracking-widest uppercase text-[#727279] dark:text-slate-400">
            {method === 'blik' ? 'BLIK // PŁATNOŚĆ MOBILNA' : 'STRIPE // 3D SECURE'}
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[#eeedff] dark:bg-[#2b274c] text-[#554aa6] dark:text-[#bdbbff]">
            <ShieldCheck className="size-3" />
            BEZPIECZNA WPŁATA
          </span>
        </div>

        {/* Title & Amount */}
        <div className="text-center mb-6">
          <h2
            id="payment-timer-title"
            className="text-xl sm:text-2xl font-bold tracking-tight text-[#010120] dark:text-white m-0 mb-1"
          >
            {status === 'waiting' && 'Oczekiwanie na wpłatę'}
            {status === 'approved' && 'Wpłata zatwierdzona!'}
            {status === 'expired' && 'Czas na wpłatę minął'}
          </h2>
          <p className="text-xs text-[#727279] dark:text-slate-400 m-0">
            {title} · <strong className="text-[#010120] dark:text-white font-semibold">{groupName}</strong>
          </p>

          <div className="mt-3 inline-block px-4 py-1.5 rounded-lg bg-[#f4f3fc] dark:bg-white/5 border border-[#ebebeb] dark:border-white/10">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#010120] dark:text-white tracking-tight">
              {money(amount)}
            </span>
          </div>
        </div>

        {/* Central Circular Countdown Gauge */}
        <div className="flex flex-col items-center justify-center my-6" aria-live="polite">
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg
              className="w-full h-full -rotate-90 transform"
              viewBox="0 0 128 128"
              aria-hidden="true"
            >
              {/* Background Track Ring */}
              <circle
                cx="64"
                cy="64"
                r={radius}
                className="stroke-slate-100 dark:stroke-white/10"
                strokeWidth="8"
                fill="none"
              />
              {/* Animated Progress Ring */}
              <circle
                cx="64"
                cy="64"
                r={radius}
                className={`transition-all duration-1000 ease-linear ${
                  status === 'approved'
                    ? 'stroke-emerald-500'
                    : status === 'expired'
                    ? 'stroke-red-500'
                    : timeLeft <= 20
                    ? 'stroke-amber-500'
                    : 'stroke-[#7472d5] dark:stroke-[#8ee9ee]'
                }`}
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={status === 'approved' ? 0 : strokeDashoffset}
                strokeLinecap="round"
                fill="none"
              />
            </svg>

            {/* Inner Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
              {status === 'waiting' && (
                <>
                  <span
                    role="timer"
                    aria-label={`Pozostało ${formattedTime}`}
                    className={`font-mono text-3xl font-bold tracking-tight ${
                      timeLeft <= 20
                        ? 'text-amber-600 dark:text-amber-400 animate-pulse'
                        : 'text-[#010120] dark:text-white'
                    }`}
                  >
                    {formattedTime}
                  </span>
                  <span className="text-[9px] font-mono font-medium uppercase tracking-wider text-[#727279] dark:text-slate-400 mt-0.5">
                    POZOSTAŁY CZAS
                  </span>
                </>
              )}

              {status === 'approved' && (
                <div className="flex flex-col items-center justify-center animate-scaleUp">
                  <CheckCircle2 className="size-12 text-emerald-500 mb-1" />
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    SUKCES ✓
                  </span>
                </div>
              )}

              {status === 'expired' && (
                <div className="flex flex-col items-center justify-center">
                  <AlertCircle className="size-12 text-red-500 mb-1" />
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                    TIMEOUT
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Live Status Description & Steps */}
        {status === 'waiting' && (
          <div className="bg-[#f9fafb] dark:bg-white/[0.03] border border-[#ebebeb] dark:border-white/10 rounded-xl p-4 mb-5">
            {/* Pulsing Banking Radar */}
            <div className="flex items-center gap-3 mb-3">
              <span className="relative flex h-3 w-3 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#7472d5] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#010120] dark:bg-[#8ee9ee]"></span>
              </span>
              <p className="text-xs font-semibold text-[#010120] dark:text-white m-0">
                {method === 'blik'
                  ? 'Oczekiwanie na autoryzację w aplikacji banku...'
                  : 'Oczekiwanie na zatwierdzenie 3D Secure...'}
              </p>
            </div>

            {/* Instruction Checklist */}
            <div className="grid gap-2 text-xs text-[#555560] dark:text-slate-300">
              {method === 'blik' ? (
                <>
                  <div className="flex items-start gap-2.5">
                    <Smartphone className="size-4 shrink-0 text-[#7472d5] dark:text-[#8ee9ee] mt-0.5" />
                    <span>
                      1. Otwórz aplikację swojego banku na smartfonie.
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="font-mono font-bold text-xs text-[#7472d5] dark:text-[#8ee9ee] shrink-0">
                      PIN
                    </span>
                    <span>
                      2. Sprawdź kwotę <strong className="text-[#010120] dark:text-white">{money(amount)}</strong> i zatwierdź transakcję kodem PIN.
                    </span>
                  </div>
                  {blikCode && (
                    <div className="mt-1 pt-2 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-[11px] font-mono">
                      <span className="text-[#727279] dark:text-slate-400">KOD BLIK:</span>
                      <strong className="text-[#010120] dark:text-white font-bold tracking-widest text-sm">
                        {blikCode}
                      </strong>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="flex items-start gap-2.5">
                    <CreditCard className="size-4 shrink-0 text-[#7472d5] dark:text-[#8ee9ee] mt-0.5" />
                    <span>
                      Autoryzacja karty kończącej się na <strong className="font-mono text-[#010120] dark:text-white">•••• {cardLast4}</strong>.
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Smartphone className="size-4 shrink-0 text-[#7472d5] dark:text-[#8ee9ee] mt-0.5" />
                    <span>
                      Potwierdź transakcję w aplikacji mobilnej banku lub kodem SMS.
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Success Card Details */}
        {status === 'approved' && (
          <div className="bg-[#edf9f3] dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 rounded-xl p-4 mb-5 text-center text-xs text-emerald-800 dark:text-emerald-300">
            <p className="font-semibold text-sm m-0 mb-1">
              Kwota {money(amount)} została zaksięgowana!
            </p>
            <p className="m-0 text-[11px] text-emerald-700/80 dark:text-emerald-400">
              Twoja skarbonka grupy została powiększona. Identyfikator: <strong className="font-mono">{txId}</strong>
            </p>
          </div>
        )}

        {/* Expired Message */}
        {status === 'expired' && (
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/40 rounded-xl p-4 mb-5 text-center text-xs text-red-800 dark:text-red-300">
            <p className="font-semibold text-sm m-0 mb-1">
              Przekroczono 120 sekund na zatwierdzenie.
            </p>
            <p className="m-0 text-[11px] text-red-700/80 dark:text-red-400">
              Bank nie otrzymał autoryzacji transakcji na czas. Wygeneruj nowy kod lub spróbuj ponownie.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid gap-2.5">
          {status === 'waiting' && (
            <>
              {/* Primary Demo Simulation Button (crucial for Hackathon presentation) */}
              <button
                type="button"
                onClick={handleApprove}
                className="w-full h-11 flex items-center justify-center gap-2 rounded-lg bg-[#010120] hover:bg-[#1a1a36] text-white font-mono text-xs font-semibold tracking-wider uppercase transition-all duration-150 cursor-pointer shadow-md hover:-translate-y-0.5"
              >
                <Zap className="size-4 text-[#8ee9ee]" />
                POTWIERDŹ W BANKU (DEMO) ↗
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full h-10 flex items-center justify-center rounded-lg border border-[#e5e5eb] dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-[#727279] dark:text-slate-400 font-mono text-[11px] tracking-wider uppercase transition-colors cursor-pointer"
              >
                ANULUJ WPŁATĘ
              </button>
            </>
          )}

          {status === 'expired' && (
            <>
              <button
                type="button"
                onClick={handleRetry}
                className="w-full h-11 flex items-center justify-center gap-2 rounded-lg bg-[#010120] hover:bg-[#1a1a36] text-white font-mono text-xs font-semibold tracking-wider uppercase transition-all cursor-pointer shadow-md"
              >
                <RefreshCw className="size-4" />
                SPRÓBUJ PONOWNIE (ODNÓW TIMER)
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full h-10 flex items-center justify-center rounded-lg border border-[#e5e5eb] dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-[#727279] dark:text-slate-400 font-mono text-[11px] tracking-wider uppercase transition-colors cursor-pointer"
              >
                ZAMKNIJ
              </button>
            </>
          )}

          {status === 'approved' && (
            <button
              type="button"
              onClick={() => {
                cleanupTimers();
                onSuccess({
                  amount,
                  method,
                  txId: txId || `TX-${Date.now()}`,
                  paidAt: new Date().toISOString()
                });
                onClose();
              }}
              className="w-full h-11 flex items-center justify-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-xs font-semibold tracking-wider uppercase transition-all cursor-pointer shadow-md"
            >
              <CheckCircle2 className="size-4" />
              ZAKOŃCZ I WRÓĆ DO PANELU
            </button>
          )}
        </div>

        {/* Footer note */}
        <p className="text-[10px] text-center text-[#727279] dark:text-slate-500 mt-4 mb-0">
          Autoryzacja symulowana w środowisku demonstracyjnym · Żadne rzeczywiste środki nie są blokowane.
        </p>
      </div>
    </div>
  );
}

export default PaymentTimerModal;
