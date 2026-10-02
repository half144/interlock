import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/inter";
import "@fontsource/libre-baskerville/400.css";
import "@fontsource/libre-baskerville/700.css";
import "@fontsource-variable/geist-mono";
import "./index.css";
import { App } from "@/app/App";
import { macChrome } from "@/platform/desktop";

if (macChrome) document.documentElement.dataset["chrome"] = "mac";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
