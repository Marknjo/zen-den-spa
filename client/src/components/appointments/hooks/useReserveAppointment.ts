import {
  useMutation,
  UseMutateFunction,
  useQueryClient,
} from '@tanstack/react-query';
import { Appointment } from '../../../../../shared/types';
import { axiosInstance } from '../../../axiosInstance';
import { queryKeys } from '../../../react-query/constants';
import { useCustomToast } from '../../app/hooks/useCustomToast';
import { useUser } from '../../user/hooks/useUser';
import dayjs from 'dayjs';

// for when we need functions for useMutation
async function setAppointmentUser(
  appointment: Appointment,
  userId: number | undefined,
): Promise<void> {
  if (!userId) return;
  const patchOp = appointment.userId ? 'replace' : 'add';
  const patchData = [{ op: patchOp, path: '/userId', value: userId }];
  await axiosInstance.patch(`/appointment/${appointment.id}`, {
    data: patchData,
  });
}

export function useReserveAppointment(): UseMutateFunction<
  void,
  unknown,
  Appointment,
  unknown
> {
  const { user } = useUser();
  const toast = useCustomToast();
  const queryClient = useQueryClient();

  const { mutate } = useMutation({
    mutationFn: (appointment: Appointment) =>
      setAppointmentUser(appointment, user?.id),
    onSuccess(_data, variables) {
      let treatment = variables.treatmentName;
      let date = dayjs(variables.dateTime).format('MMMM D, YYYY');

      queryClient.invalidateQueries([queryKeys.appointments]);
      toast({
        title: `You have reserved the appointment for ${treatment} on ${date}`,
        status: 'success',
      });
    },
  });

  // replace with mutate function
  return mutate;
}
