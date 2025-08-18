import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import supabase from "@/lib/supabase";

export default function SuperAdminRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [, navigate] = useLocation();

  useEffect(() => {
    async function checkRole() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/superadmin/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role === "superadmin") {
        setAllowed(true);
      } else {
        navigate("/superadmin/login");
      }
    }

    checkRole();
  }, [navigate]);

  if (allowed === null) {
    return <p className="text-center mt-10">Checking permissions...</p>;
  }

  return <>{allowed && children}</>;
}
