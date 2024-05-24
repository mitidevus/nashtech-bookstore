import * as moment from 'moment';

export const formatDate = ({
  date,
  formatSpecification,
  targetFormat,
}: {
  date: Date | string;
  formatSpecification?: string;
  targetFormat: string;
}) => {
  const t = moment(date, formatSpecification);
  return t.format(targetFormat);
};
