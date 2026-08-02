"use client";

import { useState, useEffect, useRef } from "react";

interface Props {
  imageDesktop: string;
  imageMobile: string;
  link: string | null;
  altText: string;
  durationSeconds: number;
}

export default function WelcomePopupClient({ imageDesktop, imageMobile, link, altText, durationSeconds }: Props) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("actumoto_popup_shown")) return;
    const showTimer = setTimeout(() => {
      setIsVisible(true);
      setTimeout(() => setIsAnimating(true), 50);
      sessionStorage.setItem("actumoto_popup_shown", "true");
    }, 300);

    let closeTimer: NodeJS.Timeout;
    if (durationSeconds > 0) {
      closeTimer = setTimeout(() => handleClose(), (durationSeconds * 1000) + 300);
    }

    return () => {
      clearTimeout(showTimer);
      if (closeTimer) clearTimeout(closeTimer);
    };
  }, []);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => setIsVisible(false), 500);
  };

  if (!isVisible) return null;

  const content = (
    <div
      id="popup-content-scale"
      className={`relative max-w-[95vw] h-[90vh] md:max-w-[90vw] md:h-auto md:max-h-[90vh] flex flex-col items-center justify-center transform transition-transform duration-500 ${isAnimating ? "scale-100" : "scale-95"}`}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={handleClose}
        className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-10 h-10 flex items-center justify-center text-xl font-bold shadow-lg hover:bg-red-700 transition-colors z-10 cursor-pointer border-2 border-white"
        aria-label="Fermer le popup"
      >
        &times;
      </button>
      <picture className="flex justify-center items-center w-full h-full">
        <source media="(min-width: 768px)" srcSet={imageDesktop} />
        <img
          src={imageMobile}
          alt={altText}
          className="w-full h-full md:w-auto md:h-auto md:max-w-full md:max-h-[85vh] object-contain rounded-xl shadow-2xl"
        />
      </picture>
    </div>
  );

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 transition-opacity duration-500 ${isAnimating ? "opacity-100" : "opacity-0"}`}
      onClick={handleClose}
    >
      {link ? (
        <a href={link} className="block flex justify-center items-center w-full h-full">
          {content}
        </a>
      ) : content}
    </div>
  );
}
