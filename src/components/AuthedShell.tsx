import type { ReactNode } from "react";
import { AppShell } from "@/components/AppShell";

// লগইন ছাড়াই সম্পূর্ণ অ্যাপ — সব ফিচার খোলা।
export function AuthedShell({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
