import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import supabase from "@/lib/supabase";
import SuperAdminLayout from "./SuperAdminLayout";

async function fetchAdmins() {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "admin");

  if (error) throw error;
  return data || [];
}

async function updateAdminStatus(id: string, status: "active" | "rejected") {
  const { error } = await supabase
    .from("profiles")
    .update({ status })
    .eq("id", id);

  if (error) throw error;
  return { id, status };
}

export default function AdminsPage() {
  const queryClient = useQueryClient();

  const { data: admins, isLoading } = useQuery({
    queryKey: ["admins"],
    queryFn: fetchAdmins,
  });

  const mutation = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: "active" | "rejected";
    }) => updateAdminStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
    },
  });

  return (
    <SuperAdminLayout>
      <div className="space-y-6 p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Manage Admins
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Approve or reject admin accounts
        </p>

        <Card className="shadow-md border border-gray-200 dark:border-gray-700 dark:bg-gray-800">
          <CardContent className="p-4">
            {isLoading ? (
              <p className="text-gray-500">Loading...</p>
            ) : admins?.length ? (
              <table className="min-w-full text-left text-gray-700 dark:text-gray-300">
                <thead>
                  <tr>
                    <th className="px-4 py-2">Name</th>
                    <th className="px-4 py-2">Email</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map((admin) => (
                    <tr
                      key={admin.id}
                      className="border-t border-gray-200 dark:border-gray-700"
                    >
                      <td className="px-4 py-2">{admin.full_name}</td>
                      <td className="px-4 py-2">{admin.email}</td>
                      <td className="px-4 py-2 capitalize">{admin.status}</td>
                      <td className="px-4 py-2 flex gap-2">
                        {admin.status === "pending" ? (
                          <>
                            <Button
                              size="sm"
                              onClick={() =>
                                mutation.mutate({
                                  id: admin.id,
                                  status: "active",
                                })
                              }
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() =>
                                mutation.mutate({
                                  id: admin.id,
                                  status: "rejected",
                                })
                              }
                            >
                              Reject
                            </Button>
                          </>
                        ) : admin.status === "active" ? (
                          <span className="text-green-600 font-medium">
                            ✅ Already Approved
                          </span>
                        ) : (
                          <span className="text-red-500 font-medium">
                            ❌ Rejected
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-500">No admins found.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </SuperAdminLayout>
  );
}
