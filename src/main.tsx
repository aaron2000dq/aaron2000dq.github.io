import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ExplorationApp } from "./components/ExplorationApp";
import { NearbyRehearsal } from "./components/NearbyRehearsal";
import { fullTestZones } from "./config/fullTestStory";
import "../app/globals.css";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .then((registration) => {
        registration.update().catch(() => undefined);
        document.addEventListener("visibilitychange", () => {
          if (document.visibilityState === "visible") registration.update().catch(() => undefined);
        });
      })
      .catch((error) => {
        console.error("Exploration Atlas offline cache failed to register", error);
      });
  });
}

const params = new URLSearchParams(window.location.search);
const mode = params.get("mode");
const nearbyMode = mode === "nearby";
const fullTestNamespace =
  mode === "fulltest"
    ? `fulltest-${params.get("run")?.replace(/[^a-zA-Z0-9-]/g, "-").slice(0, 32) || "default"}`
    : "formal";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {nearbyMode ? (
      <NearbyRehearsal />
    ) : (
      <ExplorationApp
        storageNamespace={fullTestNamespace}
        storyZones={mode === "fulltest" ? fullTestZones : undefined}
      />
    )}
  </StrictMode>,
);
