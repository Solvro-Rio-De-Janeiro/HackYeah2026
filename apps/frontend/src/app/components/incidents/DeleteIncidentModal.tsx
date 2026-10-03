import React from 'react';
import Modal from '../common/Modal';

interface DeleteIncidentModalProps {
  incidentId: string | null;
  onClose: () => void;
  onConfirm: (id: string) => void;
}

export function DeleteIncidentModal({
  incidentId,
  onClose,
  onConfirm
}: DeleteIncidentModalProps) {
  if (!incidentId) return null;

  return (
    <Modal
      isOpen={Boolean(incidentId)}
      onClose={onClose}
      title="Usunąć zdarzenie?"
      ariaLabel="Usuń zdarzenie"
    >
      <p className="text-xs leading-relaxed text-[#727279] mb-6">
        Ten zapis zostanie usunięty z lokalnej historii.
      </p>

      <div className="flex flex-col gap-2.5">
        <button
          type="button"
          className="primary w-full bg-[#010120] text-white hover:bg-[#292943] rounded py-3 px-4 font-mono text-xs tracking-wider uppercase flex items-center justify-center cursor-pointer transition-all"
          onClick={() => {
            onConfirm(incidentId);
            onClose();
          }}
        >
          USUŃ ZAPIS
        </button>

        <button
          type="button"
          autoFocus
          className="outline w-full border border-[#ebebeb] bg-white text-[#010120] hover:bg-[#f6f6fa] rounded py-3 px-4 font-mono text-xs tracking-wider uppercase flex items-center justify-center cursor-pointer transition-all"
          onClick={onClose}
        >
          ANULUJ
        </button>
      </div>
    </Modal>
  );
}

export default DeleteIncidentModal;
