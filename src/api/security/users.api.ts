import apiClient from "@/api/axios";

import type { AuthApiResponse } from "@/types/auth.types";

import type {
  CreateSecurityUserInput,
  SecurityUser,
  SecurityUserListItem,
  UpdateSecurityUserInput,
} from "@/types/security.types";

const USERS_ENDPOINT = "/security/users";

export const getSecurityUsers = async (): Promise<SecurityUserListItem[]> => {
  const response =
    await apiClient.get<AuthApiResponse<SecurityUserListItem[]>>(
      USERS_ENDPOINT,
    );

  return response.data.data;
};

export const getSecurityUser = async (id: number): Promise<SecurityUser> => {
  const response = await apiClient.get<AuthApiResponse<SecurityUser>>(
    `${USERS_ENDPOINT}/${id}`,
  );

  return response.data.data;
};

export const createSecurityUser = async (
  input: CreateSecurityUserInput,
): Promise<SecurityUser> => {
  const response = await apiClient.post<AuthApiResponse<SecurityUser>>(
    USERS_ENDPOINT,
    input,
  );

  return response.data.data;
};

export const updateSecurityUser = async (
  id: number,
  input: UpdateSecurityUserInput,
): Promise<SecurityUser> => {
  const response = await apiClient.patch<AuthApiResponse<SecurityUser>>(
    `${USERS_ENDPOINT}/${id}`,
    input,
  );

  return response.data.data;
};

export const deactivateSecurityUser = async (
  id: number,
): Promise<SecurityUser> => {
  const response = await apiClient.delete<AuthApiResponse<SecurityUser>>(
    `${USERS_ENDPOINT}/${id}`,
  );

  return response.data.data;
};
