import { OrderStatus } from '@prisma/client';
import { capitalizeString } from './string';

export const StatusMappingNumber: {
  [key in OrderStatus]: number;
} = {
  [OrderStatus.pending]: 0,
  [OrderStatus.confirmed]: 1,
  [OrderStatus.delivering]: 2,
  [OrderStatus.completed]: 3,
  [OrderStatus.cancelled]: 3,
};

export const getNextStatuses = (currentStatus: OrderStatus) => {
  const currentStatusNumber = StatusMappingNumber[currentStatus];
  const nextStatuses: {
    label: string;
    value: string;
  }[] = [];

  for (const key in StatusMappingNumber) {
    if (StatusMappingNumber[key] > currentStatusNumber) {
      nextStatuses.push({
        label: capitalizeString(key),
        value: key,
      });
    }
  }

  return nextStatuses;
};
