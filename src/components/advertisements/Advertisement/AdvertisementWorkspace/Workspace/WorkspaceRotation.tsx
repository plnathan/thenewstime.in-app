
import {
    AlertCircle,
    CheckCircle2,
    Clock3,
    LoaderCircle,
    Plus,
    RefreshCw,
    RotateCcw,
    Save,
    ShieldAlert,
    Users,
    XCircle,
} from "lucide-react";

import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import {
    addAdvertisementRotationMember,
    getAdvertisementRotationConfig,
    getAdvertisementRotationMembers,
    getAdvertisements,
    removeAdvertisementRotationMember,
    updateAdvertisementRotationConfig,
    updateAdvertisementRotationMember,
} from "@/api/advertisements/advertisement.api";

import type {
    AdvertisementDetails,
    AdvertisementListItem,
    AdvertisementRotationConfig,
    AdvertisementRotationMember,
    AdvertisementRotationMemberStatus,
    UpdateAdvertisementRotationConfigInput,
} from "@/api/advertisements/advertisement.api";

import {
    getApiErrorMessage,
} from "@/helpers/advertisementManagement.helpers";

import Surface from "@/components/ui/Surface";
import WorkspaceCreativeRotation from "./WorkspaceCreativeRotation";
import Typography from "@/components/ui/Typography";

interface WorkspaceRotationProps {
    advertisement: AdvertisementDetails;
    onSaved?: () => Promise<void>;
}

interface AdvertisementOption {
    id: number;
    name: string;
    workflowStatus: string;
    status: string;
}

const MAX_ACTIVE_ROTATION_MEMBERS = 10;
const DEFAULT_INTERVAL_SECONDS = 10;
const ADVERTISEMENT_PAGE_SIZE = 100;

const getResponseData = <T,>(
    response: {
        data?: T | null;
    },
): T | null => response.data ?? null;

const formatStatus = (value: string): string =>
    value
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (character) =>
            character.toUpperCase(),
        );

const getMemberStatusClass = (
    status: AdvertisementRotationMemberStatus,
): string =>
    status === "ACTIVE"
        ? "border-green-200 bg-green-50 text-green-800"
        : "border-gray-200 bg-gray-100 text-gray-600";

const isValidPlacementId = (
    placementId: number | null,
): placementId is number =>
    placementId !== null &&
    Number.isInteger(placementId) &&
    placementId > 0;

const isValidPriority = (priority: number): boolean =>
    Number.isInteger(priority) && priority >= 0;

