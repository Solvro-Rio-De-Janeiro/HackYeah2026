import React, { useState, useEffect } from 'react';
import { ArrowUpRight, Plus, UsersRound } from 'lucide-react';
import { useDashboard, money, dailyAmount, isRealGoal } from '../../context/DashboardContext';

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

interface SavingsHeroProps {
  onShowGoal: () => void;
  onAddGoal?: () => void;
  onOpenCreate?: () => void;
}

export function SavingsHero({ onShowGoal, onAddGoal, onOpenCreate }: SavingsHeroProps) {
  const { activeGroup, members, groupTotal, percentage } = useDashboard();
  const rate = dailyAmount(activeGroup);
  const [timeRemaining, setTimeRemaining] = useState(getTimeUntilMidnight());
  const hasGoal = isRealGoal(activeGroup.goal, activeGroup.target);

  const today = new Date().toLocaleDateString('en-CA');
  const recordedToday = activeGroup.deposits.some(
    (deposit) =>
      deposit.kind && new Date(deposit.date).toLocaleDateString('en-CA') === today
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(getTimeUntilMidnight());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section
      className="savings-hero relative isolate mx-[calc(50%_-_50vw)] box-border grid w-screen max-w-none grid-cols-1 items-center gap-[30px] overflow-hidden rounded-none bg-[#010120] px-[clamp(24px,5vw,80px)] pt-10 pb-7 text-white min-[651px]:grid-cols-[1.2fr_1fr] min-[651px]:pb-[37px] min-[1001px]:grid-cols-[1.3fr_1fr] min-[1450px]:pt-12 cursor-pointer"
      onClick={hasGoal ? onShowGoal : (onOpenCreate || onAddGoal || onShowGoal)}
    >
      <div className="min-w-0 px-4 sm:px-6 flex flex-col items-center min-[651px]:items-start text-center min-[651px]:text-left">
        <div className="eyebrow lavender flex items-center justify-center min-[651px]:justify-start gap-2 text-[#bdbbff] font-mono text-[11px] sm:text-[10px] tracking-wider uppercase">
          <span className="status-dot w-1.5 h-1.5 rounded-full bg-[#bdbbff]" />
          {members.length} {members.length === 1 ? 'OSOBA' : 'OSOBY'}
        </div>

        <h1 className="my-5 sm:my-6 text-center min-[651px]:text-left text-[clamp(38px,6.5vw,56px)] leading-[1.12] font-semibold tracking-[-1.5px] text-[#bdbbff] [overflow-wrap:anywhere]">
          {hasGoal ? (
            <button
              type="button"
              className="inline-flex cursor-pointer items-baseline justify-center min-[651px]:justify-start border-0 bg-transparent p-0 text-center min-[651px]:text-left [font:inherit] [color:inherit] [letter-spacing:inherit] [overflow-wrap:anywhere] hover:underline hover:decoration-1 hover:underline-offset-[7px] focus-visible:outline-2 focus-visible:outline-[#bdbbff] focus-visible:outline-offset-2 motion-reduce:transition-none"
              onClick={(e) => {
                e.stopPropagation();
                onShowGoal();
              }}
              aria-label={'Zobacz szczegóły celu: ' + activeGroup.goal}
            >
              {activeGroup.goal}
            </button>
          ) : (
            <button
              type="button"
              className="inline-flex cursor-pointer items-baseline justify-center min-[651px]:justify-start border-0 bg-transparent p-0 text-center min-[651px]:text-left [font:inherit] [color:inherit] [letter-spacing:inherit] [overflow-wrap:anywhere] hover:underline hover:decoration-1 hover:underline-offset-[7px] focus-visible:outline-2 focus-visible:outline-[#bdbbff] focus-visible:outline-offset-2 motion-reduce:transition-none"
              onClick={(e) => {
                e.stopPropagation();
                if (onOpenCreate) onOpenCreate();
                else if (onAddGoal) onAddGoal();
                else onShowGoal();
              }}
              aria-label="Stwórz grupę"
            >
              Stwórz grupę <ArrowUpRight className="ml-1 size-5" aria-hidden="true" />
            </button>
          )}
        </h1>

        <p className="m-0 text-center min-[651px]:text-left text-sm sm:text-xs leading-[1.8] text-[#b7b7c7] max-w-md">
          {hasGoal ? (
            <>
              {money(rate)} dziennie. Jeden rytm dla wspólnego celu.
              <br />
              Kwotę ustalacie przy tworzeniu grupy.
            </>
          ) : (
            <>
              Brak celów w tej grupie.
              <br />
              Stwórz nową grupę lub wyznacz cel, aby rozpocząć zbieranie dziennych stawek.
            </>
          )}
        </p>

        <div className="mt-[22px] flex flex-wrap items-center justify-center min-[651px]:justify-start gap-4 text-[#9898ad] min-[651px]:mt-[30px]">
          {!hasGoal && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onOpenCreate) onOpenCreate();
                  else if (onAddGoal) onAddGoal();
                }}
                className="primary bg-white text-[#010120] hover:bg-slate-200 px-4 py-2 font-mono text-xs tracking-wider uppercase rounded font-medium transition-all cursor-pointer"
              >
                <UsersRound className="mr-1.5 size-3.5" aria-hidden="true" />
                STWÓRZ GRUPĘ
                <ArrowUpRight className="ml-1.5 size-3.5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onAddGoal) onAddGoal();
                  else onShowGoal();
                }}
                className="outline border border-white/30 text-white hover:bg-white/10 px-4 py-2 font-mono text-xs tracking-wider uppercase rounded font-medium transition-all cursor-pointer"
              >
                <Plus className="mr-1.5 size-3.5" aria-hidden="true" />
                DODAJ CEL
                <ArrowUpRight className="ml-1.5 size-3.5" aria-hidden="true" />
              </button>
            </div>
          )}

          <div className="member-stack flex items-center pl-1.5" aria-label="Członkowie grupy">
            {members.map((member) => (
              <span
                key={member.initials}
                title={member.name}
                aria-label={member.name}
                className={`member-avatar ${member.color} -ml-1.5 first:ml-0 border-2 border-[#010120] w-8 h-8 rounded-full grid place-items-center text-[9px] font-mono font-bold`}
              >
                {member.initials}
              </span>
            ))}
            <span className="stack-caption text-xs ml-3 text-[#b7b7c7]">
              Jedna grupa. Wspólny kierunek.
            </span>
          </div>
        </div>
      </div>

      <div className="savings-wheel flex flex-col items-center justify-center gap-3 min-w-0 py-2">
        <div
          className="savings-disc relative isolate w-full max-w-[300px] aspect-[300/220]"
          role="progressbar"
          aria-label="Postęp wspólnego celu"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuetext={`${percentage}% celu, zebrano ${money(groupTotal)} z ${money(activeGroup.target || 0)}`}
        >
          <svg className="savings-ring absolute top-0 left-0 w-full h-auto overflow-visible" viewBox="0 0 300 170" aria-hidden="true">
            <defs>
              <linearGradient id="savings-ring-gradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#eeecff" />
                <stop offset="45%" stopColor="#bdbbff" />
                <stop offset="100%" stopColor="#756ace" />
              </linearGradient>
            </defs>
            <path className="ring-depth fill-none stroke-[17] [stroke-linecap:round]" d="M17 150 A133 133 0 0 1 283 150" />
            <path className="ring-track fill-none stroke-[17] [stroke-linecap:round]" d="M17 150 A133 133 0 0 1 283 150" />
            <path
              className="ring-value fill-none stroke-[17] [stroke-linecap:round]"
              d="M17 150 A133 133 0 0 1 283 150"
              pathLength="100"
              strokeDasharray={`${hasGoal ? percentage : 0} ${100 - (hasGoal ? percentage : 0)}`}
            />
          </svg>

          <div className="savings-disc-content absolute inset-[29%_20px_0] flex flex-col items-center justify-center text-center gap-2.5">
            <span className="eyebrow lavender font-mono text-[9px] uppercase tracking-wider text-[#bdbbff]">
              {hasGoal ? 'WSPÓLNY CEL' : 'BRAK CELU'}
            </span>
            <strong className="text-[clamp(23px,3.3vw,40px)] leading-[1.15] tracking-[-1.5px] font-semibold text-white">
              {money(groupTotal)}
            </strong>
            <span className="text-xs text-[#b7b4ce]">
              {hasGoal ? `z ${money(activeGroup.target || 0)}` : 'Brak wyznaczonego celu'}
            </span>
            <span className="disc-percentage font-mono text-[9px] text-[#bdbbff] bg-[#bdbbff12] border border-[#bdbbff25] px-2.5 py-1 rounded-full mt-0.5">
              {hasGoal ? `${percentage}% CELU` : 'STWÓRZ GRUPĘ'}
            </span>

            {hasGoal && (
              <div
                className="inline-flex items-center gap-1.5 font-mono text-[9px] text-[#bdbbff] bg-[#01012090] border border-[#bdbbff30] px-2.5 py-0.5 rounded-full mt-0.5"
                role="timer"
                aria-label={recordedToday ? `Wpłacono na dziś, następna wpłata za ${timeRemaining}` : `Czeka na wpłatę, pozostało ${timeRemaining}`}
              >
                <span>
                  {recordedToday ? `WPŁACONO · KOLEJNA ZA ${timeRemaining}` : `CZEKA NA WPŁATĘ · ${timeRemaining}`}
                </span>
              </div>
            )}
          </div>
        </div>

        {hasGoal && percentage === 100 && (
          <span className="eyebrow wheel-caption font-mono text-[9px] uppercase tracking-widest text-[#aaa6c3]">
            CEL OSIĄGNIĘTY!
          </span>
        )}
      </div>
    </section>
  );
}

export default SavingsHero;
