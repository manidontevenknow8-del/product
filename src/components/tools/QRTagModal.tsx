import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import { useMemo, useRef, useState } from 'react';
import type { PetRecord } from '@/services/pets/petTypes';
import { buildPublicTriageUrl } from '@/services/emergencyPassport/emergencyPassportTypes';
import styles from './QRTagModal.module.css';

export type QRTagStyle = 'collar' | 'crate' | 'wallet';

const STYLE_OPTIONS: { id: QRTagStyle; label: string; hint: string }[] = [
  {
    id: 'collar',
    label: 'Collar Tag (Square)',
    hint: 'High-contrast 1″ square for metal or plastic collar tags',
  },
  {
    id: 'crate',
    label: 'Travel Crate Badge (A4/Letter Sheet)',
    hint: 'Full-page printable badge for airline crates and kennels',
  },
  {
    id: 'wallet',
    label: 'Wallet Emergency Card',
    hint: 'Credit-card sized card for sitters and travel wallets',
  },
];

type QRTagModalProps = {
  isOpen: boolean;
  onClose: () => void;
  pet: PetRecord;
  /** Emergency passport public token used as `/p/:publicId`. */
  publicId: string;
};

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

/**
 * Printable high-contrast QR tag generator for collars, crates, and wallet cards.
 */
export function QRTagModal({ isOpen, onClose, pet, publicId }: QRTagModalProps) {
  const [style, setStyle] = useState<QRTagStyle>('collar');
  const printRef = useRef<HTMLDivElement>(null);
  const canvasHolderRef = useRef<HTMLDivElement>(null);

  const triageUrl = useMemo(() => buildPublicTriageUrl(publicId), [publicId]);
  const safeName = pet.name.replace(/[^\w.-]+/g, '_').slice(0, 40) || 'Pet';

  const qrSize = style === 'collar' ? 280 : style === 'wallet' ? 180 : 320;

  if (!isOpen) return null;

  const handleDownloadSvg = () => {
    const svg = printRef.current?.querySelector('svg');
    if (!svg) return;
    const clone = svg.cloneNode(true) as SVGElement;
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    const blob = new Blob(
      [`<?xml version="1.0" encoding="UTF-8"?>\n${clone.outerHTML}`],
      { type: 'image/svg+xml;charset=utf-8' },
    );
    downloadBlob(blob, `${safeName}_QR_${style}.svg`);
  };

  const handleDownloadPng = () => {
    const canvas = canvasHolderRef.current?.querySelector('canvas');
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      downloadBlob(blob, `${safeName}_QR_${style}.png`);
    }, 'image/png');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={styles.overlay} onClick={onClose} role="presentation">
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="qr-tag-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
          ×
        </button>

        <p className={styles.eyebrow}>Printable emergency tags</p>
        <h2 id="qr-tag-title" className={styles.title}>
          QR Tag Generator
        </h2>
        <p className={styles.lead}>
          High-contrast tags for {pet.name} that open the public emergency triage profile - no login
          required for finders or ER staff.
        </p>

        <fieldset className={styles.styles}>
          <legend className={styles.legend}>Tag style</legend>
          {STYLE_OPTIONS.map((option) => (
            <label key={option.id} className={styles.styleOption}>
              <input
                type="radio"
                name="qr-tag-style"
                value={option.id}
                checked={style === option.id}
                onChange={() => setStyle(option.id)}
              />
              <span>
                <strong>{option.label}</strong>
                <em>{option.hint}</em>
              </span>
            </label>
          ))}
        </fieldset>

        <div
          ref={printRef}
          className={`${styles.preview} ${styles[`preview_${style}`]}`}
          data-print-sheet={style}
        >
          <div className={styles.previewInner}>
            <p className={styles.tagKicker}>If found - scan for emergency triage</p>
            <p className={styles.tagPetName}>{pet.name}</p>
            <div className={styles.qrFrame}>
              <QRCodeSVG
                value={triageUrl}
                size={qrSize}
                level="H"
                includeMargin
                bgColor="#ffffff"
                fgColor="#111111"
              />
            </div>
            <p className={styles.tagUrl}>{triageUrl.replace(/^https?:\/\//, '')}</p>
            <p className={styles.tagFoot}>PetClues Concierge · Official Emergency Tag</p>
          </div>
        </div>

        {/* Offscreen canvas for PNG export at higher resolution */}
        <div ref={canvasHolderRef} className={styles.canvasHold} aria-hidden>
          <QRCodeCanvas
            value={triageUrl}
            size={720}
            level="H"
            includeMargin
            bgColor="#ffffff"
            fgColor="#111111"
          />
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.primary} onClick={handleDownloadSvg}>
            Download Print-Ready SVG
          </button>
          <button type="button" className={styles.secondary} onClick={handleDownloadPng}>
            Download PNG
          </button>
          <button type="button" className={styles.secondary} onClick={handlePrint}>
            Print sheet
          </button>
        </div>
      </div>
    </div>
  );
}
