"use client";

import { useEffect, useState } from "react";
import { getBackendHealth } from "@/shared/api/client";

type ConnectionState = "checking" | "connected" | "unavailable";

export function BackendStatus() {
  const [state, setState] = useState<ConnectionState>("checking");

  useEffect(() => {
    const controller = new AbortController();

    getBackendHealth(controller.signal)
      .then((health) => setState(health.status === "UP" ? "connected" : "unavailable"))
      .catch(() => {
        if (!controller.signal.aborted) setState("unavailable");
      });

    return () => controller.abort();
  }, []);

  const label = {
    checking: "Connecting to PawCare services…",
    connected: "PawCare services online",
    unavailable: "PawCare services unavailable",
  }[state];

  return (
    <span className={`backend-status backend-status--${state}`} role="status">
      <i aria-hidden="true" />
      {label}
    </span>
  );
}
