import { ArrowUpRight, Plus, Target, UsersRound } from "lucide-react";
import {
  useDashboard,
  money,
  dailyAmount,
  isRealGoal,
} from "../../context/DashboardContext";

interface GoalCardProps {
  onShowGoal: () => void;
  onOpenInvite: () => void;
  onAddGoal?: () => void;
  onOpenCreate?: () => void;
}

export function GoalCard({
  onShowGoal,
  onOpenInvite,
  onAddGoal,
  onOpenCreate,
}: GoalCardProps) {
  const { activeGroup, groupTotal, percentage } = useDashboard();
  const rate = dailyAmount(activeGroup);
  const hasGoal = isRealGoal(activeGroup.goal, activeGroup.target);

  if (!hasGoal) {
    return (
      <section className="panel goal-card p-6 sm:p-7 border border-[#ebebeb] dark:border-white/10 rounded bg-white dark:bg-[#161622] flex flex-col justify-between transition-colors">
        <div>
          <div className="card-top flex items-center justify-between mb-4">
            <span className="eyebrow muted text-[9px] font-mono tracking-wider uppercase text-[#727279] dark:text-slate-400">
              01 / WASZ WSPÓLNY CEL
            </span>
            <span className="goal-badge text-lg text-[#87878f]">—</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#010120] dark:text-white mb-2">
            <button
              type="button"
              className="goal-title-button inline-flex items-baseline gap-2.5 text-left border-0 bg-transparent p-0 [font:inherit] [letter-spacing:inherit] text-[#010120] dark:text-white hover:underline cursor-pointer"
              onClick={onOpenCreate || onAddGoal || onShowGoal}
            >
              Stwórz grupę
            </button>
          </h3>

          <p className="subtext text-xs text-[#727279] dark:text-slate-400 m-0 mb-5">
            Brak celów w aktywnej grupie. Stwórz nową grupę lub dodaj cel, aby
            rozpocząć odliczanie i zbieranie stawek.
          </p>

          <div className="goal-visual bg-[#f4f3fc] dark:bg-white/5 flex items-center gap-5 p-5 sm:p-6 my-5 rounded">
            <Plus
              className="size-8 shrink-0 text-[#7c76b4]"
              aria-hidden="true"
            />
            <div className="flex flex-col gap-1.5 min-w-0">
              <span className="eyebrow text-[9px] font-mono tracking-wider uppercase text-[#736e96] dark:text-purple-300">
                WSPÓLNY KIERUNEK
              </span>
              <strong className="text-xl sm:text-2xl font-semibold text-[#010120] dark:text-white [overflow-wrap:anywhere]">
                Czas na pierwszy krok
              </strong>
              <p className="text-xs text-[#736e96] dark:text-slate-400 m-0">
                Stwórz grupę ze znajomymi lub wyznacz cel, na który będziecie
                odkładać stawkę.
              </p>
            </div>
          </div>
        </div>

        <div className="goal-bottom flex items-center justify-between flex-wrap gap-3 pt-3 border-t border-[#ebebeb] dark:border-white/10">
          <span className="text-[10px] text-[#727279] dark:text-slate-400 flex items-center gap-2">
            <span className="small-dot w-1.5 h-1.5 rounded-full bg-[#85ebcf]" />
            {money(rate)} dziennie na osobę.
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="outline inline-flex items-center gap-1.5 border border-[#ebebeb] dark:border-white/20 text-[#010120] dark:text-white px-3 py-2 font-mono text-xs tracking-wider uppercase rounded hover:bg-[#f6f6fa] dark:hover:bg-white/10 cursor-pointer"
              onClick={onAddGoal || onShowGoal}
            >
              <Plus className="size-3.5" aria-hidden="true" />
              DODAJ CEL
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              className="primary inline-flex items-center gap-1.5 bg-[#010120] text-white hover:bg-[#292943] px-4 py-2 font-mono text-xs tracking-wider uppercase rounded cursor-pointer transition-all"
              onClick={onOpenCreate || onAddGoal}
            >
              <UsersRound className="size-3.5" aria-hidden="true" />
              STWÓRZ GRUPĘ
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="panel goal-card p-6 sm:p-7 border border-[#ebebeb] dark:border-white/10 rounded bg-white dark:bg-[#161622] flex flex-col justify-between transition-colors">
      <div>
        <div className="card-top flex items-center justify-between mb-4">
          <span className="eyebrow muted text-[9px] font-mono tracking-wider uppercase text-[#727279] dark:text-slate-400">
            01 / WASZ WSPÓLNY CEL
          </span>
          <Target className="size-5 text-[#87878f]" aria-hidden="true" />
        </div>

        <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#010120] dark:text-white mb-2">
          <button
            type="button"
            className="goal-title-button inline-flex items-baseline gap-2.5 text-left border-0 bg-transparent p-0 [font:inherit] [letter-spacing:inherit] text-[#010120] dark:text-white hover:underline cursor-pointer"
            onClick={onShowGoal}
          >
            <span>{activeGroup.goal}</span>
            <ArrowUpRight className="size-4 opacity-60" aria-hidden="true" />
          </button>
        </h3>

        <p className="subtext text-xs text-[#727279] dark:text-slate-400 m-0 mb-5">
          Codzienna kwota {money(rate)} na osobę wspiera Wasz cel.
        </p>

        <div className="goal-visual bg-[#f2f1fc] dark:bg-white/5 flex items-center gap-5 p-5 sm:p-6 my-5 rounded">
          <Target
            className="size-8 shrink-0 text-[#7c76b4]"
            aria-hidden="true"
          />
          <div className="flex flex-col gap-1.5 min-w-0">
            <span className="eyebrow text-[9px] font-mono tracking-wider uppercase text-[#736e96] dark:text-purple-300">
              WSPÓLNY KIERUNEK
            </span>
            <strong className="text-xl sm:text-2xl font-semibold text-[#010120] dark:text-white [overflow-wrap:anywhere]">
              {percentage === 100
                ? "Udało się. Razem!"
                : `Jeszcze ${money(Math.max(0, (activeGroup.target || 0) - groupTotal))}`}
            </strong>
            <p className="text-xs text-[#736e96] dark:text-slate-400 m-0">
              {percentage === 100
                ? "Wasze małe kroki złożyły się na wielką zmianę."
                : "do planów, które naprawdę mają znaczenie."}
            </p>
          </div>
        </div>
      </div>

      <div className="goal-bottom flex items-center justify-between flex-wrap gap-3 pt-3 border-t border-[#ebebeb] dark:border-white/10">
        <span className="text-[10px] text-[#727279] dark:text-slate-400 flex items-center gap-2">
          <span className="small-dot w-1.5 h-1.5 rounded-full bg-[#9691bf]" />
          {money(rate)} dziennie na osobę.
        </span>

        <button
          type="button"
          className="outline inline-flex items-center gap-1.5 border border-[#ebebeb] dark:border-white/20 text-[#010120] dark:text-white px-4 py-2 font-mono text-xs tracking-wider uppercase rounded hover:bg-[#f6f6fa] dark:hover:bg-white/10 cursor-pointer"
          onClick={onOpenInvite}
        >
          <UsersRound className="size-3.5" aria-hidden="true" />
          ZAPROŚ DO GRUPY
          <ArrowUpRight className="size-3.5" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}

export default GoalCard;
