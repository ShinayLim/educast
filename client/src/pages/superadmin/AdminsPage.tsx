import SuperAdminLayout from "@/pages/superadmin/SuperAdminLayout";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

export default function AdminsPage() {
  const [admins, setAdmins] = useState([
    { id: 1, name: "Admin One", email: "admin1@example.com" },
    { id: 2, name: "Admin Two", email: "admin2@example.com" },
  ]);

  const handleAddAdmin = () => {
    // Mock adding an admin (later hook to Supabase / DB)
    const newAdmin = {
      id: admins.length + 1,
      name: `New Admin ${admins.length + 1}`,
      email: `new${admins.length + 1}@example.com`,
    };
    setAdmins([...admins, newAdmin]);
  };

  const handleDeleteAdmin = (id: number) => {
    setAdmins(admins.filter((admin) => admin.id !== id));
  };

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Manage Admins
          </h1>
          <Button onClick={handleAddAdmin} className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Admin
          </Button>
        </div>

        {/* Admins List */}
        <div className="grid gap-4">
          {admins.map((admin) => (
            <Card
              key={admin.id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
            >
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {admin.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {admin.email}
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteAdmin(admin.id)}
                  className="flex items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" /> Remove
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </SuperAdminLayout>
  );
}
