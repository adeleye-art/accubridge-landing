import { StaffLayout } from "@/components/layout/staff-layout";

export default function StaffDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StaffLayout>{children}</StaffLayout>;
}
