import React from 'react';
import Modal from '../common/Modal';

interface PhotoLightboxModalProps {
  photo: string | null;
  onClose: () => void;
}

export function PhotoLightboxModal({ photo, onClose }: PhotoLightboxModalProps) {
  if (!photo) return null;

  return (
    <Modal
      isOpen={Boolean(photo)}
      onClose={onClose}
      eyebrow="ZDJĘCIE ZGŁOSZENIA"
      maxWidth="max-w-[760px]"
      ariaLabel="Zdjęcie zgłoszenia"
    >
      <div className="mt-4 flex items-center justify-center">
        <img
          src={photo}
          alt="Powiększone zdjęcie dołączone do zgłoszenia"
          className="w-full max-h-[70vh] object-contain rounded"
        />
      </div>
    </Modal>
  );
}

export default PhotoLightboxModal;
