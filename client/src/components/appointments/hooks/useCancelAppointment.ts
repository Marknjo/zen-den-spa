import {
  UseMutateFunction,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import dayjs from 'dayjs';
import { Appointment } from '../../../../../shared/types';
import { axiosInstance } from '../../../axiosInstance';
import { queryKeys } from '../../../react-query/constants';
import { useCustomToast } from '../../app/hooks/useCustomToast';

// for when server call is needed
async function removeAppointmentUser(appointment: Appointment): Promise<void> {
  const patchData = [{ op: 'remove', path: '/userId' }];
  await axiosInstance.patch(`/appointment/${appointment.id}`, {
    data: patchData,
  });
}

export function useCancelAppointment(): UseMutateFunction<
  void,
  unknown,
  Appointment,
  unknown
> {
  const toast = useCustomToast();
  const queryClient = useQueryClient();

  const { mutate } = useMutation({
    // mutationFn(appointment: Appointment) {
    //   return removeAppointmentUser(appointment);
    // },

    mutationFn: removeAppointmentUser,
    onSuccess(_, variable) {
      let treatment = variable.treatmentName;
      let date = dayjs(variable.dateTime).format('MMMM D, YYYY');

      toast({
        title: `You have canceled your ${treatment} appointment scheduled on ${date}`,
        status: 'success',
      });

      queryClient.invalidateQueries([queryKeys.appointments]);
    },
  });

  return mutate;
}
