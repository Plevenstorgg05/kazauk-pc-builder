"use client";
import { useEffect, useId, useRef, type ReactNode } from "react";
import s from "./Builder.module.css";
export function BuilderDialog({
  title,
  onClose,
  children,
  wide = false,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const id = useId();
  useEffect(() => {
    const previous = document.activeElement;
    const el = dialog.current;
    el?.showModal();
    return () => {
      el?.close();
      if (previous instanceof HTMLElement && previous.isConnected)
        previous.focus();
    };
  }, []);
  return (
    <dialog
      ref={dialog}
      className={`${s.dialog} ${wide ? s.wideDialog : ""}`}
      aria-labelledby={id}
      data-lenis-prevent
      onCancel={onClose}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const r = event.currentTarget.getBoundingClientRect();
        if (
          event.clientX < r.left ||
          event.clientX > r.right ||
          event.clientY < r.top ||
          event.clientY > r.bottom
        )
          onClose();
      }}
    >
      <header className={s.dialogHeader}>
        <h2 id={id}>{title}</h2>
        <button
          type="button"
          onClick={onClose}
          className={s.close}
          aria-label={`Close ${title.toLowerCase()}`}
        >
          ×
        </button>
      </header>
      {children}
    </dialog>
  );
}
