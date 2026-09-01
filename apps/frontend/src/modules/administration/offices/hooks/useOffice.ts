import { useQuery } from "@tanstack/react-query";
import { officeDetailQueryOptions } from "../queries/office-query-options";

export function useOffice(id: string | null) {
  return useQuery({
    ...officeDetailQueryOptions(id ?? ""),
    enabled: Boolean(id),
  });
}
