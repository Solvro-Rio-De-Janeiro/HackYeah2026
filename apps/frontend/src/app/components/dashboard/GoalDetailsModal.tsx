import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useDashboard, money, dailyAmount } from '../../context/DashboardContext';
import Icon from '../common/Icon';

interface GoalDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToIncidents: () => void;
}

export function GoalDetailsModal({
  isOpen,
  onClose,
  onNavigateToIncidents
}: GoalDetailsModalProps) {
  const { activeGroup, members, incidents } = useDashboard();
  const dialogRef = useRef<HTMLElement>(null);

  const total = members.reduce((sum, member) => sum + member.amount, 0);
  const reports = incidents.filter((incident) => incident.groupId === activeGroup.id);
  const rate = dailyAmount(activeGroup);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key !== 'Tab') return;

      const buttons = dialogRef.current?.querySelectorAll<HTMLButtonElement>('button');
      if (!buttons?.length) return;
      const first = buttons[0];
      const last = buttons[buttons.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="modal-backdrop goal-details-backdrop fixed inset-0 z-50 overflow-y-auto bg-[#01012070] backdrop-blur-[5px] flex items-center justify-center p-0 md:p-6"
      onClick={onClose}
    >
      <section
        ref={dialogRef}
        className="modal goal-details relative w-full max-w-[760px] min-h-screen md:min-h-0 md:max-h-[90vh] md:rounded-[5px] bg-white p-6 sm:p-10 overflow-y-auto shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="goal-details-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="modal-close absolute top-5 right-5 p-2 text-2xl leading-none text-[#727279] hover:text-[#010120] cursor-pointer"
          onClick={onClose}
          aria-label="Zamknij szczegóły celu"
        >
          <Icon name="close" size={20} />
        </button>

        <span className="eyebrow muted text-[9px] font-mono tracking-wider uppercase text-[#727279] block mb-2">
          {activeGroup.name} // SZCZEGÓŁY CELU
        </span>

        <h2 id="goal-details-title" className="text-3xl font-semibold tracking-tight text-[#010120] mb-2 [overflow-wrap:anywhere]">
          {activeGroup.goal}
        </h2>

        <p className="goal-details-intro text-xs text-[#727279] mb-6">
          {money(rate)} dziennie na osobę. Wspólny cel, indywidualna historia.
        </p>

        <div className="goal-summary grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="flex flex-col gap-2 bg-[#f4f3fc] p-4 rounded min-w-0">
            <span className="eyebrow muted text-[8px] font-mono tracking-wider uppercase text-[#727279]">
              RAZEM WPŁACONE
            </span>
            <strong className="text-2xl font-semibold text-[#010120] [overflow-wrap:anywhere]">
              {money(total)}
            </strong>
          </div>

          <div className="flex flex-col gap-2 bg-[#f4f3fc] p-4 rounded min-w-0">
            <span className="eyebrow muted text-[8px] font-mono tracking-wider uppercase text-[#727279]">
              POZOSTAŁO DO CELU
            </span>
            <strong className="text-2xl font-semibold text-[#010120] [overflow-wrap:anywhere]">
              {money(Math.max(0, activeGroup.target - total))}
            </strong>
          </div>

          <div className="flex flex-col gap-2 bg-[#f4f3fc] p-4 rounded min-w-0">
            <span className="eyebrow muted text-[8px] font-mono tracking-wider uppercase text-[#727279]">
              ZGŁOSZONE PRZYŁAPANIA
            </span>
            <strong className="text-2xl font-semibold text-[#010120] [overflow-wrap:anywhere]">
              {reports.length}
            </strong>
          </div>
        </div>

        <div className="goal-member-table w-full mb-6">
          <div className="goal-table-heading grid grid-cols-[1.6fr_1fr_0.8fr] gap-3 pb-3 border-b border-[#ebebeb] text-[9px] font-mono text-[#727279]">
            <span>OSOBA</span>
            <span className="text-right">WPŁACONE</span>
            <span className="text-right">PRZYŁAPANIA</span>
          </div>

          {members.map((member, index) => {
            const count = reports.filter((incident) => incident.person === member.name).length;
            return (
              <div
                className="goal-member-row grid grid-cols-[1.6fr_1fr_0.8fr] items-center gap-3 py-4 border-b border-[#ebebeb]"
                key={member.name}
              >
                <div className="goal-member-name flex items-center gap-3 min-w-0">
                  <span className={`member-avatar ${member.color} w-8 h-8 rounded-full grid place-items-center text-[9px] font-mono font-bold flex-shrink-0`}>
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
                      {index === 0 ? 'Twoja historia' : 'Członek grupy'}
                    </span>
                  </div>
                </div>

                <strong className="goal-member-amount text-right text-sm font-semibold font-mono text-[#010120] [overflow-wrap:anywhere]">
                  {money(member.amount)}
                </strong>

                <span className={`caught-count flex flex-col items-end gap-0.5 text-base font-medium ${count ? 'has-reports text-[#a16743]' : 'text-[#727279]'}`}>
                  {count}
                  <span className="text-[8px] text-[#727279] font-normal">
                    {count === 1 ? 'zgłoszenie' : 'zgłoszeń'}
                  </span>
                </span>
              </div>
            );
          })}
        </div>

        <div className="goal-details-footer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-6 pt-4 border-t border-[#ebebeb]">
          <p className="text-[10px] leading-relaxed text-[#727279] m-0 max-w-md">
            Kwoty pochodzą ze zgromadzonych wpłat. Liczniki pokazują zapisane zgłoszenia — nie zweryfikowane naruszenia.
          </p>
          <button
            type="button"
            className="primary bg-[#010120] text-white hover:bg-[#292943] rounded py-3 px-5 font-mono text-xs tracking-wider uppercase inline-flex items-center gap-2 cursor-pointer transition-all flex-shrink-0"
            onClick={() => {
              onClose();
              onNavigateToIncidents();
            }}
          >
            ZOBACZ HISTORIĘ PRZYŁAPAŃ ↗
          </button>
        </div>
      </section>
    </div>,
    document.body
  );
}

export default GoalDetailsModal;
