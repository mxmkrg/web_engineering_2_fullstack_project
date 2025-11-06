"use client";

import FloatingAssistant from "@/components/FloatingAssistant";
import { Toaster } from "sonner";

export function RootLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <FloatingAssistant />
      <Toaster position="top-right" richColors />
    </>
  );
}
