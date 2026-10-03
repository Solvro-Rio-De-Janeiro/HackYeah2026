import React from 'react';
import { Incident } from '../../types';

interface IncidentRowProps {
  incident: Incident;
  onViewPhoto: (photo: string) => void;
  onRequestDelete: (id: string) => void;
}

export function IncidentRow({ incident, onViewPhoto, onRequestDelete }: IncidentRowProps) {
  const formattedDate = new Date(incident.date).toLocaleString('pl-PL', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  return (
    <div className="incident-row flex gap-3.5 items-start py-5 border-b border-[#ebebeb] last:border-0">
      <span
        className="incident-symbol w-7 h-7 rounded-full grid place-items-center bg-[#f8e7dc] text-[#835947] text-sm font-bold flex-shrink-0 mt-0.5"
        aria-hidden="true"
      >
        !
      </span>

      <div className="flex flex-col gap-1.5 min-w-0 flex-1">
        <strong className="text-xs font-semibold text-[#010120]">
          {incident.person}
        </strong>

        <span className="incident-label text-[11px] text-[#7e644f] font-medium">
          Zgłoszone palenie
        </span>

        {incident.note && (
          <p className="text-xs leading-relaxed text-[#727279] m-0 [overflow-wrap:anywhere]">
            {incident.note}
          </p>
        )}

        {incident.photo && (
          <button
            type="button"
            className="evidence-thumb flex flex-col w-full max-w-[190px] border border-[#ebebeb] rounded bg-[#faf9fd] p-0 overflow-hidden my-1.5 text-left cursor-pointer hover:border-[#9e94c5] transition-colors focus-visible:outline-2 focus-visible:outline-[#7472d5]"
            onClick={() => onViewPhoto(incident.photo!)}
            aria-label={`Powiększ zdjęcie dołączone do zgłoszenia dla ${incident.person}`}
          >
            <img
              src={incident.photo}
              alt={`Zdjęcie potwierdzające palenie dla ${incident.person}`}
              className="w-full h-[105px] object-cover"
            />
            <span className="p-2 text-[10px] text-[#635b86]">
              <span aria-hidden="true">▧</span> Zdjęcie zgłoszenia ↗
            </span>
          </button>
        )}

        <time dateTime={incident.date} className="text-[10px] font-mono text-[#727279]">
          {formattedDate}
        </time>
      </div>

      <button
        type="button"
        className="plain-action ml-auto min-h-[44px] min-w-[44px] flex items-center justify-end text-xs text-[#727279] hover:text-[#a12d3d] hover:underline cursor-pointer border-0 bg-transparent p-2"
        onClick={() => onRequestDelete(incident.id)}
        aria-label={`Usuń zdarzenie z dnia ${formattedDate} dla ${incident.person}`}
      >
        Usuń
      </button>
    </div>
  );
}

export default IncidentRow;
