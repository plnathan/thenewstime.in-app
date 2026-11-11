import {
    AlertTriangle,
    Building2,
    CheckCircle2,
    Globe,
    Mail,
    MapPin,
    Phone,
    UserRound,
} from "lucide-react";

import type {
    AdvertisementClient,
} from "@/api/advertisements";

import Surface from "@/components/ui/Surface";
import Typography from "@/components/ui/Typography";

interface ClientProfileProps {
    client: AdvertisementClient;
    onUseClient: () => void;
    onChangeClient: () => void;
}

const ClientProfile = ({
    client,
    onUseClient,
    onChangeClient,
}: ClientProfileProps) => {
    const clientName =
        client.displayName ||
        client.name ||
        client.companyName ||
        "Unnamed client";

    const isOnHold = client.adCreationHold;

    return (
        <Surface
            className="
                border
                border-gray-200
                p-5
            "
        >
            <div className="flex flex-col gap-5">
                <div
                    className="
                        flex
                        flex-col
                        gap-3
                        sm:flex-row
                        sm:items-start
                        sm:justify-between
                    "
                >
                    <div className="flex items-start gap-3">
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
                                size={21}
                                aria-hidden="true"
                            />
                        </div>

                        <div>
                            <Typography
                                as="h2"
                                variant="headline"
                                className="
                                    text-base
                                    font-semibold
                                    sm:text-lg
                                "
                            >
                                Client Profile
                            </Typography>

                            <Typography
                                as="p"
                                variant="body"
                                className="
                                    mt-1
                                    text-sm
                                    text-gray-600
                                "
                            >
                                Verify the client before continuing with
                                advertisement creation.
                            </Typography>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onChangeClient}
                        className="
                            inline-flex
                            min-h-9
                            items-center
                            justify-center
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
                            hover:bg-gray-50
                            focus:outline-none
                            focus:ring-2
                            focus:ring-green-600
                            focus:ring-offset-2
                        "
                    >
                        Change Client
                    </button>
                </div>

                {isOnHold ? (
                    <div
                        role="alert"
                        className="
                            rounded-lg
                            border-2
                            border-red-300
                            bg-red-50
                            p-4
                        "
                    >
                        <div className="flex items-start gap-3">
                            <AlertTriangle
                                size={22}
                                className="
                                    mt-0.5
                                    shrink-0
                                    text-red-700
                                "
                                aria-hidden="true"
                            />

                            <div>
                                <Typography
                                    as="h3"
                                    variant="body"
                                    className="
                                        text-sm
                                        font-bold
                                        text-red-900
                                    "
                                >
                                    Advertisement creation is on hold
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
                                    This client currently cannot be used
                                    to create a new advertisement.
                                </Typography>

                                {client.adCreationHoldReason && (
                                    <div
                                        className="
                                            mt-3
                                            rounded-md
                                            border
                                            border-red-200
                                            bg-white
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
                                                uppercase
                                                tracking-wide
                                                text-red-700
                                            "
                                        >
                                            Hold reason
                                        </Typography>

                                        <Typography
                                            as="p"
                                            variant="body"
                                            className="
                                                mt-1
                                                text-sm
                                                text-gray-700
                                            "
                                        >
                                            {
                                                client.adCreationHoldReason
                                            }
                                        </Typography>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div
                        className="
                            flex
                            items-start
                            gap-3
                            rounded-md
                            border
                            border-green-200
                            bg-green-50
                            px-4
                            py-3
                        "
                    >
                        <CheckCircle2
                            size={20}
                            className="
                                mt-0.5
                                shrink-0
                                text-green-700
                            "
                            aria-hidden="true"
                        />

                        <div>
                            <Typography
                                as="p"
                                variant="body"
                                className="
                                    text-sm
                                    font-semibold
                                    text-green-900
                                "
                            >
                                Client is eligible for advertisement
                                creation
                            </Typography>

                            <Typography
                                as="p"
                                variant="body"
                                className="
                                    mt-1
                                    text-xs
                                    text-green-800
                                "
                            >
                                No advertisement creation hold is
                                currently active.
                            </Typography>
                        </div>
                    </div>
                )}

                <div
                    className="
                        grid
                        grid-cols-1
                        gap-4
                        md:grid-cols-2
                    "
                >
                    <ProfileField
                        icon={<Building2 size={17} />}
                        label="Business"
                        value={clientName}
                    />

                    <ProfileField
                        icon={<UserRound size={17} />}
                        label="Contact person"
                        value={
                            client.contactPerson ||
                            "Not available"
                        }
                    />

                    <ProfileField
                        icon={<Phone size={17} />}
                        label="Mobile / Phone"
                        value={
                            client.mobile ||
                            client.phone ||
                            "Not available"
                        }
                    />

                    <ProfileField
                        icon={<Mail size={17} />}
                        label="Email"
                        value={
                            client.email ||
                            "Not available"
                        }
                    />

                    <ProfileField
                        icon={<Building2 size={17} />}
                        label="Business type"
                        value={
                            client.businessTypeName ||
                            "Not available"
                        }
                    />

                    <ProfileField
                        icon={<Globe size={17} />}
                        label="Website"
                        value={
                            client.website ||
                            "Not available"
                        }
                    />

                    <ProfileField
                        icon={<MapPin size={17} />}
                        label="Registered address"
                        value={
                            client.registeredAddress ||
                            "Not available"
                        }
                    />

                    <ProfileField
                        icon={<MapPin size={17} />}
                        label="Billing address"
                        value={
                            client.billingAddress ||
                            "Not available"
                        }
                    />
                </div>

                <div
                    className="
                        grid
                        grid-cols-1
                        gap-4
                        border-t
                        border-gray-200
                        pt-4
                        sm:grid-cols-3
                    "
                >
                    <MetaValue
                        label="Client code"
                        value={
                            client.clientCode ||
                            "Not assigned"
                        }
                    />

                    <MetaValue
                        label="Status"
                        value={client.status}
                    />

                    <MetaValue
                        label="GST / Tax"
                        value={
                            client.gstNumber ||
                            client.taxNumber ||
                            "Not available"
                        }
                    />
                </div>

                <div
                    className="
                        flex
                        flex-col
                        gap-2
                        border-t
                        border-gray-200
                        pt-4
                        sm:flex-row
                        sm:justify-end
                    "
                >
                    <button
                        type="button"
                        onClick={onChangeClient}
                        className="
                            inline-flex
                            min-h-10
                            items-center
                            justify-center
                            rounded-md
                            border
                            border-gray-300
                            bg-white
                            px-4
                            py-2
                            text-sm
                            font-semibold
                            text-gray-700
                            transition
                            hover:bg-gray-50
                            focus:outline-none
                            focus:ring-2
                            focus:ring-green-600
                            focus:ring-offset-2
                        "
                    >
                        Select Different Client
                    </button>

                    <button
                        type="button"
                        onClick={onUseClient}
                        disabled={isOnHold}
                        className="
                            inline-flex
                            min-h-10
                            items-center
                            justify-center
                            rounded-md
                            bg-green-700
                            px-4
                            py-2
                            text-sm
                            font-semibold
                            text-white
                            transition
                            hover:bg-green-800
                            focus:outline-none
                            focus:ring-2
                            focus:ring-green-600
                            focus:ring-offset-2
                            disabled:cursor-not-allowed
                            disabled:bg-gray-300
                            disabled:text-gray-500
                        "
                    >
                        Use This Client
                    </button>
                </div>
            </div>
        </Surface>
    );
};

interface ProfileFieldProps {
    icon: React.ReactNode;
    label: string;
    value: string;
}

const ProfileField = ({
    icon,
    label,
    value,
}: ProfileFieldProps) => {
    return (
        <div
            className="
                rounded-md
                border
                border-gray-200
                bg-white
                p-4
            "
        >
            <div
                className="
                    flex
                    items-start
                    gap-3
                "
            >
                <div
                    className="
                        mt-0.5
                        shrink-0
                        text-gray-500
                    "
                >
                    {icon}
                </div>

                <div className="min-w-0">
                    <Typography
                        as="p"
                        variant="body"
                        className="
                            text-xs
                            font-semibold
                            uppercase
                            tracking-wide
                            text-gray-500
                        "
                    >
                        {label}
                    </Typography>

                    <Typography
                        as="p"
                        variant="body"
                        className="
                            mt-1
                            break-words
                            text-sm
                            text-gray-900
                        "
                    >
                        {value}
                    </Typography>
                </div>
            </div>
        </div>
    );
};

interface MetaValueProps {
    label: string;
    value: string;
}

const MetaValue = ({
    label,
    value,
}: MetaValueProps) => {
    return (
        <div>
            <Typography
                as="p"
                variant="body"
                className="
                    text-xs
                    font-semibold
                    uppercase
                    tracking-wide
                    text-gray-500
                "
            >
                {label}
            </Typography>

            <Typography
                as="p"
                variant="body"
                className="
                    mt-1
                    text-sm
                    font-medium
                    text-gray-900
                "
            >
                {value}
            </Typography>
        </div>
    );
};

export default ClientProfile;