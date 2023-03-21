import {
  useMutation,
  UseMutateFunction,
  useQueryClient,
} from '@tanstack/react-query';
import jsonpatch from 'fast-json-patch';

import type { User } from '../../../../../shared/types';
import { axiosInstance, getJWTHeader } from '../../../axiosInstance';
import { queryKeys } from '../../../react-query/constants';
import { useCustomToast } from '../../app/hooks/useCustomToast';
import { useUser } from './useUser';

// for when we need a server function
async function patchUserOnServer(
  newData: User | null,
  originalData: User | null,
): Promise<User | null> {
  if (!newData || !originalData) return null;
  // create a patch for the difference between newData and originalData
  const patch = jsonpatch.compare(originalData, newData);

  // send patched data to the server
  const { data } = await axiosInstance.patch(
    `/user/${originalData.id}`,
    { patch },
    {
      headers: getJWTHeader(originalData),
    },
  );
  return data.user;
}

// TODO: update type to UseMutateFunction type
export function usePatchUser(): UseMutateFunction<
  User | null,
  unknown,
  User,
  unknown
> {
  const { user, updateUser } = useUser();
  const toast = useCustomToast();
  const queryClient = useQueryClient();

  // replace with mutate function
  const { mutate: patchUser } = useMutation({
    mutationFn(data: User) {
      return patchUserOnServer(data, user);
    },
    async onMutate(newData: User) {
      // cancel any outgoing queries for user data, so old server data
      // doesn't overwrite our optimistic update
      queryClient.cancelQueries({ queryKey: [queryKeys.user] });

      // snapshot of previous user value
      const previousUserData: User | undefined = queryClient.getQueryData([
        queryKeys.user,
      ]);

      // optimistically update the cache with new user value
      updateUser(newData);

      // return context object with snapshot value
      return previousUserData;
    },
    onError(_err, _newData, context) {
      // roll back cache to saved value
      if (context) {
        updateUser(context);

        toast({
          title: 'Update failed; Restoring previous values',
          status: 'warning',
        });
      }
    },
    onSettled() {
      // invalidate user query to make sure we're on sync with server data
      queryClient.invalidateQueries([queryKeys.user]);
    },
    onSuccess(userData) {
      if (userData) {
        queryClient.invalidateQueries([queryKeys.user]);
        updateUser(userData);
        toast({
          title: `Your information was updated successfully`,
          status: 'success',
        });
      }
    },
  });

  return patchUser;
}
