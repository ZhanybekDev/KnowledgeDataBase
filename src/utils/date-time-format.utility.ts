import { differenceInSeconds, format, formatDistanceToNow } from "date-fns";
import ruLocale from "date-fns/locale/ru";

export function formatDatetime(datetime?: string) {
  if (!datetime) return "";
  return format(new Date(datetime), "dd.MM.yyyy, HH:mm:ss");
}

export function formatTime(datetime?: string) {
  if (!datetime) return "";
  return format(new Date(datetime), "HH:mm:ss");
}

export function formatDate(date?: string) {
  if (!date) return "";
  return format(new Date(date), "dd.MM.yyyy");
}

export function inputFormatDate(date?: string) {
  if (!date) return "";
  return format(new Date(date), "yyyy-MM-dd");
}

export function inputDateTimeFormat(datetime?: string) {
  if (!datetime) return "";
  return format(new Date(datetime), "yyyy-MM-dd HH:mm:ss");
}

export function humanizeDatetime(datetime?: string) {
  if (!datetime) return "";
  return formatDistanceToNow(new Date(datetime), {
    addSuffix: true,
    locale: ruLocale,
  });
}

export function calculateDuration(start?: string, end?: string) {
  if (!start || !end) return 0;
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (startDate > endDate) return 0;
  return differenceInSeconds(new Date(end), new Date(start));
}
