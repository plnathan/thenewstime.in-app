import { ArrowRight, FileText, FolderCog, PlusCircle } from "lucide-react";
import { Link } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";

const sections = [
    { title: "News Management", description: "Search, review, edit, publish and manage news articles.", path: "/admin/news/list", icon: FileText },
    { title: "Create News", description: "Create a new draft news article.", path: "/admin/news/create", icon: PlusCircle },
    { title: "News Category Configuration", description: "Review news categories and their codes.", path: "/admin/news/categories", icon: FolderCog },
] as const;

export default function NewsAdministrationHomePage() {
    return (
        <MainLayout>
            <div className="mx-auto w-full max-w-7xl px-4 py-8 lg:px-6">
                <header className="admin-unified-header overflow-hidden rounded-2xl bg-green-800 shadow-sm">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="max-w-3xl">
                            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                                News Administration
                            </h1>
                            <p className="mt-1 max-w-2xl text-sm leading-5 text-green-50">
                                Manage news publishing and category configuration.
                            </p>
                        </div>
                        <Link
                            to="/admin/news/create"
                            className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-white px-4 py-2 text-sm font-semibold text-green-800 shadow-sm transition hover:bg-green-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-green-800"
                        >
                            <PlusCircle size={18} aria-hidden="true" />
                            Create News
                        </Link>
                    </div>
                </header>
                <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {sections.map(({ title, description, path, icon: Icon }) => (
                        <Link key={path} to={path} className="group flex min-h-48 flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-green-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600">
                            <div className="flex items-start justify-between"><span className="rounded-xl bg-green-50 p-3 text-green-700"><Icon size={22} /></span><ArrowRight size={19} className="text-gray-400 group-hover:text-green-700" /></div>
                            <h2 className="mt-5 font-semibold text-gray-900">{title}</h2><p className="mt-2 text-sm text-gray-600">{description}</p>
                        </Link>
                    ))}
                </div>
            </div>
        </MainLayout>
    );
}
