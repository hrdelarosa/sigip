import { useQuery } from "@tanstack/react-query";
import { officeQueryOptions } from "../queries/office-query-options";

export function useOffices() {
  return useQuery(officeQueryOptions());
}
