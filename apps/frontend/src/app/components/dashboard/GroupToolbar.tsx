import React from 'react';
import { useDashboard } from '../../context/DashboardContext';

interface GroupToolbarProps {
  onOpenJoin: () => void;
  onOpenCreate: () => void;
}

export function GroupToolbar({ onOpenJoin, onOpenCreate }: GroupToolbarProps) {
  const { groups, activeGroup, selectGroup } = useDashboard();

  return (
    <div className="group-toolbar flex items-center justify-between gap-4 my-2 mb-6">
      <div className="flex flex-col gap-1.5">
        <span className="eyebrow muted text-[9px] font-mono tracking-wider uppercase text-[#727279] dark:text-slate-400">
          MOJE GRUPY
        </span>
        <select
          aria-label="Wybierz grupę"
          value={activeGroup.id}
          onChange={(e) => selectGroup(e.target.value)}
          className="font-semibold text-base bg-white dark:bg-transparent border-0 text-[#010120] dark:text-white cursor-pointer outline-none focus:ring-1 focus:ring-[#7472d5] rounded pr-6"
        >
          {groups.map((item) => (
            <option key={item.id} value={item.id} className="dark:bg-[#161622] dark:text-white">
              {item.name}
            </option>
          ))}
        </select>
      </div>

      <div className="group-actions flex items-center gap-2.5">
        <button
          type="button"
          className="outline"
          onClick={onOpenJoin}
        >
          DOŁĄCZ DO GRUPY ↗
        </button>
        <button
          type="button"
          className="outline"
          onClick={onOpenCreate}
        >
          ＋ STWÓRZ GRUPĘ
        </button>
      </div>
    </div>
  );
}

export default GroupToolbar;
