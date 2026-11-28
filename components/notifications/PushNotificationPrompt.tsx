"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Bell, X, Check } from "lucide-react";
import { toast } from "react-toastify";

interface PushNotificationPromptProps {
  enabled?: boolean;
  vapidPublicKey: string;
}

const DISMISS_STORAGE_KEY = "actumoto_push_dismissed_at";
const DISMISS_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000; // 7 jours

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const outputArray = new Uint8Array(buffer);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function PushNotificationPrompt({
  enabled = true,
  vapidPublicKey,
}: PushNotificationPromptProps) {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [retryHint, setRetryHint] = useState<string | null>(null);
  const isRequestingRef = useRef(false);
  const swRegRef = useRef<ServiceWorkerRegistration | null>(null);

  const isExcludedRoute =
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/connexion") ||
    pathname?.startsWith("/inscription") ||
    pathname?.startsWith("/verify");

  useEffect(() => {
    if (!enabled || !vapidPublicKey || isExcludedRoute) return;
    if (typeof window === "undefined") return;
    if (
      !("serviceWorker" in navigator) ||
      !("PushManager" in window) ||
      !("Notification" in window)
    ) {
      return;
    }

    let cancelled = false;

    const ensureServiceWorkerAndSync = async () => {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js");
        swRegRef.current = reg;

        // Si l'utilisateur a déjà accordé la permission, on s'assure qu'il est bien abonné en base
        if (Notification.permission === "granted") {
          const readyReg = await navigator.serviceWorker.ready;
          let sub = await readyReg.pushManager.getSubscription();
          if (!sub) {
            sub = await readyReg.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
            });
          }
          const json = sub.toJSON();
          await fetch("/api/push/subscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              endpoint: sub.endpoint,
              keys: json.keys,
            }),
          }).catch(() => {});
        }
      } catch {
        // Silencieux en cas de restriction navigateur
      }
    };

    ensureServiceWorkerAndSync();

    if (Notification.permission === "granted" || Notification.permission === "denied") {
      return;
    }

    const dismissedAt = localStorage.getItem(DISMISS_STORAGE_KEY);
    if (dismissedAt && Date.now() - Number(dismissedAt) < DISMISS_COOLDOWN_MS) {
      return;
    }

    const timer = setTimeout(() => {
      if (cancelled) return;
      // Vérifie une dernière fois avant d'afficher
      if (Notification.permission !== "default") return;
      setVisible(true);
      requestAnimationFrame(() => {
        setTimeout(() => {
          if (!cancelled) setAnimateIn(true);
        }, 40);
      });
    }, 3000);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [enabled, vapidPublicKey, isExcludedRoute]);

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_STORAGE_KEY, String(Date.now()));
    setAnimateIn(false);
    setTimeout(() => setVisible(false), 350);
  };

  const handleAccept = async () => {
    if (isRequestingRef.current) return;
    isRequestingRef.current = true;
    setRetryHint(null);

    try {
      // Appel direct dans le geste utilisateur sans modifier/désactiver le bouton avant réponse
      const permission = await Notification.requestPermission();

      if (permission === "default") {
        // La fenêtre navigateur s'est fermée sans choix définitif -> ne pas masquer pour 7 jours !
        setRetryHint(
          "Cliquez sur « Autoriser » en haut de votre navigateur (icône 🔔 ou 🔒) si la fenêtre s'est réduite, puis réessayez."
        );
        isRequestingRef.current = false;
        return;
      }

      if (permission === "denied") {
        toast.info(
          "Notifications bloquées par votre navigateur. Vous pouvez les autoriser depuis l'icône 🔒 dans la barre d'adresse."
        );
        setAnimateIn(false);
        setTimeout(() => setVisible(false), 350);
        isRequestingRef.current = false;
        return;
      }

      // permission === "granted"
      setSubscribing(true);

      const registration =
        swRegRef.current || (await navigator.serviceWorker.register("/sw.js"));
      const readyReg = await navigator.serviceWorker.ready;

      let subscription = await readyReg.pushManager.getSubscription();
      if (!subscription) {
        subscription = await readyReg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        });
      }

      const subJson = subscription.toJSON();
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          keys: subJson.keys,
        }),
      });

      if (!res.ok) {
        throw new Error("Erreur d'enregistrement serveur");
      }

      toast.success(
        "Alertes activées ! Vous recevrez nos nouveautés et promos en direct."
      );
      if (readyReg.showNotification) {
        readyReg
          .showNotification("actumoto.tn — Alertes activées !", {
            body: "Vous serez informé en avant-première des nouveaux modèles et baisses de prix.",
            icon: "/img/icon-192x192.png",
            badge: "/img/favicon-32x32.png",
            tag: "actumoto-welcome",
          })
          .catch(() => {});
      }

      setAnimateIn(false);
      setTimeout(() => setVisible(false), 350);
    } catch (error) {
      console.error("Push subscription failed:", error);
      toast.error("Impossible d'activer les notifications sur ce navigateur.");
      setSubscribing(false);
      isRequestingRef.current = false;
    }
  };

  if (!visible || isExcludedRoute) return null;

  return (
    <div
      role="dialog"
      aria-label="Activer les notifications actumoto.tn"
      className={`fixed bottom-4 left-4 right-4 sm:right-auto sm:left-6 sm:bottom-6 sm:w-[390px] z-[9990] transition-all duration-500 ease-out ${
        animateIn
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 translate-y-6 scale-95 pointer-events-none"
      }`}
    >
      <div className="relative rounded-2xl bg-[#0e1017]/95 backdrop-blur-xl border border-white/15 shadow-[0_24px_60px_rgba(0,0,0,0.85),0_0_30px_rgba(220,38,38,0.22)] overflow-hidden text-white">
        {/* Liseré lumineux supérieur dégradé rouge -> ambre */}
        <div className="h-1 w-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-500" />

        {/* Bouton fermer discret */}
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Fermer l'alerte de notifications"
          className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        <div className="p-4 sm:p-5">
          {/* En-tête icône animée + titre (sans badge "Alertes en direct") */}
          <div className="flex items-center gap-3.5 pr-6">
            <div className="relative shrink-0">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600/25 to-red-900/40 border border-red-500/40 flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.35)]">
                <Bell className="w-6 h-6 text-red-400 actumoto-bell-ring" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border border-[#0e1017]" />
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-sm sm:text-[15px] text-white leading-snug">
                Ne ratez aucun arrivage ni promo moto !
              </h4>
            </div>
          </div>

          <p className="text-xs text-gray-300/90 leading-relaxed mt-2.5">
            Recevez nos notifications instantanées sur les nouveaux modèles, baisses de prix et offres exclusives en Tunisie.
          </p>

          {retryHint && (
            <div className="mt-2.5 p-2.5 rounded-lg bg-amber-500/15 border border-amber-500/35 text-[11px] text-amber-200 leading-snug">
              {retryHint}
            </div>
          )}

          {/* Boutons d'action */}
          <div className="flex items-center gap-2.5 mt-4">
            <button
              type="button"
              onClick={handleAccept}
              className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs sm:text-[13px] font-bold shadow-[0_6px_20px_rgba(220,38,38,0.4)] hover:shadow-[0_8px_24px_rgba(220,38,38,0.6)] transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {subscribing ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Activation...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  {retryHint ? "Réessayer" : "Activer les alertes"}
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDismiss}
              className="py-2.5 px-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Plus tard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
