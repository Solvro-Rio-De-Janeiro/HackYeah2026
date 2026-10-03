import React, { useState, useEffect } from 'react';
import { useDashboard, money, dailyAmount } from '../../context/DashboardContext';
import Modal from '../common/Modal';
import { CheckCircle2, Clock } from 'lucide-react';

function getTimeUntilMidnight(): string {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const diffSec = Math.max(0, Math.floor((midnight.getTime() - now.getTime()) / 1000));
  const hours = String(Math.floor(diffSec / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((diffSec % 3600) / 60)).padStart(2, '0');
  const seconds = String(diffSec % 60).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

export function DailyAmountPanel() {
  const { activeGroup, groups, updateGroups } = useDashboard();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(getTimeUntilMidnight());

  const amount = dailyAmount(activeGroup);
  const today = new Date().toLocaleDateString('en-CA');
  const recordedToday = activeGroup.deposits.some(
    (deposit) =>
      deposit.kind && new Date(deposit.date).toLocaleDateString('en-CA') === today
  );

  // Live timer tick every second
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(getTimeUntilMidnight());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  function handleDirectDeposit() {
    if (recordedToday) return;

    const deposit = {
      id: crypto.randomUUID(),
      amount,
      date: new Date().toISOString(),
      note: 'Dzienna kwota grupy · wpłata użytkownika',
      kind: 'daily-demo' as const
    };

    updateGroups(
      groups.map((item) =>
        item.id === activeGroup.id
          ? { ...item, deposits: [...item.deposits, deposit] }
          : item
      )
    );
    setMessage(`✓ Zaksięgowano dzisiejszą wpłatę ${money(amount)}! Twoja skarbonka grupy została powiększona.`);
    setOpen(false);
  }

  return (
    <>
      <section className="subscription-strip flex items-center justify-between flex-wrap gap-5 p-5 my-5 rounded-xl border border-[#ebebeb] dark:border-white/10 bg-[#fcfcff] dark:bg-[#161622] transition-colors shadow-xs">
        {/* Left: Daily Amount Value */}
        <div className="subscription-price flex items-center gap-3.5">
          <span className="subscription-mark w-10 h-10 rounded-full grid place-items-center bg-[#eeedff] dark:bg-white/10 text-[#6b62aa] dark:text-[#bdbbff] text-xl font-mono">
            ↻
          </span>
          <div className="flex flex-col gap-1">
            <span className="eyebrow muted text-[9px] font-mono tracking-wider uppercase text-[#727279] dark:text-slate-400">
              DZIENNA KWOTA GRUPY
            </span>
            <strong className="text-2xl font-semibold tracking-tight text-[#010120] dark:text-white">
              {money(amount)}{' '}
              <span className="text-xs font-normal text-[#727279] dark:text-slate-400 tracking-normal">
                / osoba / dzień
              </span>
            </strong>
          </div>
        </div>

        {/* Center: Live Timer Waiting for Deposit (W środku panelu) */}
        <div className="daily-timer-box flex items-center gap-3.5 px-4 py-2.5 bg-white dark:bg-white/5 border border-[#e5e5eb] dark:border-white/10 rounded-xl shadow-xs transition-all">
          <div className="flex items-center justify-center">
            <span
              className={`inline-block rounded-full h-2.5 w-2.5 ${
                recordedToday ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span
                className={`eyebrow text-[10px] font-mono tracking-wider uppercase font-semibold ${
                  recordedToday
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : 'text-amber-700 dark:text-amber-400'
                }`}
              >
                {recordedToday ? 'WPŁATA ZAKSIĘGOWANA ✓' : 'CZEKA NA WPŁATĘ'}
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span
                className="font-mono text-lg sm:text-xl font-medium tracking-wider text-[#010120] dark:text-white"
                role="timer"
                aria-label={
                  recordedToday
                    ? `Kolejna wpłata za ${timeRemaining}`
                    : `Pozostały czas na dzisiejszą wpłatę: ${timeRemaining}`
                }
              >
                {timeRemaining}
              </span>
              <span className="text-[10px] text-[#727279] dark:text-slate-400 font-mono tracking-wider uppercase font-medium">
                {recordedToday ? 'DO KOLEJNEJ' : 'DO KOŃCA DOBY'}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            className="outline"
            onClick={() => {
              setMessage('');
              setOpen(true);
            }}
          >
            SZCZEGÓŁY KWOTY ↗
          </button>

          <button
            type="button"
            onClick={handleDirectDeposit}
            disabled={recordedToday}
            className={
              recordedToday
                ? 'outline opacity-75 cursor-not-allowed'
                : 'primary'
            }
          >
            {recordedToday ? (
              <>
                <CheckCircle2 className="size-3.5 text-emerald-600" />
                <span>WPŁATA ZAKSIĘGOWANA ✓</span>
              </>
            ) : (
              <>
                <Clock className="size-3.5 text-[#8ee9ee]" />
                <span>WPŁAĆ {money(amount)} TERAZ ↗</span>
              </>
            )}
          </button>
        </div>
      </section>

      {message && (
        <p
          className="save-feedback bg-[#edf9f3] dark:bg-emerald-950/40 text-[#285342] dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40 p-3 text-xs rounded my-3 text-center transition-all"
          role="status"
          aria-live="polite"
        >
          {message}
        </p>
      )}

      {/* Details Modal */}
      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        ariaLabel="Dzienna kwota grupy"
        eyebrow="WASZE ZASADY"
        title={`${money(amount)} dziennie.`}
        className="group-modal max-h-[90vh] overflow-y-auto"
      >
        <p className="text-xs leading-relaxed text-[#727279] mb-5">
          To dzienna kwota ustalona dla tej grupy przez jej twórcę. Środki zasilają wspólny cel grupy.
        </p>

        <div className="plan-summary grid grid-cols-2 gap-3.5 p-5 bg-[#f6f5fc] dark:bg-white/5 rounded mb-5 text-xs">
          <span className="text-[#727279] dark:text-slate-400">Grupa</span>
          <strong className="text-right font-semibold text-[#010120] dark:text-white">
            {activeGroup.name}
          </strong>

          <span className="text-[#727279] dark:text-slate-400">Za osobę / dzień</span>
          <strong className="text-right font-semibold text-[#010120] dark:text-white">
            {money(amount)}
          </strong>

          <span className="text-[#727279] dark:text-slate-400">Za osobę / 30 dni</span>
          <strong className="text-right font-semibold text-[#010120] dark:text-white">
            {money(amount * 30)}
          </strong>

          <span className="text-[#727279] dark:text-slate-400">Status na dziś</span>
          <strong
            className={`text-right font-semibold font-mono ${
              recordedToday ? 'text-emerald-600' : 'text-amber-600'
            }`}
          >
            {recordedToday ? 'Opłacono na dziś ✓' : `Czeka na wpłatę (${timeRemaining})`}
          </strong>
        </div>

        <button
          type="button"
          className="primary w-full flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          disabled={recordedToday}
          onClick={handleDirectDeposit}
        >
          {recordedToday ? (
            'DZISIEJSZA WPŁATA ZAKSIĘGOWANA'
          ) : (
            <>
              <Clock className="size-4 text-[#8ee9ee]" />
              <span>WPŁAĆ KWOTĘ TERAZ ({money(amount)}) ↗</span>
            </>
          )}
        </button>

        <p className="small-text text-[10px] leading-relaxed text-[#727279] mt-4">
          Wersja demonstracyjna z czasem rzeczywistym. Żadne prawdziwe pieniądze nie są pobierane z konta.
        </p>
      </Modal>
    </>
  );
}

export default DailyAmountPanel;
