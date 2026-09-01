import type { OfficeResponse, OfficesResponse } from "@sigip/shared";
import { apiRequest } from "@/lib/api/api-client";

export function getOffices(): Promise<OfficesResponse> {
  return apiRequest<OfficesResponse>("/offices");
}

export function getOfficeById({ id }: { id: string }): Promise<OfficeResponse> {
  return apiRequest<OfficeResponse>(`/offices/${id}`);
}
