import { useQuery } from '@tanstack/react-query';
import { Dispatch, SetStateAction, useCallback, useState } from 'react';

import type { Staff } from '../../../../../shared/types';
import { axiosInstance } from '../../../axiosInstance';
import { queryKeys } from '../../../react-query/constants';
import { filterByTreatment } from '../utils';

// for when we need a query function for useQuery
async function getStaff(): Promise<Staff[]> {
  const { data } = await axiosInstance.get('/staff');
  return data;
}

interface UseStaff {
  staff: Staff[];
  filter: string;
  setFilter: Dispatch<SetStateAction<string>>;
}

export function useStaff(): UseStaff {
  // for filtering staff by treatment
  const [filter, setFilter] = useState('all');

  // Filter staff
  const selectFn = useCallback(
    (data: Staff[]) => filterByTreatment(data, filter),
    [filter],
  );

  // get data from server via useQuery
  const { data: staff = [] } = useQuery({
    queryKey: [queryKeys.staff],
    queryFn: getStaff,
    select: filter === 'all' ? undefined : selectFn,
  });

  return { staff, filter, setFilter };
}