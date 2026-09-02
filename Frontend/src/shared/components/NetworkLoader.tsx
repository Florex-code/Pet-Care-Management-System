"use client";

import { PawPrint } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

export const NETWORK_ACTIVITY_EVENT = "pawcare:network-activity";

export function NetworkLoader() {
  const [pending, setPending] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const update = (event: Event) => {
      setPending((event as CustomEvent<{ pending: number }>).detail.pending);
    };
    window.addEventListener(NETWORK_ACTIVITY_EVENT, update);
    return () => window.removeEventListener(NETWORK_ACTIVITY_EVENT, update);
  }, []);

  useEffect(() => {
    if (!pending) {
      setVisible(false);
      return;
    }
    const timer = window.setTimeout(() => setVisible(true), 180);
    return () => window.clearTimeout(timer);
  }, [pending]);

  if (!visible || !pending) return null;
  return (
    <div className="network-loader" role="status" aria-live="polite">
      <span className="network-loader__mark" aria-hidden="true">
        <span className="network-loader__ring" />
        <PawPrint weight="fill" />
      </span>
      <span><strong>Just a moment</strong><small>PawCare is working…</small></span>
    </div>
  );
}

export function InlineLoader() {
  return <span className="inline-loader" aria-hidden="true" />;
}
