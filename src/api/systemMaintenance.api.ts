import apiClient from "@/api/axios";

export interface MaintenanceSettings {
  success: boolean;
  maintenance: boolean;
  message: string;
  expectedRestorationAt: string | null;
  source: "ENVIRONMENT" | "DATABASE";
}

export async function getMaintenanceSettings(): Promise<MaintenanceSettings> {
  const { data } = await apiClient.get<MaintenanceSettings>(
    "/system/maintenance",
  );
  return data;
}
export async function saveMaintenanceSettings(payload: {
  enabled: boolean;
  message: string;
  expectedRestorationAt: string | null;
}): Promise<MaintenanceSettings> {
  const { data } = await apiClient.put<MaintenanceSettings>(
    "/system/maintenance",
    payload,
  );
  return data;
}
