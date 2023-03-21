import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import { useEffect, useState } from 'react';

import type { User } from '../../../../../shared/types';
import { axiosInstance, getJWTHeader } from '../../../axiosInstance';
import { queryKeys } from '../../../react-query/constants';
import {
  clearStoredUser,
  getStoredUser,
  setStoredUser,
} from '../../../user-storage';

interface AxiosResponseWithCancel extends AxiosResponse {
  cancel: () => void;
}

async function getUser(
  user: User | null,
  signal: AbortSignal | undefined,
): Promise<AxiosResponseWithCancel | null> {
  if (!user) return null;

  console.log('Called');

  const axiosResponse: AxiosResponseWithCancel = await axiosInstance.get(
    `/user/${user.id}`,
    {
      signal,
      headers: getJWTHeader(user),
    },
  );

  axiosResponse.cancel = () => {
    // cancel the request
  };

  return axiosResponse;
}

interface UseUser {
  user: User | null;
  updateUser: (user: User) => void;
  clearUser: () => void;
}

const initialData = getStoredUser();

export function useUser(): UseUser {
  // call useQuery to update user data from server
  const { data: user } = useQuery({
    queryKey: [queryKeys.user],
    queryFn: async ({ signal }) => {
      const res = await getUser(initialData, signal);
      return res?.data.user;
    }, // Never executes
    initialData,
    onSuccess(axiosResponse) {
      /// set user
      // setUser(axiosResponse.data.user)
      return axiosResponse?.data?.user;
    },
  });

  // Query client
  const queryClient = useQueryClient();

  // meant to be called from useAuth
  function updateUser(newUser: User): void {
    // Set local storage on login

    setStoredUser(newUser);
    // Pre-populate user profile in React Query client
    queryClient.setQueryData([queryKeys.user], newUser);
  }

  // meant to be called from useAuth
  function clearUser() {
    // Clear local storage on logout
    clearStoredUser();

    // Remove user appointments query
    queryClient.removeQueries({
      queryKey: [queryKeys.appointments, queryKeys.user, user?.id],
    });

    // reset user to null in query cache
    queryClient.setQueryData([queryKeys.user], null);
  }

  return { user, updateUser, clearUser };
}
