import type { ReactNode } from "react";

import { Brand } from "@/components/shared/brand";

interface AuthShellProps {
  children: ReactNode;
}

export function AuthShell({ children }: AuthShellProps) {
  return (
    <main className="auth-page">
      <div className="auth-shell">
        <Brand />
        {children}
      </div>
    </main>
  );
}
