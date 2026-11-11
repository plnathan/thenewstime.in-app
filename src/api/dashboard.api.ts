import apiClient from "@/api/axios";
export type DashboardModule =
  | "news"
  | "users"
  | "roles"
  | "permissions"
  | "advertisements";
export interface DashboardMetric {
  key: string;
  label: string;
  value: number | null;
}
export async function getDashboardMetrics(
  module: DashboardModule,
  month: number | null,
  year: number | null,
): Promise<DashboardMetric[]> {
  const response = await apiClient.get<{
    success: boolean;
    data: DashboardMetric[];
  }>(`/dashboard/${module}`, {
    params: {
      ...(month === null ? {} : { month }),
      ...(year === null ? {} : { year }),
    },
  });
  return response.data.data;
}
