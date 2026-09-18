import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { getRouter } from "./router";
import { useFinanceStore } from "./lib/store";
import "./styles.css";

// Rehydrate Zustand from localStorage, then mark ready
useFinanceStore.persist.rehydrate().then(() => {
  useFinanceStore.getState().setHydrated();
});

const router = getRouter();

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
