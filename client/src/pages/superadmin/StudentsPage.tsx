import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import SuperAdminLayout from "./SuperAdminLayout";
import supabase from "@/lib/supabase";

async function fetchStudents() {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, created_at")
    .eq("role", "student")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export default function StudentsPage() {
  const { data: students, isLoading } = useQuery({
    queryKey: ["students"],
    queryFn: fetchStudents,
  });

  return (
    <SuperAdminLayout>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Registered Students</h1>

        <Card className="p-4">
          {isLoading ? (
            <p>Loading students...</p>
          ) : students?.length ? (
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
                {students.map((student) => (
                  <tr key={student.id} className="border-b">
                    <td className="px-4 py-2">{student.full_name}</td>
                    <td className="px-4 py-2">{student.email}</td>
                    <td className="px-4 py-2">
                      {new Date(student.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2">
                      <Link href={`/superadmin/students/${student.id}`}>
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
            <p className="text-gray-500">No students found.</p>
          )}
        </Card>
      </div>
    </SuperAdminLayout>
  );
}
