import type { ReactNode } from "react";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return <div className="min-h-screen bg-[#F4F7FB]">{children}</div>;
}
