import React from 'react';
import { useDashboard, money } from '../../context/DashboardContext';

interface MembersListProps {
  onOpenInvite: () => void;
}

export function MembersList({ onOpenInvite }: MembersListProps) {
  const { activeGroup, members } = useDashboard();

  return (
    <section className="panel members-card p-6 sm:p-7 border border-[#ebebeb] rounded bg-white transition-colors">
      <div className="card-top flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold tracking-tight text-[#010120]">
          Wasza ekipa
        </h2>
        <span className="eyebrow muted text-[9px] font-mono tracking-wider uppercase text-[#727279]">
          {members.length} {members.length === 1 ? 'OSOBA' : 'OSOBY'}
        </span>
      </div>

      <div className="flex flex-col">
        {members.map((member, index) => (
          <div
            className="member-row flex items-center gap-3 py-3 border-b border-[#ebebeb] last:border-0"
            key={member.initials}
          >
            <span
              className={`member-avatar ${member.color} w-8 h-8 rounded-full grid place-items-center text-[9px] font-mono font-bold flex-shrink-0`}
            >
              {member.initials}
            </span>

            <div className="flex flex-col gap-0.5 min-w-0">
              <strong className="text-xs font-semibold text-[#010120] truncate">
                {member.name}
                {index === 0 && (
                  <span className="you-tag text-[8px] font-mono text-[#7870a1] bg-[#eeedfc] px-1 py-0.5 rounded ml-1.5">
                    TY
                  </span>
                )}
              </strong>
              <span className="text-[10px] text-[#727279]">
                {index === 0
                  ? `${activeGroup.deposits.length} zapisów w historii`
                  : 'Przykładowy członek grupy'}
              </span>
            </div>

            <strong className="member-amount ml-auto text-xs font-semibold font-mono text-[#010120] whitespace-nowrap">
              {money(member.amount)}
            </strong>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="text-button invite-link border-0 bg-transparent text-left text-xs text-[#294f53] hover:underline cursor-pointer mt-4 p-0 block"
        onClick={onOpenInvite}
      >
        ＋ Miejsce dla kogoś bliskiego. Zaproś do grupy.
      </button>
    </section>
  );
}

export default MembersList;
