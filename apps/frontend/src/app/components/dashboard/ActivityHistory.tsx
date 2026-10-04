import React from "react";
import {
  useDashboard,
  money,
  dailyAmount,
} from "../../context/DashboardContext";

export function ActivityHistory() {
  const { activeGroup } = useDashboard();
  const rate = dailyAmount(activeGroup);

  return (
    <section
      id="subscription-history"
      className="panel activity-card p-6 sm:p-7 border border-[#ebebeb] rounded bg-white scroll-mt-6 transition-colors"
    >
      <div className="card-top flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold tracking-tight text-[#010120]">
          Historia grupy
        </h2>
        <span className="eyebrow muted text-[9px] font-mono tracking-wider uppercase text-[#727279]">
          ROZLICZENIA
        </span>
      </div>

      <p className="activity-subtitle text-xs text-[#727279] mb-4">
        Dzienna kwota: {money(rate)}
      </p>

      {activeGroup.deposits.length ? (
        <div className="flex flex-col">
          {[...activeGroup.deposits]
            .reverse()
            .slice(0, 4)
            .map((deposit) => (
              <div
                className="activity-row flex items-start gap-3 py-3 border-b border-[#ebebeb] last:border-0"
                key={deposit.id}
              >
                <span className="activity-mark w-7 h-7 rounded-full grid place-items-center bg-[#f0f0fa] text-[#777198] text-xs font-mono flex-shrink-0 mt-0.5">
                  ↗
                </span>

                <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                  <strong className="text-xs font-semibold text-[#010120]">
                    {deposit.kind ? "Symulacja" : "Zapis archiwalny"} ·{" "}
                    {money(deposit.amount)}
                  </strong>
                  <p className="text-[11px] text-[#727279] m-0 [overflow-wrap:anywhere]">
                    {deposit.note || "Wcześniejszy zapis oszczędności."}
                  </p>
                  <span className="text-[9px] font-mono text-[#89898f]">
                    {new Date(deposit.date).toLocaleDateString("pl-PL")}
                  </span>
                </div>
              </div>
            ))}
        </div>
      ) : (
        <div className="activity-empty text-center py-6">
          <span className="text-3xl text-[#9990c4] block mb-2">✧</span>
          <h3 className="text-sm font-semibold text-[#010120] mb-1">
            Wasza historia dopiero się zaczyna.
          </h3>
          <p className="text-xs text-[#727279] leading-relaxed">
            Przetestuj dzisiejszy zapis {money(rate)}
            <br />w „Szczegóły kwoty”.
          </p>
        </div>
      )}
    </section>
  );
}

export default ActivityHistory;
