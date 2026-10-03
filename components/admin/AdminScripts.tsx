"use client";

import { useEffect } from "react";

export default function AdminScripts() {
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement;
      if (
        document.activeElement === target &&
        target.tagName === "INPUT" &&
        (target as HTMLInputElement).type === "number"
      ) {
        target.blur();
      }
    };

    // Use passive: false so we could preventDefault if we wanted, 
    // but blurring is enough to stop the increment.
    window.addEventListener("wheel", handleWheel, { passive: true });

    return () => {
      window.removeEventListener("wheel", handleWheel);
    };
  }, []);

  return null;
}
