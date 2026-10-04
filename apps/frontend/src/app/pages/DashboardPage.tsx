import React, { useState } from "react";
import { ArrowRight, ArrowUpRight, Plus, UsersRound } from "lucide-react";
import { useDashboard } from "../context/DashboardContext";
import GroupToolbar from "../components/dashboard/GroupToolbar";
import SavingsHero from "../components/dashboard/SavingsHero";
import DailyAmountPanel from "../components/dashboard/DailyAmountPanel";
import GoalCard from "../components/dashboard/GoalCard";
import HistoryPreviewCard from "../components/dashboard/HistoryPreviewCard";
import MembersList from "../components/dashboard/MembersList";
import ActivityHistory from "../components/dashboard/ActivityHistory";
import GroupModals, { DialogMode } from "../components/dashboard/GroupModals";
import GoalDetailsModal from "../components/dashboard/GoalDetailsModal";

export function DashboardPage() {
  const {
    activeGroup,
    groups,
    groupsLoading,
    groupsError,
    reloadGroups,
  } = useDashboard();

  const [dialog, setDialog] = useState<DialogMode>(null);
  const [showGoal, setShowGoal] = useState(false);
  const [feedback, setFeedback] = useState("");

  if (groups.length === 0) {
    return (
      <div className="dashboard-page mx-auto flex min-h-[calc(100vh-9rem)] max-w-279 items-center py-8 sm:py-12">
        {groupsLoading ? (
          <section
            className="panel w-full rounded-2xl border border-[#ebebeb] bg-white p-8 text-center shadow-sm dark:border-white/10 dark:bg-[#161622] sm:p-12"
            aria-live="polite"
          >
            <span className="mx-auto mb-5 grid size-14 animate-pulse place-items-center rounded-full bg-[#f4f3fc] text-[#7472d5] dark:bg-white/10">
              <UsersRound className="size-6" aria-hidden="true" />
            </span>
            <h1 className="m-0 text-xl font-semibold text-ink dark:text-white">
              Sprawdzamy Twoje grupy
            </h1>
            <p className="mb-0 mt-2 text-sm text-[#727279] dark:text-slate-400">
              Za chwilę pokażemy, gdzie działacie razem.
            </p>
          </section>
        ) : groupsError ? (
          <section
            className="panel w-full rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm dark:border-red-900/60 dark:bg-[#161622] sm:p-12"
            aria-live="polite"
          >
            <span className="mx-auto mb-5 grid size-14 place-items-center rounded-full bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300">
              <UsersRound className="size-6" aria-hidden="true" />
            </span>
            <h1 className="m-0 text-xl font-semibold text-ink dark:text-white">
              Nie udało się załadować grup
            </h1>
            <p role="alert" className="mb-0 mt-2 text-sm text-red-600 dark:text-red-300">
              {groupsError}
            </p>
            <button
              type="button"
              className="primary mt-6 inline-flex items-center gap-2 rounded bg-ink px-5 py-3 font-mono text-[10px] tracking-wider text-white"
              onClick={() => void reloadGroups()}
            >
              SPRÓBUJ PONOWNIE <ArrowRight className="size-4" aria-hidden="true" />
            </button>
          </section>
        ) : (
          <section className="panel w-full overflow-hidden rounded-2xl border border-[#ebebeb] bg-white shadow-sm dark:border-white/10 dark:bg-[#161622]">
            <div className="relative isolate overflow-hidden bg-[#010120] px-6 py-10 text-center text-white sm:px-12 sm:py-14">
              <span className="pointer-events-none absolute -right-16 -top-28 -z-10 size-72 rounded-full border border-white/10" />
              <span className="pointer-events-none absolute -right-8 -top-20 -z-10 size-56 rounded-full border border-white/10" />
              <span className="mx-auto mb-5 grid size-16 place-items-center rounded-2xl border border-white/15 bg-white/10 text-[#c8f6f9] shadow-lg shadow-black/10">
                <UsersRound className="size-7" aria-hidden="true" />
              </span>
              <p className="m-0 font-mono text-[10px] font-medium tracking-[0.18em] text-[#bdbbff]">
                RAZEM ŁATWIEJ ZŁAPAĆ RYTM
              </p>
              <h1 className="mx-auto mb-0 mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Zacznij od swojej grupy
              </h1>
              <p className="mx-auto mb-0 mt-3 max-w-xl text-sm leading-6 text-white/70">
                Nie masz jeszcze żadnej grupy. Utwórz własną ekipę albo dołącz
                do istniejącej, korzystając z jej identyfikatora.
              </p>
            </div>

            <div className="grid gap-4 p-5 sm:grid-cols-2 sm:gap-5 sm:p-8">
              <button
                type="button"
                onClick={() => setDialog("create")}
                className="group flex min-h-36 flex-col items-start justify-between rounded-xl border border-[#010120] bg-[#010120] p-5 text-left text-white transition-all hover:-translate-y-0.5 hover:bg-[#171736] hover:shadow-lg focus-visible:outline-2 focus-visible:outline-[#7472d5] sm:p-6"
              >
                <span className="flex w-full items-center justify-between">
                  <span className="grid size-10 place-items-center rounded-lg bg-white/10 text-[#c8f6f9]">
                    <Plus className="size-5" aria-hidden="true" />
                  </span>
                  <ArrowUpRight className="size-4 text-white/60 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
                <span className="mt-6">
                  <span className="block font-semibold">Utwórz nową grupę</span>
                  <span className="mt-1 block text-xs leading-5 text-white/65">
                    Nadaj jej nazwę i zaproś swoją ekipę.
                  </span>
                </span>
              </button>

              <button
                type="button"
                onClick={() => setDialog("join")}
                className="group flex min-h-36 flex-col items-start justify-between rounded-xl border border-[#ebebeb] bg-[#fafafd] p-5 text-left text-ink transition-all hover:-translate-y-0.5 hover:border-[#bdbbff] hover:bg-[#f6f5ff] hover:shadow-lg focus-visible:outline-2 focus-visible:outline-[#7472d5] dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:hover:bg-white/[0.07] sm:p-6"
              >
                <span className="flex w-full items-center justify-between">
                  <span className="grid size-10 place-items-center rounded-lg bg-[#eeedfc] text-[#5a54b5] dark:bg-purple-950/60 dark:text-[#bdbbff]">
                    <UsersRound className="size-5" aria-hidden="true" />
                  </span>
                  <ArrowUpRight className="size-4 text-[#727279] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 dark:text-slate-400" aria-hidden="true" />
                </span>
                <span className="mt-6">
                  <span className="block font-semibold">Dołącz do grupy</span>
                  <span className="mt-1 block text-xs leading-5 text-[#727279] dark:text-slate-400">
                    Wpisz identyfikator otrzymany od znajomego.
                  </span>
                </span>
              </button>
            </div>

            <p className="m-0 border-t border-[#ebebeb] px-5 py-4 text-center text-xs text-[#727279] dark:border-white/10 dark:text-slate-400 sm:px-8">
              Po dołączeniu zobaczysz tutaj cele i postępy swojej grupy.
            </p>
          </section>
        )}
        <GroupModals
          dialog={dialog}
          onClose={() => setDialog(null)}
          onFeedback={(msg) => setFeedback(msg)}
        />
      </div>
    );
  }

  return (
    <div className="dashboard-page max-w-[1116px] mx-auto py-2">
      <GroupToolbar
        onOpenCreate={() => setDialog("create")}
        onOpenJoin={() => setDialog("join")}
      />

      <SavingsHero
        onShowGoal={() => setShowGoal(true)}
        onAddGoal={() => setDialog("goal")}
        onOpenCreate={() => setDialog("create")}
      />

      <div
        className="demo-notice flex items-center gap-2 font-mono text-[11px] text-[#727279] dark:text-slate-400 my-4 leading-relaxed"
        role="region"
        aria-label="Informacja o grupie"
      >
        <span
          className="small-dot w-1.5 h-1.5 rounded-full bg-[#85ebcf] shrink-0"
          aria-hidden="true"
        />
        <span>
          GRUPA AKTYWNA · Panel Twoich codziennych postępów i wspólnego celu.
        </span>
      </div>

      <DailyAmountPanel />

      {feedback && (
        <p
          className="save-feedback bg-[#edf9f3] dark:bg-emerald-950/40 text-[#285342] dark:text-emerald-300 p-3 text-xs rounded my-3"
          role="status"
          aria-live="polite"
        >
          ✓ {feedback}
        </p>
      )}

      <section aria-labelledby="rhythm-heading">
        <div className="section-heading flex items-center justify-between my-8">
          <h2
            id="rhythm-heading"
            className="text-xl font-semibold tracking-tight text-ink dark:text-white m-0"
          >
            Stały rytm. Wspólny kierunek.
          </h2>
          <span className="eyebrow muted text-[11px] font-mono tracking-wider uppercase text-[#727279] dark:text-slate-400">
            BEZ PRESJI. Z WSPARCIEM.
          </span>
        </div>

        <div className="dashboard-grid savings-grid grid grid-cols-1 md:grid-cols-[1.62fr_1fr] gap-6 mb-6">
          <GoalCard
            onShowGoal={() => setShowGoal(true)}
            onOpenInvite={() => setDialog("invite")}
            onAddGoal={() => setDialog("goal")}
            onOpenCreate={() => setDialog("create")}
          />
          <HistoryPreviewCard />
        </div>
      </section>

      <section
        aria-label="Społeczność i aktywność"
        className="community-grid grid grid-cols-1 md:grid-cols-[1.05fr_1fr] gap-6 my-6"
      >
        <MembersList onOpenInvite={() => setDialog("invite")} />
        <ActivityHistory />
      </section>

      <GroupModals
        dialog={dialog}
        onClose={() => setDialog(null)}
        onFeedback={(msg) => setFeedback(msg)}
      />

      <GoalDetailsModal isOpen={showGoal} onClose={() => setShowGoal(false)} />
    </div>
  );
}

export default DashboardPage;
