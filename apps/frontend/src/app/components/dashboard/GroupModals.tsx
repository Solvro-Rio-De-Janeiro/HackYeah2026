import React, { useState, useEffect } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { Group } from '../../types';
import Modal from '../common/Modal';

export type DialogMode = 'create' | 'join' | 'invite' | 'goal' | null;

interface GroupModalsProps {
  dialog: DialogMode;
  onClose: () => void;
  onFeedback: (msg: string) => void;
}

export function GroupModals({ dialog, onClose, onFeedback }: GroupModalsProps) {
  const { groups, activeGroup, updateGroups, selectGroup, setGoal: setContextGoal } = useDashboard();

  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');
  const [target, setTarget] = useState('');
  const [daily, setDaily] = useState('30');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [inviteFeedback, setInviteFeedback] = useState('');

  useEffect(() => {
    if (dialog === 'goal') {
      setGoal(activeGroup.goal || '');
      setTarget(activeGroup.target ? String(activeGroup.target) : '');
      setDaily(activeGroup.dailyAmount ? String(activeGroup.dailyAmount) : '30');
      setError('');
    }
  }, [dialog, activeGroup]);

  if (!dialog) return null;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError('');

    if (dialog === 'goal') {
      const targetVal = Number(target.replace(',', '.'));
      const dailyVal = Number(daily.replace(',', '.'));

      if (!goal.trim()) {
        setError('Podaj nazwę celu.');
        return;
      }

      if (!Number.isFinite(targetVal) || targetVal < 1 || targetVal > 100000000) {
        setError('Wpisz kwotę celu od 1 do 100 000 000 zł.');
        return;
      }

      if (!Number.isFinite(dailyVal) || dailyVal < 0.01 || dailyVal > 1000000) {
        setError('Dzienna stawka musi wynosić od 0,01 do 1 000 000 zł.');
        return;
      }

      setContextGoal(goal.trim(), targetVal, Math.round(dailyVal * 100) / 100);
      onFeedback('Wspólny cel został pomyślnie zapisany.');
      onClose();
      return;
    }

    if (dialog === 'create') {
      const targetVal = target.trim() ? Number(target.replace(',', '.')) : 0;
      const dailyVal = Number(daily.replace(',', '.'));

      if (!Number.isFinite(dailyVal) || dailyVal < 0.01 || dailyVal > 1000000) {
        setError('Dzienna kwota musi wynosić od 0,01 do 1 000 000 zł.');
        return;
      }

      if (!name.trim()) {
        setError('Wpisz nazwę grupy.');
        return;
      }

      const created: Group = {
        id: crypto.randomUUID(),
        name: name.trim(),
        goal: goal.trim(),
        target: Number.isFinite(targetVal) && targetVal > 0 ? targetVal : 0,
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
      onFeedback('Twoja nowa grupa jest gotowa.');
      onClose();
    } else if (dialog === 'join') {
      const found = groups.find((item) => item.code === code.trim().toUpperCase());
      if (!found) {
        setError('Nie znaleziono kodu grupy w tej przeglądarce.');
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

  const titles: Record<'create' | 'join' | 'invite' | 'goal', string> = {
    create: 'Zacznijcie coś dobrego.',
    join: 'Znajdź swoją ekipę.',
    invite: 'Razem jest łatwiej.',
    goal: 'Wyznacz wspólny cel.'
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
          <p className="text-xs text-[#727279] dark:text-slate-400 m-0">Kod Twojej grupy:</p>
          <div className="invite-code bg-[#f4f3fc] dark:bg-white/5 border border-dashed border-[#c5bfdf] dark:border-white/20 p-5 text-center font-mono text-2xl tracking-[3px] select-all rounded text-[#010120] dark:text-white">
            {activeGroup.code}
          </div>

          <button
            type="button"
            className="primary w-full bg-[#010120] text-white hover:bg-[#292943] rounded py-3 px-4 font-mono text-xs tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer transition-all"
            onClick={handleCopyInviteCode}
          >
            KOPIUJ KOD ↗
          </button>

          <p className="small-text text-[10px] leading-relaxed text-[#727279] dark:text-slate-400 m-0">
            Kod pozwala dołączyć innym osobom do Twojej grupy.
          </p>

          {inviteFeedback && (
            <p className="text-xs text-[#285342] bg-[#edf9f3] p-2 rounded text-center" role="status">
              ✓ {inviteFeedback}
            </p>
          )}
        </div>
      ) : dialog === 'goal' ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <p className="text-xs text-[#727279] dark:text-slate-400 m-0">
            Wyznacz cel, na który grupa będzie odkładać codzienne stawki.
          </p>

          <label className="flex flex-col gap-1.5 text-xs text-[#17171c] dark:text-white">
            Tytuł celu
            <input
              autoFocus
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="np. Wycieczka w góry, Nowy sprzęt, Zdrowie"
              maxLength={80}
              required
              className="w-full p-3 border border-[#ebebeb] dark:border-white/10 dark:bg-white/5 rounded text-sm outline-none focus:ring-1 focus:ring-[#7472d5]"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-xs text-[#17171c] dark:text-white">
            Kwota celu (PLN)
            <input
              inputMode="decimal"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="np. 3000"
              required
              className="w-full p-3 border border-[#ebebeb] dark:border-white/10 dark:bg-white/5 rounded text-sm outline-none focus:ring-1 focus:ring-[#7472d5]"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-xs text-[#17171c] dark:text-white">
            Dzienna stawka na osobę (PLN)
            <input
              inputMode="decimal"
              value={daily}
              onChange={(e) => setDaily(e.target.value)}
              placeholder="np. 30"
              required
              className="w-full p-3 border border-[#ebebeb] dark:border-white/10 dark:bg-white/5 rounded text-sm outline-none focus:ring-1 focus:ring-[#7472d5]"
            />
            <span className="text-[10px] text-[#727279] dark:text-slate-400">
              Stawka wpłacana codziennie przez każdego członka grupy.
            </span>
          </label>

          {error && (
            <p className="form-error text-xs text-[#a12d3d] bg-[#fdf2f2] p-2.5 rounded" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="primary w-full bg-[#010120] text-white hover:bg-[#292943] rounded py-3.5 px-4 font-mono text-xs tracking-wider uppercase flex items-center justify-between cursor-pointer transition-all mt-2"
          >
            <span>ZAPISZ CEL</span>
            <span>↗</span>
          </button>
        </form>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {dialog === 'create' ? (
            <>
              <label className="flex flex-col gap-1.5 text-xs text-[#17171c] dark:text-white">
                Nazwa grupy
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="np. Ekipa nowego początku"
                  maxLength={60}
                  required
                  className="w-full p-3 border border-[#ebebeb] dark:border-white/10 dark:bg-white/5 rounded text-sm outline-none focus:ring-1 focus:ring-[#7472d5]"
                />
              </label>

              <label className="flex flex-col gap-1.5 text-xs text-[#17171c] dark:text-white">
                Tytuł celu grupy (opcjonalnie)
                <input
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="np. Zdrowie i kondycja"
                  maxLength={80}
                  className="w-full p-3 border border-[#ebebeb] dark:border-white/10 dark:bg-white/5 rounded text-sm outline-none focus:ring-1 focus:ring-[#7472d5]"
                />
              </label>

              <label className="flex flex-col gap-1.5 text-xs text-[#17171c] dark:text-white">
                Cel oszczędności (PLN) (opcjonalnie)
                <input
                  inputMode="decimal"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  placeholder="np. 3000"
                  className="w-full p-3 border border-[#ebebeb] dark:border-white/10 dark:bg-white/5 rounded text-sm outline-none focus:ring-1 focus:ring-[#7472d5]"
                />
              </label>

              <label className="flex flex-col gap-1.5 text-xs text-[#17171c] dark:text-white">
                Dzienna kwota na osobę (PLN)
                <input
                  inputMode="decimal"
                  value={daily}
                  onChange={(e) => setDaily(e.target.value)}
                  placeholder="np. 30"
                  required
                  className="w-full p-3 border border-[#ebebeb] dark:border-white/10 dark:bg-white/5 rounded text-sm outline-none focus:ring-1 focus:ring-[#7472d5]"
                />
                <span className="text-[10px] text-[#727279] dark:text-slate-400">
                  Stawka obowiązująca każdego członka grupy.
                </span>
              </label>
            </>
          ) : (
            <>
              <p className="text-xs text-[#727279] dark:text-slate-400 m-0 leading-relaxed">
                Wpisz kod grupy, do której chcesz dołączyć.
              </p>

              <label className="flex flex-col gap-1.5 text-xs text-[#17171c] dark:text-white">
                Kod grupy
                <input
                  autoFocus
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="ODNOWA"
                  required
                  className="w-full p-3 border border-[#ebebeb] dark:border-white/10 dark:bg-white/5 rounded text-sm uppercase outline-none focus:ring-1 focus:ring-[#7472d5]"
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
