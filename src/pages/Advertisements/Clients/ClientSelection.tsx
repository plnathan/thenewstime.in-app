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

import ClientProfile from "./ClientProfile";
import ClientSearch from "./ClientSearch";

interface ClientSelectionProps {
    value: AdvertisementClient | null;
    onChange: (
        client: AdvertisementClient,
    ) => void;
    onConfirm?: (
        client: AdvertisementClient,
    ) => void;
}

type ClientSelectionStep =
    | "SEARCH"
    | "PROFILE";

const ClientSelection = ({
    value,
    onChange,
    onConfirm,
}: ClientSelectionProps) => {
    const [step, setStep] =
        useState<ClientSelectionStep>(
            value
                ? "PROFILE"
                : "SEARCH",
        );

    const handleSelect = (
        client: AdvertisementClient,
    ): void => {
        onChange(client);
        setStep("PROFILE");
    };

    const handleChangeClient = (): void => {
        setStep("SEARCH");
    };

    const handleUseClient = (): void => {
        if (
            !value ||
            value.adCreationHold
        ) {
            return;
        }

        if (onConfirm) {
            onConfirm(value);
            return;
        }

        onChange(value);
    };

    return (
        <div
            className="
                flex
                flex-col
                gap-4
            "
        >
            <div
                className="
                    flex
                    flex-wrap
                    items-center
                    gap-2
                    text-sm
                    font-medium
                    text-gray-600
                "
            >
                <div
                    className={`
                        flex
                        h-7
                        w-7
                        items-center
                        justify-center
                        rounded-full
                        text-xs
                        font-bold
                        ${step === "SEARCH"
                            ? "bg-green-700 text-white"
                            : "bg-green-100 text-green-800"
                        }
                    `}
                >
                    {step === "SEARCH" ? (
                        "1"
                    ) : (
                        <CheckCircle2
                            size={16}
                            aria-hidden="true"
                        />
                    )}
                </div>

                <span>
                    Find client
                </span>

                <span
                    className="
                        h-px
                        w-8
                        bg-gray-300
                    "
                    aria-hidden="true"
                />

                <div
                    className={`
                        flex
                        h-7
                        w-7
                        items-center
                        justify-center
                        rounded-full
                        text-xs
                        font-bold
                        ${step === "PROFILE"
                            ? "bg-green-700 text-white"
                            : "bg-gray-100 text-gray-500"
                        }
                    `}
                >
                    2
                </div>

                <span>
                    Verify profile
                </span>
            </div>

            {step === "SEARCH" && (
                <ClientSearch
                    selectedClientId={
                        value?.id ?? null
                    }
                    onSelect={
                        handleSelect
                    }
                />
            )}

            {step === "PROFILE" &&
                value && (
                    <ClientProfile
                        client={value}
                        onUseClient={
                            handleUseClient
                        }
                        onChangeClient={
                            handleChangeClient
                        }
                    />
                )}

            {!value &&
                step === "PROFILE" && (
                    <div
                        className="
                            rounded-md
                            border
                            border-gray-200
                            bg-gray-50
                            px-4
                            py-6
                            text-center
                        "
                    >
                        <UserRound
                            size={24}
                            className="
                                mx-auto
                                text-gray-400
                            "
                            aria-hidden="true"
                        />

                        <p
                            className="
                                mt-2
                                text-sm
                                text-gray-600
                            "
                        >
                            No client has been
                            selected.
                        </p>

                        <button
                            type="button"
                            onClick={() => {
                                setStep(
                                    "SEARCH",
                                );
                            }}
                            className="
                                mt-4
                                inline-flex
                                min-h-9
                                items-center
                                justify-center
                                rounded-md
                                bg-green-700
                                px-3
                                py-2
                                text-sm
                                font-semibold
                                text-white
                                hover:bg-green-800
                                focus:outline-none
                                focus:ring-2
                                focus:ring-green-600
                                focus:ring-offset-2
                            "
                        >
                            Find Client
                        </button>
                    </div>
                )}
        </div>
    );
};

export default ClientSelection;