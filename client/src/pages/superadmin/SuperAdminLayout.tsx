import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import {
  LayoutDashboard,
  ShieldCheck,
  GraduationCap,
  Users,
  LogOut,
} from "lucide-react";

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [location, navigate] = useLocation();
  const { logout } = useAuth();

  const links = [
    {
      href: "/superadmin/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    { href: "/superadmin/admins", label: "Manage Admins", icon: ShieldCheck },
    {
      href: "/superadmin/professors",
      label: "Manage Professors",
      icon: GraduationCap,
    },
    { href: "/superadmin/students", label: "Manage Students", icon: Users },
  ];

  async function handleLogout() {
    try {
      await logout(); // clears Supabase session + context
      navigate("/superadmin/login"); // redirect to login page
    } catch (err) {
      console.error("Logout failed:", err);
    }
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-900 text-gray-900 dark:text-white flex flex-col shadow-lg">
        {/* Header */}
        <div className="p-6 font-bold text-lg border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900 z-10">
          SuperAdmin
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-2">
          {links.map(({ href, label, icon: Icon }) => {
            const active = location === href;
            return (
              <Link key={href} href={href}>
                <div
                  className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-colors ${
                    active
                      ? "bg-gray-200 dark:bg-gray-800 font-semibold border-l-4 border-blue-500"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-900">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gray-50 dark:bg-gray-950 overflow-y-auto p-6 transition-colors">
        {children}
      </main>
    </div>
  );
}
