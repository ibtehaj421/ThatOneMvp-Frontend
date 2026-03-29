"use client";

import { ReactNode } from "react";
import { LocaleProvider } from "./providers/LocaleProvider";
import { AuthProvider } from "./providers/AuthProvider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <LocaleProvider>
      <AuthProvider>{children}</AuthProvider>
    </LocaleProvider>
  );
}
