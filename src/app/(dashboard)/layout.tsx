import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AppShell from "@/components/AppShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const userName = session?.user?.name ?? undefined;
  const userRole = (session?.user as { role?: string })?.role ?? undefined;

  return (
    <AppShell userName={userName} userRole={userRole}>
      {children}
    </AppShell>
  );
}
