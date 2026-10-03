import React, { useState } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { Group } from '../../types';
import Modal from '../common/Modal';

export type DialogMode = 'create' | 'join' | 'invite' | null;

interface GroupModalsProps {
  dialog: DialogMode;
  onClose: () => void;
  onFeedback: (msg: string) => void;
}

export function GroupModals({ dialog, onClose, onFeedback }: GroupModalsProps) {
  const { groups, activeGroup, updateGroups, selectGroup } = useDashboard();

  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');
  const [target, setTarget] = useState('');
  const [daily, setDaily] = useState('30');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [inviteFeedback, setInviteFeedback] = useState('');

  if (!dialog) return null;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError('');

    if (dialog === 'create') {
      const targetVal = Number(target.replace(',', '.'));
      const dailyVal = Number(daily.replace(',', '.'));

      if (!Number.isFinite(dailyVal) || dailyVal < 0.01 || dailyVal > 1000000) {
        setError('Dzienna kwota musi wynosić od 0,01 do 1 000 000 zł.');
        return;
      }

      if (!name.trim() || !goal.trim() || !Number.isFinite(targetVal) || targetVal < 1 || targetVal > 100000000) {
        setError('Wpisz nazwę, cel i kwotę od 1 do 100 000 000 zł.');
        return;
      }

      const created: Group = {
        id: crypto.randomUUID(),
        name: name.trim(),
        goal: goal.trim(),
        target: targetVal,
        dailyAmount: Math.round(dailyVal * 100) / 100,
        code: crypto.randomUUID().slice(0, 8).toUpperCase(),
        demo: false,
        deposits: []
      };

      updateGroups([...groups, created]);
      selectGroup(created.id);
      setName('');
      setGoal('');
      setTarget('');
      setDaily('30');
      onFeedback('Twoja lokalna grupa jest gotowa.');
      onClose();
    } else if (dialog === 'join') {
      const found = groups.find((item) => item.code === code.trim().toUpperCase());
      if (!found) {
        setError('Nie znaleziono kodu w tej przeglądarce. Wersja demo nie łączy jeszcze kont na różnych urządzeniach.');
        return;
      }
      selectGroup(found.id);
      setCode('');
      onFeedback('Otworzono grupę.');
      onClose();
    }
  }

  async function handleCopyInviteCode() {
    try {
      await navigator.clipboard.writeText(activeGroup.code);
      setInviteFeedback('Kod skopiowany.');
    } catch {
      setError('Skopiuj kod ręcznie z pola powyżej.');
    }
  }

  const titles: Record<'create' | 'join' | 'invite', string> = {
    create: 'Zacznijcie coś dobrego.',
    join: 'Znajdź swoją ekipę.',
    invite: 'Razem jest łatwiej.'
  };

  return (
    <Modal
      isOpen={Boolean(dialog)}
      onClose={onClose}
      eyebrow="MAŁY KROK. WSPÓLNY CEL."
      title={dialog ? titles[dialog] : ''}
      className="group-modal max-h-[90vh] overflow-y-auto"
      ariaLabel="Działania grupy"
    >
      {dialog === 'invite' ? (
        <div className="flex flex-col gap-4">
          <p className="text-xs text-[#727279] m-0">Kod Twojej grupy:</p>
          <div className="invite-code bg-[#f4f3fc] border border-dashed border-[#c5bfdf] p-5 text-center font-mono text-2xl tracking-[3px] select-all rounded text-[#010120]">
            {activeGroup.code}
          </div>

          <button
            type="button"
            className="primary w-full bg-[#010120] text-white hover:bg-[#292943] rounded py-3 px-4 font-mono text-xs tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer transition-all"
            onClick={handleCopyInviteCode}
          >
            KOPIUJ KOD ↗
          </button>

          <p className="small-text text-[10px] leading-relaxed text-[#727279] m-0">
            Kod otwiera grupę tylko w tej przeglądarce. Zapraszanie innych osób wymaga podłączenia wspólnej bazy danych.
          </p>

          {inviteFeedback && (
            <p className="text-xs text-[#285342] bg-[#edf9f3] p-2 rounded text-center" role="status">
              ✓ {inviteFeedback}
            </p>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {dialog === 'create' ? (
            <>
              <label className="flex flex-col gap-1.5 text-xs text-[#17171c]">
                Nazwa grupy
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="np. Ekipa nowego początku"
                  maxLength={60}
                  required
                  className="w-full p-3 border border-[#ebebeb] rounded text-sm outline-none focus:ring-1 focus:ring-[#7472d5]"
                />
              </label>

              <label className="flex flex-col gap-1.5 text-xs text-[#17171c]">
                Tytuł celu grupy
                <input
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="np. Niepalenie"
                  maxLength={80}
                  required
                  className="w-full p-3 border border-[#ebebeb] rounded text-sm outline-none focus:ring-1 focus:ring-[#7472d5]"
                />
              </label>

              <label className="flex flex-col gap-1.5 text-xs text-[#17171c]">
                Cel oszczędności (PLN)
                <input
                  inputMode="decimal"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  placeholder="np. 3000"
                  required
                  className="w-full p-3 border border-[#ebebeb] rounded text-sm outline-none focus:ring-1 focus:ring-[#7472d5]"
                />
              </label>

              <label className="flex flex-col gap-1.5 text-xs text-[#17171c]">
                Dzienna kwota na osobę (PLN)
                <input
                  inputMode="decimal"
                  value={daily}
                  onChange={(e) => setDaily(e.target.value)}
                  placeholder="np. 30"
                  required
                  className="w-full p-3 border border-[#ebebeb] rounded text-sm outline-none focus:ring-1 focus:ring-[#7472d5]"
                />
                <span className="text-[10px] text-[#727279]">
                  Ty ustalasz stawkę. Obowiązuje każdego członka grupy, każdego dnia.
                </span>
              </label>

              <p className="small-text text-[10px] text-[#727279] m-0">
                Utworzysz lokalną grupę. Na tym etapie nie jest dostępna między urządzeniami.
              </p>
            </>
          ) : (
            <>
              <p className="text-xs text-[#727279] m-0 leading-relaxed">
                Wpisz kod lokalnej grupy. Możesz wypróbować grupę demonstracyjną kodem ODNOWA.
              </p>

              <label className="flex flex-col gap-1.5 text-xs text-[#17171c]">
                Kod grupy
                <input
                  autoFocus
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="ODNOWA"
                  required
                  className="w-full p-3 border border-[#ebebeb] rounded text-sm uppercase outline-none focus:ring-1 focus:ring-[#7472d5]"
                />
              </label>
            </>
          )}

          {error && (
            <p className="form-error text-xs text-[#a12d3d] bg-[#fdf2f2] p-2.5 rounded" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="primary w-full bg-[#010120] text-white hover:bg-[#292943] rounded py-3.5 px-4 font-mono text-xs tracking-wider uppercase flex items-center justify-between cursor-pointer transition-all mt-2"
          >
            <span>{dialog === 'create' ? 'STWÓRZ GRUPĘ' : 'OTWÓRZ GRUPĘ'}</span>
            <span>↗</span>
          </button>
        </form>
      )}
    </Modal>
  );
}

export default GroupModals;