const WorkspaceRotation = ({
    advertisement,
    onSaved,
}: WorkspaceRotationProps) => {
    const loadRequestId = useRef(0);

    const placementId =
        advertisement.placement?.id ?? null;

    const canManage =
        advertisement.workflowStatus !== "ARCHIVED";

    const [config, setConfig] =
        useState<AdvertisementRotationConfig | null>(null);

    const [loadedPlacementId, setLoadedPlacementId] =
        useState<number | null>(null);

    const [members, setMembers] =
        useState<AdvertisementRotationMember[]>([]);

    const [advertisementOptions, setAdvertisementOptions] =
        useState<AdvertisementOption[]>([]);

    const [rotationEnabled, setRotationEnabled] =
        useState(false);

    const [rotationIntervalSeconds, setRotationIntervalSeconds] =
        useState(String(DEFAULT_INTERVAL_SECONDS));

    const [selectedAdvertisementId, setSelectedAdvertisementId] =
        useState("");

    const [newMemberPriority, setNewMemberPriority] =
        useState("0");

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [savingConfig, setSavingConfig] = useState(false);
    const [addingMember, setAddingMember] = useState(false);

    const [busyMemberId, setBusyMemberId] =
        useState<number | null>(null);

    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] =
        useState<string | null>(null);

    const [searchTerm, setSearchTerm] = useState("");

    const activeMembers = useMemo(
        () =>
            members.filter(
                (member) => member.status === "ACTIVE",
            ),
        [members],
    );

    const activeMemberCount = activeMembers.length;

    const activeMemberLimitReached =
        activeMemberCount >= MAX_ACTIVE_ROTATION_MEMBERS;

    const configurationVerified =
        isValidPlacementId(placementId) &&
        loadedPlacementId === placementId &&
        config?.placementId === placementId;

    const mutationBusy =
        savingConfig ||
        addingMember ||
        busyMemberId !== null;

    const filteredMembers = useMemo(() => {
        const normalizedSearch =
            searchTerm.trim().toLowerCase();

        const orderedMembers = [...members].sort(
            (first, second) =>
                first.priority - second.priority ||
                first.id - second.id,
        );

        if (!normalizedSearch) {
            return orderedMembers;
        }

        return orderedMembers.filter(
            (member) =>
                member.advertisementName
                    .toLowerCase()
                    .includes(normalizedSearch) ||
                String(member.advertisementId)
                    .includes(normalizedSearch) ||
                member.status
                    .toLowerCase()
                    .includes(normalizedSearch),
        );
    }, [members, searchTerm]);

    const loadAdvertisementPages = useCallback(
        async (): Promise<AdvertisementListItem[]> => {
            const firstResponse = await getAdvertisements({
                page: 1,
                pageSize: ADVERTISEMENT_PAGE_SIZE,
            });

            if (!Array.isArray(firstResponse.data)) {
                throw new Error(
                    "The server did not return a valid advertisement list.",
                );
            }

            const allAdvertisements = [
                ...firstResponse.data,
            ];

            let currentPage = 1;

            let hasMore =
                firstResponse.meta?.hasNext ??
                (
                    typeof firstResponse.meta?.totalPages ===
                        "number"
                        ? currentPage <
                        firstResponse.meta.totalPages
                        : firstResponse.data.length ===
                        ADVERTISEMENT_PAGE_SIZE
                );

            while (hasMore) {
                currentPage += 1;

                const response = await getAdvertisements({
                    page: currentPage,
                    pageSize: ADVERTISEMENT_PAGE_SIZE,
                });

                if (!Array.isArray(response.data)) {
                    throw new Error(
                        `The server returned an invalid advertisement list for page ${currentPage}.`,
                    );
                }

                allAdvertisements.push(...response.data);

                hasMore =
                    response.meta?.hasNext ??
                    (
                        typeof response.meta?.totalPages ===
                            "number"
                            ? currentPage <
                            response.meta.totalPages
                            : response.data.length ===
                            ADVERTISEMENT_PAGE_SIZE
                    );
            }

            return allAdvertisements;
        },
        [],
    );

    const loadRotationData = useCallback(
        async (
            showRefreshState = false,
        ): Promise<boolean> => {
            const requestId = ++loadRequestId.current;

            if (!isValidPlacementId(placementId)) {
                setLoadedPlacementId(null);
                setConfig(null);
                setMembers([]);
                setAdvertisementOptions([]);
                setError(
                    "A persisted placement is required before rotation can be configured.",
                );
                setLoading(false);
                setRefreshing(false);

                return false;
            }

            setLoadedPlacementId(null);

            try {
                if (showRefreshState) {
                    setRefreshing(true);
                } else {
                    setLoading(true);
                }

                setError(null);
                setSuccessMessage(null);

                const [
                    configResponse,
                    membersResponse,
                    loadedAdvertisements,
                ] = await Promise.all([
                    getAdvertisementRotationConfig(placementId),
                    getAdvertisementRotationMembers(placementId),
                    loadAdvertisementPages(),
                ]);

                if (requestId !== loadRequestId.current) {
                    return false;
                }

                const loadedConfig =
                    getResponseData(configResponse);

                const loadedMembers =
                    getResponseData(membersResponse);

                if (!loadedConfig) {
                    throw new Error(
                        "The server did not return the persisted rotation configuration.",
                    );
                }

                if (loadedConfig.placementId !== placementId) {
                    throw new Error(
                        "The returned rotation configuration does not belong to this advertisement's persisted placement.",
                    );
                }

                if (!Array.isArray(loadedMembers)) {
                    throw new Error(
                        "The server did not return the rotation member list.",
                    );
                }

                if (
                    loadedMembers.some(
                        (member) =>
                            member.placementId !== placementId,
                    )
                ) {
                    throw new Error(
                        "The rotation member list contains records belonging to a different placement. Refresh before continuing.",
                    );
                }

                setConfig(loadedConfig);
                setRotationEnabled(
                    loadedConfig.rotationEnabled,
                );
                setRotationIntervalSeconds(
                    String(
                        loadedConfig.rotationIntervalSeconds,
                    ),
                );
                setMembers(loadedMembers);

                setAdvertisementOptions(
                    loadedAdvertisements
                        .filter(
                            (item) =>
                                item.id !== advertisement.id &&
                                item.status === "ACTIVE" &&
                                item.workflowStatus === "APPROVED",
                        )
                        .map((item) => ({
                            id: item.id,
                            name: item.name,
                            status: item.status,
                            workflowStatus: item.workflowStatus,
                        })),
                );

                setLoadedPlacementId(placementId);

                return true;
            } catch (loadError) {
                if (requestId !== loadRequestId.current) {
                    return false;
                }

                console.error(
                    "Failed to load advertisement rotation data:",
                    loadError,
                );

                setLoadedPlacementId(null);
                setConfig(null);
                setMembers([]);
                setAdvertisementOptions([]);
                setError(getApiErrorMessage(loadError));

                return false;
            } finally {
                if (requestId === loadRequestId.current) {
                    setLoading(false);
                    setRefreshing(false);
                }
            }
        },
        [
            advertisement.id,
            loadAdvertisementPages,
            placementId,
        ],
    );

    useEffect(() => {
        const timerId = window.setTimeout(() => {
            void loadRotationData();
        }, 0);

        return () => {
            window.clearTimeout(timerId);
            loadRequestId.current += 1;
        };
    }, [loadRotationData]);

    const refreshAfterMutation = async (
        successText: string,
    ): Promise<void> => {
        const refreshed = await loadRotationData(true);

        let callbackFailed = false;

        if (onSaved) {
            try {
                await onSaved();
            } catch (callbackError) {
                callbackFailed = true;

                console.error(
                    "Rotation was saved, but the workspace refresh callback failed:",
                    callbackError,
                );
            }
        }

        if (!refreshed) {
            setSuccessMessage(null);
            setError(
                "The change was saved, but the latest persisted rotation state could not be verified. Use Refresh before making further changes.",
            );
            return;
        }

        setSuccessMessage(successText);

        if (callbackFailed) {
            setError(
                "The rotation change was saved and verified, but the workspace summary could not be refreshed. Refresh the workspace to update its summary.",
            );
        }
    };

    const handleSaveConfig = async (): Promise<void> => {
        if (
            !isValidPlacementId(placementId) ||
            !configurationVerified ||
            !config
        ) {
            setError(
                "The verified rotation configuration for this placement is unavailable. Refresh before making changes.",
            );
            return;
        }

        const parsedInterval =
            Number(rotationIntervalSeconds);

        if (
            !Number.isInteger(parsedInterval) ||
            parsedInterval <= 0
        ) {
            setError(
                "Rotation interval must be a positive whole number of seconds.",
            );
            return;
        }

        const payload: UpdateAdvertisementRotationConfigInput = {
            rotationEnabled,
            rotationMode: "TIME_BASED",
            rotationIntervalSeconds: parsedInterval,
            rotationStrategy: "ROUND_ROBIN",
        };

        try {
            setSavingConfig(true);
            setError(null);
            setSuccessMessage(null);

            const response =
                await updateAdvertisementRotationConfig(
                    placementId,
                    payload,
                );

            const updatedConfig =
                getResponseData(response);

            if (!updatedConfig) {
                throw new Error(
                    "The server did not return the updated rotation configuration.",
                );
            }

            if (updatedConfig.placementId !== placementId) {
                throw new Error(
                    "The updated rotation configuration belongs to a different placement. Refresh before continuing.",
                );
            }

            setConfig(updatedConfig);
            setRotationEnabled(
                updatedConfig.rotationEnabled,
            );
            setRotationIntervalSeconds(
                String(
                    updatedConfig.rotationIntervalSeconds,
                ),
            );

            await refreshAfterMutation(
                "Rotation configuration saved and verified successfully.",
            );
        } catch (saveError) {
            console.error(
                "Failed to save rotation configuration:",
                saveError,
            );

            setError(getApiErrorMessage(saveError));
        } finally {
            setSavingConfig(false);
        }
    };

    const handleAddMember = async (): Promise<void> => {
        if (
            !isValidPlacementId(placementId) ||
            !configurationVerified ||
            !config
        ) {
            setError(
                "The verified rotation configuration for this placement is unavailable. Refresh before making changes.",
            );
            return;
        }

        const parsedAdvertisementId =
            Number(selectedAdvertisementId);

        const parsedPriority =
            Number(newMemberPriority);

        if (
            !Number.isInteger(parsedAdvertisementId) ||
            parsedAdvertisementId <= 0
        ) {
            setError(
                "Select a valid advertisement to add to the rotation.",
            );
            return;
        }

        if (!isValidPriority(parsedPriority)) {
            setError(
                "Member priority must be a non-negative whole number.",
            );
            return;
        }

        if (activeMemberLimitReached) {
            setError(
                `This placement already has ${MAX_ACTIVE_ROTATION_MEMBERS} active rotation members. Deactivate an existing member before activating another.`,
            );
            return;
        }

        const selectedAdvertisement =
            advertisementOptions.find(
                (option) =>
                    option.id === parsedAdvertisementId,
            );

        if (
            !selectedAdvertisement ||
            selectedAdvertisement.status !== "ACTIVE" ||
            selectedAdvertisement.workflowStatus !== "APPROVED"
        ) {
            setError(
                "Select an active, approved advertisement from the available list.",
            );
            return;
        }

        if (
            members.some(
                (member) =>
                    member.advertisementId ===
                    parsedAdvertisementId,
            )
        ) {
            setError(
                "This advertisement is already listed as a rotation member. Update its existing membership instead.",
            );
            return;
        }

        if (
            activeMembers.some(
                (member) =>
                    member.priority === parsedPriority,
            )
        ) {
            setError(
                "Each active rotation member must have a unique priority. Choose an unused priority.",
            );
            return;
        }

        try {
            setAddingMember(true);
            setError(null);
            setSuccessMessage(null);

            const response =
                await addAdvertisementRotationMember(
                    placementId,
                    {
                        advertisementId:
                            parsedAdvertisementId,
                        priority: parsedPriority,
                        status: "ACTIVE",
                    },
                );

            const createdMember =
                getResponseData(response);

            if (!createdMember) {
                throw new Error(
                    "The server did not return the created rotation member.",
                );
            }

            if (
                createdMember.placementId !== placementId ||
                createdMember.advertisementId !==
                parsedAdvertisementId
            ) {
                throw new Error(
                    "The created rotation member does not match the requested placement and advertisement.",
                );
            }

            setSelectedAdvertisementId("");
            setNewMemberPriority("0");

            await refreshAfterMutation(
                "Rotation member added and verified successfully.",
            );
        } catch (addError) {
            console.error(
                "Failed to add rotation member:",
                addError,
            );

            setError(getApiErrorMessage(addError));
        } finally {
            setAddingMember(false);
        }
    };

    const handleUpdateMember = async (
        member: AdvertisementRotationMember,
        payload: {
            priority?: number;
            status?: AdvertisementRotationMemberStatus;
        },
    ): Promise<void> => {
        if (
            !isValidPlacementId(placementId) ||
            !configurationVerified ||
            !config ||
            member.placementId !== placementId
        ) {
            setError(
                "The verified rotation configuration for this placement is unavailable. Refresh before making changes.",
            );
            return;
        }

        const nextStatus =
            payload.status ?? member.status;

        const nextPriority =
            payload.priority ?? member.priority;

        const willBecomeActive =
            member.status !== "ACTIVE" &&
            nextStatus === "ACTIVE";

        if (
            willBecomeActive &&
            activeMemberCount >= MAX_ACTIVE_ROTATION_MEMBERS
        ) {
            setError(
                `The active-member limit is ${MAX_ACTIVE_ROTATION_MEMBERS}. Deactivate an existing member before activating this member.`,
            );
            return;
        }

        if (
            payload.priority !== undefined &&
            !isValidPriority(payload.priority)
        ) {
            setError(
                "Member priority must be a non-negative whole number.",
            );
            return;
        }

        if (
            nextStatus === "ACTIVE" &&
            activeMembers.some(
                (activeMember) =>
                    activeMember.id !== member.id &&
                    activeMember.priority === nextPriority,
            )
        ) {
            setError(
                "Each active rotation member must have a unique priority. Choose an unused priority.",
            );
            return;
        }

        if (
            nextStatus === "ACTIVE" &&
            (
                member.advertisementStatus !== "ACTIVE" ||
                member.advertisementWorkflowStatus !== "APPROVED"
            )
        ) {
            setError(
                "Only active, approved advertisements can be activated as rotation members.",
            );
            return;
        }

        try {
            setBusyMemberId(member.id);
            setError(null);
            setSuccessMessage(null);

            const response =
                await updateAdvertisementRotationMember(
                    placementId,
                    member.id,
                    payload,
                );

            const updatedMember =
                getResponseData(response);

            if (!updatedMember) {
                throw new Error(
                    "The server did not return the updated rotation member.",
                );
            }

            if (
                updatedMember.placementId !== placementId ||
                updatedMember.id !== member.id
            ) {
                throw new Error(
                    "The updated rotation member does not match the requested placement and member.",
                );
            }

            await refreshAfterMutation(
                payload.status !== undefined
                    ? `Rotation member ${payload.status === "ACTIVE" ? "activated" : "deactivated"} and verified successfully.`
                    : "Rotation member priority updated and verified successfully.",
            );
        } catch (updateError) {
            console.error(
                "Failed to update rotation member:",
                updateError,
            );

            setError(getApiErrorMessage(updateError));
        } finally {
            setBusyMemberId(null);
        }
    };

    const handleDeactivateMember = async (
        member: AdvertisementRotationMember,
    ): Promise<void> => {
        if (
            !isValidPlacementId(placementId) ||
            !configurationVerified ||
            !config ||
            member.placementId !== placementId
        ) {
            setError(
                "The verified rotation configuration for this placement is unavailable. Refresh before making changes.",
            );
            return;
        }

        try {
            setBusyMemberId(member.id);
            setError(null);
            setSuccessMessage(null);

            const response =
                await removeAdvertisementRotationMember(
                    placementId,
                    member.id,
                );

            const deactivatedMember =
                getResponseData(response);

            if (!deactivatedMember) {
                throw new Error(
                    "The server did not return the deactivated rotation member.",
                );
            }

            if (
                deactivatedMember.placementId !== placementId ||
                deactivatedMember.id !== member.id
            ) {
                throw new Error(
                    "The server returned a rotation member that does not match the requested placement and member.",
                );
            }

            await refreshAfterMutation(
                "Rotation member deactivated and verified successfully. Its record has been retained.",
            );
        } catch (removeError) {
            console.error(
                "Failed to deactivate rotation member:",
                removeError,
            );

            setError(getApiErrorMessage(removeError));
        } finally {
            setBusyMemberId(null);
        }
    };

    if (loading) {
        return (
            <Surface className="border border-gray-200 p-6">
                <div className="flex items-center gap-3">
                    <LoaderCircle
                        size={20}
                        className="animate-spin text-green-700"
                        aria-hidden="true"
                    />

                    <Typography
                        as="p"
                        variant="body"
                        className="text-sm text-gray-600"
                    >
                        Loading persisted rotation configuration...
                    </Typography>
                </div>
            </Surface>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            <WorkspaceCreativeRotation
                advertisementId={advertisement.id}
                canManage={canManage}
                onSaved={onSaved}
            />
            {!advertisement.placement && (
                <Notice
                    variant="warning"
                    message="This advertisement has no persisted placement. Configure its placement before managing rotation."
                />
            )}

            {error && (
                <Notice variant="error" message={error} />
            )}

            {successMessage && (
                <Notice
                    variant="success"
                    message={successMessage}
                />
            )}

            <Surface className="border border-gray-200 p-5 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-3">
                        <div className="rounded-lg bg-green-50 p-2.5">
                            <RotateCcw
                                size={21}
                                className="text-green-700"
                                aria-hidden="true"
                            />
                        </div>

                        <div className="min-w-0">
                            <Typography
                                as="h2"
                                variant="headline"
                                className="text-base font-semibold text-gray-900"
                            >
                                Rotation Configuration
                            </Typography>

                            <Typography
                                as="p"
                                variant="body"
                                className="mt-1 text-sm text-gray-600"
                            >
                                Configure how advertisements rotate within the
                                persisted placement. These settings are shared
                                by advertisements using that placement.
                            </Typography>

                            <Typography
                                as="p"
                                variant="body"
                                className="mt-2 text-xs text-gray-500"
                            >
                                Placement:{" "}
                                {advertisement.placement
                                    ? `${advertisement.placement.displayName} (#${advertisement.placement.id})`
                                    : "Not configured"}
                            </Typography>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => void loadRotationData(true)}
                        disabled={refreshing || mutationBusy}
                        className="
                            inline-flex min-h-10 items-center justify-center gap-2
                            rounded-md border border-gray-300 bg-white px-3 py-2
                            text-sm font-semibold text-gray-700 hover:bg-gray-50
                            disabled:cursor-not-allowed disabled:opacity-60
                            focus:outline-none focus:ring-2 focus:ring-green-600
                            focus:ring-offset-2
                        "
                    >
                        <RefreshCw
                            size={15}
                            className={refreshing ? "animate-spin" : ""}
                            aria-hidden="true"
                        />
                        Refresh
                    </button>
                </div>

                {!config || !configurationVerified ? (
                    <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4">
                        <div className="flex items-start gap-3">
                            <ShieldAlert
                                size={19}
                                className="mt-0.5 shrink-0 text-amber-700"
                                aria-hidden="true"
                            />

                            <div>
                                <p className="text-sm font-semibold text-amber-900">
                                    Rotation configuration unavailable
                                </p>

                                <p className="mt-1 text-sm text-amber-800">
                                    The saved configuration could not be
                                    verified for the current placement. Use
                                    Refresh to retry. This component will not
                                    silently create a configuration that the
                                    server has not returned.
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="rounded-lg border border-gray-200 p-4">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">
                                            Enable rotation
                                        </p>

                                        <p className="mt-1 text-xs leading-5 text-gray-500">
                                            Allow this placement to rotate
                                            through its active members.
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        role="switch"
                                        aria-checked={rotationEnabled}
                                        aria-label="Enable placement rotation"
                                        disabled={
                                            !canManage ||
                                            !configurationVerified ||
                                            mutationBusy ||
                                            refreshing
                                        }
                                        onClick={() =>
                                            setRotationEnabled(
                                                (current) => !current,
                                            )
                                        }
                                        className={`
                                            relative inline-flex h-6 w-11 shrink-0
                                            items-center rounded-full transition
                                            focus:outline-none focus:ring-2
                                            focus:ring-green-600 focus:ring-offset-2
                                            disabled:cursor-not-allowed disabled:opacity-60
                                            ${rotationEnabled
                                                ? "bg-green-600"
                                                : "bg-gray-300"
                                            }
                                        `}
                                    >
                                        <span
                                            className={`
                                                inline-block h-4 w-4 transform rounded-full
                                                bg-white shadow transition
                                                ${rotationEnabled
                                                    ? "translate-x-6"
                                                    : "translate-x-1"
                                                }
                                            `}
                                        />
                                    </button>
                                </div>

                                <div className="mt-3">
                                    <span
                                        className={`
                                            inline-flex rounded-full border px-2.5 py-1
                                            text-xs font-semibold
                                            ${rotationEnabled
                                                ? "border-green-200 bg-green-50 text-green-800"
                                                : "border-gray-200 bg-gray-100 text-gray-600"
                                            }
                                        `}
                                    >
                                        {rotationEnabled
                                            ? "Enabled"
                                            : "Disabled"}
                                    </span>
                                </div>
                            </div>

                            <div className="rounded-lg border border-gray-200 p-4">
                                <label
                                    htmlFor="rotation-interval"
                                    className="block text-sm font-semibold text-gray-900"
                                >
                                    Rotation interval (seconds)
                                </label>

                                <p className="mt-1 text-xs leading-5 text-gray-500">
                                    Time before the rotation advances to
                                    another eligible member.
                                </p>

                                <div className="mt-3 flex items-center gap-2">
                                    <Clock3
                                        size={17}
                                        className="shrink-0 text-gray-500"
                                        aria-hidden="true"
                                    />

                                    <input
                                        id="rotation-interval"
                                        type="number"
                                        min={1}
                                        step={1}
                                        inputMode="numeric"
                                        value={rotationIntervalSeconds}
                                        onChange={(event) =>
                                            setRotationIntervalSeconds(
                                                event.target.value,
                                            )
                                        }
                                        disabled={
                                            !canManage ||
                                            !configurationVerified ||
                                            mutationBusy ||
                                            refreshing
                                        }
                                        className="
                                            min-h-10 w-full rounded-md border
                                            border-gray-300 bg-white px-3 py-2
                                            text-sm text-gray-900
                                            focus:border-green-600 focus:outline-none
                                            focus:ring-2 focus:ring-green-600/20
                                            disabled:cursor-not-allowed
                                            disabled:bg-gray-100
                                        "
                                    />
                                </div>
                            </div>

                            <ReadOnlyField
                                label="Rotation mode"
                                value={formatStatus(config.rotationMode)}
                            />

                            <ReadOnlyField
                                label="Rotation strategy"
                                value={formatStatus(config.rotationStrategy)}
                            />
                        </div>

                        <div className="mt-5 rounded-lg border border-blue-200 bg-blue-50/70 p-4">
                            <div className="flex items-start gap-3">
                                <AlertCircle
                                    size={19}
                                    className="mt-0.5 shrink-0 text-blue-700"
                                    aria-hidden="true"
                                />

                                <div>
                                    <p className="text-sm font-semibold text-blue-900">
                                        Rotation policy
                                    </p>

                                    <p className="mt-1 text-sm leading-5 text-blue-800">
                                        Up to {MAX_ACTIVE_ROTATION_MEMBERS}{" "}
                                        active members are allowed per
                                        placement. Active member priorities
                                        must be unique. Member priority
                                        determines the stored ordering; it
                                        does not replace advertisement schedule
                                        priority. Deactivated members remain
                                        in the member history.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {!canManage && (
                            <p className="mt-4 text-sm text-amber-700">
                                Archived advertisements cannot change rotation
                                settings from this workspace.
                            </p>
                        )}

                        <div className="mt-5 flex justify-end">
                            <button
                                type="button"
                                onClick={() => void handleSaveConfig()}
                                disabled={
                                    !canManage ||
                                    !configurationVerified ||
                                    mutationBusy ||
                                    refreshing ||
                                    !isValidPlacementId(placementId)
                                }
                                className="
                                    inline-flex min-h-10 items-center justify-center
                                    gap-2 rounded-md bg-green-700 px-4 py-2
                                    text-sm font-semibold text-white
                                    hover:bg-green-800 disabled:cursor-not-allowed
                                    disabled:opacity-60 focus:outline-none
                                    focus:ring-2 focus:ring-green-600
                                    focus:ring-offset-2
                                "
                            >
                                {savingConfig ? (
                                    <LoaderCircle
                                        size={16}
                                        className="animate-spin"
                                        aria-hidden="true"
                                    />
                                ) : (
                                    <Save
                                        size={16}
                                        aria-hidden="true"
                                    />
                                )}

                                Save Rotation Settings
                            </button>
                        </div>
                    </>
                )}
            </Surface>

            <Surface className="border border-gray-200 p-5 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-3">
                        <div className="rounded-lg bg-green-50 p-2.5">
                            <Users
                                size={21}
                                className="text-green-700"
                                aria-hidden="true"
                            />
                        </div>

                        <div>
                            <Typography
                                as="h2"
                                variant="headline"
                                className="text-base font-semibold text-gray-900"
                            >
                                Rotation Members
                            </Typography>

                            <Typography
                                as="p"
                                variant="body"
                                className="mt-1 text-sm text-gray-600"
                            >
                                Manage the advertisements assigned to this
                                placement's rotation.
                            </Typography>
                        </div>
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-center">
                        <p className="text-xl font-bold tabular-nums text-gray-900">
                            {activeMemberCount}/{MAX_ACTIVE_ROTATION_MEMBERS}
                        </p>

                        <p className="mt-0.5 text-xs font-medium text-gray-500">
                            Active members
                        </p>
                    </div>
                </div>

                {activeMemberLimitReached && (
                    <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4">
                        <div className="flex items-start gap-3">
                            <AlertCircle
                                size={19}
                                className="mt-0.5 shrink-0 text-amber-700"
                                aria-hidden="true"
                            />

                            <div>
                                <p className="text-sm font-semibold text-amber-900">
                                    Active-member limit reached
                                </p>

                                <p className="mt-1 text-sm leading-5 text-amber-800">
                                    This placement already has at least{" "}
                                    {MAX_ACTIVE_ROTATION_MEMBERS} active
                                    members. You can still edit priorities
                                    and deactivate existing members, but
                                    cannot add or reactivate members until
                                    the active count is below the limit.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="mt-6 rounded-lg border border-gray-200 p-4">
                    <h3 className="text-sm font-semibold text-gray-900">
                        Add a rotation member
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-gray-500">
                        Only active, approved advertisements are offered.
                        The API must also validate placement compatibility
                        and eligibility.
                    </p>

                    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_140px_auto] md:items-end">
                        <div>
                            <label
                                htmlFor="rotation-advertisement"
                                className="mb-1.5 block text-sm font-medium text-gray-700"
                            >
                                Advertisement
                            </label>

                            <select
                                id="rotation-advertisement"
                                value={selectedAdvertisementId}
                                onChange={(event) =>
                                    setSelectedAdvertisementId(
                                        event.target.value,
                                    )
                                }
                                disabled={
                                    !canManage ||
                                    !configurationVerified ||
                                    mutationBusy ||
                                    refreshing ||
                                    activeMemberLimitReached ||
                                    !isValidPlacementId(placementId)
                                }
                                className="
                                    min-h-10 w-full rounded-md border
                                    border-gray-300 bg-white px-3 py-2
                                    text-sm text-gray-900
                                    focus:border-green-600 focus:outline-none
                                    focus:ring-2 focus:ring-green-600/20
                                    disabled:cursor-not-allowed
                                    disabled:bg-gray-100
                                "
                            >
                                <option value="">
                                    Select advertisement
                                </option>

                                {advertisementOptions
                                    .filter(
                                        (option) =>
                                            !members.some(
                                                (member) =>
                                                    member.advertisementId ===
                                                    option.id,
                                            ),
                                    )
                                    .map((option) => (
                                        <option
                                            key={option.id}
                                            value={String(option.id)}
                                        >
                                            {option.name} (#{option.id}) —{" "}
                                            {formatStatus(
                                                option.workflowStatus,
                                            )}
                                        </option>
                                    ))}
                            </select>

                            {advertisementOptions.length === 0 && (
                                <p className="mt-1.5 text-xs text-gray-500">
                                    No other active, approved advertisements
                                    were returned by the advertisement list
                                    endpoint.
                                </p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="rotation-member-priority"
                                className="mb-1.5 block text-sm font-medium text-gray-700"
                            >
                                Member priority
                            </label>

                            <input
                                id="rotation-member-priority"
                                type="number"
                                min={0}
                                step={1}
                                inputMode="numeric"
                                value={newMemberPriority}
                                onChange={(event) =>
                                    setNewMemberPriority(
                                        event.target.value,
                                    )
                                }
                                disabled={
                                    !canManage ||
                                    !configurationVerified ||
                                    mutationBusy ||
                                    refreshing ||
                                    activeMemberLimitReached
                                }
                                className="
                                    min-h-10 w-full rounded-md border
                                    border-gray-300 bg-white px-3 py-2
                                    text-sm text-gray-900
                                    focus:border-green-600 focus:outline-none
                                    focus:ring-2 focus:ring-green-600/20
                                    disabled:cursor-not-allowed
                                    disabled:bg-gray-100
                                "
                            />
                        </div>

                        <button
                            type="button"
                            onClick={() => void handleAddMember()}
                            disabled={
                                !canManage ||
                                !configurationVerified ||
                                mutationBusy ||
                                refreshing ||
                                activeMemberLimitReached ||
                                !isValidPlacementId(placementId) ||
                                !selectedAdvertisementId
                            }
                            className="
                                inline-flex min-h-10 items-center justify-center
                                gap-2 rounded-md bg-green-700 px-4 py-2
                                text-sm font-semibold text-white
                                hover:bg-green-800 disabled:cursor-not-allowed
                                disabled:opacity-60 focus:outline-none
                                focus:ring-2 focus:ring-green-600
                                focus:ring-offset-2
                            "
                        >
                            {addingMember ? (
                                <LoaderCircle
                                    size={16}
                                    className="animate-spin"
                                    aria-hidden="true"
                                />
                            ) : (
                                <Plus
                                    size={16}
                                    aria-hidden="true"
                                />
                            )}

                            Add Member
                        </button>
                    </div>
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900">
                            Saved members
                        </h3>

                        <p className="mt-1 text-xs text-gray-500">
                            {members.length} record
                            {members.length === 1 ? "" : "s"} ·{" "}
                            {activeMemberCount} active ·{" "}
                            {members.length - activeMemberCount} inactive
                        </p>
                    </div>

                    <div>
                        <label
                            htmlFor="rotation-member-search"
                            className="sr-only"
                        >
                            Search rotation members
                        </label>

                        <input
                            id="rotation-member-search"
                            type="search"
                            value={searchTerm}
                            onChange={(event) =>
                                setSearchTerm(event.target.value)
                            }
                            placeholder="Search members..."
                            className="
                                min-h-10 w-full rounded-md border
                                border-gray-300 bg-white px-3 py-2
                                text-sm text-gray-900
                                placeholder:text-gray-400
                                focus:border-green-600 focus:outline-none
                                focus:ring-2 focus:ring-green-600/20
                                sm:w-64
                            "
                        />
                    </div>
                </div>

                {members.length === 0 ? (
                    <div className="mt-4 rounded-lg border border-dashed border-gray-300 px-4 py-10 text-center">
                        <Users
                            size={28}
                            className="mx-auto text-gray-400"
                            aria-hidden="true"
                        />

                        <p className="mt-3 text-sm font-semibold text-gray-800">
                            No rotation members
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                            Add an eligible advertisement to begin configuring
                            this placement's rotation.
                        </p>
                    </div>
                ) : filteredMembers.length === 0 ? (
                    <div className="mt-4 rounded-lg border border-gray-200 px-4 py-8 text-center">
                        <p className="text-sm text-gray-600">
                            No rotation members match your search.
                        </p>
                    </div>
                ) : (
                    <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200">
                        <table className="w-full min-w-[760px] border-collapse text-left">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Advertisement
                                    </th>

                                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Workflow
                                    </th>

                                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Member priority
                                    </th>

                                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Membership
                                    </th>

                                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100 bg-white">
                                {filteredMembers.map((member) => {
                                    const memberBusy =
                                        busyMemberId === member.id;

                                    const canActivate =
                                        member.status !== "ACTIVE" &&
                                        activeMemberCount <
                                        MAX_ACTIVE_ROTATION_MEMBERS &&
                                        member.advertisementStatus ===
                                        "ACTIVE" &&
                                        member.advertisementWorkflowStatus ===
                                        "APPROVED";

                                    return (
                                        <tr key={member.id}>
                                            <td className="px-4 py-4 align-top">
                                                <p className="max-w-xs break-words text-sm font-semibold text-gray-900">
                                                    {member.advertisementName}
                                                </p>

                                                <p className="mt-1 text-xs text-gray-500">
                                                    Advertisement #{member.advertisementId}
                                                </p>

                                                <p className="mt-1 text-xs text-gray-500">
                                                    Ad status:{" "}
                                                    {formatStatus(
                                                        member.advertisementStatus,
                                                    )}
                                                </p>
                                            </td>

                                            <td className="px-4 py-4 align-top">
                                                <span className="inline-flex rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-700">
                                                    {formatStatus(
                                                        member.advertisementWorkflowStatus,
                                                    )}
                                                </span>
                                            </td>

                                            <td className="px-4 py-4 align-top">
                                                <label
                                                    htmlFor={`rotation-priority-${member.id}`}
                                                    className="sr-only"
                                                >
                                                    Priority for{" "}
                                                    {member.advertisementName}
                                                </label>

                                                <input
                                                    id={`rotation-priority-${member.id}`}
                                                    type="number"
                                                    min={0}
                                                    step={1}
                                                    inputMode="numeric"
                                                    defaultValue={String(
                                                        member.priority,
                                                    )}
                                                    key={`${member.id}-${member.priority}`}
                                                    disabled={
                                                        !canManage ||
                                                        !configurationVerified ||
                                                        mutationBusy ||
                                                        refreshing
                                                    }
                                                    onBlur={(event) => {
                                                        const input =
                                                            event.currentTarget;

                                                        const parsedPriority =
                                                            Number(
                                                                input.value,
                                                            );

                                                        if (
                                                            !isValidPriority(
                                                                parsedPriority,
                                                            )
                                                        ) {
                                                            setError(
                                                                "Member priority must be a non-negative whole number.",
                                                            );

                                                            input.value =
                                                                String(
                                                                    member.priority,
                                                                );

                                                            return;
                                                        }

                                                        if (
                                                            parsedPriority ===
                                                            member.priority
                                                        ) {
                                                            return;
                                                        }

                                                        if (
                                                            activeMembers.some(
                                                                (activeMember) =>
                                                                    activeMember.id !==
                                                                    member.id &&
                                                                    activeMember.priority ===
                                                                    parsedPriority,
                                                            ) &&
                                                            member.status ===
                                                            "ACTIVE"
                                                        ) {
                                                            setError(
                                                                "Each active rotation member must have a unique priority. Choose an unused priority.",
                                                            );

                                                            input.value =
                                                                String(
                                                                    member.priority,
                                                                );

                                                            return;
                                                        }

                                                        void handleUpdateMember(
                                                            member,
                                                            {
                                                                priority:
                                                                    parsedPriority,
                                                            },
                                                        );
                                                    }}
                                                    className="
                                                        min-h-9 w-24 rounded-md
                                                        border border-gray-300
                                                        px-2.5 py-1.5 text-sm
                                                        text-gray-900
                                                        focus:border-green-600
                                                        focus:outline-none
                                                        focus:ring-2
                                                        focus:ring-green-600/20
                                                        disabled:cursor-not-allowed
                                                        disabled:bg-gray-100
                                                    "
                                                />
                                            </td>

                                            <td className="px-4 py-4 align-top">
                                                <span
                                                    className={`
                                                        inline-flex rounded-full
                                                        border px-2.5 py-1
                                                        text-xs font-semibold
                                                        ${getMemberStatusClass(member.status)}
                                                    `}
                                                >
                                                    {formatStatus(member.status)}
                                                </span>
                                            </td>

                                            <td className="px-4 py-4 text-right align-top">
                                                {memberBusy ? (
                                                    <span className="inline-flex items-center gap-2 text-xs text-gray-500">
                                                        <LoaderCircle
                                                            size={15}
                                                            className="animate-spin"
                                                            aria-hidden="true"
                                                        />
                                                        Saving
                                                    </span>
                                                ) : member.status ===
                                                    "ACTIVE" ? (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            void handleDeactivateMember(
                                                                member,
                                                            )
                                                        }
                                                        disabled={
                                                            !canManage ||
                                                            !configurationVerified ||
                                                            mutationBusy ||
                                                            refreshing
                                                        }
                                                        className="
                                                            inline-flex min-h-9 items-center
                                                            justify-center gap-1.5 rounded-md
                                                            border border-red-200 bg-white
                                                            px-3 py-1.5 text-xs font-semibold
                                                            text-red-700 hover:bg-red-50
                                                            disabled:cursor-not-allowed
                                                            disabled:opacity-50
                                                            focus:outline-none focus:ring-2
                                                            focus:ring-red-500
                                                            focus:ring-offset-2
                                                        "
                                                    >
                                                        <XCircle
                                                            size={14}
                                                            aria-hidden="true"
                                                        />
                                                        Deactivate
                                                    </button>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            void handleUpdateMember(
                                                                member,
                                                                {
                                                                    status: "ACTIVE",
                                                                },
                                                            )
                                                        }
                                                        disabled={
                                                            !canManage ||
                                                            !configurationVerified ||
                                                            mutationBusy ||
                                                            refreshing ||
                                                            !canActivate
                                                        }
                                                        title={
                                                            member.advertisementStatus !==
                                                                "ACTIVE" ||
                                                                member.advertisementWorkflowStatus !==
                                                                "APPROVED"
                                                                ? "Only active, approved advertisements can be activated."
                                                                : !canActivate
                                                                    ? "Deactivate another member before activating this one."
                                                                    : undefined
                                                        }
                                                        className="
                                                            inline-flex min-h-9 items-center
                                                            justify-center gap-1.5 rounded-md
                                                            border border-green-200 bg-white
                                                            px-3 py-1.5 text-xs font-semibold
                                                            text-green-700 hover:bg-green-50
                                                            disabled:cursor-not-allowed
                                                            disabled:opacity-50
                                                            focus:outline-none focus:ring-2
                                                            focus:ring-green-600
                                                            focus:ring-offset-2
                                                        "
                                                    >
                                                        <CheckCircle2
                                                            size={14}
                                                            aria-hidden="true"
                                                        />
                                                        Activate
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                <p className="mt-4 text-xs leading-5 text-gray-500">
                    Deactivating a member retains its record. Priority changes
                    are saved when you leave the priority field. Active member
                    priorities must be unique. The backend remains responsible
                    for validating placement compatibility, permissions,
                    eligibility, and rotation limits.
                </p>
            </Surface>
        </div>
    );
};

const ReadOnlyField = ({
    label,
    value,
}: {
    label: string;
    value: string;
}) => (
    <div className="rounded-lg border border-gray-200 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            {label}
        </p>

        <p className="mt-2 text-sm font-semibold text-gray-900">
            {value}
        </p>
    </div>
);

const Notice = ({
    variant,
    message,
}: {
    variant: "error" | "warning" | "success";
    message: string;
}) => {
    const styles = {
        error: {
            container: "border-red-200 bg-red-50",
            icon: "text-red-700",
            text: "text-red-800",
        },
        warning: {
            container: "border-amber-200 bg-amber-50",
            icon: "text-amber-700",
            text: "text-amber-800",
        },
        success: {
            container: "border-green-200 bg-green-50",
            icon: "text-green-700",
            text: "text-green-800",
        },
    }[variant];

    const Icon =
        variant === "success"
            ? CheckCircle2
            : AlertCircle;

    return (
        <div
            className={`rounded-lg border p-4 ${styles.container}`}
            role={variant === "error" ? "alert" : "status"}
        >
            <div className="flex items-start gap-3">
                <Icon
                    size={19}
                    className={`mt-0.5 shrink-0 ${styles.icon}`}
                    aria-hidden="true"
                />

                <p className={`text-sm leading-5 ${styles.text}`}>
                    {message}
                </p>
            </div>
        </div>
    );
};

export default WorkspaceRotation;
