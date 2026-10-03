import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboard, money, dailyAmount } from '../context/DashboardContext';
import GroupToolbar from '../components/dashboard/GroupToolbar';
import SavingsHero from '../components/dashboard/SavingsHero';
import DailyAmountPanel from '../components/dashboard/DailyAmountPanel';
import GoalCard from '../components/dashboard/GoalCard';
import HistoryPreviewCard from '../components/dashboard/HistoryPreviewCard';
import MembersList from '../components/dashboard/MembersList';
import ActivityHistory from '../components/dashboard/ActivityHistory';
import GroupModals, { DialogMode } from '../components/dashboard/GroupModals';
import GoalDetailsModal from '../components/dashboard/GoalDetailsModal';

export function DashboardPage() {
  const navigate = useNavigate();
  const { activeGroup } = useDashboard();

  const [dialog, setDialog] = useState<DialogMode>(null);
  const [showGoal, setShowGoal] = useState(false);
  const [feedback, setFeedback] = useState('');

  const rate = dailyAmount(activeGroup);

  return (
    <div className="dashboard-page max-w-[1116px] mx-auto py-2">
      <GroupToolbar
        onOpenCreate={() => setDialog('create')}
        onOpenJoin={() => setDialog('join')}
      />

      <SavingsHero onShowGoal={() => setShowGoal(true)} />

      <div
        className="demo-notice flex items-center gap-2 font-mono text-[11px] text-[#727279] my-4 leading-relaxed"
        role="region"
        aria-label="Informacja o grupie"
      >
        <span className="small-dot w-1.5 h-1.5 rounded-full bg-[#9491bb] flex-shrink-0" aria-hidden="true" />
        <span>
          {activeGroup.demo ? 'GRUPA DEMONSTRACYJNA' : 'GRUPA LOKALNA'} · Dane zapisują się w tej przeglądarce.
          Synchronizacja między osobami nie jest jeszcze podłączona.
        </span>
      </div>

      <DailyAmountPanel />

      {feedback && (
        <p className="save-feedback bg-[#edf9f3] text-[#285342] p-3 text-xs rounded my-3" role="status" aria-live="polite">
          ✓ {feedback}
        </p>
      )}

      <section aria-labelledby="rhythm-heading">
        <div className="section-heading flex items-center justify-between my-8">
          <h2 id="rhythm-heading" className="text-xl font-semibold tracking-tight text-[#010120] m-0">
            Stały rytm. Wspólny kierunek.
          </h2>
          <span className="eyebrow muted text-[11px] font-mono tracking-wider uppercase text-[#727279]">
            BEZ PRESJI. Z WSPARCIEM.
          </span>
        </div>

        <div className="dashboard-grid savings-grid grid grid-cols-1 md:grid-cols-[1.62fr_1fr] gap-6 mb-6">
          <GoalCard
            onShowGoal={() => setShowGoal(true)}
            onOpenInvite={() => setDialog('invite')}
          />
          <HistoryPreviewCard />
        </div>
      </section>

      <section aria-label="Społeczność i aktywność" className="community-grid grid grid-cols-1 md:grid-cols-[1.05fr_1fr] gap-6 my-6">
        <MembersList onOpenInvite={() => setDialog('invite')} />
        <ActivityHistory />
      </section>

      <blockquote className="quote flex items-center gap-3.5 my-8 text-[#555560]">
        <span className="text-4xl text-[#b3b0d9] leading-none" aria-hidden="true">“</span>
        <p className="text-xs m-0 text-[#17171c]">
          Codziennie {money(rate)}. Razem budujecie motywację.
        </p>
        <cite className="eyebrow muted text-[11px] font-mono tracking-wider uppercase text-[#727279] ml-auto not-italic">
          TAK DZIAŁA ODNOWA
        </cite>
      </blockquote>

      <GroupModals
        dialog={dialog}
        onClose={() => setDialog(null)}
        onFeedback={(msg) => setFeedback(msg)}
      />

      <GoalDetailsModal
        isOpen={showGoal}
        onClose={() => setShowGoal(false)}
        onNavigateToIncidents={() => navigate('/incidents')}
      />
    </div>
  );
}

export default DashboardPage;
