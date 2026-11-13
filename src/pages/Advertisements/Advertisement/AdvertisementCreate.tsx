import { formatIstInputDateTime, formatIstDate, getInclusiveIstCalendarDays, istCalendarDateEndUtcIso, istCalendarDateToUtcIso } from "@/helpers/businessTimeZone.helpers";
import AdvertisementAdminPageHeader from "@/components/ui/AdvertisementAdminPageHeader";
import {
    ArrowLeft,
    CheckCircle2,
} from "lucide-react";

import {
    Link,
    useParams,
} from "react-router-dom";

import {
    useEffect,
    useState,
} from "react";

import {
    createAdvertisement,
    createAdvertisementCreative,
    deleteAdvertisementCreative,
    getAdvertisementCreatives,
    getAdvertisementById,
    updateAdvertisement,
    updateAdvertisementCreative,
} from "@/api/advertisements";

import type {
    AdvertisementClient,
    AdvertisementType,
    CreateAdvertisementInput,
} from "@/api/advertisements";

import {
    getAdvertisementRateCards,
} from "@/api/advertisements/rate-cards.api";

import type {
    AdvertisementRateCard,
} from "@/api/advertisements/rate-cards.api";

import type {
    CreateAdvertisementCreativeInput,
    UpdateAdvertisementCreativeInput,
} from "@/types/creative.types";

import { getAdvertisementClientById } from "@/api/advertisements/clients.api";

import ClientSelection from "@/pages/Advertisements/Clients";

import AdvertisementDetails from "./AdvertisementDetails";

import type {
    AdvertisementDetailsValue,
} from "./AdvertisementDetails";

import AdvertisementPlacement from "./AdvertisementPlacement";

import type {
    AdvertisementPlacementValue,
} from "./AdvertisementPlacement";

import Creative from "@/components/advertisements/Creative/Creative";

import type {
    AdvertisementCreativeValue,
    AdvertisementCreativePlacementFormat,
} from "@/types/creative.types";

import {
    validateAdvertisementCreatives,
} from "@/components/advertisements/Creative/creative.helpers";

import Schedule from "@/components/advertisements/Schedule/Schedule";

import {
    createInitialAdvertisementSchedule,
    validateAdvertisementSchedule,
    scheduleLocalToIso,
    scheduleIsoToLocal,
} from "@/helpers/schedule.helpers";

import type {
    AdvertisementScheduleValue,
} from "@/types/schedule.types";

import Review from "@/components/advertisements/Review/Review";

import MainLayout from "@/layouts/MainLayout";

import Surface from "@/components/ui/Surface";

import Typography from "@/components/ui/Typography";

type AdvertisementCreateStep =
    | "CLIENT"
    | "DETAILS"
    | "PLACEMENT"
    | "SCHEDULE"
    | "PRICING"
    | "CREATIVE"
    | "REVIEW";

const createInitialAdvertisementDetails =
    (): AdvertisementDetailsValue => ({
        name: "",
        internalName: "",
        advertisementType: "DISPLAY",
        isClickable: true,
        destinationUrl: "",
        openInNewTab: true,
        priority: 1,
        currencyCode: "INR",
        notes: "",
    });

const createInitialAdvertisementPlacement =
    (): AdvertisementPlacementValue => ({
        placementId: null,
        placementCode: null,
        pageType: null,
        formatId: null,
        format: null,
    });

const createInitialAdvertisementCreative =
    (): AdvertisementCreativeValue => ({
        creatives: [],
    });

const createInitialAdvertisementScheduleValue =
    (): AdvertisementScheduleValue =>
        createInitialAdvertisementSchedule();

/**
 * Convert the value maintained by Advertisement Details
 * into the advertisement type accepted by the API.
 */
const getApiAdvertisementType = (
    value: AdvertisementDetailsValue["advertisementType"],
): AdvertisementType => {
    switch (value) {
        case "DISPLAY":
        case "BANNER":
        case "NATIVE":
        case "MODAL":
        case "OVERLAY":
            return value;

        default:
            throw new Error(
                "The selected advertisement type is no longer supported. Please select a supported advertisement type.",
            );
    }
};

/**
 * Convert an API date value to a timestamp.
 */
const getDateTimestamp = (
    value: string | Date,
): number => {
    const date =
        value instanceof Date
            ? value
            : new Date(value);

    return date.getTime();
};

/**
 * Treat date-only effectiveTo values as inclusive through
 * the end of that calendar day.
 */
const isRateCardEffective = (
    rateCard: AdvertisementRateCard,
    effectiveDate: Date,
): boolean => {
    if (
        rateCard.status !== "ACTIVE" ||
        !Number.isFinite(effectiveDate.getTime())
    ) {
        return false;
    }

    const effectiveFrom =
        getDateTimestamp(typeof rateCard.effectiveFrom === "string" && /^\d{4}-\d{2}-\d{2}$/.test(rateCard.effectiveFrom) ? istCalendarDateToUtcIso(rateCard.effectiveFrom) : rateCard.effectiveFrom);

    if (
        !Number.isFinite(effectiveFrom) ||
        effectiveFrom > effectiveDate.getTime()
    ) {
        return false;
    }

    if (rateCard.effectiveTo === null) {
        return true;
    }

    const effectiveToValue =
        rateCard.effectiveTo;

    let effectiveTo =
        getDateTimestamp(effectiveToValue);

    if (
        typeof effectiveToValue === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(effectiveToValue)
    ) {
        effectiveTo = Date.parse(istCalendarDateEndUtcIso(effectiveToValue));
    }

    return (
        Number.isFinite(effectiveTo) &&
        effectiveTo >= effectiveDate.getTime()
    );
};

/**
 * Calculate the inclusive number of calendar days between
 * the selected schedule dates.
 *
 * For example, 1 November through 5 November = 5 days.
 * Date components are used instead of elapsed milliseconds,
 * avoiding daylight-saving and time-of-day differences.
 */
const getInclusiveScheduleDays = (
    startValue: string | Date | null | undefined,
    endValue: string | Date | null | undefined,
): number | null => {
    if (!startValue || !endValue) return null;
    try {
        return getInclusiveIstCalendarDays(startValue, endValue);
    } catch {
        return null;
    }
};

/**
 * Format an amount using the currency configured on the rate card.
 */
const formatCurrency = (
    amount: number,
    currencyCode: string,
): string => {
    try {
        return new Intl.NumberFormat(
            undefined,
            {
                style: "currency",
                currency: currencyCode,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            },
        ).format(amount);
    } catch {
        return `${currencyCode} ${amount.toFixed(2)}`;
    }
};

