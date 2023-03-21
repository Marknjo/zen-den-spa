import { QueryKey, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Treatment } from '../../../../../shared/types';
import { axiosInstance } from '../../../axiosInstance';
import { queryKeys } from '../../../react-query/constants';

// for when we need a query function for useQuery
async function getTreatments(): Promise<Treatment[]> {
  const { data } = await axiosInstance.get('/treatments');

  return data;
}

export function useTreatments(): Treatment[] | [] {
  const { data = [] } = useQuery({
    queryKey: [queryKeys.treatments as unknown as QueryKey],
    queryFn: getTreatments,
  });

  return data;
}

export function usePrefetchTreatments(): void {
  const queryClient = useQueryClient();
  queryClient.prefetchQuery({
    queryKey: [queryKeys.treatments],
    queryFn: getTreatments,
  });
}
