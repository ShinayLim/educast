import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import SuperAdminLayout from "./SuperAdminLayout";
import supabase from "@/lib/supabase";

async function fetchProfessors() {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, created_at")
    .eq("role", "professor")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export default function ProfessorsPage() {
  const { data: professors, isLoading } = useQuery({
    queryKey: ["professors"],
    queryFn: fetchProfessors,
  });

  return (
    <SuperAdminLayout>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Registered Professors</h1>

        <Card className="p-4">
          {isLoading ? (
            <p>Loading professors...</p>
          ) : professors?.length ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Date Registered</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {professors.map((prof) => (
                  <tr key={prof.id} className="border-b">
                    <td className="px-4 py-2">{prof.full_name}</td>
                    <td className="px-4 py-2">{prof.email}</td>
                    <td className="px-4 py-2">
                      {new Date(prof.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2">
                      <Link href={`/superadmin/professors/${prof.id}`}>
                        <Button variant="outline" size="sm">
                          View Profile
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500">No professors found.</p>
          )}
        </Card>
      </div>
    </SuperAdminLayout>
  );
}
