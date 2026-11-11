import MainLayout from "@/layouts/MainLayout";
import { Link } from "react-router-dom";
import AdvertisementAdminPageHeader from "@/components/ui/AdvertisementAdminPageHeader";
import {
    CheckCircle2,
    UserRound,
} from "lucide-react";
import {
    useState,
} from "react";

import type {
    AdvertisementClient,
} from "@/api/advertisements";

import ClientSearch from "@/pages/Advertisements/Clients/ClientSearch";

import Surface from "@/components/ui/Surface";
import Typography from "@/components/ui/Typography";

const ClientSearchPage = () => {
    const [selectedClient, setSelectedClient] =
        useState<AdvertisementClient | null>(null);

    return (
        <MainLayout>
            <main className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6">
                <Link to="/admin/advertisements" className="inline-flex text-sm font-semibold text-green-700 hover:underline">← Back to Advertisement Administration</Link>
                <AdvertisementAdminPageHeader title="Advertisement Clients" description="Search and review existing advertisement clients. Selecting a client here does not create or modify an advertisement." />
                <ClientSearch
                    selectedClientId={selectedClient?.id ?? null}
                    onSelect={setSelectedClient}
                />

                {selectedClient && (
                    <Surface className="border border-green-200 bg-green-50 p-5 sm:p-6">
                        <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100">
                                <UserRound
                                    size={20}
                                    className="text-green-700"
                                    aria-hidden="true"
                                />
                            </div>

                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <Typography
                                        as="h2"
                                        variant="headline"
                                        className="text-base font-semibold text-gray-900"
                                    >
                                        Selected Client
                                    </Typography>

                                    <CheckCircle2
                                        size={18}
                                        className="text-green-700"
                                        aria-hidden="true"
                                    />
                                </div>

                                <Typography
                                    as="p"
                                    variant="body"
                                    className="mt-2 text-sm font-semibold text-gray-900"
                                >
                                    {selectedClient.displayName ||
                                        selectedClient.name}
                                </Typography>

                                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                    <ClientDetail
                                        label="Client Code"
                                        value={
                                            selectedClient.clientCode
                                        }
                                    />

                                    <ClientDetail
                                        label="Business Name"
                                        value={
                                            selectedClient.businessName
                                        }
                                    />

                                    <ClientDetail
                                        label="Contact Number"
                                        value={
                                            selectedClient.contactNo
                                        }
                                    />

                                    <ClientDetail
                                        label="Email"
                                        value={selectedClient.email}
                                    />

                                    <ClientDetail
                                        label="Client ID"
                                        value={String(selectedClient.id)}
                                    />
                                </div>
                            </div>
                        </div>
                    </Surface>
                )}
            </main>
        </MainLayout>
    );
};

interface ClientDetailProps {
    label: string;
    value: string | number | null | undefined;
}

const ClientDetail = ({
    label,
    value,
}: ClientDetailProps) => (
    <div className="rounded-md border border-gray-200 bg-white p-3">
        <Typography
            as="p"
            variant="body"
            className="text-xs font-medium text-gray-500"
        >
            {label}
        </Typography>

        <Typography
            as="p"
            variant="body"
            className="mt-1 break-all text-sm font-medium text-gray-900"
        >
            {value === null || value === undefined || value === ""
                ? "Not available"
                : value}
        </Typography>
    </div>
);

export default ClientSearchPage;