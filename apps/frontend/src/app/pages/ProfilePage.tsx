import React, { useState } from 'react';
import { useDashboard, money } from '../context/DashboardContext';
import Icon from '../components/common/Icon';
import Modal from '../components/common/Modal';

export function ProfilePage() {
  const {
    settings,
    allDeposits,
    clearHistory,
    exportReport
  } = useDashboard();

  const [resetModal, setResetModal] = useState(false);

  const total = allDeposits.reduce((sum, deposit) => sum + deposit.amount, 0);

  return (
    <section className="secondary-page profile-page max-w-[760px] mx-auto py-10 min-h-[650px]">
      <span className="eyebrow muted text-[9px] font-mono tracking-wider uppercase text-[#727279] block mb-4">
        TWÓJ CODZIENNY RYTM
      </span>

      <div className="profile-heading flex items-center gap-5 my-6">
        <div
          className="profile-avatar w-16 h-16 sm:w-20 sm:h-20 rounded bg-[#ebebeb] grid place-items-center text-xl sm:text-2xl font-bold font-mono text-[#010120] flex-shrink-0"
          role="img"
          aria-label="Awatar profilu: Anonimowy Orzeł"
        >
          AO
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#010120] m-0 mb-1">
            Anonimowy Orzeł
          </h1>
          <span className="eyebrow muted text-[11px] font-mono tracking-wider uppercase text-[#727279]">
            TWÓJ PROFIL W GRUPIE
          </span>
        </div>
      </div>

      <section aria-label="Statystyki profilu">
        <h2 className="sr-only">Statystyki profilu</h2>
        <div className="profile-stats grid grid-cols-2 gap-4 my-8">
          <div className="bg-[#f0f0f2] rounded p-6 sm:p-8 flex flex-col gap-2 min-w-0">
            <strong className="text-2xl sm:text-4xl font-semibold text-[#010120] [overflow-wrap:anywhere]">
              {settings.privacy ? '—' : money(total)}
            </strong>
            <span className="eyebrow text-[11px] font-mono tracking-wider uppercase text-[#727279]">
              SUMA ZAPISÓW · DEMO I ARCHIWUM
            </span>
          </div>

          <div className="bg-[#f0f0f2] rounded p-6 sm:p-8 flex flex-col gap-2 min-w-0">
            <strong className="text-2xl sm:text-4xl font-semibold text-[#010120] [overflow-wrap:anywhere]">
              {settings.privacy ? '—' : allDeposits.length}
            </strong>
            <span className="eyebrow text-[11px] font-mono tracking-wider uppercase text-[#727279]">
              ZAPISÓW W HISTORII
            </span>
          </div>
        </div>
      </section>

      {settings.privacy && (
        <p className="preference-hint profile-privacy-hint p-4 bg-[#f4f3ff] rounded text-xs text-[#59536f] text-center my-4" role="note">
          Podsumowanie jest ukryte. Możesz je odsłonić w Preferencjach.
        </p>
      )}

      <section aria-label="Zarządzanie danymi profilu" className="profile-actions flex flex-col gap-3 my-8">
        <h2 className="sr-only">Działania profilu</h2>
        <button
          type="button"
          aria-label="Eksportuj historię zapisów do pliku CSV"
          className="primary w-full bg-[#010120] text-white hover:bg-[#292943] rounded py-3.5 px-5 font-mono text-xs tracking-wider uppercase flex items-center justify-between cursor-pointer transition-all"
          onClick={exportReport}
        >
          <span>EKSPORTUJ HISTORIĘ (.CSV)</span>
          <Icon name="download" size={18} />
        </button>

        <button
          type="button"
          aria-label="Otwórz potwierdzenie usunięcia lokalnej historii"
          className="outline w-full border border-[#ebebeb] bg-white text-[#010120] hover:bg-[#f6f6fa] rounded py-3.5 px-5 font-mono text-xs tracking-wider uppercase flex items-center justify-center cursor-pointer transition-all"
          onClick={() => setResetModal(true)}
        >
          USUŃ LOKALNĄ HISTORIĘ
        </button>
      </section>

      <p className="privacy-caption text-xs text-[#727279] flex items-center gap-2 mt-6">
        <Icon name="shield" size={16} /> Kwotę dzienną ustala twórca grupy · demo bez rzeczywistych płatności.
      </p>

      <Modal
        isOpen={resetModal}
        onClose={() => setResetModal(false)}
        title="Usunąć Twoje zapisy?"
        ariaLabel="Usuń zapisy"
      >
        <p className="text-xs leading-relaxed text-[#727279] mb-6">
          Usuniesz własne zapisy ze wszystkich lokalnych grup. Możesz wcześniej wyeksportować raport.
          Ta czynność nie wpływa na Twoje pieniądze.
        </p>

        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            className="primary w-full bg-[#010120] text-white hover:bg-[#292943] rounded py-3 px-4 font-mono text-xs tracking-wider uppercase flex items-center justify-center cursor-pointer transition-all"
            onClick={() => {
              clearHistory();
              setResetModal(false);
            }}
          >
            TAK, USUŃ ZAPISY
          </button>

          <button
            type="button"
            autoFocus
            className="outline w-full border border-[#ebebeb] bg-white text-[#010120] hover:bg-[#f6f6fa] rounded py-3 px-4 font-mono text-xs tracking-wider uppercase flex items-center justify-center cursor-pointer transition-all"
            onClick={() => setResetModal(false)}
          >
            ANULUJ
          </button>
        </div>
      </Modal>
    </section>
  );
}

export default ProfilePage;
