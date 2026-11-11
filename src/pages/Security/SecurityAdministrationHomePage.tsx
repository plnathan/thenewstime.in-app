/** Security module landing page. Module visibility follows the same RBAC rules as the sidebar. */
import { ArrowRight, Settings2, ShieldCheck, Users, Wrench } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import MainLayout from "@/layouts/MainLayout";

const modules = [
    { title: "Users", description: "Manage user accounts and access.", to: "/admin/security/users", permission: "users.read", icon: Users },
    { title: "Roles", description: "Manage security roles and assignments.", to: "/admin/security/roles", permission: "roles.read", icon: ShieldCheck },
    { title: "Permissions", description: "Review and configure system permissions.", to: "/admin/security/permissions", permission: "permissions.read", icon: Settings2 },
    { title: "System Maintenance", description: "Control planned website downtime.", to: "/admin/security/maintenance", permission: "permissions.read", icon: Wrench },
] as const;

export default function SecurityAdministrationHomePage() {
    const { hasPermissionCode } = useAuth();
    const available = modules.filter(item => hasPermissionCode(item.permission));

    return (
        <MainLayout>
            <main className="min-h-screen bg-gray-50">
                <div className="mx-auto w-full max-w-[1600px] space-y-6 px-4 py-6 sm:px-6 lg:px-8">
                    <header className="admin-unified-header rounded-2xl bg-[#008236] p-6 shadow-sm sm:p-8">
                        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Security Administration</h1>
                        <p className="mt-2 text-sm leading-6 text-white/90">Manage user accounts, roles and permissions.</p>
                    </header>
                    <section aria-label="Security modules" className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                        {available.map(item => {
                            const Icon = item.icon;
                            return (
                                <Link key={item.to} to={item.to} className="group flex min-h-48 flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-green-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2">
                                    <div className="flex items-start justify-between">
                                        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-700"><Icon size={22} aria-hidden="true" /></span>
                                        <ArrowRight size={18} className="text-gray-400 transition group-hover:translate-x-1 group-hover:text-green-700" aria-hidden="true" />
                                    </div>
                                    <h2 className="mt-4 text-base font-semibold text-gray-900">{item.title}</h2>
                                    <p className="mt-2 flex-1 text-sm leading-6 text-gray-600">{item.description}</p>
                                    <span className="mt-4 text-sm font-semibold text-green-700">Open {item.title}</span>
                                </Link>
                            );
                        })}
                    </section>
                    {available.length === 0 && <p className="text-sm text-gray-600">You do not have permission to access security modules.</p>}
                </div>
            </main>
        </MainLayout>
    );
}
