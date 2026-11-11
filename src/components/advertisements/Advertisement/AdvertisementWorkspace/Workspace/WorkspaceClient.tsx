import { useEffect, useState } from "react";
import { getAdvertisementClientById } from "@/api/advertisements/clients.api";
import {
    AlertCircle,
    Building2,
    CheckCircle2,
    ExternalLink,
    Mail,
    MapPin,
    Phone,
    UserRound,
} from "lucide-react";

import {
    Link,
} from "react-router-dom";

import type {
    AdvertisementClient,
    AdvertisementDetails,
} from "@/api/advertisements/advertisement.api";

import Surface from "@/components/ui/Surface";
import Typography from "@/components/ui/Typography";

interface WorkspaceClientProps {
    advertisement: AdvertisementDetails;
}

const getClientName = (
    client: AdvertisementClient,
): string => {
    return (
        client.displayName?.trim() ||
        client.businessName?.trim() ||
        client.name.trim() ||
        "Client not available"
    );
};

const getBusinessType = (
    client: AdvertisementClient,
): string => {
    return (
        client.businessType?.displayName?.trim() ||
        client.businessTypeName?.trim() ||
        ""
    );
};

const getWebsite = (
    client: AdvertisementClient,
): string | null => {
    return (
        client.websiteUrl?.trim() ||
        client.website?.trim() ||
        null
    );
};

