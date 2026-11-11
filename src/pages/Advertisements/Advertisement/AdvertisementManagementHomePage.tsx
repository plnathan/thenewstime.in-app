import MainLayout from "@/layouts/MainLayout";

import {
    ArrowRight,
    CircleDollarSign,
    ClipboardList,
    FilePlus2,
    LayoutDashboard,
    Monitor,
    PanelsTopLeft,
    Search,
    Settings2,
    Users,
    Building2,
    ShieldCheck,
    Inbox,
} from "lucide-react";

import {
    Link,
} from "react-router-dom";

type AdvertisementModuleItem = {
    title: string;
    description: string;
    path: string;
    icon: typeof LayoutDashboard;
    category: "WORKSPACE" | "CONFIGURATION";
};

const WORKSPACE_ITEMS: AdvertisementModuleItem[] = [
    {
        title: "Advertisement Management",
        description:
            "View and manage advertisement records, review their status, and open individual workspaces.",
        path: "/admin/advertisements/list",
        icon: ClipboardList,
        category: "WORKSPACE",
    },
    {
        title: "Advertisement Enquiries",
        description: "Manage incoming advertising enquiries, status and remarks.",
        path: "/admin/advertisements/enquiries",
        icon: Inbox,
        category: "WORKSPACE",
    },
    {
        title: "Search Advertisements",
        description:
            "Find existing advertisements and access their management workspaces.",
        path: "/admin/advertisements/search",
        icon: Search,
        category: "WORKSPACE",
    },
    {
        title: "Create Advertisement",
        description:
            "Start the advertisement creation workflow and configure its client, placement, creative, and schedule.",
        path: "/admin/advertisements/create",
        icon: FilePlus2,
        category: "WORKSPACE",
    },
    {
        title: "Advertisement Clients",
        description:
            "Search and select advertising clients and review their business information.",
        path: "/admin/advertisements/clients",
        icon: Users,
        category: "WORKSPACE",
    },
];

const CONFIGURATION_ITEMS: AdvertisementModuleItem[] = [
    {
        title: "Business Type Configuration",
        description: "Manage the business types used by advertising clients.",
        path: "/admin/advertisements/business-types",
        icon: Building2,
        category: "CONFIGURATION",
    },
    {
        title: "Client Configuration",
        description:
            "Add and manage advertising clients, contact details, and client status.",
        path: "/admin/advertisements/client-configuration",
        icon: Users,
        category: "CONFIGURATION",
    },
    {
        title: "Format Configuration",
        description:
            "Manage advertisement formats, desktop and mobile dimensions, responsive settings, and activation status.",
        path: "/admin/advertisements/formats",
        icon: PanelsTopLeft,
        category: "CONFIGURATION",
    },
    {
        title: "Placement Configuration",
        description:
            "Manage the available advertisement placements and their configuration.",
        path: "/admin/advertisements/placements",
        icon: Monitor,
        category: "CONFIGURATION",
    },
    {
        title: "Rate Card Configuration",
        description:
            "Configure system-defined placement rates, pricing units, effective periods, and rate status.",
        path: "/admin/advertisements/rate-cards",
        icon: CircleDollarSign,
        category: "CONFIGURATION",
    },
    {
        title: "Financial Approval Thresholds",
        description:
            "Configure approval thresholds and financial controls for discounts, adjustments, refunds, and other financial approval requests.",
        path: "/admin/advertisements/financial-approval-thresholds",
        icon: ShieldCheck,
        category: "CONFIGURATION",
    },
];

