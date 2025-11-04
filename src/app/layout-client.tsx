"use client";

import FloatingAssistant from "@/components/FloatingAssistant";

export function RootLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <FloatingAssistant />
    </>
  );
}
