import React, { useEffect, useRef } from 'react';
import Icon from './Icon';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  eyebrow?: string;
  children: React.ReactNode;
  className?: string;
  maxWidth?: string;
  ariaLabel?: string;
  hideCloseButton?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  eyebrow,
  children,
  className = '',
  maxWidth = 'max-w-[460px]',
  ariaLabel,
  hideCloseButton = false
}: ModalProps) {
  const modalRef = useRef<HTMLElement>(null);
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);
  const titleId = React.useId();

  useEffect(() => {
    if (!isOpen) return;

    previouslyFocusedElementRef.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus first focusable element inside modal
    const focusableSelectors =
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const timer = setTimeout(() => {
      if (!modalRef.current) return;
      const autoFocusElement = modalRef.current.querySelector<HTMLElement>('[autofocus]');
      if (autoFocusElement) {
        autoFocusElement.focus();
      } else {
        const firstFocusable = modalRef.current.querySelector<HTMLElement>(focusableSelectors);
        firstFocusable?.focus();
      }
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusable = Array.from(
          modalRef.current.querySelectorAll<HTMLElement>(focusableSelectors)
        ).filter((el) => el.offsetParent !== null);

        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first || !modalRef.current.contains(document.activeElement)) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last || !modalRef.current.contains(document.activeElement)) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(timer);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      // Restore focus to trigger element
      if (previouslyFocusedElementRef.current && typeof previouslyFocusedElementRef.current.focus === 'function') {
        previouslyFocusedElementRef.current.focus();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#01012070] backdrop-blur-[5px]"
      onClick={onClose}
    >
      <section
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={!title ? (ariaLabel || 'Okno dialogowe') : undefined}
        className={`modal bg-white relative w-full ${maxWidth} rounded-[5px] p-8 sm:p-10 shadow-xl ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {!hideCloseButton && (
          <button
            type="button"
            className="modal-close absolute top-4 right-4 p-2 text-xl leading-none text-[#727279] hover:text-[#010120] cursor-pointer"
            onClick={onClose}
            aria-label="Zamknij okno dialogowe"
          >
            <Icon name="close" size={18} />
          </button>
        )}

        {eyebrow && (
          <span className="eyebrow muted block mb-2">{eyebrow}</span>
        )}

        {title && (
          <h2 id={titleId} className="text-2xl font-semibold tracking-tight text-[#010120] mb-4">
            {title}
          </h2>
        )}

        {children}
      </section>
    </div>
  );
}

export default Modal;
