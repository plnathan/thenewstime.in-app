import { getApiErrorMessage } from "@/utils/apiError";
import {
    AlertCircle,
    ArrowLeft,
    Pencil,
    RefreshCw,
} from "lucide-react";

import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import {
    Link,
    useNavigate,
    useParams,
    useSearchParams,
} from "react-router-dom";

import {
    getAdvertisementById,
    getAdvertisementCreatives,
    getAdvertisementFinancialApprovals,
    getAdvertisementPayments,
    getAdvertisementRotationConfig,
    getAdvertisementRotationMembers,
    getAdvertisementTargets,
    submitAdvertisement,
    approveAdvertisement,
    activateAdvertisement,
} from "@/api/advertisements/advertisement.api";

import type {
    AdvertisementDetails,
    AdvertisementTarget,
    AdvertisementFinancialApproval,
    AdvertisementPayment,
    AdvertisementPaymentSummary,
    AdvertisementRotationConfig,
    AdvertisementRotationMember,
    AdvertisementWorkflowStatus,
} from "@/api/advertisements/advertisement.api";

import {
    getAdvertisementCreativePreviews,
} from "@/api/advertisements/creatives.api";

import type {
    AdvertisementCreative,
    AdvertisementCreativePreviewResponse,
} from "@/api/advertisements/creatives.api";

import AdvertisementStatusBadge from "@/components/advertisements/Advertisement/AdvertisementStatusBadge/AdvertisementStatusBadge";

import AdvertisementWorkspaceNavigation from "@/components/advertisements/Advertisement/AdvertisementWorkspace/Workspace/WorkspaceNavigation";

import AdvertisementWorkspaceOverview from "@/components/advertisements/Advertisement/AdvertisementWorkspace/Workspace/WorkspaceOverview";

import WorkspaceClient from "@/components/advertisements/Advertisement/AdvertisementWorkspace/Workspace/WorkspaceClient";

import WorkspaceDetails from "@/components/advertisements/Advertisement/AdvertisementWorkspace/Workspace/WorkspaceDetails";

import WorkspacePlacement from "@/components/advertisements/Advertisement/AdvertisementWorkspace/Workspace/WorkspacePlacement";

import WorkspacePlacementRules from "@/components/advertisements/Advertisement/AdvertisementWorkspace/Workspace/WorkspacePlacementRules";

import WorkspaceRotation from "@/components/advertisements/Advertisement/AdvertisementWorkspace/Workspace/WorkspaceRotation";

import WorkspacePricing from "@/components/advertisements/Advertisement/AdvertisementWorkspace/Workspace/WorkspacePricing";

import AdvertisementWorkspaceSectionPlaceholder from "@/components/advertisements/Advertisement/AdvertisementWorkspace/Workspace/WorkspaceSectionPlaceholder";

import AdvertisementWorkspaceSummary from "@/components/advertisements/Advertisement/AdvertisementWorkspace/Workspace/WorkspaceSummaryCards";


import WorkspaceCreative from "@/components/advertisements/Advertisement/AdvertisementWorkspace/Workspace/WorkspaceCreative";

import WorkspaceSchedule from "@/components/advertisements/Advertisement/AdvertisementWorkspace/Workspace/WorkspaceSchedule";

import WorkspaceTargeting from "@/components/advertisements/Advertisement/AdvertisementWorkspace/Workspace/WorkspaceTargeting";

import WorkspacePayments from "@/components/advertisements/Advertisement/AdvertisementWorkspace/Workspace/WorkspacePayments";

import WorkspaceFinancialApproval from "@/components/advertisements/Advertisement/AdvertisementWorkspace/Workspace/WorkspaceFinancialApproval";

import WorkspaceDelivery from "@/components/advertisements/Advertisement/AdvertisementWorkspace/Workspace/WorkspaceDelivery";

import WorkspaceTracking from "@/components/advertisements/Advertisement/AdvertisementWorkspace/Workspace/WorkspaceTracking";




import MainLayout from "@/layouts/MainLayout";

import Typography from "@/components/ui/Typography";

import {
    buildReadiness,
} from "@/helpers/advertisementWorkspace.helpers";

// import {
//     getApiErrorMessage,
// } from "@/helpers/advertisementManagement.helpers";

import type {
    ReadinessItem,
    WorkspaceSection,
} from "@/types/advertisementWorkspace.types";

import type {
    PaymentReadinessSnapshot,
} from "@/components/advertisements/Advertisement/AdvertisementWorkspace/Workspace/WorkspacePayments";

import { getAdvertisementSchedules } from "@/api/advertisements/schedules.api";
import type { AdvertisementSchedule } from "@/api/advertisements/schedules.api";

const WORKFLOW_STATUSES: readonly AdvertisementWorkflowStatus[] = [
    "DRAFT",
    "SUBMITTED",
    "APPROVED",
    "REJECTED",
    "ON_HOLD",
    "ARCHIVED",
];

type VerificationStatus =
    | "LOADING"
    | "VERIFIED"
    | "ERROR";

const FINANCIAL_APPROVAL_READINESS_LABEL = "Financial Approval";

const normalizeWorkflowStatus = (
    status: string | null | undefined,
): AdvertisementWorkflowStatus => {
    if (
        status &&
        WORKFLOW_STATUSES.includes(
            status as AdvertisementWorkflowStatus,
        )
    ) {
        return status as AdvertisementWorkflowStatus;
    }

    return "DRAFT";
};

