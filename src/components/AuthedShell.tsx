import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, useRole } from "@/hooks/useAuth";
import { AppShell } from "@/components/AppShell";

export function AuthedShell({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const role = useRole(user?.id);
  const [name, setName] = useState("");

  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => setName(data?.full_name || user.email || ""));
  }, [user?.id, user?.email]);

  return (
    <AppShell role={role} displayName={name || user?.email || "?"}>
      {children}
    </AppShell>
  );
}