function ModuleCard({
    item,
}: {
    item: AdvertisementModuleItem;
}) {
    const Icon = item.icon;

    return (
        <Link
            to={item.path}
            className="
                group
                flex
                min-h-48
                flex-col
                rounded-xl
                border
                border-gray-200
                bg-white
                p-5
                shadow-sm
                transition
                hover:border-green-300
                hover:shadow-md
                focus:outline-none
                focus:ring-2
                focus:ring-green-600
                focus:ring-offset-2
            "
        >
            <div className="flex items-start justify-between gap-3">
                <div
                    className="
                        flex
                        h-11
                        w-11
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-green-50
                        text-green-700
                        transition
                        group-hover:bg-green-100
                    "
                >
                    <Icon size={22} aria-hidden="true" />
                </div>

                <ArrowRight
                    size={18}
                    className="
                        mt-1
                        shrink-0
                        text-gray-400
                        transition
                        group-hover:translate-x-1
                        group-hover:text-green-700
                    "
                    aria-hidden="true"
                />
            </div>

            <h3 className="mt-4 text-base font-semibold text-gray-900">
                {item.title}
            </h3>

            <p className="mt-2 flex-1 text-sm leading-6 text-gray-600">
                {item.description}
            </p>

            <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-green-700">
                Open {item.title}
                <ArrowRight size={14} aria-hidden="true" />
            </span>
        </Link>
    );
}

export default function AdvertisementManagementHomePage() {
    return (
        <MainLayout>
            <main className="min-h-screen bg-gray-50">
                <div className="mx-auto w-full max-w-[1600px] space-y-8 px-4 py-6 sm:px-6 lg:px-8">
                    <header
                        className="
                        overflow-hidden
                        rounded-2xl
                        bg-[#008236]
                        shadow-sm
                    "
                    >
                        <div className="flex flex-col gap-5 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
                            <div className="max-w-3xl">
                                <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                                    Advertisement Administration
                                </h1>

                                <p className="mt-3 max-w-2xl text-sm leading-6 text-green-50 sm:text-base">
                                    Manage advertising clients, campaigns, placements,
                                    and pricing from one place. Choose a module below
                                    to continue your work.
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                <Link
                                    to="/admin/advertisements/create"
                                    className="
                                inline-flex
                                min-h-11
                                shrink-0
                                items-center
                                justify-center
                                gap-2
                                rounded-lg
                                bg-white
                                px-4
                                py-2.5
                                text-sm
                                font-semibold
                                text-green-800
                                shadow-sm
                                transition
                                hover:bg-green-50
                                focus:outline-none
                                focus:ring-2
                                focus:ring-white
                                focus:ring-offset-2
                                focus:ring-offset-green-800
                            "
                                >
                                    <FilePlus2 size={17} aria-hidden="true" />
                                    Create Advertisement
                                </Link>
                            </div>
                        </div>
                    </header>

                    <section aria-labelledby="workspace-heading">
                        <div className="mb-4">
                            <h2
                                id="workspace-heading"
                                className="text-lg font-semibold text-gray-900"
                            >
                                Advertisement Workspace
                            </h2>

                            <p className="mt-1 text-sm text-gray-600">
                                Work with advertisement records and client information.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            {WORKSPACE_ITEMS.map((item) => (
                                <ModuleCard
                                    key={item.path}
                                    item={item}
                                />
                            ))}
                        </div>
                    </section>

                    <section aria-labelledby="configuration-heading">
                        <div className="mb-4">
                            <div className="flex items-center gap-2">
                                <Settings2
                                    size={20}
                                    className="text-green-700"
                                    aria-hidden="true"
                                />

                                <h2
                                    id="configuration-heading"
                                    className="text-lg font-semibold text-gray-900"
                                >
                                    Configuration
                                </h2>
                            </div>

                            <p className="mt-1 text-sm text-gray-600">
                                Maintain the settings used by advertisement creation
                                and pricing workflows.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                            {CONFIGURATION_ITEMS.map((item) => (
                                <ModuleCard
                                    key={item.path}
                                    item={item}
                                />
                            ))}
                        </div>
                    </section>

                    <footer className="border-t border-gray-200 pt-4 text-xs leading-5 text-gray-500">
                        Advertisement module navigation. Access to individual
                        operations remains subject to the application's authentication
                        and authorization rules.
                    </footer>
                </div>
            </main>
        </MainLayout>
    );
}