const WorkspaceClient = ({
    advertisement,
}: WorkspaceClientProps) => {
    const [client, setClient] = useState<AdvertisementClient | null>(null);
    const [loadingClient, setLoadingClient] = useState(false);
    const [clientError, setClientError] = useState<string | null>(null);

    useEffect(() => {
        const clientId = advertisement.clientId;
        if (advertisement.isHouseAd || clientId === null) return;
        let cancelled = false;
        const fetchClient = async (): Promise<void> => {
            try {
                const response = await getAdvertisementClientById(clientId);
                if (!cancelled) {
                    setClient(response.data);
                    setClientError(null);
                }
            } catch {
                if (!cancelled) {
                    setClientError("Unable to load the complete client profile. Please retry.");
                }
            } finally {
                if (!cancelled) setLoadingClient(false);
            }
        };
        // Schedule the request outside the synchronous effect body.
        const timer = window.setTimeout(() => {
            setLoadingClient(true);
            void fetchClient();
        }, 0);
        return () => { cancelled = true; window.clearTimeout(timer); };
    }, [advertisement.clientId, advertisement.isHouseAd]);

    const editAdvertisementPath =
        `/admin/advertisements/${advertisement.id}/edit`;

    if (advertisement.isHouseAd === true) {
        return (
            <Surface className="border border-green-200 bg-green-50 p-5 sm:p-6">
                <Typography as="h3" variant="headline" className="text-base font-semibold text-green-900">
                    TheNewsTime.in — House Advertisement
                </Typography>
                <Typography as="p" variant="body" className="mt-2 text-sm text-green-800">
                    This advertisement is internal inventory. An external client profile is not required.
                </Typography>
            </Surface>
        );
    }

    if (loadingClient || (!client && !clientError && advertisement.clientId !== null && !advertisement.isHouseAd)) {
        return <Surface className="border border-gray-200 p-6"><div className="animate-pulse text-sm text-gray-500">Loading client profile…</div></Surface>;
    }

    if (!client) {
        return (
            <div className="space-y-4">
                <Surface
                    className="
                        border
                        border-red-200
                        bg-red-50
                        p-5
                        sm:p-6
                    "
                >
                    <div
                        className="
                            flex
                            items-start
                            gap-3
                        "
                    >
                        <AlertCircle
                            size={20}
                            className="
                                mt-0.5
                                shrink-0
                                text-red-600
                            "
                            aria-hidden="true"
                        />

                        <div className="min-w-0">
                            <Typography
                                as="h3"
                                variant="headline"
                                className="
                                    text-base
                                    font-semibold
                                    text-red-900
                                "
                            >
                                Client profile unavailable
                            </Typography>

                            <Typography
                                as="p"
                                variant="body"
                                className="
                                    mt-1
                                    text-sm
                                    text-red-700
                                "
                            >
                                {clientError ?? `Client #${advertisement.clientId ?? "unknown"} is not available.`}
                            </Typography>
                        </div>
                    </div>
                </Surface>
            </div>
        );
    }

    const clientName =
        getClientName(client);

    const businessType =
        getBusinessType(client);

    const website =
        getWebsite(client);

    return (
        <div
            className="
                flex
                flex-col
                gap-4
            "
        >
            {client.adCreationHold && (
                <Surface
                    className="
                        border
                        border-amber-200
                        bg-amber-50
                        p-5
                        sm:p-6
                    "
                >
                    <div
                        className="
                            flex
                            items-start
                            gap-3
                        "
                    >
                        <AlertCircle
                            size={20}
                            className="
                                mt-0.5
                                shrink-0
                                text-amber-700
                            "
                            aria-hidden="true"
                        />

                        <div className="min-w-0">
                            <Typography
                                as="h3"
                                variant="headline"
                                className="
                                    text-base
                                    font-semibold
                                    text-amber-900
                                "
                            >
                                Advertisement creation hold
                            </Typography>

                            <Typography
                                as="p"
                                variant="body"
                                className="
                                    mt-1
                                    text-sm
                                    text-amber-800
                                "
                            >
                                This client currently has an
                                advertisement creation hold.
                            </Typography>

                            {client.adCreationHoldType && (
                                <Typography
                                    as="p"
                                    variant="body"
                                    className="
                                        mt-2
                                        text-xs
                                        font-semibold
                                        uppercase
                                        tracking-wide
                                        text-amber-700
                                    "
                                >
                                    Hold type:{" "}
                                    {
                                        client.adCreationHoldType
                                    }
                                </Typography>
                            )}

                            {client.adCreationHoldReason && (
                                <div
                                    className="
                                        mt-3
                                        rounded-md
                                        border
                                        border-amber-200
                                        bg-white/70
                                        px-3
                                        py-2
                                    "
                                >
                                    <Typography
                                        as="p"
                                        variant="body"
                                        className="
                                            text-xs
                                            font-semibold
                                            text-amber-900
                                        "
                                    >
                                        Reason
                                    </Typography>

                                    <Typography
                                        as="p"
                                        variant="body"
                                        className="
                                            mt-1
                                            text-sm
                                            text-amber-800
                                        "
                                    >
                                        {
                                            client.adCreationHoldReason
                                        }
                                    </Typography>
                                </div>
                            )}

                            {client.adCreationHoldRemarks && (
                                <div
                                    className="
                                        mt-3
                                        rounded-md
                                        border
                                        border-amber-200
                                        bg-white/70
                                        px-3
                                        py-2
                                    "
                                >
                                    <Typography
                                        as="p"
                                        variant="body"
                                        className="
                                            text-xs
                                            font-semibold
                                            text-amber-900
                                        "
                                    >
                                        Remarks
                                    </Typography>

                                    <Typography
                                        as="p"
                                        variant="body"
                                        className="
                                            mt-1
                                            text-sm
                                            text-amber-800
                                        "
                                    >
                                        {
                                            client.adCreationHoldRemarks
                                        }
                                    </Typography>
                                </div>
                            )}
                        </div>
                    </div>
                </Surface>
            )}

            <Surface
                className="
                    border
                    border-gray-200
                    bg-white
                    p-5
                    sm:p-6
                "
            >
                <div
                    className="
                        flex
                        flex-col
                        gap-4
                        sm:flex-row
                        sm:items-start
                        sm:justify-between
                    "
                >
                    <div
                        className="
                            flex
                            min-w-0
                            items-start
                            gap-3
                        "
                    >
                        <div
                            className="
                                flex
                                h-11
                                w-11
                                shrink-0
                                items-center
                                justify-center
                                rounded-lg
                                bg-green-50
                                text-green-700
                            "
                        >
                            <Building2
                                size={22}
                                aria-hidden="true"
                            />
                        </div>

                        <div className="min-w-0">
                            <h3
                                className="
                                    text-base
                                    font-semibold
                                    text-slate-900
                                "
                            >
                                {clientName}
                            </h3>

                            <div
                                className="
                                    mt-1
                                    flex
                                    flex-wrap
                                    items-center
                                    gap-2
                                "
                            >
                                <span
                                    className="
                                        rounded-md
                                        bg-gray-100
                                        px-2
                                        py-1
                                        text-xs
                                        font-semibold
                                        text-gray-700
                                    "
                                >
                                    {client.clientCode}
                                </span>

                                <span
                                    className={`
                                        inline-flex
                                        items-center
                                        gap-1
                                        rounded-md
                                        px-2
                                        py-1
                                        text-xs
                                        font-semibold
                                        ${client.status ===
                                            "ACTIVE"
                                            ? "bg-green-100 text-green-800"
                                            : "bg-gray-100 text-gray-700"
                                        }
                                    `}
                                >
                                    {client.status ===
                                        "ACTIVE" ? (
                                        <CheckCircle2
                                            size={13}
                                            aria-hidden="true"
                                        />
                                    ) : (
                                        <AlertCircle
                                            size={13}
                                            aria-hidden="true"
                                        />
                                    )}

                                    {client.status}
                                </span>
                            </div>
                        </div>
                    </div>

                    <Link
                        to={editAdvertisementPath}
                        className="
                            inline-flex
                            min-h-9
                            shrink-0
                            items-center
                            justify-center
                            gap-2
                            rounded-md
                            border
                            border-gray-300
                            bg-white
                            px-3
                            py-2
                            text-sm
                            font-semibold
                            text-gray-700
                            transition
                            hover:border-green-300
                            hover:bg-green-50
                            hover:text-green-800
                            focus:outline-none
                            focus:ring-2
                            focus:ring-green-600
                            focus:ring-offset-2
                        "
                    >
                        View / Edit Advertisement
                    </Link>
                </div>

                <div
                    className="
                        mt-5
                        grid
                        gap-4
                        md:grid-cols-2
                    "
                >
                    <ClientField
                        icon={Building2}
                        label="Business Type"
                        value={businessType}
                    />

                    <ClientField
                        icon={UserRound}
                        label="Contact Person"
                        value={
                            client.contactPerson ||
                            ""
                        }
                    />

                    <ClientField
                        icon={Phone}
                        label="Contact Number"
                        value={
                            client.contactNo ||
                            ""
                        }
                    />

                    <ClientField
                        icon={Phone}
                        label="Alternate Mobile"
                        value={
                            client.alternateMobile ||
                            ""
                        }
                    />

                    <ClientField
                        icon={Mail}
                        label="Email"
                        value={
                            client.email ||
                            ""
                        }
                    />

                    <ClientField
                        icon={Mail}
                        label="Alternate Email"
                        value={
                            client.alternateEmail ||
                            ""
                        }
                    />

                    <ClientField
                        icon={MapPin}
                        label="Primary Address"
                        value={
                            client.primaryAddress ||
                            ""
                        }
                        fullWidth
                    />

                    <ClientField
                        icon={MapPin}
                        label="Communication Address"
                        value={
                            client.communicationAddress ||
                            ""
                        }
                        fullWidth
                    />

                    <ClientField
                        icon={ExternalLink}
                        label="Website"
                        value={
                            website ||
                            ""
                        }
                        fullWidth
                    />
                </div>
            </Surface>

            {client.paymentAttentionRequired && (
                <Surface
                    className="
                        border
                        border-red-200
                        bg-red-50
                        p-5
                    "
                >
                    <Typography
                        as="h3"
                        variant="headline"
                        className="
                            text-base
                            font-semibold
                            text-red-900
                        "
                    >
                        Payment attention required
                    </Typography>

                    <Typography
                        as="p"
                        variant="body"
                        className="
                            mt-1
                            text-sm
                            text-red-800
                        "
                    >
                        The client currently requires payment
                        attention before additional advertisement
                        creation activity.
                    </Typography>
                </Surface>
            )}

            {client.notes?.trim() && (
                <Surface
                    className="
                        border
                        border-gray-200
                        bg-white
                        p-5
                        sm:p-6
                    "
                >
                    <Typography
                        as="h3"
                        variant="headline"
                        className="
                            text-base
                            font-semibold
                            text-gray-900
                        "
                    >
                        Client Notes
                    </Typography>

                    <div
                        className="
                            mt-3
                            rounded-lg
                            border
                            border-gray-200
                            bg-gray-50
                            px-3
                            py-3
                            text-sm
                            leading-6
                            text-gray-700
                        "
                    >
                        {client.notes}
                    </div>
                </Surface>
            )}
        </div>
    );
};

interface ClientFieldProps {
    icon: typeof Building2;
    label: string;
    value: string;
    fullWidth?: boolean;
}

const ClientField = ({
    icon: Icon,
    label,
    value,
    fullWidth = false,
}: ClientFieldProps) => {
    return (
        <div
            className={
                fullWidth
                    ? "md:col-span-2"
                    : ""
            }
        >
            <div
                className="
                    mb-1.5
                    flex
                    items-center
                    gap-2
                "
            >
                <Icon
                    size={14}
                    className="text-gray-400"
                    aria-hidden="true"
                />

                <span
                    className="
                        text-xs
                        font-semibold
                        uppercase
                        tracking-wide
                        text-gray-500
                    "
                >
                    {label}
                </span>
            </div>

            <div
                className="
                    min-h-10
                    rounded-lg
                    border
                    border-gray-200
                    bg-gray-50
                    px-3
                    py-2.5
                    text-sm
                    leading-6
                    text-gray-800
                "
            >
                {value}
            </div>
        </div>
    );
};

export default WorkspaceClient;