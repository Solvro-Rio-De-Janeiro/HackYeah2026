import React from 'react';
import { Link } from 'react-router-dom';
import { useDashboard, money } from '../../context/DashboardContext';

interface MembersListProps {
  onOpenInvite: () => void;
}

export function MembersList({ onOpenInvite }: MembersListProps) {
  const { activeGroup, members } = useDashboard();

  return (
    <section className="panel members-card p-6 sm:p-7 border border-[#ebebeb] dark:border-white/10 rounded bg-white dark:bg-[#161622] transition-colors">
      <div className="card-top flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold tracking-tight text-[#010120] dark:text-white">
          Wasza ekipa
        </h2>
        <span className="eyebrow muted text-[9px] font-mono tracking-wider uppercase text-[#727279] dark:text-slate-400">
          {members.length} {members.length === 1 ? 'OSOBA' : 'OSOBY'}
        </span>
      </div>

      <div className="flex flex-col">
        {members.map((member, index) => (
          <Link
            key={member.name}
            to="/profile"
            aria-label={`Profil użytkownika ${member.name}`}
            className="member-row flex items-center gap-3 py-3 border-b border-[#ebebeb] dark:border-white/10 last:border-0 no-underline text-inherit hover:bg-black/[0.02] dark:hover:bg-white/[0.04] -mx-2 px-2 rounded transition-colors group cursor-pointer"
          >
            <span
              className={`member-avatar ${member.color} w-8 h-8 rounded-full grid place-items-center text-[9px] font-mono font-bold flex-shrink-0`}
            >
              {member.initials}
            </span>

            <div className="flex flex-col gap-0.5 min-w-0">
              <strong className="text-xs font-semibold text-[#010120] dark:text-white truncate flex items-center gap-1.5">
                <span>{member.name}</span>
                {index === 0 && (
                  <span className="you-tag text-[8px] font-mono text-[#7870a1] bg-[#eeedfc] dark:bg-purple-950 dark:text-purple-300 px-1 py-0.5 rounded">
                    TY
                  </span>
                )}
              </strong>
              <span className="text-[10px] text-[#727279] dark:text-slate-400 flex items-center gap-1">
                {index === 0
                  ? `${activeGroup.deposits.length} zapisów w historii · Twój profil ↗`
                  : 'Członek grupy'}
              </span>
            </div>

            <strong className="member-amount ml-auto text-xs font-semibold font-mono text-[#010120] dark:text-white whitespace-nowrap">
              {money(member.amount)}
            </strong>
          </Link>
        ))}
      </div>

      <button
        type="button"
        className="text-button invite-link border-0 bg-transparent text-left text-xs text-[#294f53] dark:text-[#a0dfe4] hover:underline cursor-pointer mt-4 p-0 block"
        onClick={onOpenInvite}
      >
        ＋ Miejsce dla kogoś bliskiego. Zaproś do grupy.
      </button>
    </section>
  );
}

export default MembersList;
