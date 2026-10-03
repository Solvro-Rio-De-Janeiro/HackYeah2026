import React from 'react';
import { useDashboard, money, dailyAmount } from '../../context/DashboardContext';

interface GoalCardProps {
  onShowGoal: () => void;
  onOpenInvite: () => void;
}

export function GoalCard({ onShowGoal, onOpenInvite }: GoalCardProps) {
  const { activeGroup, groupTotal, percentage } = useDashboard();
  const rate = dailyAmount(activeGroup);

  return (
    <section className="panel goal-card p-6 sm:p-7 border border-[#ebebeb] rounded bg-white flex flex-col justify-between transition-colors">
      <div>
        <div className="card-top flex items-center justify-between mb-4">
          <span className="eyebrow muted text-[9px] font-mono tracking-wider uppercase text-[#727279]">
            01 / WASZ WSPÓLNY CEL
          </span>
          <span className="goal-badge text-lg text-[#87878f]">↗</span>
        </div>

        <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#010120] mb-2">
          <button
            type="button"
            className="goal-title-button inline-flex items-baseline gap-2.5 text-left border-0 bg-transparent p-0 [font:inherit] [letter-spacing:inherit] text-[#010120] hover:underline cursor-pointer"
            onClick={onShowGoal}
          >
            <span>{activeGroup.goal}</span>
            <span className="text-sm opacity-60" aria-hidden="true">
              ↗
            </span>
          </button>
        </h3>

        <p className="subtext text-xs text-[#727279] m-0 mb-5">
          Codzienna kwota {money(rate)} na osobę wspiera Wasz cel.
        </p>

        <div className="goal-visual bg-[#f2f1fc] flex items-center gap-5 p-5 sm:p-6 my-5 rounded">
          <span className="text-4xl text-[#7c76b4] leading-none">↗</span>
          <div className="flex flex-col gap-1.5 min-w-0">
            <span className="eyebrow text-[9px] font-mono tracking-wider uppercase text-[#736e96]">
              WSPÓLNY KIERUNEK
            </span>
            <strong className="text-xl sm:text-2xl font-semibold text-[#010120] [overflow-wrap:anywhere]">
              {percentage === 100
                ? 'Udało się. Razem!'
                : `Jeszcze ${money(Math.max(0, activeGroup.target - groupTotal))}`}
            </strong>
            <p className="text-xs text-[#736e96] m-0">
              {percentage === 100
                ? 'Wasze małe kroki złożyły się na wielką zmianę.'
                : 'do planów, które naprawdę mają znaczenie.'}
            </p>
          </div>
        </div>
      </div>

      <div className="goal-bottom flex items-center justify-between flex-wrap gap-3 pt-3 border-t border-[#ebebeb]">
        <span className="text-[10px] text-[#727279] flex items-center gap-2">
          <span className="small-dot w-1.5 h-1.5 rounded-full bg-[#9691bf]" />
          {money(rate)} dziennie na osobę · demo.
        </span>

        <button
          type="button"
          className="outline"
          onClick={onOpenInvite}
        >
          ZAPROŚ DO GRUPY ↗
        </button>
      </div>
    </section>
  );
}

export default GoalCard;
