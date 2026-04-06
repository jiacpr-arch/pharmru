import Navbar from "./Navbar";

interface AppShellProps {
  children: React.ReactNode;
  userName?: string;
  userRole?: string;
}

export default function AppShell({ children, userName, userRole }: AppShellProps) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Navbar userName={userName} userRole={userRole} />
      <main style={{ flex: 1, padding: "24px", overflowY: "auto" }}>
        {children}
      </main>
    </div>
  );
}
