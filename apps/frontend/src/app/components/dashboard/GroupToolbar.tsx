import React from "react";
import { useDashboard } from "../../context/DashboardContext";
import { ArrowUpRightFromCircle, PlusCircle, UserPlus } from "lucide-react";

interface GroupToolbarProps {
  onOpenJoin: () => void;
  onOpenCreate: () => void;
}

export function GroupToolbar({ onOpenJoin, onOpenCreate }: GroupToolbarProps) {
  const { groups, activeGroup, selectGroup } = useDashboard();

  return (
    <div className="group-toolbar flex flex-col md:flex-row md:items-center justify-between gap-4 my-2 mb-6">
      <div className="flex flex-col gap-1 w-full md:w-auto">
        <label
          htmlFor="group-select"
          className="eyebrow muted text-[10px] font-mono tracking-wider text-[#727279] uppercase cursor-pointer"
        >
          TWOJA GRUPA
        </label>

        <select
          id="group-select"
          value={activeGroup.id}
          onChange={(e) => selectGroup(e.target.value)}
          className="font-semibold text-base bg-white border border-line sm:border-0 text-ink cursor-pointer outline-none focus:ring-1 focus:ring-[#7472d5] rounded p-2 sm:p-0 sm:pr-6 w-full max-w-full sm:max-w-xs truncate"
        >
          {groups.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </div>

      <div className="group-actions flex flex-col md:flex-row items-center gap-2.5 md:gap-6 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-line">
        <button
          type="button"
          className="w-full md:w-auto flex items-center justify-center gap-2 border border-line rounded-xl px-4 py-2.5 md:py-2 text-xs font-semibold text-ink bg-white hover:bg-[#f6f6fa] cursor-pointer transition-all shrink-0 shadow-sm md:shadow-none"
          onClick={onOpenJoin}
        >
          <span>Dołącz do grupy</span>
          <ArrowUpRightFromCircle className="size-4 text-[#7472d5]" />
        </button>

        <button
          type="button"
          className="w-full md:w-auto flex items-center justify-center gap-2 border border-[#7472d5]/30 rounded-xl px-4 py-2.5 md:py-2 text-xs font-mono tracking-wider uppercase text-[#010120] bg-white hover:bg-[#f6f6fa] cursor-pointer transition-all shrink-0 shadow-sm md:shadow-none"
          onClick={onOpenCreate}
        >
          <PlusCircle className="size-4 text-[#7472d5]" />
          <span>STWÓRZ GRUPĘ</span>
        </button>
      </div>
    </div>
  );
}

export default GroupToolbar;
