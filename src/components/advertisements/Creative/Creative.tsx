import {
    useEffect,
    useRef,
    useState,
} from "react";
import type {
    ChangeEvent,
} from "react";

import {
    uploadAdvertisementCreative,
} from "@/api/advertisements";

import Surface from "@/components/ui/Surface";
import Typography from "@/components/ui/Typography";

import AddedCreativeCard from "./AddedCreativeCard";
import CreativeForm from "./CreativeForm";

import {
    createEmptyForm,
    getDimensionComparison,
    isObjectUrl,
    parsePositiveInteger,
} from "./creative.helpers";

import type {
    AdvertisementCreativeItem,
    AdvertisementCreativePlacementFormat,
    AdvertisementCreativeType,
    AdvertisementCreativeValue,
    AdvertisementCreativeVariant,
    CreativeFormState,
} from "../../../types/creative.types";

interface AdvertisementCreativeProps {
    value: AdvertisementCreativeValue;
    onChange: (
        value: AdvertisementCreativeValue,
    ) => void;
    placementName?: string;
    placementFormat:
    | AdvertisementCreativePlacementFormat
    | null;
}

export default function AdvertisementCreative({
    value,
    onChange,
    placementName,
    placementFormat,
}: AdvertisementCreativeProps) {
    const [form, setForm] =
        useState<CreativeFormState>(
            createEmptyForm,
        );

    const [
        editingCreativeId,
        setEditingCreativeId,
    ] = useState<string | null>(null);

    const [error, setError] = useState<
        string | null
    >(null);

    const [isUploading, setIsUploading] =
        useState(false);

    const fileInputRef =
        useRef<HTMLInputElement | null>(null);

    const formObjectUrlRef =
        useRef<string | null>(null);

    const uploadingObjectUrlRef =
        useRef<string | null>(null);

    const isUploadingRef =
        useRef(false);

    const revokeFormObjectUrl = (): void => {
        const url = formObjectUrlRef.current;

        if (url && isObjectUrl(url)) {
            URL.revokeObjectURL(url);
        }

        formObjectUrlRef.current = null;
    };

    useEffect(() => {
        return () => {
            revokeFormObjectUrl();
        };
    }, []);

    const resetForm = (): void => {
        revokeFormObjectUrl();

        /*
         * Invalidate any outstanding upload response for the
         * previous form. A late response must not restore the
         * previous file into a reset form.
         */
        uploadingObjectUrlRef.current = null;
        isUploadingRef.current = false;

        setIsUploading(false);
        setForm(createEmptyForm());
        setEditingCreativeId(null);
        setError(null);

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleTypeChange = (
        creativeType: AdvertisementCreativeType,
    ): void => {
        resetForm();

        setForm({
            ...createEmptyForm(),
            creativeType,
            variant: form.variant,
        });
    };

    const handleVariantChange = (
        variant: AdvertisementCreativeVariant,
    ): void => {
        setForm((current) => ({
            ...current,
            variant,
        }));

        setError(null);
    };

    const handleFileChange = async (
        event: ChangeEvent<HTMLInputElement>,
    ): Promise<void> => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        if (isUploadingRef.current) {
            setError(
                "Please wait for the current upload to finish.",
            );

            return;
        }

        const selectedCreativeType =
            form.creativeType;

        if (
            selectedCreativeType === "IMAGE" &&
            !file.type.startsWith("image/")
        ) {
            setError(
                "Please select a valid image file.",
            );

            event.target.value = "";
            return;
        }

        if (
            selectedCreativeType === "VIDEO" &&
            !file.type.startsWith("video/")
        ) {
            setError(
                "Please select a valid video file.",
            );

            event.target.value = "";
            return;
        }

        if (
            selectedCreativeType !== "IMAGE" &&
            selectedCreativeType !== "VIDEO"
        ) {
            setError(
                "File uploads are supported only for image and video creatives.",
            );

            event.target.value = "";
            return;
        }

        revokeFormObjectUrl();

        const objectUrl =
            URL.createObjectURL(file);

        formObjectUrlRef.current = objectUrl;
        uploadingObjectUrlRef.current = objectUrl;
        isUploadingRef.current = true;

        setIsUploading(true);

        setForm((current) => ({
            ...current,
            mediaUrl: objectUrl,
            fileName: file.name,
            fileSizeBytes: file.size,
            mimeType: file.type || null,
            widthPx: "",
            heightPx: "",
        }));

        setError(null);

        try {
            /*
             * Upload before the creative is saved.
             *
             * The upload API returns a permanent Cloudinary URL
             * and the actual dimensions reported by Cloudinary.
             */
            const uploaded =
                await uploadAdvertisementCreative(file);

            /*
             * Ignore stale results if the form was reset or the
             * selected file was replaced while the request ran.
             */
            if (
                formObjectUrlRef.current !== objectUrl ||
                uploadingObjectUrlRef.current !== objectUrl
            ) {
                return;
            }

            const expectedResourceType =
                selectedCreativeType === "IMAGE"
                    ? "image"
                    : "video";

            if (
                uploaded.resourceType !==
                expectedResourceType
            ) {
                throw new Error(
                    "Cloudinary returned an unexpected media type.",
                );
            }

            if (
                !uploaded.secureUrl ||
                !Number.isFinite(uploaded.widthPx) ||
                !Number.isFinite(uploaded.heightPx) ||
                uploaded.widthPx <= 0 ||
                uploaded.heightPx <= 0
            ) {
                throw new Error(
                    "The uploaded file did not return a valid URL and dimensions.",
                );
            }

            /*
             * The Cloudinary URL replaces the temporary browser
             * URL. The saved creative will therefore contain a
             * permanent URL rather than blob:...
             */
            URL.revokeObjectURL(objectUrl);

            formObjectUrlRef.current = null;

            setForm((current) => {
                if (current.mediaUrl !== objectUrl) {
                    return current;
                }

                return {
                    ...current,
                    mediaUrl: uploaded.secureUrl,
                    fileName: file.name,
                    fileSizeBytes:
                        uploaded.fileSizeBytes,
                    mimeType: uploaded.mimeType,
                    widthPx: String(
                        Math.round(uploaded.widthPx),
                    ),
                    heightPx: String(
                        Math.round(uploaded.heightPx),
                    ),
                };
            });

            setError(null);
        } catch (uploadError: unknown) {
            if (
                formObjectUrlRef.current === objectUrl &&
                uploadingObjectUrlRef.current === objectUrl
            ) {
                const message =
                    uploadError instanceof Error
                        ? uploadError.message
                        : "Unable to upload the creative file.";

                setError(
                    `Upload failed: ${message} Please try selecting the file again.`,
                );
            }
        } finally {
            if (
                uploadingObjectUrlRef.current === objectUrl
            ) {
                uploadingObjectUrlRef.current = null;
                isUploadingRef.current = false;
                setIsUploading(false);
            }
        }
    };

    const validateForm = (): string | null => {
        if (!form.title.trim()) {
            return "Creative title is required.";
        }

        if (isUploadingRef.current) {
            return "Please wait for the creative upload to finish.";
        }

        if (
            (
                form.creativeType === "IMAGE" ||
                form.creativeType === "VIDEO"
            ) &&
            !form.mediaUrl
        ) {
            return "Please upload a creative file.";
        }

        /*
         * A browser object URL is only a temporary preview.
         * Never allow it to be saved as the permanent media URL.
         */
        if (
            (
                form.creativeType === "IMAGE" ||
                form.creativeType === "VIDEO"
            ) &&
            isObjectUrl(form.mediaUrl)
        ) {
            return "The file has not been uploaded successfully. Please upload it again.";
        }

        if (
            (
                form.creativeType === "HTML" ||
                form.creativeType === "TEXT"
            ) &&
            !form.mediaUrl.trim()
        ) {
            return "Creative content is required.";
        }

        if (form.widthPx.trim()) {
            const width = parsePositiveInteger(
                form.widthPx,
            );

            if (width === null) {
                return "Actual width must be a positive integer.";
            }
        }

        if (form.heightPx.trim()) {
            const height = parsePositiveInteger(
                form.heightPx,
            );

            if (height === null) {
                return "Actual height must be a positive integer.";
            }
        }

        return null;
    };

    const handleSaveCreative = (): void => {
        const validationError = validateForm();

        if (validationError) {
            setError(validationError);
            return;
        }

        const existingCreative =
            editingCreativeId
                ? value.creatives.find(
                    (creative) =>
                        creative.id === editingCreativeId,
                )
                : undefined;

        const creativeId =
            existingCreative?.id ??
            `creative-${Date.now()}-${Math.random()
                .toString(36)
                .slice(2, 9)}`;

        const widthPx = parsePositiveInteger(
            form.widthPx,
        );

        const heightPx = parsePositiveInteger(
            form.heightPx,
        );

        const updatedCreative: AdvertisementCreativeItem = {
            id: creativeId,
            creativeType: form.creativeType,
            variant: form.variant,
            title: form.title.trim(),
            altText: form.altText.trim(),
            mediaUrl: form.mediaUrl,
            fileName: form.fileName,
            fileSizeBytes: form.fileSizeBytes,
            mimeType: form.mimeType,
            widthPx,
            heightPx,
            isPrimary: form.isPrimary,
            isActive:
                existingCreative?.isActive ?? true,
            displayOrder:
                existingCreative?.displayOrder ??
                value.creatives.length + 1,
        };

        let creatives = editingCreativeId
            ? value.creatives.map((creative) =>
                creative.id === editingCreativeId
                    ? updatedCreative
                    : creative,
            )
            : [
                ...value.creatives,
                updatedCreative,
            ];

        if (form.isPrimary) {
            creatives = creatives.map(
                (creative) => ({
                    ...creative,
                    isPrimary:
                        creative.variant === form.variant
                            ? creative.id === creativeId
                            : creative.isPrimary,
                }),
            );
        }

        creatives = creatives.map(
            (creative, index) => ({
                ...creative,
                displayOrder: index + 1,
            }),
        );

        /*
         * The saved creative owns the URL only when it is a
         * browser object URL. Successful image/video uploads use
         * permanent Cloudinary URLs, which must not be revoked.
         */
        formObjectUrlRef.current = null;

        onChange({
            creatives,
        });

        uploadingObjectUrlRef.current = null;
        isUploadingRef.current = false;

        setIsUploading(false);
        setForm(createEmptyForm());
        setEditingCreativeId(null);
        setError(null);

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleEditCreative = (
        creative: AdvertisementCreativeItem,
    ): void => {
        revokeFormObjectUrl();

        uploadingObjectUrlRef.current = null;
        isUploadingRef.current = false;

        setIsUploading(false);

        setForm({
            creativeType: creative.creativeType,
            variant: creative.variant,
            title: creative.title,
            altText: creative.altText,
            mediaUrl: creative.mediaUrl,
            fileName: creative.fileName,
            fileSizeBytes: creative.fileSizeBytes,
            mimeType: creative.mimeType,
            widthPx:
                creative.widthPx !== null
                    ? String(creative.widthPx)
                    : "",
            heightPx:
                creative.heightPx !== null
                    ? String(creative.heightPx)
                    : "",
            isPrimary: creative.isPrimary,
        });

        setEditingCreativeId(creative.id);
        setError(null);

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleDeleteCreative = (
        creativeId: string,
    ): void => {
        const creative = value.creatives.find(
            (item) => item.id === creativeId,
        );

        if (
            creative &&
            isObjectUrl(creative.mediaUrl)
        ) {
            URL.revokeObjectURL(creative.mediaUrl);
        }

        const creatives = value.creatives
            .filter(
                (item) => item.id !== creativeId,
            )
            .map((item, index) => ({
                ...item,
                displayOrder: index + 1,
            }));

        onChange({
            creatives,
        });

        if (editingCreativeId === creativeId) {
            resetForm();
        }
    };

    const handleSetPrimary = (
        creativeId: string,
    ): void => {
        const selectedCreative =
            value.creatives.find(
                (creative) => creative.id === creativeId,
            );

        if (!selectedCreative) {
            return;
        }

        const creatives = value.creatives.map(
            (creative) => ({
                ...creative,
                isPrimary:
                    creative.variant === selectedCreative.variant
                        ? creative.id === creativeId
                        : creative.isPrimary,
            }),
        );

        onChange({
            creatives,
        });
    };

    const handleFieldChange = (
        field: keyof CreativeFormState,
        valueToSet: string | boolean,
    ): void => {
        setForm((current) => ({
            ...current,
            [field]: valueToSet,
        }));

        setError(null);
    };

    const expectedWidth =
        placementFormat?.widthPx ?? null;

    const expectedHeight =
        placementFormat?.heightPx ?? null;

    const currentWidth =
        form.widthPx.trim()
            ? Number(form.widthPx)
            : null;

    const currentHeight =
        form.heightPx.trim()
            ? Number(form.heightPx)
            : null;

    const currentDimensionComparison =
        getDimensionComparison(
            currentWidth,
            currentHeight,
            placementFormat,
        );

    return (
        <div className="space-y-6">
            <Surface>
                <div className="space-y-5 p-5">
                    <div>
                        <Typography
                            as="h3"
                            className="text-lg font-semibold text-gray-900"
                        >
                            {editingCreativeId
                                ? "Edit Creative"
                                : "Add Creative"}
                        </Typography>

                        <p className="mt-1 text-sm text-gray-500">
                            Configure the creative content and
                            verify its dimensions against the
                            selected placement format.
                        </p>
                    </div>

                    {isUploading && (
                        <div
                            role="status"
                            aria-live="polite"
                            className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
                        >
                            Uploading your file to Cloudinary.
                            Please wait before saving the creative.
                        </div>
                    )}

                    <CreativeForm
                        form={form}
                        isUploading={isUploading}
                        editingCreativeId={
                            editingCreativeId
                        }
                        error={error}
                        placementFormat={
                            placementFormat
                        }
                        expectedWidth={
                            expectedWidth
                        }
                        expectedHeight={
                            expectedHeight
                        }
                        currentDimensionComparison={
                            currentDimensionComparison
                        }
                        fileInputRef={
                            fileInputRef
                        }
                        onTypeChange={
                            handleTypeChange
                        }
                        onVariantChange={
                            handleVariantChange
                        }
                        onFieldChange={
                            handleFieldChange
                        }
                        onFileChange={
                            handleFileChange
                        }
                        onSave={
                            handleSaveCreative
                        }
                        onReset={
                            resetForm
                        }
                    />
                </div>
            </Surface>

            <Surface>
                <div className="p-5">
                    <div className="flex flex-col gap-1">
                        <Typography
                            as="h3"
                            className="text-lg font-semibold text-gray-900"
                        >
                            Added Creatives
                        </Typography>

                        <p className="text-sm text-gray-500">
                            Review the saved creatives and their
                            placement-specific previews.
                        </p>
                    </div>

                    {value.creatives.length === 0 ? (
                        <div className="mt-5 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-5 py-10 text-center">
                            <p className="text-sm font-medium text-gray-700">
                                No creatives added yet.
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                                Add at least one creative to
                                continue.
                            </p>
                        </div>
                    ) : (
                        <div className="mt-5 space-y-4">
                            {value.creatives.map(
                                (creative) => (
                                    <AddedCreativeCard
                                        key={creative.id}
                                        creative={creative}
                                        placementName={
                                            placementName
                                        }
                                        placementFormat={
                                            placementFormat
                                        }
                                        onEdit={
                                            handleEditCreative
                                        }
                                        onDelete={
                                            handleDeleteCreative
                                        }
                                        onSetPrimary={
                                            handleSetPrimary
                                        }
                                    />
                                ),
                            )}
                        </div>
                    )}
                </div>
            </Surface>
        </div>
    );
}