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
        <span className="eyebrow muted text-[10px] tracking-wider text-[#727279]">
          TWOJA GRUPA
        </span>
        <select
          aria-label="Wybierz grupę"
          value={activeGroup.id}
          onChange={(e) => selectGroup(e.target.value)}
          className="font-semibold text-base bg-white border-0 text-[#010120] cursor-pointer outline-none focus:ring-1 focus:ring-[#7472d5] rounded pr-6"
        >
          {groups.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </div>

      <div className="group-actions flex items-center gap-4 sm:gap-6">
        <button
          type="button"
          className="plain-action border-0 bg-transparent text-xs font-semibold text-[#010120] hover:underline cursor-pointer py-2"
          onClick={onOpenJoin}
        >
          Dołącz do grupy ↗
        </button>
        <button
          type="button"
          className="outline flex items-center gap-2 border border-[#ebebeb] rounded px-4 py-2 text-xs font-mono tracking-wider uppercase text-[#010120] bg-white hover:bg-[#f6f6fa] cursor-pointer transition-all"
          onClick={onOpenCreate}
        >
          ＋ STWÓRZ GRUPĘ
        </button>
      </div>
    </div>
  );
}

export default GroupToolbar;