const AdvertisementCreatePage = () => {
    const { id: editIdParam } = useParams<{ id: string }>();
    const isEditMode = editIdParam !== undefined;
    const editId = editIdParam && /^\d+$/.test(editIdParam)
        ? Number(editIdParam)
        : null;
    const [isHouseAd, setIsHouseAd] = useState(false);
    const [draftLoading, setDraftLoading] = useState(isEditMode);
    const [draftLoadError, setDraftLoadError] = useState<string | null>(null);

    const [
        selectedClient,
        setSelectedClient,
    ] = useState<AdvertisementClient | null>(null);

    const [
        clientConfirmed,
        setClientConfirmed,
    ] = useState(false);

    const [
        currentStep,
        setCurrentStep,
    ] = useState<AdvertisementCreateStep>("CLIENT");

    const [
        advertisementDetails,
        setAdvertisementDetails,
    ] = useState<AdvertisementDetailsValue>(
        createInitialAdvertisementDetails,
    );

    const [
        advertisementPlacement,
        setAdvertisementPlacement,
    ] = useState<AdvertisementPlacementValue>(
        createInitialAdvertisementPlacement,
    );

    const [
        advertisementCreative,
        setAdvertisementCreative,
    ] = useState<AdvertisementCreativeValue>(
        createInitialAdvertisementCreative,
    );

    const [
        advertisementSchedule,
        setAdvertisementSchedule,
    ] = useState<AdvertisementScheduleValue>(
        createInitialAdvertisementScheduleValue,
    );

    const [
        advertisementId,
        setAdvertisementId,
    ] = useState<number | null>(null);

    const [
        persistenceAction,
        setPersistenceAction,
    ] = useState<"DRAFT" | null>(null);

    const [
        persistenceError,
        setPersistenceError,
    ] = useState<string | null>(null);

    const [
        persistenceSuccess,
        setPersistenceSuccess,
    ] = useState<string | null>(null);

    const [
        pricingQuantity,
        setPricingQuantity,
    ] = useState("1");

    /** Restore persisted draft before allowing any save action. */
    useEffect(() => {
        if (!isEditMode) return;
        let cancelled = false;

        const restoreDraft = async (): Promise<void> => {
            try {
                if (editId === null || !Number.isSafeInteger(editId) || editId <= 0) {
                    throw new Error("Invalid advertisement ID.");
                }
                const response = await getAdvertisementById(editId);
                const advertisement = response.data;
                if (advertisement.workflowStatus !== "DRAFT") {
                    throw new Error("Only draft advertisements can be edited in this workflow.");
                }
                if (advertisement.clientId === null && !advertisement.isHouseAd) {
                    throw new Error("This paid draft does not have a valid client.");
                }
                const [clientResponse, creatives] = await Promise.all([
                    advertisement.clientId === null ? Promise.resolve(null) : getAdvertisementClientById(advertisement.clientId),
                    getAdvertisementCreatives(editId),
                ]);
                if (cancelled) return;

                setIsHouseAd(advertisement.isHouseAd === true);
                setSelectedClient(clientResponse?.data ?? null);
                setClientConfirmed(true);
                setAdvertisementId(editId);
                setAdvertisementDetails({
                    name: advertisement.name,
                    internalName: advertisement.internalName ?? "",
                    advertisementType: advertisement.advertisementType,
                    isClickable: advertisement.isClickable,
                    destinationUrl: advertisement.destinationUrl ?? "",
                    openInNewTab: advertisement.openInNewTab,
                    priority: advertisement.priority,
                    currencyCode: advertisement.currencyCode,
                    notes: advertisement.notes ?? "",
                });
                const placement = advertisement.placement;
                setAdvertisementPlacement(placement ? {
                    placementId: placement.id,
                    placementCode: placement.placementType,
                    pageType: placement.pageType,
                    formatId: placement.formatId,
                    format: placement.format,
                } : createInitialAdvertisementPlacement());
                setAdvertisementSchedule({
                    startDateTime: scheduleIsoToLocal(advertisement.startAt),
                    endDateTime: scheduleIsoToLocal(advertisement.endAt),
                    timezone: createInitialAdvertisementScheduleValue().timezone,
                });
                setPricingQuantity(String(advertisement.pricingQuantity ?? 1));
                setAdvertisementCreative({
                    creatives: (creatives.data ?? []).filter((creative) => creative.status === "ACTIVE").map((creative) => ({
                        id: String(creative.id),
                        creativeType: creative.creativeType,
                        variant: creative.variant,
                        title: creative.title ?? "",
                        altText: creative.altText ?? "",
                        mediaUrl: creative.mediaUrl,
                        fileName: "",
                        fileSizeBytes: null,
                        mimeType: null,
                        widthPx: creative.widthPx,
                        heightPx: creative.heightPx,
                        isPrimary: creative.isPrimary,
                        isActive: creative.status === "ACTIVE",
                        displayOrder: creative.displayOrder,
                    })),
                });
                setCurrentStep("CLIENT");
            } catch (error) {
                if (!cancelled) {
                    setDraftLoadError(error instanceof Error ? error.message : "Unable to load draft.");
                }
            } finally {
                if (!cancelled) setDraftLoading(false);
            }
        };
        void restoreDraft();
        return () => { cancelled = true; };
    }, [editId, isEditMode]);

    /*
     * Placement pricing state.
     *
     * DAY quantity is derived from the schedule.
     * Other pricing units retain a manually entered quantity.
     *
     * Standard Amount is display-only and is never submitted
     * to the API as a trusted amount.
     */
    const [
        rateCards,
        setRateCards,
    ] = useState<AdvertisementRateCard[]>([]);

    const [
        selectedRateCardId,
        setSelectedRateCardId,
    ] = useState<number | null>(null);


    const [
        rateCardsLoading,
        setRateCardsLoading,
    ] = useState(false);

    const [
        rateCardError,
        setRateCardError,
    ] = useState<string | null>(null);

    /**
     * Load active rate cards for the selected placement.
     *
     * The backend still verifies the configured rate card and
     * calculates the authoritative standard amount.
     */
    useEffect(() => {
        const placementId =
            advertisementPlacement.placementId;

        if (placementId === null) {
            return;
        }

        let cancelled = false;

        const loadRateCards = async (): Promise<void> => {
            try {
                const response =
                    await getAdvertisementRateCards({
                        placementId,
                        status: "ACTIVE",
                    });

                if (cancelled) {
                    return;
                }

                setRateCards(response);
                if (isEditMode && editId !== null) {
                    const saved = await getAdvertisementById(editId);
                    if (cancelled) return;
                    const matching = response.find((card) =>
                        card.pricingUnit === saved.data.pricingUnit &&
                        card.currencyCode === saved.data.currencyCode
                    );
                    setSelectedRateCardId(matching?.id ?? null);
                }
                setRateCardError(null);
            } catch (error) {
                if (cancelled) {
                    return;
                }

                setRateCards([]);
                setSelectedRateCardId(null);

                setRateCardError(
                    error instanceof Error &&
                        error.message.trim()
                        ? error.message
                        : "Unable to load rate cards for this placement. Please try again.",
                );
            } finally {
                if (!cancelled) {
                    setRateCardsLoading(false);
                }
            }
        };

        void loadRateCards();

        return () => {
            cancelled = true;
        };
    }, [
        advertisementPlacement.placementId,
    ]);

    const getStepHeadingId = (
        step: AdvertisementCreateStep,
    ): string => {
        switch (step) {
            case "CLIENT":
                return "client-selection-heading";

            case "DETAILS":
                return "advertisement-details-heading";

            case "PLACEMENT":
                return "advertisement-placement-heading";

            case "SCHEDULE":
                return "advertisement-schedule-heading";

            case "PRICING":
                return "advertisement-pricing-heading";

            case "CREATIVE":
                return "advertisement-creative-heading";

            case "REVIEW":
                return "advertisement-review-heading";
        }
    };

    /**
     * Revoke temporary browser object URLs created for local
     * creative previews.
     */
    const revokeCreativeObjectUrls = (
        creatives: AdvertisementCreativeValue["creatives"],
    ): void => {
        creatives.forEach((creative) => {
            if (creative.mediaUrl.startsWith("blob:")) {
                URL.revokeObjectURL(creative.mediaUrl);
            }
        });
    };

    /**
     * Navigate to a workflow step and focus its heading.
     */
    const navigateToStep = (
        step: AdvertisementCreateStep,
    ): void => {
        setCurrentStep(step);

        window.requestAnimationFrame(() => {
            window.requestAnimationFrame(() => {
                const headingId =
                    getStepHeadingId(step);

                const target =
                    document.getElementById(headingId) ??
                    document.querySelector<HTMLElement>(
                        `[aria-labelledby="${headingId}"]`,
                    );

                if (!target) {
                    return;
                }

                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });

                target.focus({
                    preventScroll: true,
                });
            });
        });
    };

    /**
     * A client change starts a new advertisement context.
     * All dependent values are reset.
     */
    const handleClientChange = (
        client: AdvertisementClient,
    ): void => {
        setSelectedClient(client);
        setClientConfirmed(false);

        setAdvertisementDetails(
            createInitialAdvertisementDetails(),
        );

        setAdvertisementPlacement(
            createInitialAdvertisementPlacement(),
        );

        setRateCards([]);
        setSelectedRateCardId(null);
        setPricingQuantity("1");
        setRateCardsLoading(false);
        setRateCardError(null);

        revokeCreativeObjectUrls(
            advertisementCreative.creatives,
        );

        setAdvertisementCreative(
            createInitialAdvertisementCreative(),
        );

        setAdvertisementSchedule(
            createInitialAdvertisementScheduleValue(),
        );

        setAdvertisementId(null);
        setPersistenceError(null);
        setPersistenceSuccess(null);

        navigateToStep("CLIENT");
    };

    const handleClientConfirm = (
        client: AdvertisementClient,
    ): void => {
        if (client.adCreationHold) return;
        void (async () => {
            try {
                const response = await getAdvertisementClientById(client.id);
                if (response.data.adCreationHold) return;
                setSelectedClient(response.data);
                setClientConfirmed(true);
                navigateToStep("DETAILS");
            } catch {
                setPersistenceError("Unable to retrieve the complete client profile. Please retry.");
            }
        })();
    };

    const handleContinue = (): void => {
        if (!selectedClient || selectedClient.adCreationHold) return;
        void (async () => {
            try {
                const response = await getAdvertisementClientById(selectedClient.id);
                if (response.data.adCreationHold) return;
                setSelectedClient(response.data);
                setClientConfirmed(true);
                navigateToStep("DETAILS");
            } catch {
                setPersistenceError("Unable to retrieve the complete client profile. Please retry.");
            }
        })();
    };

    const handlePlacementChange = (
        value: AdvertisementPlacementValue,
    ): void => {
        const placementChanged =
            advertisementPlacement.placementId !== value.placementId;

        const formatChanged =
            advertisementPlacement.formatId !== value.formatId;

        setAdvertisementPlacement(value);

        if (placementChanged) {
            setRateCards([]);
            setSelectedRateCardId(null);
            setPricingQuantity("1");
            setRateCardError(null);
            setRateCardsLoading(value.placementId !== null);
        }

        /*
         * Rate cards belong to the placement, not its creative format.
         * Keep the loaded rate cards when only the format changes, but
         * clear creatives because their dimensions/compatibility changed.
         */
        if (placementChanged || formatChanged) {
            revokeCreativeObjectUrls(
                advertisementCreative.creatives,
            );

            setAdvertisementCreative(
                createInitialAdvertisementCreative(),
            );
        }
    };

    const isDetailsComplete =
        advertisementDetails.name.trim().length > 0 &&
        (
            !advertisementDetails.isClickable ||
            advertisementDetails.destinationUrl.trim().length > 0
        );

    const hasPlacement =
        advertisementPlacement.placementId !== null;

    const placementFormat:
        | AdvertisementCreativePlacementFormat
        | null =
        advertisementPlacement.format;

    /*
     * Use the selected schedule start date when determining
     * whether a rate card is effective.
     */
    const pricingEffectiveDate = (() => {
        const scheduleStart =
            advertisementSchedule.startDateTime;

        if (scheduleStart) {
            const date = new Date(scheduleStart);

            if (Number.isFinite(date.getTime())) {
                return date;
            }
        }

        return new Date();
    })();

    const effectiveRateCards =
        rateCards.filter(
            (rateCard) =>
                rateCard.placementId ===
                advertisementPlacement.placementId &&
                isRateCardEffective(
                    rateCard,
                    pricingEffectiveDate,
                ),
        );

    const selectedRateCard =
        effectiveRateCards.find(
            (rateCard) =>
                rateCard.id === selectedRateCardId,
        ) ?? null;

    /*
     * Calculate the schedule duration using inclusive calendar
     * dates. This value drives quantity for DAY pricing.
     */
    const inclusiveScheduleDays =
        getInclusiveScheduleDays(
            advertisementSchedule.startDateTime,
            advertisementSchedule.endDateTime,
        );

    /*
     * DAY quantity is read-only and schedule-derived.
     * For other units, use the entered pricing quantity.
     */
    const effectivePricingQuantity =
        selectedRateCard?.pricingUnit === "DAY"
            ? inclusiveScheduleDays
            : Number(pricingQuantity);

    const isPricingQuantityValid =
        effectivePricingQuantity !== null &&
        effectivePricingQuantity !== undefined &&
        Number.isFinite(effectivePricingQuantity) &&
        effectivePricingQuantity > 0 &&
        (
            selectedRateCard?.pricingUnit === "DAY" ||
            pricingQuantity.trim().length > 0
        ) &&
        (
            selectedRateCard?.pricingUnit === "DAY" ||
            effectivePricingQuantity <= 99_999_999_999.9999
        ) &&
        (
            selectedRateCard?.pricingUnit === "DAY" ||
            Number(
                effectivePricingQuantity.toFixed(4),
            ) === effectivePricingQuantity
        );

    /*
     * This is a display-only estimate. The backend must resolve
     * the effective rate card and calculate standardAmount itself.
     */
    const calculatedStandardAmount =
        selectedRateCard && isPricingQuantityValid
            ? Number(
                (
                    Number(selectedRateCard.rateAmount) *
                    Number(effectivePricingQuantity)
                ).toFixed(2),
            )
            : null;

    const isPricingComplete =
        isHouseAd || (selectedRateCard !== null &&
            isPricingQuantityValid &&
            calculatedStandardAmount !== null &&
            Number.isFinite(calculatedStandardAmount));

    const creativeValidation =
        validateAdvertisementCreatives(
            advertisementCreative,
            placementFormat,
        );

    const isCreativeComplete =
        creativeValidation.isValid;

    const scheduleValidation =
        validateAdvertisementSchedule(
            advertisementSchedule,
        );

    const isScheduleComplete =
        scheduleValidation.isValid;

    const canOpenDetails =
        (isHouseAd || clientConfirmed) &&
        (isHouseAd || !selectedClient?.adCreationHold);

    const canOpenPlacement =
        canOpenDetails &&
        isDetailsComplete;

    const canOpenSchedule =
        canOpenPlacement &&
        hasPlacement;

    const canOpenPricing =
        canOpenSchedule &&
        isScheduleComplete;

    const canOpenCreative =
        canOpenPricing &&
        isPricingComplete;

    /*
     * Review is accessible after pricing is complete so that a
     * user can still save a draft without finishing creatives.
     * Submission itself requires valid creative content.
     */
    const canOpenReview =
        canOpenCreative;

    const clientName =
        (isHouseAd ? "TheNewsTime.in — House Advertisement" : selectedClient?.displayName) ||
        selectedClient?.name ||
        selectedClient?.companyName ||
        "No client selected";

    /**
     * Build the common advertisement create/update payload.
     *
     * The client sends the selected placement, pricing unit and
     * quantity. It does not send a trusted standardAmount or a
     * rateCardId; the backend resolves the applicable rate card.
     */
    const buildAdvertisementPayload =
        (): CreateAdvertisementInput => {
            if (!isHouseAd && !selectedClient) {
                throw new Error("Please select a client before saving a paid advertisement.");
            }

            if (
                advertisementPlacement.placementId === null
            ) {
                throw new Error(
                    "Please select an advertisement placement before saving the advertisement.",
                );
            }

            if (!isHouseAd && !selectedRateCard) {
                throw new Error(
                    "Please select an active rate card that is effective for the advertisement schedule.",
                );
            }

            if (!isHouseAd && !isPricingQuantityValid) {
                throw new Error(
                    selectedRateCard?.pricingUnit === "DAY"
                        ? "Select a valid schedule with a positive inclusive duration before saving."
                        : "Enter a valid pricing quantity greater than zero with no more than four decimal places.",
                );
            }

            const advertisementType =
                getApiAdvertisementType(
                    advertisementDetails.advertisementType,
                );

            const payload: CreateAdvertisementInput = {
                ...(isHouseAd ? { isHouseAd: true } : { clientId: selectedClient!.id, isHouseAd: false }),

                name: advertisementDetails.name.trim(),

                advertisementType,

                priority: advertisementDetails.priority,

                isClickable: advertisementDetails.isClickable,

                openInNewTab: advertisementDetails.openInNewTab,

                currencyCode: isHouseAd ? "INR" : selectedRateCard!.currencyCode,

                placementId: advertisementPlacement.placementId,

                ...(isHouseAd ? {} : {
                    pricing: {
                        placementId: advertisementPlacement.placementId,
                        pricingUnit: selectedRateCard!.pricingUnit,
                        quantity: Number(effectivePricingQuantity),
                    }
                }),
            };

            const internalName =
                advertisementDetails.internalName.trim();

            if (internalName.length > 0) {
                payload.internalName = internalName;
            }

            if (advertisementDetails.isClickable) {
                const destinationUrl =
                    advertisementDetails.destinationUrl.trim();

                if (destinationUrl.length > 0) {
                    payload.destinationUrl = destinationUrl;
                }
            }

            const notes =
                advertisementDetails.notes.trim();

            if (notes.length > 0) {
                payload.notes = notes;
            }

            if (advertisementSchedule.startDateTime) {
                payload.startAt =
                    scheduleLocalToIso(advertisementSchedule.startDateTime);
            }

            if (advertisementSchedule.endDateTime) {
                payload.endAt =
                    scheduleLocalToIso(advertisementSchedule.endDateTime);
            }

            return payload;
        };

    const getPersistenceErrorMessage = (
        error: unknown,
    ): string => {
        if (
            error instanceof Error &&
            error.message.trim()
        ) {
            return error.message;
        }

        return "The advertisement could not be saved. Please try again.";
    };

    /**
     * Synchronize the creatives in the form with the records
     * stored for this advertisement.
     *
     * The Creative component has already uploaded the media.
     * This function persists its permanent media URL and metadata.
     */
    const persistAdvertisementCreatives =
        async (
            savedAdvertisementId: number,
        ): Promise<void> => {
            if (
                !Number.isInteger(savedAdvertisementId) ||
                savedAdvertisementId <= 0
            ) {
                throw new Error(
                    "A valid advertisement ID is required to save creative content.",
                );
            }

            const existingResponse =
                await getAdvertisementCreatives(
                    savedAdvertisementId,
                );

            const existingCreatives =
                existingResponse.data ?? [];

            const retainedCreativeIds =
                new Set<number>();

            for (
                let index = 0;
                index < advertisementCreative.creatives.length;
                index += 1
            ) {
                const creative =
                    advertisementCreative.creatives[index];

                if (!creative) {
                    continue;
                }

                const mediaUrl =
                    creative.mediaUrl.trim();

                if (
                    !mediaUrl ||
                    mediaUrl.startsWith("blob:")
                ) {
                    throw new Error(
                        `Creative "${creative.title || `#${index + 1}`}" has no permanent media URL. Please upload it again before saving.`,
                    );
                }

                const widthPx =
                    creative.widthPx !== null &&
                        Number.isInteger(creative.widthPx) &&
                        creative.widthPx > 0
                        ? creative.widthPx
                        : null;

                const heightPx =
                    creative.heightPx !== null &&
                        Number.isInteger(creative.heightPx) &&
                        creative.heightPx > 0
                        ? creative.heightPx
                        : null;

                const input: CreateAdvertisementCreativeInput = {
                    formatId: placementFormat?.id ?? null,

                    creativeType: creative.creativeType,

                    variant: creative.variant,

                    title: creative.title.trim() || null,

                    altText: creative.altText.trim() || null,

                    mediaUrl,

                    thumbnailUrl: null,

                    widthPx,

                    heightPx,

                    displayOrder:
                        creative.displayOrder >= 0
                            ? creative.displayOrder
                            : index,

                    isPrimary: creative.isPrimary,

                    status:
                        creative.isActive
                            ? "ACTIVE"
                            : "INACTIVE",
                };

                // A draft edit must preserve the original database identity even
                // when its image URL changes. Matching only by URL creates a new
                // record and leaves the previous one soft-deleted (INACTIVE).
                const savedCreativeId = Number(creative.id);
                const existingCreative = existingCreatives.find(
                    (candidate) =>
                        !retainedCreativeIds.has(candidate.id) &&
                        candidate.id === savedCreativeId,
                ) ?? existingCreatives.find(
                    (candidate) =>
                        !retainedCreativeIds.has(candidate.id) &&
                        candidate.status === "ACTIVE" &&
                        candidate.mediaUrl === mediaUrl &&
                        candidate.variant === creative.variant,
                );

                if (existingCreative) {
                    const updateInput:
                        UpdateAdvertisementCreativeInput = {
                        ...input,
                    };

                    const updatedResponse =
                        await updateAdvertisementCreative(
                            savedAdvertisementId,
                            existingCreative.id,
                            updateInput,
                        );

                    if (!updatedResponse.data) {
                        throw new Error(
                            `The creative "${creative.title || mediaUrl}" was not returned after updating.`,
                        );
                    }

                    retainedCreativeIds.add(
                        existingCreative.id,
                    );

                    continue;
                }

                const createResponse =
                    await createAdvertisementCreative(
                        savedAdvertisementId,
                        input,
                    );

                const createdCreative =
                    createResponse.data;

                if (
                    !createdCreative ||
                    !Number.isInteger(createdCreative.id)
                ) {
                    throw new Error(
                        `The creative "${creative.title || mediaUrl}" was not returned after creation.`,
                    );
                }

                retainedCreativeIds.add(
                    createdCreative.id,
                );
            }

            /*
             * Remove obsolete records only after all current
             * creatives have been created or updated successfully.
             */
            const creativesToRemove =
                existingCreatives.filter(
                    (creative) =>
                        !retainedCreativeIds.has(creative.id),
                );

            for (const creative of creativesToRemove) {
                await deleteAdvertisementCreative(
                    savedAdvertisementId,
                    creative.id,
                );
            }
        };

    /**
     * Save or update the advertisement, then synchronize creatives.
     *
     * The advertisement ID is retained if creative persistence
     * fails, allowing the next attempt to update the same record.
     */
    const saveAdvertisementDraft =
        async (): Promise<number> => {
            const payload =
                buildAdvertisementPayload();

            let savedId: number;

            if (advertisementId !== null) {
                const updatePayload =
                    Object.fromEntries(
                        Object.entries(payload).filter(
                            ([key]) => key !== "clientId",
                        ),
                    ) as Omit<
                        typeof payload,
                        "clientId"
                    >;

                const response =
                    await updateAdvertisement(
                        advertisementId,
                        updatePayload,
                    );

                savedId = response.data.id;
            } else {
                const response =
                    await createAdvertisement(payload);

                savedId = response.data.id;
            }

            if (
                !Number.isInteger(savedId) ||
                savedId <= 0
            ) {
                throw new Error(
                    "The advertisement was saved without returning a valid advertisement ID.",
                );
            }

            setAdvertisementId(savedId);

            await persistAdvertisementCreatives(savedId);

            return savedId;
        };

    const handleSaveDraft =
        async (): Promise<void> => {
            if (
                persistenceAction !== null ||
                (!isHouseAd && !selectedClient) ||
                !isDetailsComplete ||
                !hasPlacement ||
                !isScheduleComplete ||
                !isPricingComplete
            ) {
                return;
            }

            setPersistenceAction("DRAFT");
            setPersistenceError(null);
            setPersistenceSuccess(null);

            try {
                const savedId =
                    await saveAdvertisementDraft();

                setPersistenceSuccess(
                    `Advertisement draft, pricing and creative content saved successfully (#${savedId}).`,
                );
            } catch (error) {
                setPersistenceError(
                    getPersistenceErrorMessage(error),
                );
            } finally {
                setPersistenceAction(null);
            }
        };

    const handleStepNavigation = (
        step: AdvertisementCreateStep,
    ): void => {
        switch (step) {
            case "CLIENT":
                navigateToStep("CLIENT");
                return;

            case "DETAILS":
                if (canOpenDetails) {
                    navigateToStep("DETAILS");
                }
                return;

            case "PLACEMENT":
                if (canOpenPlacement) {
                    navigateToStep("PLACEMENT");
                }
                return;

            case "SCHEDULE":
                if (canOpenSchedule) {
                    navigateToStep("SCHEDULE");
                }
                return;

            case "PRICING":
                if (isHouseAd) { navigateToStep("CREATIVE"); return; }
                if (canOpenPricing) {
                    navigateToStep("PRICING");
                }
                return;

            case "CREATIVE":
                if (canOpenCreative) {
                    navigateToStep("CREATIVE");
                }
                return;

            case "REVIEW":
                if (canOpenReview) {
                    navigateToStep("REVIEW");
                }
                return;

            default:
                return;
        }
    };

    const renderStepContent = () => {
        if (currentStep === "CLIENT") {
            return (
                <section
                    aria-labelledby="client-selection-heading"
                >
                    <div className="mb-3">
                        <Typography
                            id="client-selection-heading"
                            tabIndex={-1}
                            as="h2"
                            variant="headline"
                            className="
                                text-base
                                font-semibold
                                sm:text-lg
                            "
                        >
                            1. Select Client
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
                            Use an existing reusable client record rather than duplicating business information.
                        </Typography>
                    </div>

                    <Surface className="mb-4 border border-green-200 p-4">
                        <p className="mb-2 text-sm font-semibold text-gray-800">Advertisement classification</p>
                        <label className="mr-5 inline-flex items-center gap-2 text-sm"><input type="radio" checked={!isHouseAd} disabled={isEditMode} onChange={() => setIsHouseAd(false)} /> Paid advertisement</label>
                        <label className="inline-flex items-center gap-2 text-sm"><input type="radio" checked={isHouseAd} disabled={isEditMode} onChange={() => { setIsHouseAd(true); setSelectedClient(null); setClientConfirmed(true); }} /> House advertisement</label>
                    </Surface>
                    {isHouseAd ? (
                        <Surface className="border border-green-200 p-4">
                            <p className="text-sm text-gray-700">TheNewsTime.in in-house inventory does not require an external client or paid rate card. Campaign dates and creatives are configured in the existing steps.</p>
                            <button type="button" className="mt-4 rounded-md bg-green-700 px-5 py-2 text-sm font-semibold text-white" onClick={() => navigateToStep("DETAILS")}>Continue to Advertisement Details</button>
                        </Surface>
                    ) : isEditMode ? (
                        <Surface className="border border-gray-200 p-4">
                            <Typography as="p" variant="body" className="text-sm text-gray-600">
                                This draft is linked to its existing client. The client cannot be changed while editing this draft.
                            </Typography>
                            <Typography as="p" variant="body" className="mt-2 font-semibold">
                                {selectedClient?.displayName || selectedClient?.name || "Selected client"}
                            </Typography>
                        </Surface>
                    ) : (
                        <ClientSelection
                            value={selectedClient}
                            onChange={handleClientChange}
                            onConfirm={handleClientConfirm}
                        />
                    )}

                    {selectedClient &&
                        !selectedClient.adCreationHold && (
                            <div className="mt-4 flex justify-end">
                                <button
                                    type="button"
                                    onClick={handleContinue}
                                    className="
                                        inline-flex min-h-10 items-center justify-center gap-2
                                        rounded-md bg-green-700 px-5 py-2 text-sm font-semibold
                                        text-white hover:bg-green-800 focus:outline-none
                                        focus:ring-2 focus:ring-green-600 focus:ring-offset-2
                                    "
                                >
                                    Continue to Advertisement Details
                                </button>
                            </div>
                        )}
                </section>
            );
        }

        if (currentStep === "DETAILS") {
            return (
                <section
                    aria-labelledby="advertisement-details-heading"
                >
                    <Surface
                        className="
                            border
                            border-green-200
                            bg-green-50
                            p-5
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
                            <div className="flex items-start gap-3">
                                <div
                                    className="
                                        flex h-10 w-10 shrink-0 items-center justify-center
                                        rounded-lg bg-white text-green-700
                                    "
                                >
                                    <CheckCircle2
                                        size={21}
                                        aria-hidden="true"
                                    />
                                </div>

                                <div>
                                    <Typography
                                        as="h2"
                                        id="advertisement-details-heading"
                                        variant="headline"
                                        className="
                                            scroll-mt-24 text-base font-semibold text-green-900
                                        "
                                    >
                                        2. Advertisement Details
                                    </Typography>

                                    <Typography
                                        as="p"
                                        variant="body"
                                        className="mt-1 text-sm text-green-800"
                                    >
                                        {clientName}
                                        {selectedClient?.clientCode
                                            ? ` (${selectedClient.clientCode})`
                                            : ""}
                                    </Typography>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    navigateToStep("CLIENT")
                                }
                                className="
                                    inline-flex min-h-9 items-center justify-center rounded-md
                                    border border-green-300 bg-white px-3 py-2 text-sm font-semibold
                                    text-green-800 hover:bg-green-50 focus:outline-none
                                    focus:ring-2 focus:ring-green-600 focus:ring-offset-2
                                "
                            >
                                Change Client
                            </button>
                        </div>
                    </Surface>

                    <div className="mt-5">
                        <AdvertisementDetails
                            value={advertisementDetails}
                            onChange={setAdvertisementDetails}
                        />
                    </div>

                    <div
                        className="
                            mt-5 flex flex-col gap-3 sm:flex-row sm:justify-between
                        "
                    >
                        <button
                            type="button"
                            onClick={() =>
                                navigateToStep("CLIENT")
                            }
                            className="
                                inline-flex min-h-10 items-center justify-center rounded-md
                                border border-gray-300 bg-white px-4 py-2 text-sm font-semibold
                                text-gray-700 hover:bg-gray-50 focus:outline-none
                                focus:ring-2 focus:ring-green-600 focus:ring-offset-2
                            "
                        >
                            Back to Client
                        </button>

                        <button
                            type="button"
                            disabled={!isDetailsComplete}
                            onClick={() => {
                                if (isDetailsComplete) {
                                    navigateToStep("PLACEMENT");
                                }
                            }}
                            className="
                                inline-flex min-h-10 items-center justify-center gap-2 rounded-md
                                bg-green-700 px-5 py-2 text-sm font-semibold text-white
                                hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-gray-300
                                focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2
                            "
                        >
                            Continue to Placement
                        </button>
                    </div>
                </section>
            );
        }

        if (currentStep === "PLACEMENT") {
            return (
                <section
                    aria-labelledby="advertisement-placement-heading"
                    tabIndex={-1}
                    className="scroll-mt-24"
                >
                    <Typography
                        id="advertisement-placement-heading"
                        tabIndex={-1}
                        as="h2"
                        variant="headline"
                        className="
                            mb-4 text-base font-semibold text-gray-900 outline-none
                        "
                    >
                        3. Placement
                    </Typography>

                    <AdvertisementPlacement
                        value={advertisementPlacement}
                        onChange={handlePlacementChange}
                    />

                    <div
                        className="
                            mt-4 rounded-md border border-blue-200 bg-blue-50 p-3
                        "
                    >
                        <p className="text-sm text-blue-900">
                            Choose the placement first. Schedule dates and pricing are configured in the following steps.
                        </p>
                    </div>

                    <div
                        className="
                            mt-5 flex flex-col gap-3 sm:flex-row sm:justify-between
                        "
                    >
                        <button
                            type="button"
                            onClick={() =>
                                navigateToStep("DETAILS")
                            }
                            className="
                                inline-flex min-h-10 items-center justify-center rounded-md
                                border border-gray-300 bg-white px-4 py-2 text-sm font-semibold
                                text-gray-700 hover:bg-gray-50 focus:outline-none
                                focus:ring-2 focus:ring-green-600 focus:ring-offset-2
                            "
                        >
                            Back to Details
                        </button>

                        <button
                            type="button"
                            disabled={!hasPlacement}
                            onClick={() => {
                                if (hasPlacement) {
                                    navigateToStep("SCHEDULE");
                                }
                            }}
                            className="
                                inline-flex min-h-10 items-center justify-center gap-2 rounded-md
                                bg-green-700 px-5 py-2 text-sm font-semibold text-white
                                hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-gray-300
                                focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2
                            "
                        >
                            Continue to Schedule
                        </button>
                    </div>
                </section>
            );
        }

        if (currentStep === "SCHEDULE") {
            return (
                <section
                    aria-labelledby="advertisement-schedule-heading"
                    tabIndex={-1}
                    className="scroll-mt-24"
                >
                    <Typography
                        id="advertisement-schedule-heading"
                        tabIndex={-1}
                        as="h2"
                        variant="headline"
                        className="
                            mb-4 text-base font-semibold text-gray-900 outline-none
                        "
                    >
                        4. Schedule
                    </Typography>

                    <Typography
                        as="p"
                        variant="body"
                        className="mb-5 text-sm text-gray-600"
                    >
                        Choose when the advertisement should run. These dates determine the quantity automatically when DAY pricing is selected.
                    </Typography>

                    <Schedule
                        value={advertisementSchedule}
                        onChange={setAdvertisementSchedule}
                    />

                    {inclusiveScheduleDays !== null && (
                        <Surface
                            className="
                                mt-5 border border-green-200 bg-green-50 p-4
                            "
                        >
                            <Typography
                                as="p"
                                variant="body"
                                className="text-sm font-semibold text-green-900"
                            >
                                Inclusive schedule duration
                            </Typography>

                            <Typography
                                as="p"
                                variant="body"
                                className="mt-1 text-lg font-bold text-green-800"
                            >
                                {inclusiveScheduleDays}{" "}
                                {inclusiveScheduleDays === 1
                                    ? "calendar day"
                                    : "calendar days"}
                            </Typography>

                            <Typography
                                as="p"
                                variant="body"
                                className="mt-1 text-sm text-green-800"
                            >
                                Both the start date and end date are included in the duration.
                            </Typography>
                        </Surface>
                    )}

                    {!isScheduleComplete && (
                        <Surface
                            className="
                                mt-5 border border-amber-200 bg-amber-50 p-4
                            "
                        >
                            <Typography
                                as="p"
                                variant="body"
                                className="text-sm font-semibold text-amber-900"
                            >
                                Schedule incomplete
                            </Typography>

                            <Typography
                                as="p"
                                variant="body"
                                className="mt-1 text-sm text-amber-800"
                            >
                                Complete the required schedule fields and correct any date validation errors before continuing.
                            </Typography>
                        </Surface>
                    )}

                    <div
                        className="
                            mt-5 flex flex-col gap-3 sm:flex-row sm:justify-between
                        "
                    >
                        <button
                            type="button"
                            onClick={() =>
                                navigateToStep("PLACEMENT")
                            }
                            className="
                                inline-flex min-h-10 items-center justify-center rounded-md
                                border border-gray-300 bg-white px-4 py-2 text-sm font-semibold
                                text-gray-700 hover:bg-gray-50 focus:outline-none
                                focus:ring-2 focus:ring-green-600 focus:ring-offset-2
                            "
                        >
                            Back to Placement
                        </button>

                        <button
                            type="button"
                            disabled={!isScheduleComplete}
                            onClick={() => {
                                if (isScheduleComplete) {
                                    navigateToStep(isHouseAd ? "CREATIVE" : "PRICING");
                                }
                            }}
                            className="
                                inline-flex min-h-10 items-center justify-center gap-2 rounded-md
                                bg-green-700 px-5 py-2 text-sm font-semibold text-white
                                hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-gray-300
                                focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2
                            "
                        >
                            Continue to Placement Pricing
                        </button>
                    </div>
                </section>
            );
        }

        if (currentStep === "PRICING" && !isHouseAd) {
            return (
                <section
                    aria-labelledby="advertisement-pricing-heading"
                    tabIndex={-1}
                    className="scroll-mt-24"
                >
                    <Typography
                        id="advertisement-pricing-heading"
                        tabIndex={-1}
                        as="h2"
                        variant="headline"
                        className="
                            mb-2 text-base font-semibold text-gray-900 outline-none
                        "
                    >
                        5. Placement Pricing
                    </Typography>

                    <Typography
                        as="p"
                        variant="body"
                        className="mb-5 text-sm text-gray-600"
                    >
                        Select the effective rate card for your placement. For DAY pricing, quantity is automatically calculated from the inclusive schedule duration.
                    </Typography>

                    <Surface
                        className="
                            mb-5 border border-gray-200 bg-white p-4
                        "
                    >
                        <Typography
                            as="h3"
                            variant="headline"
                            className="text-sm font-semibold text-gray-900"
                        >
                            Schedule summary
                        </Typography>

                        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Start date
                                </p>

                                <p className="mt-1 text-sm font-semibold text-gray-900">
                                    {advertisementSchedule.startDateTime
                                        ? formatIstInputDateTime(advertisementSchedule.startDateTime)
                                        : "Not selected"}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                    End date
                                </p>

                                <p className="mt-1 text-sm font-semibold text-gray-900">
                                    {advertisementSchedule.endDateTime
                                        ? formatIstInputDateTime(advertisementSchedule.endDateTime)
                                        : "Not selected"}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Inclusive duration
                                </p>

                                <p className="mt-1 text-sm font-semibold text-gray-900">
                                    {inclusiveScheduleDays !== null
                                        ? `${inclusiveScheduleDays} ${inclusiveScheduleDays === 1
                                            ? "day"
                                            : "days"
                                        }`
                                        : "Not available"}
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                navigateToStep("SCHEDULE")
                            }
                            className="
                                mt-3 text-sm font-semibold text-green-800 underline
                                decoration-green-300 underline-offset-2 hover:text-green-900
                            "
                        >
                            Change schedule
                        </button>
                    </Surface>

                    <Surface
                        className="
                            border border-gray-200 bg-white p-5
                        "
                    >
                        <div className="mb-5">
                            <Typography
                                as="h3"
                                variant="headline"
                                className="text-base font-semibold text-gray-900"
                            >
                                Configured rate card
                            </Typography>

                            <Typography
                                as="p"
                                variant="body"
                                className="mt-1 text-sm text-gray-600"
                            >
                                Rate cards are managed in Advertisement Rate Cards. The rate and currency come from the selected configuration.
                            </Typography>
                        </div>

                        {!hasPlacement && (
                            <p className="text-sm text-amber-800">
                                Select a placement before configuring pricing.
                            </p>
                        )}

                        {hasPlacement && rateCardsLoading && (
                            <p
                                role="status"
                                className="text-sm text-gray-600"
                            >
                                Loading configured rate cards...
                            </p>
                        )}

                        {hasPlacement && rateCardError && (
                            <div
                                role="alert"
                                className="
                                    rounded-md border border-red-200 bg-red-50 p-3
                                    text-sm text-red-800
                                "
                            >
                                {rateCardError}
                            </div>
                        )}

                        {hasPlacement &&
                            !rateCardsLoading &&
                            !rateCardError &&
                            effectiveRateCards.length === 0 && (
                                <div
                                    role="status"
                                    className="
                                        rounded-md border border-amber-200 bg-amber-50
                                        p-3 text-sm text-amber-900
                                    "
                                >
                                    No active rate card is effective for this placement on the selected schedule start date. Configure or activate a suitable rate card in Advertisement Rate Cards before continuing.
                                </div>
                            )}

                        {hasPlacement &&
                            !rateCardsLoading &&
                            !rateCardError &&
                            effectiveRateCards.length > 0 && (
                                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                    <div>
                                        <label
                                            htmlFor="advertisement-rate-card"
                                            className="
                                                mb-2 block text-sm font-medium text-gray-700
                                            "
                                        >
                                            Rate Card
                                            <span className="ml-1 text-red-600">*</span>
                                        </label>

                                        <select
                                            id="advertisement-rate-card"
                                            value={
                                                selectedRateCard
                                                    ? String(selectedRateCard.id)
                                                    : ""
                                            }
                                            onChange={(event) => {
                                                const value =
                                                    event.target.value;

                                                setSelectedRateCardId(
                                                    value
                                                        ? Number(value)
                                                        : null,
                                                );

                                                setPersistenceError(null);
                                                setPersistenceSuccess(null);
                                            }}
                                            required
                                            className="
                                                min-h-11 w-full rounded-md border border-gray-300
                                                bg-white px-3 py-2 text-sm text-gray-900
                                                focus:border-green-600 focus:outline-none
                                                focus:ring-2 focus:ring-green-600
                                            "
                                        >
                                            <option value="">
                                                Select a rate card
                                            </option>

                                            {effectiveRateCards.map(
                                                (rateCard) => (
                                                    <option
                                                        key={rateCard.id}
                                                        value={String(rateCard.id)}
                                                    >
                                                        {rateCard.pricingUnit}
                                                        {" — "}
                                                        {formatCurrency(
                                                            Number(rateCard.rateAmount),
                                                            rateCard.currencyCode,
                                                        )}
                                                        {" / "}
                                                        {rateCard.pricingUnit.toLowerCase()}
                                                    </option>
                                                ),
                                            )}
                                        </select>

                                        {selectedRateCard && (
                                            <p className="mt-2 text-xs text-gray-500">
                                                Effective from{" "}
                                                {formatIstDate(selectedRateCard.effectiveFrom)}
                                                {selectedRateCard.effectiveTo
                                                    ? ` to ${formatIstDate(selectedRateCard.effectiveTo)}`
                                                    : " (no end date)"}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="advertisement-pricing-quantity"
                                            className="
                                                mb-2 block text-sm font-medium text-gray-700
                                            "
                                        >
                                            Quantity
                                            <span className="ml-1 text-red-600">*</span>
                                        </label>

                                        {selectedRateCard?.pricingUnit === "DAY" ? (
                                            <input
                                                id="advertisement-pricing-quantity"
                                                type="number"
                                                value={
                                                    inclusiveScheduleDays ?? ""
                                                }
                                                readOnly
                                                aria-readonly="true"
                                                aria-describedby="advertisement-pricing-quantity-help"
                                                className="
                                                    min-h-11 w-full rounded-md border border-gray-300
                                                    bg-gray-100 px-3 py-2 text-sm text-gray-700
                                                    focus:outline-none
                                                "
                                            />
                                        ) : (
                                            <input
                                                id="advertisement-pricing-quantity"
                                                type="number"
                                                min="0.0001"
                                                max="99999999999.9999"
                                                step="0.0001"
                                                inputMode="decimal"
                                                value={pricingQuantity}
                                                onChange={(event) => {
                                                    setPricingQuantity(
                                                        event.target.value,
                                                    );

                                                    setPersistenceError(null);
                                                    setPersistenceSuccess(null);
                                                }}
                                                aria-describedby="advertisement-pricing-quantity-help"
                                                aria-invalid={
                                                    pricingQuantity.trim().length > 0 &&
                                                    !isPricingQuantityValid
                                                }
                                                required
                                                className="
                                                    min-h-11 w-full rounded-md border border-gray-300
                                                    bg-white px-3 py-2 text-sm text-gray-900
                                                    focus:border-green-600 focus:outline-none
                                                    focus:ring-2 focus:ring-green-600
                                                "
                                            />
                                        )}

                                        <p
                                            id="advertisement-pricing-quantity-help"
                                            className="mt-2 text-xs text-gray-500"
                                        >
                                            {selectedRateCard?.pricingUnit === "DAY"
                                                ? "Automatically calculated from the inclusive schedule dates. Change the schedule to update this quantity."
                                                : "Enter the billable quantity for this pricing unit. Up to four decimal places are supported."}
                                        </p>

                                        {selectedRateCard?.pricingUnit === "DAY" &&
                                            inclusiveScheduleDays === null && (
                                                <p
                                                    role="alert"
                                                    className="mt-1 text-sm text-red-700"
                                                >
                                                    A valid start date and end date are required to calculate DAY pricing.
                                                </p>
                                            )}

                                        {selectedRateCard?.pricingUnit !== "DAY" &&
                                            pricingQuantity.trim().length > 0 &&
                                            !isPricingQuantityValid && (
                                                <p
                                                    role="alert"
                                                    className="mt-1 text-sm text-red-700"
                                                >
                                                    Quantity must be greater than zero and contain no more than four decimal places.
                                                </p>
                                            )}
                                    </div>
                                </div>
                            )}

                        {selectedRateCard && (
                            <div
                                className="
                                    mt-6 grid grid-cols-1 gap-4 rounded-lg
                                    border border-green-200 bg-green-50 p-4 sm:grid-cols-3
                                "
                            >
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-600">
                                        Configured rate
                                    </p>

                                    <p className="mt-1 text-base font-semibold text-gray-900">
                                        {formatCurrency(
                                            Number(selectedRateCard.rateAmount),
                                            selectedRateCard.currencyCode,
                                        )}
                                    </p>

                                    <p className="mt-1 text-xs text-gray-600">
                                        Per {selectedRateCard.pricingUnit.toLowerCase()}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-600">
                                        Pricing quantity
                                    </p>

                                    <p className="mt-1 text-base font-semibold text-gray-900">
                                        {isPricingQuantityValid
                                            ? Number(
                                                effectivePricingQuantity,
                                            ).toLocaleString()
                                            : "—"}
                                    </p>

                                    {selectedRateCard.pricingUnit === "DAY" && (
                                        <p className="mt-1 text-xs text-gray-600">
                                            Derived from schedule
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-600">
                                        Standard Amount
                                    </p>

                                    <p className="mt-1 text-xl font-bold text-green-800">
                                        {calculatedStandardAmount !== null
                                            ? formatCurrency(
                                                calculatedStandardAmount,
                                                selectedRateCard.currencyCode,
                                            )
                                            : "—"}
                                    </p>

                                    <p className="mt-1 text-xs text-gray-600">
                                        Automatically calculated · Read-only
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="mt-4 rounded-md border border-blue-200 bg-blue-50 p-3">
                            <p className="text-sm text-blue-900">
                                <strong>Important:</strong>{" "}
                                Standard Amount is the system-calculated price based on the rate card and quantity. It is separate from the negotiated Advertisement Amount. The backend must recalculate and persist the authoritative Standard Amount.
                            </p>
                        </div>
                    </Surface>

                    <div
                        className="
                            mt-5 flex flex-col gap-3 sm:flex-row sm:justify-between
                        "
                    >
                        <button
                            type="button"
                            onClick={() =>
                                navigateToStep("SCHEDULE")
                            }
                            className="
                                inline-flex min-h-10 items-center justify-center rounded-md
                                border border-gray-300 bg-white px-4 py-2 text-sm font-semibold
                                text-gray-700 hover:bg-gray-50 focus:outline-none
                                focus:ring-2 focus:ring-green-600 focus:ring-offset-2
                            "
                        >
                            Back to Schedule
                        </button>

                        <button
                            type="button"
                            disabled={
                                !isPricingComplete ||
                                rateCardsLoading
                            }
                            onClick={() => {
                                if (isPricingComplete) {
                                    navigateToStep("CREATIVE");
                                }
                            }}
                            className="
                                inline-flex min-h-10 items-center justify-center gap-2 rounded-md
                                bg-green-700 px-5 py-2 text-sm font-semibold text-white
                                hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-gray-300
                                focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2
                            "
                        >
                            Continue to Creative
                        </button>
                    </div>
                </section>
            );
        }

        if (currentStep === "CREATIVE") {
            return (
                <section
                    aria-labelledby="advertisement-creative-heading"
                    tabIndex={-1}
                    className="scroll-mt-24"
                >
                    <div className="mb-5">
                        <Typography
                            id="advertisement-creative-heading"
                            tabIndex={-1}
                            as="h2"
                            variant="headline"
                            className="
                                scroll-mt-24 text-base font-semibold text-gray-900 outline-none
                            "
                        >
                            6. Creative Content
                        </Typography>

                        <Typography
                            as="p"
                            variant="body"
                            className="mt-1 text-sm text-gray-600"
                        >
                            Add the artwork or content that will be displayed in the selected placement.
                        </Typography>
                    </div>

                    <Creative
                        value={advertisementCreative}
                        onChange={setAdvertisementCreative}
                        placementName={
                            advertisementPlacement.placementCode ??
                            "Selected placement"
                        }
                        placementFormat={
                            advertisementPlacement.format
                        }
                    />

                    {!isCreativeComplete && (
                        <Surface
                            className="
                                mt-5 border border-amber-200 bg-amber-50 p-4
                            "
                        >
                            <div className="flex items-start gap-3">
                                <div
                                    className="
                                        mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full bg-amber-500
                                    "
                                    aria-hidden="true"
                                />

                                <div>
                                    <Typography
                                        as="p"
                                        variant="body"
                                        className="text-sm font-semibold text-amber-900"
                                    >
                                        Creative step is not complete
                                    </Typography>

                                    <Typography
                                        as="p"
                                        variant="body"
                                        className="mt-1 text-sm text-amber-800"
                                    >
                                        {creativeValidation.message}
                                    </Typography>
                                </div>
                            </div>
                        </Surface>
                    )}

                    {isCreativeComplete && (
                        <Surface
                            className="
                                mt-5 border border-green-200 bg-green-50 p-4
                            "
                        >
                            <div className="flex items-start gap-3">
                                <CheckCircle2
                                    size={20}
                                    className="mt-0.5 shrink-0 text-green-700"
                                    aria-hidden="true"
                                />

                                <div>
                                    <Typography
                                        as="p"
                                        variant="body"
                                        className="text-sm font-semibold text-green-900"
                                    >
                                        Creative step complete
                                    </Typography>

                                    <Typography
                                        as="p"
                                        variant="body"
                                        className="mt-1 text-sm text-green-800"
                                    >
                                        {advertisementCreative.creatives.length === 1
                                            ? "The advertisement has one valid creative."
                                            : `The advertisement has ${advertisementCreative.creatives.length} valid creatives.`}
                                    </Typography>
                                </div>
                            </div>
                        </Surface>
                    )}

                    <div
                        className="
                            mt-5 flex flex-col gap-3 sm:flex-row sm:justify-between
                        "
                    >
                        <button
                            type="button"
                            onClick={() =>
                                navigateToStep(isHouseAd ? "SCHEDULE" : "PRICING")
                            }
                            className="
                                inline-flex min-h-10 items-center justify-center rounded-md
                                border border-gray-300 bg-white px-4 py-2 text-sm font-semibold
                                text-gray-700 hover:bg-gray-50 focus:outline-none
                                focus:ring-2 focus:ring-green-600 focus:ring-offset-2
                            "
                        >
                            Back to Placement Pricing
                        </button>

                        <button
                            type="button"
                            disabled={!isCreativeComplete}
                            onClick={() => {
                                if (isCreativeComplete) {
                                    navigateToStep("REVIEW");
                                }
                            }}
                            className="
                                inline-flex min-h-10 items-center justify-center gap-2 rounded-md
                                bg-green-700 px-5 py-2 text-sm font-semibold text-white
                                hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-gray-300
                                focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2
                            "
                        >
                            Continue to Review
                        </button>
                    </div>
                </section>
            );
        }

        return (
            <section
                aria-labelledby="advertisement-review-heading"
                tabIndex={-1}
                className="scroll-mt-24"
            >
                <Typography
                    id="advertisement-review-heading"
                    tabIndex={-1}
                    as="h2"
                    variant="headline"
                    className="
                        mb-2 text-base font-semibold text-gray-900 outline-none
                    "
                >
                    7. Review & Save Draft
                </Typography>

                <Typography
                    as="p"
                    variant="body"
                    className="mb-5 text-sm text-gray-600"
                >
                    Review the client, advertisement details, placement, schedule, pricing, and creative content. Save the advertisement as a draft, then complete commercials, payment, targeting, rotation, and delivery in its workspace before submitting for approval.
                </Typography>

                <Review
                    client={selectedClient}
                    details={advertisementDetails}
                    placement={advertisementPlacement}
                    creative={advertisementCreative}
                    placementFormat={placementFormat}
                    schedule={advertisementSchedule}
                    scheduleValid={isScheduleComplete}
                />

                <Surface
                    className="
                        mt-5 border border-gray-200 bg-white p-4
                    "
                >
                    <Typography
                        as="h3"
                        variant="headline"
                        className="text-base font-semibold text-gray-900"
                    >
                        Placement Pricing Summary
                    </Typography>

                    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div>
                            <p className="text-sm text-gray-600">
                                Pricing unit
                            </p>

                            <p className="mt-1 font-semibold text-gray-900">
                                {selectedRateCard?.pricingUnit ?? "Not selected"}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-600">
                                Rate
                            </p>

                            <p className="mt-1 font-semibold text-gray-900">
                                {selectedRateCard
                                    ? formatCurrency(
                                        Number(selectedRateCard.rateAmount),
                                        selectedRateCard.currencyCode,
                                    )
                                    : "Not selected"}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-600">
                                Quantity
                            </p>

                            <p className="mt-1 font-semibold text-gray-900">
                                {isPricingQuantityValid
                                    ? Number(
                                        effectivePricingQuantity,
                                    ).toLocaleString()
                                    : "Not valid"}
                            </p>
                        </div>
                    </div>

                    <div className="mt-4 rounded-md border border-green-200 bg-green-50 p-4">
                        <p className="text-sm font-medium text-green-900">
                            Standard Amount
                        </p>

                        <p className="mt-1 text-2xl font-bold text-green-800">
                            {selectedRateCard &&
                                calculatedStandardAmount !== null
                                ? formatCurrency(
                                    calculatedStandardAmount,
                                    selectedRateCard.currencyCode,
                                )
                                : "Not available"}
                        </p>

                        <p className="mt-1 text-xs text-green-800">
                            Read-only estimate. The backend recalculates the authoritative amount when saving.
                        </p>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={() =>
                                navigateToStep("SCHEDULE")
                            }
                            className="
                                text-sm font-semibold text-green-800 underline
                                decoration-green-300 underline-offset-2 hover:text-green-900
                            "
                        >
                            Edit Schedule
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                navigateToStep(isHouseAd ? "SCHEDULE" : "PRICING")
                            }
                            className="
                                text-sm font-semibold text-green-800 underline
                                decoration-green-300 underline-offset-2 hover:text-green-900
                            "
                        >
                            Edit Placement Pricing
                        </button>
                    </div>
                </Surface>

                {!isCreativeComplete && (
                    <Surface
                        className="
                            mt-5 border border-amber-200 bg-amber-50 p-4
                        "
                    >
                        <Typography
                            as="p"
                            variant="body"
                            className="text-sm font-semibold text-amber-900"
                        >
                            Creative validation is incomplete
                        </Typography>

                        <Typography
                            as="p"
                            variant="body"
                            className="mt-1 text-sm text-amber-800"
                        >
                            {creativeValidation.message}
                        </Typography>

                        <button
                            type="button"
                            onClick={() =>
                                navigateToStep("CREATIVE")
                            }
                            className="
                                mt-2 text-sm font-semibold text-amber-900 underline
                                underline-offset-2
                            "
                        >
                            Return to Creative
                        </button>
                    </Surface>
                )}

                {persistenceError && (
                    <Surface
                        className="
                            mt-5 border border-red-200 bg-red-50 p-4
                        "
                    >
                        <Typography
                            as="p"
                            variant="body"
                            className="text-sm font-medium text-red-800"
                        >
                            {persistenceError}
                        </Typography>
                    </Surface>
                )}

                {persistenceSuccess && (
                    <Surface
                        className="
                            mt-5 border border-green-200 bg-green-50 p-4
                        "
                    >
                        <Typography
                            as="p"
                            variant="body"
                            className="text-sm font-medium text-green-800"
                        >
                            {persistenceSuccess}
                        </Typography>

                        {advertisementId !== null && (
                            <Link
                                to={`/admin/advertisements/${advertisementId}/workspace`}
                                className="
                                    mt-3 inline-flex min-h-10 items-center justify-center
                                    rounded-md bg-green-700 px-4 py-2 text-sm font-semibold
                                    text-white hover:bg-green-800 focus:outline-none
                                    focus:ring-2 focus:ring-green-600 focus:ring-offset-2
                                "
                            >
                                Open Advertisement Workspace
                            </Link>
                        )}
                    </Surface>
                )}

                <div
                    className="
                        mt-5 flex flex-col gap-3 sm:flex-row sm:items-center
                        sm:justify-between
                    "
                >
                    <button
                        type="button"
                        onClick={() =>
                            navigateToStep("CREATIVE")
                        }
                        disabled={persistenceAction !== null}
                        className="
                            inline-flex min-h-10 items-center justify-center rounded-md
                            border border-gray-300 bg-white px-4 py-2 text-sm font-semibold
                            text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed
                            disabled:opacity-60 focus:outline-none focus:ring-2
                            focus:ring-green-600 focus:ring-offset-2
                        "
                    >
                        Back to Creative
                    </button>

                    <div className="flex flex-col gap-3 sm:flex-row">
                        <button
                            type="button"
                            onClick={() => {
                                void handleSaveDraft();
                            }}
                            disabled={
                                persistenceAction !== null ||
                                (!isHouseAd && !selectedClient) ||
                                !isDetailsComplete ||
                                !hasPlacement ||
                                !isScheduleComplete ||
                                !isPricingComplete
                            }
                            className="
                                inline-flex min-h-10 items-center justify-center gap-2 rounded-md
                                border border-green-700 bg-white px-5 py-2 text-sm font-semibold
                                text-green-800 hover:bg-green-50 disabled:cursor-not-allowed
                                disabled:border-gray-300 disabled:text-gray-400 focus:outline-none
                                focus:ring-2 focus:ring-green-600 focus:ring-offset-2
                            "
                        >
                            {persistenceAction === "DRAFT"
                                ? "Saving Draft..."
                                : "Save Draft"}
                        </button>


                    </div>
                </div>
            </section>
        );
    };

    const workflowSteps: Array<{
        number: string;
        label: string;
        step: AdvertisementCreateStep;
        active: boolean;
        completed: boolean;
        enabled: boolean;
    }> = [
            {
                number: "1",
                label: "Client",
                step: "CLIENT",
                active: currentStep === "CLIENT",
                completed: clientConfirmed,
                enabled: true,
            },
            {
                number: "2",
                label: "Details",
                step: "DETAILS",
                active: currentStep === "DETAILS",
                completed: isDetailsComplete,
                enabled: canOpenDetails,
            },
            {
                number: "3",
                label: "Placement",
                step: "PLACEMENT",
                active: currentStep === "PLACEMENT",
                completed: hasPlacement,
                enabled: canOpenPlacement,
            },
            {
                number: "4",
                label: "Schedule",
                step: "SCHEDULE",
                active: currentStep === "SCHEDULE",
                completed: isScheduleComplete,
                enabled: canOpenSchedule,
            },
            {
                number: "5",
                label: "Pricing",
                step: "PRICING",
                active: currentStep === "PRICING",
                completed: isPricingComplete,
                enabled: canOpenPricing,
            },
            {
                number: "6",
                label: "Creative",
                step: "CREATIVE",
                active: currentStep === "CREATIVE",
                completed: isCreativeComplete,
                enabled: canOpenCreative,
            },
            {
                number: "7",
                label: "Review & Save Draft",
                step: "REVIEW",
                active: currentStep === "REVIEW",
                completed:
                    isScheduleComplete &&
                    isPricingComplete &&
                    isCreativeComplete,
                enabled: canOpenReview,
            },
        ];

    if (draftLoading || draftLoadError) {
        return (
            <MainLayout>
                <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    {draftLoadError ? (
                        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">
                            <p className="font-semibold">Unable to load advertisement draft</p>
                            <p className="mt-1">{draftLoadError}</p>
                        </div>
                    ) : (
                        <div role="status" aria-label="Loading advertisement draft" className="flex items-center gap-4 rounded-xl border border-green-200 bg-green-50 p-5 text-green-900 shadow-sm">
                            <span aria-hidden="true" className="h-6 w-6 shrink-0 animate-spin rounded-full border-[3px] border-green-200 border-t-green-700" />
                            <div>
                                <p className="font-semibold">Preparing your advertisement draft</p>
                                <p className="mt-1 text-sm">Retrieving saved advertisement details. Please wait…</p>
                            </div>
                        </div>
                    )}
                </main>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <main
                className="
                    mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8
                "
            >
                <div className="flex flex-col gap-6">
                    <Link to="/admin/advertisements/list" className="inline-flex items-center gap-2 text-sm font-semibold text-green-700 hover:underline"><ArrowLeft size={16} /> Back to Advertisement Management</Link>
                    <AdvertisementAdminPageHeader title={isEditMode ? "Edit Advertisement (Draft)" : "Create Advertisement"} description="Select the client, define the advertisement, choose its placement, set the schedule, calculate placement pricing, add creative content, and save a draft. Complete the remaining setup in the workspace before submitting for approval." />

                    <section
                        aria-labelledby="advertisement-create-progress"
                    >
                        <Surface
                            className="border border-gray-200 p-4"
                        >
                            <Typography
                                id="advertisement-create-progress"
                                as="h2"
                                variant="headline"
                                className="text-sm font-semibold text-gray-900"
                            >
                                Advertisement Creation
                            </Typography>

                            <div
                                className="
                                    mt-4 grid grid-cols-2 gap-3
                                    sm:grid-cols-3 lg:grid-cols-7
                                "
                            >
                                {workflowSteps.filter((step) => !isHouseAd || step.step !== "PRICING").map((step) => (
                                    <WorkflowStep
                                        key={step.step}
                                        number={step.number}
                                        label={step.label}
                                        active={step.active}
                                        completed={step.completed}
                                        enabled={step.enabled}
                                        onClick={() =>
                                            handleStepNavigation(step.step)
                                        }
                                    />
                                ))}
                            </div>
                        </Surface>
                    </section>

                    {renderStepContent()}
                </div>
            </main>
        </MainLayout>
    );
};

interface WorkflowStepProps {
    number: string;
    label: string;
    active: boolean;
    completed: boolean;
    enabled: boolean;
    onClick: () => void;
}

const WorkflowStep = ({
    number,
    label,
    active,
    completed,
    enabled,
    onClick,
}: WorkflowStepProps) => {
    return (
        <button
            type="button"
            disabled={!enabled}
            onClick={onClick}
            aria-current={active ? "step" : undefined}
            className={`
                w-full rounded-md border px-3 py-3 text-left transition
                focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2
                ${active
                    ? "border-green-300 bg-green-50"
                    : completed
                        ? "border-green-200 bg-white hover:bg-green-50"
                        : enabled
                            ? "border-gray-200 bg-gray-50 hover:bg-white"
                            : "cursor-not-allowed border-gray-200 bg-gray-50 opacity-60"
                }
            `}
        >
            <div className="flex items-center gap-2">
                <span
                    className={`
                        flex h-7 w-7 shrink-0 items-center justify-center rounded-full
                        text-xs font-bold
                        ${completed
                            ? "bg-green-100 text-green-800"
                            : active
                                ? "bg-green-700 text-white"
                                : "bg-gray-200 text-gray-500"
                        }
                    `}
                >
                    {completed ? (
                        <CheckCircle2
                            size={15}
                            aria-hidden="true"
                        />
                    ) : (
                        number
                    )}
                </span>

                <span
                    className={`
                        text-xs font-semibold
                        ${active
                            ? "text-green-900"
                            : "text-gray-600"
                        }
                    `}
                >
                    {label}
                </span>
            </div>
        </button>
    );
};

export default AdvertisementCreatePage;
