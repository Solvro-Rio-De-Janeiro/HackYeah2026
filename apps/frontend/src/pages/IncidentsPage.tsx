import React, { useState } from 'react';
import { useDashboard, money, dailyAmount } from '../context/DashboardContext';
import IncidentRow from '../components/incidents/IncidentRow';
import IncidentFormModal from '../components/incidents/IncidentFormModal';
import PhotoLightboxModal from '../components/incidents/PhotoLightboxModal';
import DeleteIncidentModal from '../components/incidents/DeleteIncidentModal';

export function IncidentsPage() {
  const { activeGroup, incidents, updateIncidents } = useDashboard();

  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [removeId, setRemoveId] = useState<string | null>(null);
  const [photoView, setPhotoView] = useState<string | null>(null);

  const groupIncidents = incidents.filter((item) => item.groupId === activeGroup.id);
  const rate = dailyAmount(activeGroup);

  return (
    <section className="incidents-page max-w-[1116px] mx-auto py-8 min-h-[650px]">
      <div className="incident-header flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 mb-6">
        <div>
          <span className="eyebrow muted text-[9px] font-mono tracking-wider uppercase text-[#727279] block mb-1">
            {activeGroup.name} // WSPARCIE GRUPY
          </span>
          <h1 className="text-3xl font-semibold tracking-tight text-[#010120] my-2">
            Przyłapania
          </h1>
          <p className="text-xs text-[#727279] m-0">
            Paleniu mówimy wprost. Sobie — z wyrozumiałością.
          </p>
        </div>

        <button
          type="button"
          aria-label="Zapisz nowe zdarzenie palenia"
          className="primary bg-[#010120] text-white hover:bg-[#292943] rounded py-3 px-5 font-mono text-xs tracking-wider uppercase inline-flex items-center gap-2 cursor-pointer transition-all flex-shrink-0"
          onClick={() => {
            setMessage('');
            setShowForm(true);
          }}
        >
          <span aria-hidden="true">＋</span> ZAPISZ ZDARZENIE
        </button>
      </div>

      <div className="incident-info flex items-center gap-4 bg-[#f2f0fc] p-5 sm:p-6 rounded mb-8">
        <span className="text-2xl text-[#7e75a9] leading-none flex-shrink-0" aria-hidden="true">↗</span>
        <p className="text-xs leading-relaxed text-[#59536f] m-0">
          To historia zgłoszonych zdarzeń, nie system oceniania. Jeden trudniejszy dzień nie przekreśla postępu.
          Zapis nie nalicza dodatkowej opłaty — dzienna kwota tej grupy pozostaje {money(rate)} na osobę.
        </p>
      </div>

      {message && (
        <p className="save-feedback bg-[#edf9f3] text-[#285342] p-3 text-xs rounded mb-6 text-center" role="status" aria-live="polite">
          {message}
        </p>
      )}

      <section className="panel incident-list p-6 sm:p-7 border border-[#ebebeb] rounded bg-white mb-6 transition-colors">
        <div className="card-top flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold tracking-tight text-[#010120]">
            Historia palenia
          </h2>
          <span className="eyebrow muted text-[11px] font-mono tracking-wider uppercase text-[#727279]">
            {groupIncidents.length} ZDARZEŃ
          </span>
        </div>

        {groupIncidents.length ? (
          <ul className="flex flex-col list-none p-0 m-0" role="list" aria-label="Lista zgłoszonych zdarzeń palenia">
            {[...groupIncidents].reverse().map((incident) => (
              <li key={incident.id} className="list-none">
                <IncidentRow
                  incident={incident}
                  onViewPhoto={(photo) => setPhotoView(photo)}
                  onRequestDelete={(id) => setRemoveId(id)}
                />
              </li>
            ))}
          </ul>
        ) : (
          <div className="activity-empty text-center py-8">
            <span className="text-3xl text-[#9990c4] block mb-2" aria-hidden="true">✧</span>
            <h3 className="text-base font-semibold text-[#010120] mb-1">
              Na razie bez zdarzeń.
            </h3>
            <p className="text-xs text-[#727279] leading-relaxed">
              Gdy pojawi się trudniejszy moment, zapisz go tutaj.
              <br />
              To punkt wyjścia do rozmowy, nie do osądzania.
            </p>
          </div>
        )}
      </section>

      <p className="privacy-caption text-[10px] text-[#727279] flex items-center gap-2">
        Wersja lokalna — historia nie jest udostępniana innym osobom.
      </p>

      <IncidentFormModal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSaved={(msg) => setMessage(msg)}
      />

      <DeleteIncidentModal
        incidentId={removeId}
        onClose={() => setRemoveId(null)}
        onConfirm={(id) => updateIncidents(incidents.filter((item) => item.id !== id))}
      />

      <PhotoLightboxModal
        photo={photoView}
        onClose={() => setPhotoView(null)}
      />
    </section>
  );
}

export default IncidentsPage;
