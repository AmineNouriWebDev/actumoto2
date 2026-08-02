"use client";

import { ReactNode, useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

interface ConfirmFormProps {
  action: string | ((formData: FormData) => void | Promise<void>);
  confirmMessage?: string;
  children: ReactNode;
  style?: React.CSSProperties;
  className?: string;
  onBeforeSubmit?: () => boolean;
}

export default function ConfirmForm({ action, confirmMessage, children, style, className, onBeforeSubmit }: ConfirmFormProps) {
  const [showModal, setShowModal] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  
  // Ref to track if we're programmatically submitting
  const isConfirmingRef = useRef(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <>
      <form
        ref={formRef}
        action={action}
        style={style}
        className={className}
        onSubmit={(e) => {
          if (onBeforeSubmit && !isConfirmingRef.current) {
            if (!onBeforeSubmit()) {
              e.preventDefault();
              return;
            }
          }
          if (confirmMessage && !isConfirmingRef.current) {
            e.preventDefault();
            setShowModal(true);
          }
        }}
      >
        {children}
      </form>

      {isMounted && showModal && createPortal(
        <div className="custom-modal-overlay">
          <div className="custom-modal">
            <div className="custom-modal-icon">⚠️</div>
            <h3 className="custom-modal-title">Confirmation requise</h3>
            <p className="custom-modal-text">{confirmMessage}</p>
            <div className="custom-modal-actions">
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={() => setShowModal(false)}
              >
                Annuler
              </button>
              <button 
                type="button" 
                className="btn-danger" 
                onClick={() => {
                  setShowModal(false);
                  isConfirmingRef.current = true;
                  setTimeout(() => {
                    formRef.current?.requestSubmit();
                    isConfirmingRef.current = false;
                  }, 10);
                }}
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
