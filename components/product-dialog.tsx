"use client";

import Link from "next/link";
import { useId, type ReactNode } from "react";
import { useProductDialog } from "@/animations/use-product-dialog";
import styles from "./product-dialog.module.css";

export default function ProductDialog({
  href, title, trigger, triggerClassName, image, children,
}: {
  href: string;
  title: string;
  trigger: ReactNode;
  triggerClassName: string;
  image: ReactNode;
  children: ReactNode;
}) {
  const dialogId = useId();
  const {
    dialogRef, sheetRef, backdropRef, openerRef, closeButtonRef, imageRef, movingImageRef,
    isOpen, open, close, onClosed, onOutsidePointerDown, onOutsideClick, onKeyDown,
  } = useProductDialog();

  return <>
    <Link
      ref={openerRef}
      href={href}
      prefetch={false}
      className={`${triggerClassName} ${styles.trigger}`}
      aria-haspopup="dialog"
      aria-expanded={isOpen}
      aria-controls={dialogId}
      onNavigate={(event) => { event.preventDefault(); open(); }}
      onBlur={(event) => { delete event.currentTarget.dataset.dialogReturnFocus; }}
      onKeyDown={(event) => { delete event.currentTarget.dataset.dialogReturnFocus; }}
    >
      {trigger}
    </Link>
    <dialog
      ref={dialogRef}
      id={dialogId}
      className={styles.dialog}
      aria-label={title}
      data-lenis-prevent
      onCancel={(event) => { event.preventDefault(); close(); }}
      onClose={onClosed}
      onKeyDown={onKeyDown}
      onPointerDown={(event) => onOutsidePointerDown(event.target)}
      onClick={(event) => onOutsideClick(event.target)}
    >
      <div ref={backdropRef} className={styles.backdrop} aria-hidden="true" />
      <div ref={sheetRef} className={styles.sheet}>
        <div className={styles.content} data-product-scroll>{children}</div>
        <div className={styles.visual} data-product-visual>
          <div ref={imageRef} className={styles.image}>{image}</div>
        </div>
        <button ref={closeButtonRef} type="button" className={styles.close} onClick={close} aria-label={`Fermer la fiche de ${title}`}>
          Fermer <span aria-hidden="true">×</span>
        </button>
      </div>
      <div ref={movingImageRef} className={styles.movingImage} aria-hidden="true" />
    </dialog>
  </>;
}
