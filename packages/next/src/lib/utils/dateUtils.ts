import { format, formatDistanceToNow } from 'date-fns';

export const formatDate = (date: Date | string) => {
  const d = new Date(date);
  return format(d, 'PPpp');
};

export const formatTimeAgo = (date: Date | string) => {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

export const getHourRange = (hour: number) => {
  const start = format(new Date().setHours(hour, 0, 0, 0), 'h:mm a');
  const end = format(new Date().setHours(hour + 1, 0, 0, 0), 'h:mm a');
  return `${start} - ${end}`;
};