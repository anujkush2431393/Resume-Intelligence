import React from "react";
import { ThemeProvider } from "./components/ThemeProvider";
import Analyzer from "./components/Analyzer";
import { Toaster } from "sonner";

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="resume-ats-theme">
      <Analyzer />
      <Toaster position="bottom-right" richColors theme="system" />
    </ThemeProvider>
  );
}
