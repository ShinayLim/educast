import { useQuery } from "@tanstack/react-query";
import SuperAdminLayout from "@/pages/superadmin/SuperAdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Users, GraduationCap, ShieldCheck } from "lucide-react";
import supabase from "@/lib/supabase";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

// Fetch counts
async function fetchCounts() {
  const { count: adminCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "admin")
    .eq("status", "active"); // ✅ only count active admins

  const { count: profCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "professor");

  const { count: studentCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "student");

  return {
    admins: adminCount ?? 0,
    professors: profCount ?? 0,
    students: studentCount ?? 0,
  };
}

// Fetch admins
async function fetchAdmins() {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, created_at, status")
    .eq("role", "admin")
    .eq("status", "active") // <-- only active admins
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

// Fetch professors
async function fetchProfessors() {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, created_at")
    .eq("role", "professor")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

// Fetch students
async function fetchStudents() {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, created_at")
    .eq("role", "student")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export default function SuperAdminDashboard() {
  const { data: counts } = useQuery({
    queryKey: ["superadmin-counts"],
    queryFn: fetchCounts,
  });

  const { data: admins } = useQuery({
    queryKey: ["superadmin-admins"],
    queryFn: fetchAdmins,
  });

  const { data: professors } = useQuery({
    queryKey: ["superadmin-professors"],
    queryFn: fetchProfessors,
  });

  const { data: students } = useQuery({
    queryKey: ["superadmin-students"],
    queryFn: fetchStudents,
  });

  return (
    <SuperAdminLayout>
      <div className="space-y-6 p-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            SuperAdmin Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Overview of platform statistics and registered users
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="shadow-md border dark:border-gray-700 dark:bg-gray-800">
            <CardContent className="p-6 flex items-center gap-4">
              <ShieldCheck className="w-10 h-10 text-indigo-500" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Total Admins (Active Only)
                </p>
                <p className="text-2xl font-bold">{counts?.admins ?? 0}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md border dark:border-gray-700 dark:bg-gray-800">
            <CardContent className="p-6 flex items-center gap-4">
              <GraduationCap className="w-10 h-10 text-purple-500" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Total Professors
                </p>
                <p className="text-2xl font-bold">{counts?.professors ?? 0}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md border dark:border-gray-700 dark:bg-gray-800">
            <CardContent className="p-6 flex items-center gap-4">
              <Users className="w-10 h-10 text-pink-500" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Total Students
                </p>
                <p className="text-2xl font-bold">{counts?.students ?? 0}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Registered Admins */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Registered Admins</h2>
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 overflow-x-auto">
            <table className="min-w-full text-sm text-left">
              <thead>
                <tr className="border-b dark:border-gray-700">
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Joined</th>
                </tr>
              </thead>
              <tbody>
                {admins?.length ? (
                  admins.map((admin) => (
                    <tr
                      key={admin.id}
                      className="border-b dark:border-gray-700"
                    >
                      <td className="px-4 py-2">{admin.full_name}</td>
                      <td className="px-4 py-2">{admin.email}</td>
                      <td className="px-4 py-2 text-green-500 font-medium">
                        Active
                      </td>
                      <td className="px-4 py-2">
                        {new Date(admin.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-2 text-gray-400">
                      No active admins found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Registered Professors */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Registered Professors</h2>
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 overflow-x-auto">
            <table className="min-w-full text-sm text-left">
              <thead>
                <tr className="border-b dark:border-gray-700">
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Joined</th>
                </tr>
              </thead>
              <tbody>
                {professors?.map((prof) => (
                  <tr key={prof.id} className="border-b dark:border-gray-700">
                    <td className="px-4 py-2">{prof.full_name}</td>
                    <td className="px-4 py-2">{prof.email}</td>
                    <td className="px-4 py-2">
                      {new Date(prof.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2">
                      <Link href={`/professor/${prof.id}`}>
                        <Button variant="outline" size="sm">
                          View Profile
                        </Button>
                      </Link>
                    </td>
                  </tr>
                )) || (
                  <tr>
                    <td colSpan={4} className="px-4 py-2 text-gray-400">
                      No professors found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Registered Students */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Registered Students</h2>
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 overflow-x-auto">
            <table className="min-w-full text-sm text-left">
              <thead>
                <tr className="border-b dark:border-gray-700">
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Joined</th>
                </tr>
              </thead>
              <tbody>
                {students?.map((student) => (
                  <tr
                    key={student.id}
                    className="border-b dark:border-gray-700"
                  >
                    <td className="px-4 py-2">{student.full_name}</td>
                    <td className="px-4 py-2">{student.email}</td>
                    <td className="px-4 py-2">
                      {new Date(student.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2">
                      <Link href={`/student/${student.id}`}>
                        <Button variant="outline" size="sm">
                          View Profile
                        </Button>
                      </Link>
                    </td>
                  </tr>
                )) || (
                  <tr>
                    <td colSpan={4} className="px-4 py-2 text-gray-400">
                      No students found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </SuperAdminLayout>
  );
}
