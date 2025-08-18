import { useEffect, useState } from "react";
import supabase from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    async function fetchProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/admin/login"); // not logged in → redirect
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, email, status")
        .eq("id", user.id)
        .single();

      if (error || !data) {
        navigate("/admin/login");
      } else {
        setProfile(data);
      }
    }

    fetchProfile();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        Admin Dashboard
      </h1>

      {profile ? (
        <Card className="shadow-md border dark:border-gray-700 dark:bg-gray-800">
          <CardContent className="p-6 space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              Welcome,{" "}
              <span className="font-semibold">{profile.full_name}</span>
            </p>
            <p className="text-gray-500 dark:text-gray-400">{profile.email}</p>
            <p
              className={`font-medium ${
                profile.status === "active"
                  ? "text-green-500"
                  : "text-yellow-500"
              }`}
            >
              Status: {profile.status}
            </p>

            <Button variant="destructive" onClick={handleLogout}>
              Logout
            </Button>
          </CardContent>
        </Card>
      ) : (
        <p className="text-gray-500 dark:text-gray-400">Loading...</p>
      )}
    </div>
  );
}
