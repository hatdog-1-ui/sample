"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { UserRole } from "@/lib/database.types";

interface AuthGuardProps {
  children: React.ReactNode;
}

interface UserContext {
  userId: string;
  email: string;
  role: UserRole;
}

export const UserContext = {
  current: null as UserContext | null,
};

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      const p = profile as { role: UserRole } | null;
      UserContext.current = {
        userId: session.user.id,
        email: session.user.email!,
        role: p?.role ?? "viewer",
      };

      setAuthenticated(true);
      setLoading(false);
    };

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        UserContext.current = null;
        router.push("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!authenticated) return null;

  return <>{children}</>;
}
