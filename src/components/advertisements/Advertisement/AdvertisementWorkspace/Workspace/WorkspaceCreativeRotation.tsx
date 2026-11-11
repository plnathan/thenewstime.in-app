import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, LoaderCircle, RefreshCw, Save, Shuffle } from "lucide-react";

import {
    getCreativeRotationConfig,
    updateCreativeRotationConfig,
    type CreativeRotationConfig,
} from "@/api/advertisements/creative-rotation.api";
import { getAdvertisementCreatives } from "@/api/advertisements/advertisement.api";
import type { AdvertisementCreative } from "@/types/creative.types";
import { getApiErrorMessage } from "@/helpers/advertisementManagement.helpers";
import Surface from "@/components/ui/Surface";

interface Props {
    advertisementId: number;
    canManage: boolean;
    onSaved?: () => Promise<void>;
}

const MAX_ACTIVE_DESKTOP_CREATIVES = 5;

export default function WorkspaceCreativeRotation({ advertisementId, canManage, onSaved }: Props) {
    const [config, setConfig] = useState<CreativeRotationConfig | null>(null);
    const [creatives, setCreatives] = useState<AdvertisementCreative[]>([]);
    const [enabled, setEnabled] = useState(false);
    const [seconds, setSeconds] = useState("10");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            const [configResponse, creativesResponse] = await Promise.all([
                getCreativeRotationConfig(advertisementId),
                getAdvertisementCreatives(advertisementId),
            ]);
            if (!configResponse.data || configResponse.data.advertisementId !== advertisementId) {
                throw new Error("Creative rotation configuration does not match this advertisement.");
            }
            if (!Array.isArray(creativesResponse.data)) {
                throw new Error("The server did not return a valid creative list.");
            }
            setConfig(configResponse.data);
            setEnabled(configResponse.data.rotationEnabled);
            setSeconds(String(configResponse.data.rotationIntervalSeconds));
            setCreatives(creativesResponse.data);
        } catch (caught: unknown) {
            setError(getApiErrorMessage(caught));
        } finally {
            setLoading(false);
        }
    }, [advertisementId]);

    // Initial loading is an external-system synchronization. Keep state updates
    // inside the asynchronous completion handlers, not in the effect body.
    useEffect(() => {
        let cancelled = false;

        void Promise.all([
            getCreativeRotationConfig(advertisementId),
            getAdvertisementCreatives(advertisementId),
        ])
            .then(([configResponse, creativesResponse]) => {
                if (cancelled) return;
                if (!configResponse.data || configResponse.data.advertisementId !== advertisementId) {
                    throw new Error("Creative rotation configuration does not match this advertisement.");
                }
                if (!Array.isArray(creativesResponse.data)) {
                    throw new Error("The server did not return a valid creative list.");
                }
                setConfig(configResponse.data);
                setEnabled(configResponse.data.rotationEnabled);
                setSeconds(String(configResponse.data.rotationIntervalSeconds));
                setCreatives(creativesResponse.data);
                setError(null);
            })
            .catch((caught: unknown) => {
                if (!cancelled) setError(getApiErrorMessage(caught));
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => { cancelled = true; };
    }, [advertisementId]);

    const desktop = useMemo(() => creatives
        .filter(creative => creative.status === "ACTIVE" && creative.variant === "DESKTOP")
        .sort((a, b) => a.displayOrder - b.displayOrder || a.id - b.id), [creatives]);
    const mobile = useMemo(() => creatives.filter(creative =>
        creative.status === "ACTIVE" && creative.variant === "MOBILE"), [creatives]);
    const duplicateDesktop = desktop.some((creative, index) =>
        desktop.findIndex(other => other.displayOrder === creative.displayOrder) !== index);
    const duplicateMobile = mobile.some((creative, index) =>
        mobile.findIndex(other => other.displayOrder === creative.displayOrder) !== index);
    const unmatchedMobile = mobile.some(creative =>
        !desktop.some(other => other.displayOrder === creative.displayOrder));
    const countInvalid = desktop.length < 2 || desktop.length > MAX_ACTIVE_DESKTOP_CREATIVES;
    const interval = Number(seconds);
    const intervalInvalid = !Number.isInteger(interval) || interval < 1 || interval > 3600;
    const validationError = enabled && (
        countInvalid ? `Enable rotation with 2–${MAX_ACTIVE_DESKTOP_CREATIVES} active Desktop creatives.` :
            duplicateDesktop ? "Desktop creatives must have unique display orders." :
                duplicateMobile ? "Only one active Mobile variant is allowed per display order." :
                    unmatchedMobile ? "Every active Mobile variant must match an active Desktop display order." : null
    );
    const dirty = config !== null && (enabled !== config.rotationEnabled || seconds !== String(config.rotationIntervalSeconds));

    const save = async () => {
        if (!canManage || saving || intervalInvalid || validationError || !config) return;
        setSaving(true);
        setError(null);
        setSuccess(null);
        try {
            const response = await updateCreativeRotationConfig(advertisementId, {
                rotationEnabled: enabled,
                rotationIntervalSeconds: interval,
                rotationStrategy: "ROUND_ROBIN",
            });
            if (!response.data || response.data.advertisementId !== advertisementId) {
                throw new Error("The server did not confirm the saved creative rotation settings.");
            }
            setConfig(response.data);
            setEnabled(response.data.rotationEnabled);
            setSeconds(String(response.data.rotationIntervalSeconds));
            setSuccess("Creative rotation configuration saved.");
            if (onSaved) await onSaved();
        } catch (caught: unknown) {
            setError(getApiErrorMessage(caught));
        } finally {
            setSaving(false);
        }
    };

    return (
        <Surface className="border border-gray-200 p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-green-50 p-2.5"><Shuffle size={21} className="text-green-700" aria-hidden="true" /></div>
                    <div>
                        <h2 className="text-base font-semibold text-gray-900">Creative Rotation</h2>
                        <p className="mt-1 text-sm text-gray-600">Independent rotation of creatives within advertisement #{advertisementId}. Desktop and Mobile assets sharing a display order are one logical slide.</p>
                    </div>
                </div>
                <button type="button" onClick={() => void load()} disabled={loading || saving}
                    className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold disabled:opacity-50">
                    <RefreshCw size={15} /> Refresh
                </button>
            </div>
            {loading ? <p className="mt-4 flex items-center gap-2 text-sm text-gray-600"><LoaderCircle size={16} className="animate-spin" /> Loading creative rotation...</p> : (
                <div className="mt-5 space-y-4">
                    {error && <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
                    {success && <p role="status" className="flex items-center gap-2 rounded-md bg-green-50 p-3 text-sm text-green-700"><CheckCircle2 size={16} />{success}</p>}
                    <label className="flex items-center gap-3 text-sm font-medium text-gray-800">
                        <input type="checkbox" checked={enabled} onChange={event => { setEnabled(event.target.checked); setSuccess(null); }} disabled={!canManage || saving || !config} />
                        Enable creative rotation
                    </label>
                    <div className="flex flex-wrap items-end gap-4">
                        <label className="block text-sm font-medium text-gray-700">Rotation interval (seconds)
                            <input type="number" min={1} max={3600} step={1} value={seconds}
                                onChange={event => { setSeconds(event.target.value); setSuccess(null); }}
                                disabled={!canManage || saving || !config}
                                className="mt-1 block w-44 rounded-md border border-gray-300 px-3 py-2" />
                        </label>
                        <div className="pb-2 text-sm text-gray-600">Strategy: Round Robin</div>
                    </div>
                    <p className="text-xs text-gray-500">Allowed interval: 1–3600 seconds. This setting does not change placement-level advertisement rotation or pricing.</p>
                    <div className="rounded-lg border border-gray-200 p-4">
                        <h3 className="text-sm font-semibold text-gray-900">Active creative slides ({desktop.length})</h3>
                        {desktop.length === 0 ? <p className="mt-2 text-sm text-gray-600">No active Desktop creatives. Add creatives in the Creative workspace.</p> : (
                            <div className="mt-3 space-y-2">{desktop.map((creative, index) => {
                                const paired = mobile.find(item => item.displayOrder === creative.displayOrder);
                                return <div key={creative.id} className="flex flex-wrap justify-between gap-2 rounded-md bg-gray-50 p-3 text-sm">
                                    <span className="font-medium">Slide {index + 1} · Order {creative.displayOrder} · {creative.title || `Creative #${creative.id}`}</span>
                                    <span className="text-gray-600">{paired ? `Mobile #${paired.id} paired` : "Mobile uses Desktop fallback"}</span>
                                </div>;
                            })}</div>
                        )}
                    </div>
                    {validationError && <p role="alert" className="text-sm text-amber-700">{validationError}</p>}
                    {intervalInvalid && <p role="alert" className="text-sm text-red-700">Enter a whole-number interval from 1 to 3600 seconds.</p>}
                    <button type="button" onClick={() => void save()}
                        disabled={!canManage || saving || !dirty || intervalInvalid || Boolean(validationError) || !config}
                        className="inline-flex min-h-10 items-center gap-2 rounded-md bg-green-700 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">
                        {saving ? <LoaderCircle size={16} className="animate-spin" /> : <Save size={16} />} Save Creative Rotation
                    </button>
                    {!canManage && <p className="text-xs text-gray-500">Archived advertisements are read-only.</p>}
                </div>
            )}
        </Surface>
    );
}
