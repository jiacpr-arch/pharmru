"use client";

import { SessionProvider } from "next-auth/react";
import Navbar from "./Navbar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <Navbar />
        <main style={{ flex: 1, padding: "24px", overflowY: "auto" }}>
          {children}
        </main>
      </div>
    </SessionProvider>
  );
}
