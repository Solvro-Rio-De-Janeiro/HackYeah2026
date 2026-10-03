import React from 'react';
import { useDashboard, money, dailyAmount } from '../../context/DashboardContext';

export function HistoryPreviewCard() {
  const { activeGroup } = useDashboard();
  const latest = activeGroup.deposits.at(-1);
  const rate = dailyAmount(activeGroup);

  return (
    <section className="support personal-card history-preview p-6 sm:p-7 rounded bg-[#c8f6f9] flex flex-col justify-between transition-colors">
      <div>
        <div className="card-top flex items-center justify-between mb-4">
          <span className="eyebrow text-[9px] font-mono tracking-wider uppercase text-[#3e6569]">
            02 / OSTATNIA HISTORIA
          </span>
          <span className="support-icon w-8 h-8 rounded-full border border-[#9acfd3] grid place-items-center text-lg text-[#3e6569]">
            ↻
          </span>
        </div>

        <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#17171c] my-3">
          {latest ? money(latest.amount) : 'Jeszcze bez historii.'}
        </h3>

        <p className="text-xs leading-relaxed text-[#3e6569] mb-4">
          {latest
            ? latest.kind
              ? 'Dzienna kwota grupy · symulacja'
              : 'Wcześniejszy zapis oszczędności'
            : 'Tutaj zobaczysz ostatni zapis dziennej kwoty grupy.'}
        </p>

        <div className="support-rule h-[1px] bg-[#a9dbe0] my-4" />

        <div className="support-note flex items-center gap-2 text-[10px] text-[#3e6569] mb-4 font-mono">
          <span className="online-dot w-1.5 h-1.5 rounded-full bg-[#40827f]" />
          {latest
            ? new Date(latest.date).toLocaleString('pl-PL', {
                dateStyle: 'medium',
                timeStyle: 'short'
              })
            : `${money(rate)} każdego dnia`}
        </div>
      </div>

      <div>
        <a
          href="#subscription-history"
          className="primary w-full bg-[#010120] text-white hover:bg-[#292943] rounded py-3 px-4 font-mono text-xs tracking-wider uppercase flex items-center justify-between cursor-pointer no-underline transition-all"
        >
          <span>ZOBACZ HISTORIĘ</span>
          <span>↗</span>
        </a>

        <p className="personal-footnote text-[10px] text-center text-[#3e6569] mt-3 m-0">
          Demo — żadne pieniądze nie są pobierane.
        </p>
      </div>
    </section>
  );
}

export default HistoryPreviewCard;
