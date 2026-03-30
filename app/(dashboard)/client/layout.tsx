import { ClientLayout } from "@/components/layout/client-layout";

export default function ClientDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientLayout>{children}</ClientLayout>;
}
