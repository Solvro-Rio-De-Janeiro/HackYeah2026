import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useDashboard, money } from '../context/DashboardContext';
import Icon from '../components/common/Icon';
import Modal from '../components/common/Modal';
import {
  api,
  CurrentUser,
  AccountStatusResponse,
  getStoredToken,
  getStoredUser,
  setStoredUser,
  clearStoredAuth,
} from '../services/api';

export function ProfilePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const {
    currentUser,
    setCurrentUser,
    settings,
    allDeposits,
    clearHistory,
    exportReport
  } = useDashboard();

  const [resetModal, setResetModal] = useState(false);
  const [user, setUser] = useState<CurrentUser | null>(() => {
    return (currentUser as CurrentUser | null) || getStoredUser();
  });
  const [connectStatus, setConnectStatus] = useState<AccountStatusResponse | null>(null);
  const [connectLoading, setConnectLoading] = useState(false);
  const [connectFeedback, setConnectFeedback] = useState<string | null>(() => {
    if (searchParams.get('connect') === 'return') {
      return 'Konto Stripe Connect zostało pomyślnie zsynchronizowane.';
    }
    return null;
  });

  const total = allDeposits.reduce((sum, deposit) => sum + deposit.amount, 0);

  useEffect(() => {
    if (currentUser) {
      setUser(currentUser as CurrentUser);
    }
  }, [currentUser]);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) return;

    api
      .getMe()
      .then((me) => {
        setUser(me);
        setStoredUser(me);
        setCurrentUser(me);
        if (me.id) {
          api
            .getUserAccountStatus(me.id)
            .then(setConnectStatus)
            .catch(() => {});
        }
      })
      .catch(() => {});
  }, [setCurrentUser]);

  async function handleConnectOnboarding() {
    if (!user?.id) {
      setConnectFeedback('Zaloguj się, aby połączyć konto Stripe.');
      return;
    }
    setConnectLoading(true);
    setConnectFeedback(null);
    try {
      const res = await api.startUserOnboarding(user.id);
      if (res.onboarding_url) {
        window.location.href = res.onboarding_url;
      }
    } catch (err: unknown) {
      setConnectFeedback(err instanceof Error ? err.message : 'Nie udało się uruchomić onboardingu.');
    } finally {
      setConnectLoading(false);
    }
  }

  function handleLogout() {
    clearStoredAuth();
    setUser(null);
    setCurrentUser(null);
    setConnectStatus(null);
    document.documentElement.dataset.theme = 'light';
    try {
      localStorage.setItem('odnowa-theme', JSON.stringify('light'));
    } catch {}
    navigate('/login');
  }

  const isUserAuthenticated = Boolean(user && user.email);
  const displayName = user?.name?.trim() || (isUserAuthenticated ? 'Użytkownik' : 'Twój profil');
  const displayEmail = user?.email || null;
  const initials = isUserAuthenticated
    ? displayName
        .split(' ')
        .filter(Boolean)
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase() || 'U'
    : 'SO';

  return (
    <section className="secondary-page profile-page max-w-[760px] mx-auto py-10 min-h-[650px]">
      <span className="eyebrow muted text-[9px] font-mono tracking-wider uppercase text-[#727279] dark:text-[#b0aec5] block mb-4">
        TWÓJ CODZIENNY RYTM
      </span>

      {connectFeedback && (
        <p
          className="save-feedback bg-[#edf9f3] dark:bg-emerald-950/40 text-[#285342] dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40 p-3.5 text-xs rounded mb-6 text-center font-mono"
          role="status"
          aria-live="polite"
        >
          ✓ {connectFeedback}
        </p>
      )}

      {/* Guest notice if not logged in */}
      {!isUserAuthenticated && (
        <div className="bg-[#f0f0f5] dark:bg-white/5 border border-[#e1e1e8] dark:border-white/10 p-4 rounded-xl mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <strong className="text-sm font-semibold text-[#010120] dark:text-white block mb-0.5">
              Nie jesteś zalogowany
            </strong>
            <p className="text-xs text-[#727279] dark:text-slate-400 m-0">
              Zaloguj się lub załóż konto, aby zsynchronizować wpłaty i zarządzać profilem grupy.
            </p>
          </div>
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <Link
              to="/login"
              className="primary bg-[#010120] text-white hover:bg-[#292943] px-3.5 py-2 font-mono text-[10px] tracking-wider uppercase rounded no-underline"
            >
              Zaloguj się ↗
            </Link>
            <Link
              to="/signup"
              className="outline border border-[#010120] text-[#010120] dark:border-white/20 dark:text-white px-3.5 py-2 font-mono text-[10px] tracking-wider uppercase rounded no-underline"
            >
              Załóż konto ↗
            </Link>
          </div>
        </div>
      )}

      <div className="profile-heading flex items-center justify-between flex-wrap gap-5 my-6">
        <div className="flex items-center gap-5">
          <div
            className="profile-avatar w-16 h-16 sm:w-20 sm:h-20 rounded bg-[#ebebeb] dark:bg-white/10 grid place-items-center text-xl sm:text-2xl font-bold font-mono text-[#010120] dark:text-white flex-shrink-0"
            role="img"
            aria-label={`Awatar profilu: ${displayName}`}
          >
            {initials}
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#010120] dark:text-white m-0 mb-1">
              {displayName}
            </h1>
            <span className="eyebrow muted text-[11px] font-mono tracking-wider uppercase text-[#727279] dark:text-slate-400">
              {displayEmail ? `${displayEmail} · ` : ''}TWÓJ PROFIL W GRUPIE
            </span>
          </div>
        </div>

        {isUserAuthenticated && (
          <button
            type="button"
            onClick={handleLogout}
            className="outline border border-[#ebebeb] dark:border-white/10 px-4 py-2 text-xs font-mono tracking-wider uppercase text-[#4e4e56] hover:text-[#010120] dark:text-[#b0aec5] dark:hover:text-white rounded"
          >
            Wyloguj się
          </button>
        )}
      </div>

      <section aria-label="Statystyki profilu">
        <h2 className="sr-only">Statystyki profilu</h2>
        <div className="profile-stats grid grid-cols-2 gap-4 my-8">
          <div className="bg-[#f0f0f2] dark:bg-white/5 rounded p-6 sm:p-8 flex flex-col gap-2 min-w-0">
            <strong className="text-2xl sm:text-4xl font-semibold text-[#010120] dark:text-white [overflow-wrap:anywhere]">
              {settings.privacy ? '—' : money(total)}
            </strong>
            <span className="eyebrow text-[11px] font-mono tracking-wider uppercase text-[#4e4e56] dark:text-[#b0aec5]">
              SUMA TWOICH WPŁAT
            </span>
          </div>

          <div className="bg-[#f0f0f2] dark:bg-white/5 rounded p-6 sm:p-8 flex flex-col gap-2 min-w-0">
            <strong className="text-2xl sm:text-4xl font-semibold text-[#010120] dark:text-white [overflow-wrap:anywhere]">
              {settings.privacy ? '—' : allDeposits.length}
            </strong>
            <span className="eyebrow text-[11px] font-mono tracking-wider uppercase text-[#4e4e56] dark:text-[#b0aec5]">
              ZAPISÓW W HISTORII
            </span>
          </div>
        </div>
      </section>

      {settings.privacy && (
        <p className="preference-hint profile-privacy-hint p-4 bg-[#f4f3ff] dark:bg-purple-950/30 rounded text-xs text-[#59536f] dark:text-purple-300 text-center my-4" role="note">
          Podsumowanie jest ukryte. Możesz je odsłonić w Preferencjach.
        </p>
      )}

      {/* Stripe Connect Payout Card */}
      <section className="panel p-6 border border-[#ebebeb] dark:border-white/10 rounded-xl bg-[#fcfcff] dark:bg-[#161622] my-6 transition-colors shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="eyebrow muted text-[9px] font-mono tracking-wider uppercase text-[#727279] dark:text-slate-400">
            WYPŁATY NAGRÓD · STRIPE CONNECT
          </span>
          <span
            className={`font-mono text-[9px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded ${
              connectStatus?.transfers_active
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
            }`}
          >
            {connectStatus?.transfers_active ? 'KONTO AKTYWNE ✓' : 'WYMAGA KONFIGURACJI'}
          </span>
        </div>

        <h2 className="text-base font-semibold text-[#010120] dark:text-white m-0 mb-1">
          Konto bankowe do odbioru nagród grupy
        </h2>
        <p className="text-xs text-[#727279] dark:text-slate-400 m-0 mb-4 leading-relaxed">
          Gdy grupa osiągnie swój cel, zebrane środki mogą zostać wypłacone na zakup nagrody bezpośrednio przez Stripe Connect na połączone konto.
        </p>

        <button
          type="button"
          disabled={connectLoading || !isUserAuthenticated}
          onClick={handleConnectOnboarding}
          className="outline border border-[#010120] dark:border-white/20 text-[#010120] dark:text-white hover:bg-[#010120] hover:text-white dark:hover:bg-white dark:hover:text-[#010120] font-mono text-[10px] tracking-wider uppercase py-2.5 px-4 rounded transition-all cursor-pointer disabled:opacity-50"
        >
          {connectLoading
            ? 'PRZEKIEROWYWANIE DO STRIPE...'
            : !isUserAuthenticated
            ? 'ZALOGUJ SIĘ, ABY POŁĄCZYĆ STRIPE ↗'
            : connectStatus?.transfers_active
            ? 'ZARZĄDZAJ KONTEM STRIPE ↗'
            : 'POŁĄCZ KONTO BANKOWE DO WYPŁAT ↗'}
        </button>
      </section>

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
          className="outline w-full border border-[#ebebeb] dark:border-white/10 bg-white dark:bg-transparent text-[#010120] dark:text-white hover:bg-[#f6f6fa] dark:hover:bg-white/5 rounded py-3.5 px-5 font-mono text-xs tracking-wider uppercase flex items-center justify-center cursor-pointer transition-all"
          onClick={() => setResetModal(true)}
        >
          USUŃ LOKALNĄ HISTORIĘ
        </button>
      </section>

      <p className="privacy-caption text-xs text-[#727279] dark:text-slate-400 flex items-center gap-2 mt-6">
        <Icon name="shield" size={16} /> Kwotę dzienną ustala twórca grupy.
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
