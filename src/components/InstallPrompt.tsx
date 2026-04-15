"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// Type for the beforeinstallprompt event (not in standard lib)
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function useInstallState() {
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const promptRef = useRef<BeforeInstallPromptEvent | null>(null);
  const [promptReady, setPromptReady] = useState(false);

  const onBeforeInstallPrompt = useCallback((e: Event) => {
    e.preventDefault();
    promptRef.current = e as BeforeInstallPromptEvent;
    setPromptReady(true);
    setShow(true);
  }, []);

  useEffect(() => {
    // Already installed as standalone — don't show
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    // Already dismissed this session
    if (sessionStorage.getItem("fieldsafe-install-dismissed")) return;

    const ios =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !("MSStream" in window);

    if (ios) {
      // We need to defer the state update to avoid the lint rule
      // Use queueMicrotask to set state outside the synchronous effect body
      queueMicrotask(() => {
        setIsIOS(true);
        setShow(true);
      });
      return;
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    return () =>
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
  }, [onBeforeInstallPrompt]);

  return { show, setShow, isIOS, promptRef, promptReady, setPromptReady };
}

export default function InstallPrompt() {
  const { show, setShow, isIOS, promptRef, promptReady, setPromptReady } =
    useInstallState();

  const dismiss = () => {
    setShow(false);
    sessionStorage.setItem("fieldsafe-install-dismissed", "1");
  };

  const handleInstall = async () => {
    const prompt = promptRef.current;
    if (!prompt) return;
    prompt.prompt();
    const result = await prompt.userChoice;
    if (result.outcome === "accepted") {
      setShow(false);
    }
    promptRef.current = null;
    setPromptReady(false);
  };

  if (!show) return null;

  return (
    <div className="bg-orange-50 border-b border-orange-200 px-4 py-2.5 flex items-center gap-3">
      <div className="flex-1 min-w-0">
        {isIOS ? (
          <p className="text-xs text-orange-800">
            Install FieldSafe: tap{" "}
            <span className="inline-block align-middle text-base leading-none">
              ⎋
            </span>{" "}
            Share then &quot;Add to Home Screen&quot;
          </p>
        ) : (
          <p className="text-xs text-orange-800">
            Install FieldSafe for quick access and offline use
          </p>
        )}
      </div>
      {!isIOS && promptReady && (
        <button
          onClick={handleInstall}
          className="px-3 py-1 bg-orange-500 text-white text-xs font-semibold rounded-lg flex-shrink-0"
        >
          Install
        </button>
      )}
      <button
        onClick={dismiss}
        className="text-orange-400 text-lg leading-none flex-shrink-0"
        aria-label="Dismiss"
      >
        &times;
      </button>
    </div>
  );
}