const AdvertisementWorkspacePage = () => {
    const paymentRequestIdRef = useRef(0);
    const financialApprovalRequestIdRef = useRef(0);

    const { id } = useParams();
    const navigate = useNavigate();

    const [searchParams] = useSearchParams();

    const activationSectionRef =
        useRef<HTMLElement | null>(null);

    const shouldFocusActivation =
        searchParams.get("action") === "activate";

    const advertisementId = Number(id);

    const advertisementRequestIdRef = useRef(0);
    const scheduleRequestIdRef = useRef(0);
    const rotationRequestIdRef = useRef(0);
    const creativeRequestIdRef = useRef(0);
    const targetingRequestIdRef = useRef(0);

    const [
        paymentSummary,
        setPaymentSummary,
    ] = useState<AdvertisementPaymentSummary | null>(null);

    const [
        advertisement,
        setAdvertisement,
    ] = useState<AdvertisementDetails | null>(null);

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        refreshing,
        setRefreshing,
    ] = useState(false);

    const [
        error,
        setError,
    ] = useState<string | null>(null);

    const [
        activeSection,
        setActiveSection,
    ] = useState<WorkspaceSection>("overview");

    const [
        rotationConfig,
        setRotationConfig,
    ] = useState<AdvertisementRotationConfig | null>(null);

    const [
        rotationMembers,
        setRotationMembers,
    ] = useState<AdvertisementRotationMember[] | null>(null);

    const [
        rotationVerificationStatus,
        setRotationVerificationStatus,
    ] = useState<VerificationStatus>("LOADING");

    const [
        persistedCreatives,
        setPersistedCreatives,
    ] = useState<AdvertisementCreative[] | null>(null);

    const [
        creativePreviews,
        setCreativePreviews,
    ] = useState<AdvertisementCreativePreviewResponse | null>(null);

    const [
        creativeVerificationStatus,
        setCreativeVerificationStatus,
    ] = useState<VerificationStatus>("LOADING");

    const [persistedTargets, setPersistedTargets] = useState<AdvertisementTarget[] | null>(null);
    const [targetingVerificationStatus, setTargetingVerificationStatus] = useState<VerificationStatus>("LOADING");

    const [
        rotationLoading,
        setRotationLoading,
    ] = useState(false);

    const [
        creativesLoading,
        setCreativesLoading,
    ] = useState(false);

    const [
        submitting,
        setSubmitting,
    ] = useState(false);

    const [
        submitError,
        setSubmitError,
    ] = useState<string | null>(null);

    const [
        submitSuccess,
        setSubmitSuccess,
    ] = useState<string | null>(null);

    const [
        paymentRecords,
        setPaymentRecords,
    ] = useState<AdvertisementPayment[] | null>(null);

    const [
        paymentVerificationStatus,
        setPaymentVerificationStatus,
    ] = useState<VerificationStatus>("LOADING");

    const [
        financialApprovals,
        setFinancialApprovals,
    ] = useState<AdvertisementFinancialApproval[] | null>(null);

    const [
        financialApprovalVerificationStatus,
        setFinancialApprovalVerificationStatus,
    ] = useState<VerificationStatus>("LOADING");

    const [persistedSchedules, setPersistedSchedules] = useState<AdvertisementSchedule[] | null>(null);
    const [scheduleVerificationStatus, setScheduleVerificationStatus] = useState<VerificationStatus>("LOADING");

    const [approving, setApproving] = useState(false);
    const [approveError, setApproveError] = useState<string | null>(null);
    const [approveSuccess, setApproveSuccess] = useState<string | null>(null);

    const [activating, setActivating] = useState(false);
    const [activationRemarks, setActivationRemarks] = useState("");
    const [activationError, setActivationError] = useState<string | null>(null);
    const [activationSuccess, setActivationSuccess] = useState<string | null>(null);

    /**
     * Load the advertisement and protect against stale responses.
     *
     * Placement is supplied by the persisted advertisement response.
     * When that response succeeds, its placement association can be
     * evaluated independently of Creative preview verification.
     */
    const loadAdvertisement = useCallback(
        async (
            showRefreshState = false,
        ): Promise<void> => {
            const requestId =
                ++advertisementRequestIdRef.current;

            if (
                !Number.isInteger(advertisementId) ||
                advertisementId <= 0
            ) {
                setError("The advertisement ID is invalid.");
                setAdvertisement(null);
                setLoading(false);
                setRefreshing(false);
                return;
            }

            if (showRefreshState) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError(null);

            try {
                const response = await getAdvertisementById(
                    advertisementId,
                );

                if (requestId !== advertisementRequestIdRef.current) {
                    return;
                }

                if (!response.data) {
                    throw new Error(
                        "Advertisement data was not returned by the server.",
                    );
                }

                setAdvertisement(response.data);
                setError(null);
            } catch (loadError) {
                if (requestId !== advertisementRequestIdRef.current) {
                    return;
                }

                console.error(
                    "Failed to load advertisement:",
                    loadError,
                );

                setAdvertisement(null);
                setError(getApiErrorMessage(loadError));
            } finally {
                if (requestId === advertisementRequestIdRef.current) {
                    setLoading(false);
                    setRefreshing(false);
                }
            }
        },
        [advertisementId],
    );

    const loadScheduleData = useCallback(async (): Promise<void> => {
        const requestId = ++scheduleRequestIdRef.current;
        if (!Number.isInteger(advertisementId) || advertisementId <= 0) {
            setPersistedSchedules([]);
            setScheduleVerificationStatus("ERROR");
            return;
        }
        setScheduleVerificationStatus("LOADING");
        try {
            const schedules = await getAdvertisementSchedules({ advertisementId });
            if (requestId !== scheduleRequestIdRef.current) return;
            setPersistedSchedules(schedules);
            setScheduleVerificationStatus("VERIFIED");
        } catch (scheduleError) {
            if (requestId !== scheduleRequestIdRef.current) return;
            console.error("Failed to verify persisted advertisement schedules:", scheduleError);
            setPersistedSchedules([]);
            setScheduleVerificationStatus("ERROR");
        }
    }, [advertisementId]);

    useEffect(() => {
        const timerId = window.setTimeout(() => {
            void loadAdvertisement();
            void loadScheduleData();
        }, 0);

        return () => {
            window.clearTimeout(timerId);
            advertisementRequestIdRef.current += 1;
            scheduleRequestIdRef.current += 1;
        };
    }, [loadAdvertisement, loadScheduleData]);

    useEffect(() => {
        if (!shouldFocusActivation || loading || !advertisement) {
            return;
        }

        const currentWorkflowStatus = normalizeWorkflowStatus(
            advertisement.workflowStatus,
        );

        if (
            currentWorkflowStatus !== "APPROVED" ||
            advertisement.status === "ACTIVE" ||
            advertisement.status === "ARCHIVED"
        ) {
            return;
        }

        const section = activationSectionRef.current;

        if (!section) {
            return;
        }

        section.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });

        section
            .querySelector<HTMLElement>(
                "#advertisement-activation-heading",
            )
            ?.focus({ preventScroll: true });
    }, [advertisement, loading, shouldFocusActivation]);

    /**
     * Load persisted rotation configuration and member records.
     *
     * A configuration and its members are verified together. The
     * response is rejected if the configuration or any returned member
     * belongs to another placement.
     */
    const loadRotationData = useCallback(
        async (
            placementId: number | null,
        ): Promise<void> => {
            const requestId = ++rotationRequestIdRef.current;

            setRotationConfig(null);
            setRotationMembers(null);
            setRotationVerificationStatus("LOADING");

            if (
                placementId === null ||
                !Number.isInteger(placementId) ||
                placementId <= 0
            ) {
                setRotationVerificationStatus("ERROR");
                setRotationLoading(false);
                return;
            }

            setRotationLoading(true);

            try {
                const [
                    configResponse,
                    membersResponse,
                ] = await Promise.all([
                    getAdvertisementRotationConfig(placementId),
                    getAdvertisementRotationMembers(placementId),
                ]);

                if (requestId !== rotationRequestIdRef.current) {
                    return;
                }

                if (
                    !configResponse.data ||
                    !membersResponse.data
                ) {
                    throw new Error(
                        "Rotation configuration or members were not returned by the server.",
                    );
                }

                const config = configResponse.data;
                const members = membersResponse.data;

                if (config.placementId !== placementId) {
                    throw new Error(
                        "The returned rotation configuration does not match the selected placement.",
                    );
                }

                if (
                    members.some(
                        (member) => member.placementId !== placementId,
                    )
                ) {
                    throw new Error(
                        "One or more rotation members do not belong to the selected placement.",
                    );
                }

                setRotationConfig(config);

                setRotationMembers(
                    [...members].sort(
                        (first, second) =>
                            first.priority - second.priority,
                    ),
                );

                setRotationVerificationStatus("VERIFIED");
            } catch (loadError) {
                if (requestId !== rotationRequestIdRef.current) {
                    return;
                }

                console.error(
                    "Failed to load advertisement rotation data:",
                    loadError,
                );

                setRotationConfig(null);
                setRotationMembers(null);
                setRotationVerificationStatus("ERROR");
            } finally {
                if (requestId === rotationRequestIdRef.current) {
                    setRotationLoading(false);
                }
            }
        },
        [],
    );

    /**
     * Load approved Credit Exception records used by Pricing readiness.
     *
     * Credit coverage is not a payment. The records are verified
     * independently of the actual payment history and summary.
     */
    const loadFinancialApprovalReadiness = useCallback(
        async (): Promise<void> => {
            const requestId =
                ++financialApprovalRequestIdRef.current;

            setFinancialApprovals(null);
            setFinancialApprovalVerificationStatus("LOADING");

            if (
                !Number.isInteger(advertisementId) ||
                advertisementId <= 0
            ) {
                setFinancialApprovalVerificationStatus("ERROR");
                return;
            }

            try {
                const response = await getAdvertisementFinancialApprovals({
                    advertisementId,
                    page: 1,
                    pageSize: 100,
                });

                if (
                    requestId !== financialApprovalRequestIdRef.current
                ) {
                    return;
                }

                if (
                    !response.success ||
                    !Array.isArray(response.data)
                ) {
                    throw new Error(
                        response.message ||
                        "Financial approval records were not returned by the server.",
                    );
                }

                setFinancialApprovals(response.data);
                setFinancialApprovalVerificationStatus("VERIFIED");
            } catch (loadError) {
                if (
                    requestId !== financialApprovalRequestIdRef.current
                ) {
                    return;
                }

                console.error(
                    "Failed to load financial approval readiness data:",
                    loadError,
                );

                setFinancialApprovals(null);
                setFinancialApprovalVerificationStatus("ERROR");
            }
        },
        [advertisementId],
    );

    useEffect(() => {
        const timerId = window.setTimeout(() => {
            void loadFinancialApprovalReadiness();
        }, 0);

        return () => {
            window.clearTimeout(timerId);
            financialApprovalRequestIdRef.current += 1;
        };
    }, [loadFinancialApprovalReadiness]);

    /**
     * Load payment history independently of the Payments section UI.
     *
     * This loader verifies the records endpoint. The authoritative
     * payment summary is supplied by the persistently mounted
     * WorkspacePayments component through handlePaymentDataChanged.
     *
     * Do not construct a summary from payment records: the backend
     * summary is authoritative for the outstanding balance.
     */
    const loadPaymentReadiness = useCallback(
        async (): Promise<void> => {
            const requestId = ++paymentRequestIdRef.current;

            setPaymentRecords(null);
            setPaymentVerificationStatus("LOADING");

            if (
                !Number.isInteger(advertisementId) ||
                advertisementId <= 0
            ) {
                setPaymentVerificationStatus("ERROR");
                return;
            }

            try {
                const response = await getAdvertisementPayments(
                    advertisementId,
                );

                if (requestId !== paymentRequestIdRef.current) {
                    return;
                }

                if (!Array.isArray(response.data)) {
                    throw new Error(
                        "Payment records were not returned by the server.",
                    );
                }

                setPaymentRecords(response.data);

                /*
                 * Do not mark payment readiness VERIFIED here.
                 * This endpoint supplies payment records only; it does
                 * not establish that the backend summary is available.
                 * WorkspacePayments reports the verified combined
                 * snapshot when its initial load completes.
                 */
                setPaymentVerificationStatus(
                    paymentSummary === null ? "LOADING" : "VERIFIED",
                );
            } catch (loadError) {
                if (requestId !== paymentRequestIdRef.current) {
                    return;
                }

                console.error(
                    "Failed to load advertisement payment readiness data:",
                    loadError,
                );

                setPaymentRecords(null);
                setPaymentVerificationStatus("ERROR");
            }
        },
        [advertisementId, paymentSummary],
    );

    useEffect(() => {
        const timerId = window.setTimeout(() => {
            void loadPaymentReadiness();
        }, 0);

        return () => {
            window.clearTimeout(timerId);
            paymentRequestIdRef.current += 1;
        };
    }, [loadPaymentReadiness]);

    /**
     * Load saved creative records and preview compatibility independently
     * from the read-only WorkspaceCreative component.
     *
     * Approval readiness requires both API responses. The Creative
     * workspace can still display saved assets if its own preview request
     * fails, but a failed preview verification must not pass readiness.
     */
    const loadCreativeData = useCallback(
        async (
            currentAdvertisementId: number,
        ): Promise<void> => {
            const requestId = ++creativeRequestIdRef.current;

            setPersistedCreatives(null);
            setCreativePreviews(null);
            setCreativeVerificationStatus("LOADING");

            if (
                !Number.isInteger(currentAdvertisementId) ||
                currentAdvertisementId <= 0
            ) {
                setCreativeVerificationStatus("ERROR");
                setCreativesLoading(false);
                return;
            }

            setCreativesLoading(true);

            try {
                const [
                    creativesResponse,
                    previewsResponse,
                ] = await Promise.all([
                    getAdvertisementCreatives(
                        currentAdvertisementId,
                    ),
                    getAdvertisementCreativePreviews(
                        currentAdvertisementId,
                    ),
                ]);

                if (requestId !== creativeRequestIdRef.current) {
                    return;
                }

                if (!creativesResponse.data) {
                    throw new Error(
                        "Persisted creative records were not returned by the server.",
                    );
                }

                if (
                    !previewsResponse.desktop &&
                    !previewsResponse.mobile
                ) {
                    throw new Error(
                        "Creative preview results were not returned by the server.",
                    );
                }

                setPersistedCreatives(creativesResponse.data);
                setCreativePreviews(previewsResponse);
                setCreativeVerificationStatus("VERIFIED");
            } catch (loadError) {
                if (requestId !== creativeRequestIdRef.current) {
                    return;
                }

                console.error(
                    "Failed to load persisted advertisement creatives and previews:",
                    loadError,
                );

                setPersistedCreatives(null);
                setCreativePreviews(null);
                setCreativeVerificationStatus("ERROR");
            } finally {
                if (requestId === creativeRequestIdRef.current) {
                    setCreativesLoading(false);
                }
            }
        },
        [],
    );

    const loadTargetingData = useCallback(async (currentAdvertisementId: number): Promise<void> => {
        const requestId = ++targetingRequestIdRef.current;
        setTargetingVerificationStatus("LOADING");
        try {
            const response = await getAdvertisementTargets(currentAdvertisementId);
            if (requestId !== targetingRequestIdRef.current) return;
            if (!response.success || !Array.isArray(response.data)) {
                throw new Error(response.message || "Saved targeting rules were not returned.");
            }
            setPersistedTargets(response.data);
            setTargetingVerificationStatus("VERIFIED");
        } catch (loadError) {
            if (requestId !== targetingRequestIdRef.current) return;
            console.error("Failed to verify targeting readiness:", loadError);
            setPersistedTargets(null);
            setTargetingVerificationStatus("ERROR");
        }
    }, []);

    /**
     * Reload dependent persisted data whenever the selected advertisement
     * or its persisted placement association changes.
     */
    useEffect(() => {
        if (!advertisement) {
            return;
        }

        const placementId =
            advertisement.placement?.id ?? null;

        const currentAdvertisementId = advertisement.id;

        const timerId = window.setTimeout(() => {
            void loadRotationData(placementId);
            void loadCreativeData(currentAdvertisementId);
            void loadTargetingData(currentAdvertisementId);
        }, 0);

        return () => {
            window.clearTimeout(timerId);

            rotationRequestIdRef.current += 1;
            creativeRequestIdRef.current += 1;
            targetingRequestIdRef.current += 1;
        };
    }, [
        advertisement,
        loadRotationData,
        loadCreativeData,
        loadTargetingData,
    ]);

    const workflowStatus = normalizeWorkflowStatus(
        advertisement?.workflowStatus,
    );

    const isDraft = workflowStatus === "DRAFT";

    /**
     * Placement comes from the persisted advertisement response.
     * Payment readiness requires both payment history and the backend
     * summary supplied by WorkspacePayments.
     */
    const readiness = useMemo(() => {
        if (!advertisement) {
            return [];
        }

        const items = buildReadiness(
            advertisement,
            {
                placement: advertisement.placement ?? null,
                placementVerificationStatus: "VERIFIED",

                creatives: persistedCreatives,
                previews: creativePreviews,
                verificationStatus: creativeVerificationStatus,

                targets: persistedTargets,
                targetingVerificationStatus,

                rotationConfig,
                rotationMembers,
                rotationVerificationStatus,

                payments: paymentRecords,
                paymentSummary,
                paymentVerificationStatus,

                financialApprovals,
                financialApprovalVerificationStatus,

                pricingReadinessVerificationStatus:
                    paymentVerificationStatus === "LOADING" ||
                        financialApprovalVerificationStatus === "LOADING"
                        ? "LOADING"
                        : paymentVerificationStatus === "ERROR" ||
                            financialApprovalVerificationStatus === "ERROR"
                            ? "ERROR"
                            : "VERIFIED",
            },
        );

        // Schedule records are created after approval. Draft/submitted readiness
        // uses the campaign window; go-live readiness requires a persisted record.
        if (workflowStatus !== "APPROVED") return items;
        return items.map((item) => {
            if (item.label !== "Schedule") return item;
            if (scheduleVerificationStatus !== "VERIFIED") {
                return {
                    ...item,
                    description: "Persisted schedule records could not be verified. Refresh the workspace and check schedule-read permission.",
                    state: "REQUIRES_VERIFICATION" as const,
                };
            }
            const acceptedStatuses: AdvertisementSchedule["status"][] = advertisement.status === "ACTIVE"
                ? ["ACTIVE", "SCHEDULED", "PAUSED"]
                : ["SCHEDULED", "PAUSED"];
            const activatableSchedules = (persistedSchedules ?? []).filter(
                (schedule) => acceptedStatuses.includes(schedule.status),
            );
            return activatableSchedules.length > 0
                ? {
                    ...item,
                    description: advertisement.status === "ACTIVE"
                        ? `${activatableSchedules.length} persisted schedule record(s) are present for this active advertisement.`
                        : `${activatableSchedules.length} persisted schedule record(s) are available for activation.`,
                    state: "READY" as const,
                }
                : { ...item, description: "Create a persisted schedule for this approved advertisement before activation.", state: "MISSING" as const };
        });
    }, [
        advertisement,
        persistedCreatives,
        creativePreviews,
        creativeVerificationStatus,
        persistedTargets,
        targetingVerificationStatus,
        rotationConfig,
        rotationMembers,
        rotationVerificationStatus,
        paymentRecords,
        paymentSummary,
        paymentVerificationStatus,
        financialApprovals,
        financialApprovalVerificationStatus,
        workflowStatus,
        persistedSchedules,
        scheduleVerificationStatus,
    ]);

    const readinessReady = readiness.filter(
        (item) => item.state === "READY",
    ).length;

    const readinessTotal = readiness.length;

    const readinessCountConsistent =
        readiness.length === readinessTotal &&
        readiness.filter(
            (item) => item.state === "READY",
        ).length === readinessReady;

    /**
     * Initial submission readiness is separate from final approval
     * readiness. Financial Approval is a downstream workflow step and
     * must not automatically prevent an otherwise ready draft from
     * being submitted.
     *
     * All other readiness checks must be READY. Rotation and Creative
     * verification must also have finished loading successfully.
     */
    const submissionReadiness = readiness.filter(
        (item: ReadinessItem) =>
            item.label !== FINANCIAL_APPROVAL_READINESS_LABEL,
    );

    const submissionReadinessComplete =
        submissionReadiness.length > 0 &&
        submissionReadiness.every(
            (item) => item.state === "READY",
        );

    const canSubmit =
        isDraft &&
        !loading &&
        !refreshing &&
        !submitting &&
        !rotationLoading &&
        !creativesLoading &&
        creativeVerificationStatus === "VERIFIED" &&
        rotationVerificationStatus === "VERIFIED" &&
        readinessCountConsistent &&
        submissionReadinessComplete;

    /**
     * Final approval readiness remains separate from initial submission.
     * Financial Approval requirements must be represented accurately by
     * buildReadiness before final approval can be enabled.
     */
    const canApprove =
        workflowStatus === "SUBMITTED" &&
        !refreshing &&
        !rotationLoading &&
        !creativesLoading &&
        readinessCountConsistent &&
        readinessTotal > 0 &&
        readiness.every(
            (item) => item.state === "READY",
        );

    /** Go-live readiness is distinct from approval readiness. */
    const goLiveReadinessComplete =
        workflowStatus === "APPROVED" &&
        advertisement?.status !== "ACTIVE" &&
        advertisement?.status !== "ARCHIVED" &&
        !loading &&
        !refreshing &&
        !rotationLoading &&
        !creativesLoading &&
        creativeVerificationStatus === "VERIFIED" &&
        rotationVerificationStatus === "VERIFIED" &&
        paymentVerificationStatus === "VERIFIED" &&
        financialApprovalVerificationStatus === "VERIFIED" &&
        scheduleVerificationStatus === "VERIFIED" &&
        readinessCountConsistent &&
        readinessTotal > 0 &&
        readiness.every((item) => item.state === "READY");

    const handleSubmitForApproval = useCallback(
        async (): Promise<void> => {
            if (!advertisement || submitting) {
                return;
            }

            if (workflowStatus !== "DRAFT") {
                setSubmitError(
                    "Only draft advertisements can be submitted for approval.",
                );
                setSubmitSuccess(null);
                return;
            }

            if (!canSubmit) {
                setSubmitError(
                    "Complete all required submission readiness checks before submitting this advertisement.",
                );
                setSubmitSuccess(null);
                return;
            }

            setSubmitting(true);
            setSubmitError(null);
            setSubmitSuccess(null);

            try {
                const response = await submitAdvertisement(
                    advertisement.id,
                );

                if (!response.success) {
                    throw new Error(
                        response.message ||
                        "The advertisement could not be submitted for approval.",
                    );
                }

                setSubmitSuccess(
                    response.message ||
                    "Advertisement submitted for approval successfully.",
                );

                await loadAdvertisement(true);
            } catch (submitErrorValue) {
                console.error(
                    "Failed to submit advertisement for approval:",
                    submitErrorValue,
                );

                setSubmitError(
                    getApiErrorMessage(submitErrorValue),
                );
            } finally {
                setSubmitting(false);
            }
        },
        [
            advertisement,
            submitting,
            workflowStatus,
            canSubmit,
            loadAdvertisement,
        ],
    );

    const handleApproveAdvertisement = async (): Promise<void> => {
        if (
            !advertisement ||
            workflowStatus !== "SUBMITTED" ||
            !canApprove ||
            approving
        ) {
            return;
        }

        setApproving(true);
        setApproveError(null);
        setApproveSuccess(null);

        try {
            const response = await approveAdvertisement(advertisement.id);

            if (!response.success) {
                setApproveError(
                    response.message ||
                    "The advertisement could not be approved.",
                );
                return;
            }

            setApproveSuccess(
                response.message || "Advertisement approved successfully.",
            );

            await loadAdvertisement(true);
        } catch (error: unknown) {
            setApproveError(
                getApiErrorMessage(
                    error,
                    "Failed to approve the advertisement. Please try again.",
                ),
            );
        } finally {
            setApproving(false);
        }
    };

    const handleActivateAdvertisement = useCallback(
        async (): Promise<void> => {
            if (!advertisement || activating) {
                return;
            }

            if (workflowStatus !== "APPROVED") {
                setActivationError(
                    "Only approved advertisements can be activated.",
                );
                setActivationSuccess(null);
                return;
            }

            if (!goLiveReadinessComplete) {
                setActivationError(
                    "Go-Live readiness is not complete. Review the readiness checks below and refresh any unverified data before activating.",
                );
                setActivationSuccess(null);
                return;
            }

            const remarks = activationRemarks.trim();

            if (!remarks) {
                setActivationError(
                    "Enter remarks before activating this advertisement.",
                );
                setActivationSuccess(null);
                return;
            }

            setActivating(true);
            setActivationError(null);
            setActivationSuccess(null);

            try {
                const response = await activateAdvertisement(
                    advertisement.id,
                    { remarks },
                );

                if (!response.success) {
                    throw new Error(
                        response.message ||
                        "The advertisement could not be activated.",
                    );
                }

                // Activation is a distinct workflow action. Never reuse a
                // submission message returned by the API or left in UI state.
                setSubmitSuccess(null);
                setApproveSuccess(null);
                setActivationSuccess(
                    "Advertisement activated successfully.",
                );

                setActivationRemarks("");

                await loadAdvertisement(true);

                await Promise.all([
                    loadFinancialApprovalReadiness(),
                    loadPaymentReadiness(),
                    loadScheduleData(),
                ]);
            } catch (activationErrorValue: unknown) {
                console.error(
                    "Failed to activate advertisement:",
                    activationErrorValue,
                );

                setActivationError(
                    getApiErrorMessage(
                        activationErrorValue,
                        "Failed to activate the advertisement. Please try again.",
                    ),
                );
            } finally {
                setActivating(false);
            }
        },
        [
            advertisement,
            activating,
            workflowStatus,
            activationRemarks,
            loadAdvertisement,
            loadFinancialApprovalReadiness,
            loadPaymentReadiness,
            loadScheduleData,
            goLiveReadinessComplete,
        ],
    );

    const handleBack = (): void => {
        navigate("/admin/advertisements/list");
    };

    const handleSectionChange = (
        section: WorkspaceSection,
    ): void => {
        setActiveSection(section);
    };

    /**
     * Refresh the advertisement record. Its updated persisted data will
     * trigger the dependent Rotation and Creative readiness loaders.
     */
    const handleWorkspaceSaved = useCallback(
        async (): Promise<void> => {
            await Promise.all([loadAdvertisement(true), loadScheduleData(), loadTargetingData(advertisementId)]);
        },
        [loadAdvertisement, loadScheduleData, loadTargetingData, advertisementId],
    );

    /**
     * WorkspacePayments provides the authoritative payment summary and
     * payment records as one snapshot. This callback supersedes any
     * older records-only request so an outdated response cannot overwrite
     * the verified snapshot.
     */
    const handlePaymentDataChanged = useCallback(
        (snapshot: PaymentReadinessSnapshot): void => {
            paymentRequestIdRef.current += 1;

            setPaymentRecords(snapshot.payments);
            setPaymentSummary(snapshot.summary);
            setPaymentVerificationStatus(
                snapshot.verificationStatus,
            );
        },
        [],
    );

    const handleFinancialApprovalChanged = useCallback(
        async (): Promise<void> => {
            await Promise.all([
                loadFinancialApprovalReadiness(),
                loadPaymentReadiness(),
            ]);
        },
        [
            loadFinancialApprovalReadiness,
            loadPaymentReadiness,
        ],
    );

    const renderWorkspaceContent = () => {
        if (!advertisement) {
            return null;
        }

        switch (activeSection) {
            case "overview":
                return (
                    <AdvertisementWorkspaceOverview
                        advertisement={advertisement}
                        readiness={readiness}
                        readinessReady={readinessReady}
                        readinessTotal={readinessTotal}
                        canApprove={canApprove}
                        canSubmit={canSubmit}
                        submitting={submitting}
                        submitError={submitError}
                        submitSuccess={submitSuccess}
                        onSubmitForApproval={
                            handleSubmitForApproval
                        }
                        approving={approving}
                        approveError={approveError}
                        approveSuccess={approveSuccess}
                        onApproveAdvertisement={handleApproveAdvertisement}
                    />
                );

            case "client":
                return (
                    <WorkspaceClient
                        advertisement={advertisement}
                    />
                );

            case "details":
                return (
                    <WorkspaceDetails
                        advertisement={advertisement}
                    />
                );

            case "pricing":
                return (
                    <WorkspacePricing
                        advertisement={advertisement}
                        canEditCommercials={isDraft}
                        onSaved={handleWorkspaceSaved}
                    />
                );

            case "placement":
                return (
                    <>
                        <WorkspacePlacement placement={advertisement.placement} />
                        <WorkspacePlacementRules
                            advertisementId={advertisement.id}
                            placement={advertisement.placement}
                        />
                    </>
                );

            case "rotation":
                return (
                    <WorkspaceRotation
                        advertisement={advertisement}
                        onSaved={handleWorkspaceSaved}
                    />
                );

            case "creative":
                return (
                    <WorkspaceCreative
                        advertisementId={advertisement.id}
                        workflowStatus={workflowStatus}
                        advertisementEndAt={advertisement.endAt}
                        advertisementStatus={advertisement.status}
                    />
                );

            case "schedule":
                return (
                    <WorkspaceSchedule
                        advertisement={advertisement}
                        canEditSchedule={isDraft}
                        onSaved={handleWorkspaceSaved}
                    />
                );

            case "targeting":
                return (
                    <WorkspaceTargeting
                        advertisement={advertisement}
                        canEditTargeting={isDraft}
                        onSaved={handleWorkspaceSaved}
                    />
                );

            case "delivery":
                return (
                    <WorkspaceDelivery
                        advertisement={advertisement}
                        schedules={persistedSchedules ?? []}
                        scheduleVerificationStatus={scheduleVerificationStatus}
                        onChanged={handleWorkspaceSaved}
                    />
                );

            case "tracking":
                return <WorkspaceTracking advertisementId={advertisement.id} />;

            /*
             * WorkspacePayments is rendered outside this switch so it
             * remains mounted when another section is selected.
             */
            case "payments":
                return null;

            case "financial":
                return (
                    <WorkspaceFinancialApproval
                        advertisement={advertisement}
                        onChanged={handleFinancialApprovalChanged}
                    />
                );

            default:
                return (
                    <AdvertisementWorkspaceSectionPlaceholder
                        section={activeSection}
                    />
                );
        }
    };

    if (loading) {
        return (
            <MainLayout>
                <main
                    className="
                        mx-auto
                        w-full
                        max-w-7xl
                        px-4
                        py-6
                        sm:px-6
                        lg:px-8
                    "
                >
                    <div role="status" aria-label="Loading advertisement workspace" className="flex items-center gap-4 rounded-xl border border-green-200 bg-green-50 p-5 text-green-900 shadow-sm">
                        <span aria-hidden="true" className="h-6 w-6 shrink-0 animate-spin rounded-full border-[3px] border-green-200 border-t-green-700" />
                        <div>
                            <p className="font-semibold">Preparing your advertisement workspace</p>
                            <p className="mt-1 text-sm">Retrieving advertisement details. Please wait…</p>
                        </div>
                    </div>
                </main>
            </MainLayout>
        );
    }

    if (error || !advertisement) {
        return (
            <MainLayout>
                <main
                    className="
                        mx-auto
                        w-full
                        max-w-7xl
                        px-4
                        py-6
                        sm:px-6
                        lg:px-8
                    "
                >
                    <div
                        className="
                            rounded-xl
                            border
                            border-red-200
                            bg-red-50
                            p-6
                        "
                        role="alert"
                    >
                        <div className="flex items-start gap-3">
                            <AlertCircle
                                size={21}
                                className="mt-0.5 shrink-0 text-red-600"
                                aria-hidden="true"
                            />

                            <div>
                                <Typography
                                    as="h1"
                                    variant="headline"
                                    className="text-lg text-red-900"
                                >
                                    Advertisement could not be loaded
                                </Typography>

                                <Typography
                                    as="p"
                                    variant="body"
                                    className="mt-2 text-sm text-red-700"
                                >
                                    {error ??
                                        "The requested advertisement was not found."}
                                </Typography>
                            </div>
                        </div>

                        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                            <button
                                type="button"
                                onClick={() =>
                                    void Promise.all([loadAdvertisement(true), loadScheduleData()])
                                }
                                disabled={refreshing}
                                className="
                                    inline-flex min-h-10 items-center
                                    justify-center gap-2 rounded-md
                                    border border-red-300 bg-white
                                    px-4 py-2 text-sm font-semibold
                                    text-red-700 hover:bg-red-50
                                    disabled:cursor-not-allowed
                                    disabled:opacity-60
                                    focus:outline-none focus:ring-2
                                    focus:ring-red-500 focus:ring-offset-2
                                "
                            >
                                <RefreshCw
                                    size={16}
                                    className={
                                        refreshing ? "animate-spin" : ""
                                    }
                                    aria-hidden="true"
                                />
                                Try Again
                            </button>

                            <button
                                type="button"
                                onClick={handleBack}
                                className="
                                    inline-flex min-h-10 items-center
                                    justify-center gap-2 rounded-md
                                    border border-gray-300 bg-white
                                    px-4 py-2 text-sm font-semibold
                                    text-gray-700 hover:bg-gray-50
                                    focus:outline-none focus:ring-2
                                    focus:ring-green-600 focus:ring-offset-2
                                "
                            >
                                <ArrowLeft
                                    size={16}
                                    aria-hidden="true"
                                />
                                Back to Advertisements
                            </button>
                        </div>
                    </div>
                </main>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <main
                className="
                    mx-auto
                    w-full
                    max-w-7xl
                    px-4
                    py-6
                    sm:px-6
                    lg:px-8
                "
            >
                <div className="flex flex-col gap-6">
                    <div>
                        <button
                            type="button"
                            onClick={handleBack}
                            className="
                                inline-flex min-h-9 items-center gap-2
                                rounded-md px-2 py-1.5 text-sm
                                font-semibold text-gray-600 transition
                                hover:bg-gray-100 hover:text-gray-900
                                focus:outline-none focus:ring-2
                                focus:ring-green-600 focus:ring-offset-2
                            "
                        >
                            <ArrowLeft
                                size={16}
                                aria-hidden="true"
                            />
                            Advertisements
                        </button>

                        <header
                            className="admin-unified-header mt-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"
                        >
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <Typography
                                        as="h1"
                                        variant="headline"
                                        className="
                                            min-w-0 wrap-break-word
                                            text-xl font-semibold sm:text-2xl
                                        "
                                    >
                                        Advertisement Workspace
                                    </Typography>

                                    <span className="rounded-full bg-white px-1 py-0.5">
                                        <AdvertisementStatusBadge
                                            status={workflowStatus}
                                            size="sm"
                                        />
                                    </span>
                                    <span
                                        className={`inline-flex items-center rounded-full border border-white/30 px-2.5 py-1 text-xs font-semibold ${advertisement.status === "ACTIVE"
                                            ? "bg-green-100 text-green-800"
                                            : advertisement.status === "ARCHIVED"
                                                ? "bg-gray-100 text-gray-700"
                                                : "bg-amber-100 text-amber-800"
                                            }`}
                                        aria-label={`Operational status: ${advertisement.status}`}
                                    >
                                        Operational: {advertisement.status}
                                    </span>
                                </div>

                                <Typography
                                    as="p"
                                    variant="body"
                                    className="mt-2 text-sm text-gray-600"
                                >
                                    Advertisement #{advertisement.id}
                                    {" • "}
                                    {advertisement.advertisementType}
                                    {" • "}
                                    Client:{" "}
                                    {advertisement.client?.displayName?.trim() ||
                                        advertisement.client?.businessName?.trim() ||
                                        advertisement.client?.name?.trim() ||
                                        advertisement.clientName?.trim() ||
                                        "Not available"}
                                </Typography>

                                {(rotationLoading ||
                                    creativesLoading) && (
                                        <Typography
                                            as="p"
                                            variant="body"
                                            className="mt-2 text-xs text-gray-500"
                                        >
                                            Refreshing persisted approval-readiness
                                            data…
                                        </Typography>
                                    )}
                            </div>

                            <div className="flex flex-col gap-2 sm:flex-row">
                                {isDraft && (
                                    <Link
                                        to={`/admin/advertisements/${advertisement.id}/edit`}
                                        className="
                                            inline-flex min-h-10 items-center
                                            justify-center gap-2 rounded-md
                                            border border-gray-300 bg-white
                                            px-4 py-2 text-sm font-semibold
                                            text-gray-700 hover:bg-gray-50
                                            focus:outline-none focus:ring-2
                                            focus:ring-green-600
                                            focus:ring-offset-2
                                        "
                                    >
                                        <Pencil
                                            size={16}
                                            aria-hidden="true"
                                        />
                                        Continue Draft
                                    </Link>
                                )}

                                {workflowStatus === "APPROVED" &&
                                    advertisement.status === "DRAFT" && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                activationSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                                                activationSectionRef.current?.querySelector<HTMLElement>("#advertisement-activation-heading")?.focus({ preventScroll: true });
                                            }}
                                            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2"
                                        >
                                            Go-Live readiness
                                        </button>
                                    )}

                                <button
                                    type="button"
                                    onClick={() =>
                                        void Promise.all([loadAdvertisement(true), loadScheduleData()])
                                    }
                                    disabled={refreshing}
                                    className="
                                        inline-flex min-h-10 items-center
                                        justify-center gap-2 rounded-md
                                        border border-gray-300 bg-white
                                        px-4 py-2 text-sm font-semibold
                                        text-gray-700 hover:bg-gray-50
                                        disabled:cursor-not-allowed
                                        disabled:opacity-60
                                        focus:outline-none focus:ring-2
                                        focus:ring-green-600
                                        focus:ring-offset-2
                                    "
                                >
                                    <RefreshCw
                                        size={16}
                                        className={
                                            refreshing ? "animate-spin" : ""
                                        }
                                        aria-hidden="true"
                                    />
                                    Refresh
                                </button>
                            </div>
                        </header>
                    </div>

                    {submitSuccess && (
                        <div
                            className="
                                rounded-lg border border-green-200
                                bg-green-50 px-4 py-3
                            "
                            role="status"
                            aria-live="polite"
                        >
                            <p className="text-sm font-medium text-green-800">
                                {submitSuccess}
                            </p>
                        </div>
                    )}

                    <AdvertisementWorkspaceSummary
                        advertisement={{
                            ...advertisement,
                            clientName:
                                advertisement.client?.displayName?.trim() ||
                                advertisement.client?.businessName?.trim() ||
                                advertisement.client?.name?.trim() ||
                                advertisement.clientName,
                            clientCode:
                                advertisement.client?.clientCode?.trim() ||
                                advertisement.clientCode,
                        }}
                        workflowStatus={workflowStatus}
                    />

                    {workflowStatus === "APPROVED" &&
                        advertisement.status === "DRAFT" && (
                            <section
                                ref={activationSectionRef}
                                tabIndex={-1}
                                className="scroll-mt-6 rounded-xl border border-green-200 bg-white p-5 shadow-sm"
                                aria-labelledby="advertisement-activation-heading"
                            >
                                <Typography
                                    id="advertisement-activation-heading"
                                    tabIndex={-1}
                                    as="h2"
                                    variant="headline"
                                    className="text-base font-semibold text-gray-900 focus:outline-none"
                                >
                                    Activate Advertisement
                                </Typography>

                                <Typography
                                    as="p"
                                    variant="body"
                                    className="mt-1 text-sm text-gray-600"
                                >
                                    This advertisement is approved but is not operationally active.
                                    Activation validates its persisted schedule, placement, creative,
                                    and rotation configuration. Activation does not change the campaign
                                    or schedule dates: an advertisement scheduled for the future will
                                    not be delivered before its start time, and an expired campaign
                                    will not be delivered after its end time.
                                </Typography>

                                <div className={`mt-4 rounded-lg border p-4 ${goLiveReadinessComplete ? "border-green-200 bg-green-50" : "border-amber-200 bg-amber-50"}`}>
                                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                        <p className="text-sm font-semibold text-gray-900">Go-Live readiness</p>
                                        <span className={`inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${goLiveReadinessComplete ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>
                                            {goLiveReadinessComplete ? "Ready to activate" : `${readinessReady} of ${readinessTotal} checks ready`}
                                        </span>
                                    </div>
                                    <p className="mt-1 text-xs text-gray-600">Activation is enabled only when all persisted readiness checks are ready and required data has been verified. The server performs the final validation.</p>
                                    {readiness.length > 0 && <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                                        {readiness.map((item) => (
                                            <li key={item.label} className="flex items-start gap-2 text-xs">
                                                <span className={`mt-0.5 inline-block h-2 w-2 shrink-0 rounded-full ${item.state === "READY" ? "bg-green-600" : item.state === "REQUIRES_VERIFICATION" ? "bg-amber-500" : "bg-red-500"}`} aria-hidden="true" />
                                                <span><span className="font-semibold text-gray-800">{item.label}</span><span className="block text-gray-600">{item.description}</span></span>
                                            </li>
                                        ))}
                                    </ul>}
                                    {!goLiveReadinessComplete && <div className="mt-3"><button type="button" onClick={() => setActiveSection("delivery")} className="inline-flex min-h-8 items-center gap-2 rounded-md border border-green-300 bg-white px-3 py-1.5 text-xs font-semibold text-green-800 hover:bg-green-50">Manage delivery & schedules</button></div>}
                                </div>

                                <div className="mt-4">
                                    <label
                                        htmlFor="activation-remarks"
                                        className="mb-1.5 block text-sm font-medium text-gray-700"
                                    >
                                        Activation remarks
                                        <span className="ml-1 text-red-600" aria-hidden="true">
                                            *
                                        </span>
                                    </label>

                                    <textarea
                                        id="activation-remarks"
                                        value={activationRemarks}
                                        onChange={(event) =>
                                            setActivationRemarks(event.target.value)
                                        }
                                        rows={3}
                                        maxLength={2000}
                                        required
                                        disabled={activating}
                                        placeholder="Enter the reason for activating this advertisement"
                                        className="
                        block w-full rounded-md border border-gray-300
                        px-3 py-2 text-sm text-gray-900 shadow-sm
                        placeholder:text-gray-400
                        focus:border-green-600 focus:outline-none
                        focus:ring-2 focus:ring-green-600
                        disabled:cursor-not-allowed disabled:bg-gray-50
                    "
                                    />
                                </div>

                                {activationError && (
                                    <div
                                        role="alert"
                                        className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2"
                                    >
                                        <p className="text-sm text-red-700">
                                            {activationError}
                                        </p>
                                    </div>
                                )}

                                {activationSuccess && (
                                    <div
                                        className="
                                                    rounded-lg border border-green-200
                                                    bg-green-50 px-4 py-3
                                                "
                                        role="status"
                                        aria-live="polite"
                                    >
                                        <p className="text-sm font-medium text-green-800">
                                            {activationSuccess}
                                        </p>
                                    </div>
                                )}

                                <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
                                    <button
                                        type="button"
                                        onClick={() => void handleActivateAdvertisement()}
                                        disabled={
                                            activating ||
                                            refreshing ||
                                            !goLiveReadinessComplete ||
                                            !activationRemarks.trim()
                                        }
                                        className="
                        inline-flex min-h-10 items-center justify-center
                        gap-2 rounded-md bg-green-700 px-4 py-2
                        text-sm font-semibold text-white
                        hover:bg-green-800
                        disabled:cursor-not-allowed disabled:opacity-60
                        focus:outline-none focus:ring-2
                        focus:ring-green-600 focus:ring-offset-2
                    "
                                    >
                                        <RefreshCw
                                            size={16}
                                            className={activating ? "animate-spin" : ""}
                                            aria-hidden="true"
                                        />
                                        {activating ? "Activating…" : "Activate Advertisement"}
                                    </button>
                                </div>
                            </section>
                        )}

                    <div
                        className="
                            grid grid-cols-1 gap-6
                            lg:grid-cols-[250px_minmax(0,1fr)]
                        "
                    >
                        <AdvertisementWorkspaceNavigation
                            activeSection={activeSection}
                            onSectionChange={handleSectionChange}
                        />

                        <div className="min-w-0">
                            {/*
                             * Keep the payment component mounted for the
                             * lifetime of this workspace. Its initial
                             * load reports payment records and the backend
                             * summary to Approval Readiness even when the
                             * user opens Overview first.
                             *
                             * The same instance becomes visible when
                             * Payments is selected.
                             */}
                            <div
                                className={
                                    activeSection === "payments"
                                        ? "min-w-0"
                                        : "hidden"
                                }
                            >
                                <WorkspacePayments
                                    advertisementId={advertisement.id}
                                    currencyCode={advertisement.currencyCode}
                                    canManagePayments={
                                        workflowStatus !== "ARCHIVED"
                                    }
                                    onPaymentReadinessChange={
                                        handlePaymentDataChanged
                                    }
                                />
                            </div>

                            {activeSection !== "payments" &&
                                renderWorkspaceContent()}
                        </div>
                    </div>
                </div>
            </main>
        </MainLayout>
    );
};

export default AdvertisementWorkspacePage;