import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="auth-wrapper">
      <div className="auth-card">
        <div className="brand">
          <span className="brand-mark">MD</span>
          <div>
            <h1>Marketplace Daily</h1>
            <p>O que preciso fazer hoje, em qual ordem e por quê.</p>
          </div>
        </div>
        {children}
      </div>
    </main>
  );
}