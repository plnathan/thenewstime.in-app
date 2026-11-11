import type {
  AdvertisementScheduleValidation,
  AdvertisementScheduleValue,
} from "@/types/schedule.types";

export const createInitialAdvertisementSchedule =
  (): AdvertisementScheduleValue => ({
    startDateTime: "",
    endDateTime: "",
    timezone:
      Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata",
  });

export const validateAdvertisementSchedule = (
  value: AdvertisementScheduleValue,
): AdvertisementScheduleValidation => {
  if (!value.startDateTime) {
    return {
      isValid: false,
      message: "Select a start date and time.",
    };
  }

  if (!value.endDateTime) {
    return {
      isValid: false,
      message: "Select an end date and time.",
    };
  }

  const start = new Date(value.startDateTime);
  const end = new Date(value.endDateTime);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return {
      isValid: false,
      message: "Enter valid start and end date/time values.",
    };
  }

  if (end.getTime() <= start.getTime()) {
    return {
      isValid: false,
      message: "End date/time must be later than the start date/time.",
    };
  }

  if (!value.timezone.trim()) {
    return {
      isValid: false,
      message: "A schedule timezone is required.",
    };
  }

  return {
    isValid: true,
    message: "Schedule is valid.",
  };
};

export const formatScheduleDateTime = (
  value: string,
  timezone: string,
): string => {
  if (!value) {
    return "Not selected";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Invalid date/time";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: timezone || undefined,
  }).format(date);
};

export const getScheduleDurationLabel = (
  value: AdvertisementScheduleValue,
): string => {
  if (!value.startDateTime || !value.endDateTime) {
    return "Not available";
  }

  const start = new Date(value.startDateTime).getTime();
  const end = new Date(value.endDateTime).getTime();

  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) {
    return "Not available";
  }

  const totalMinutes = Math.round((end - start) / 60000);

  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  const parts: string[] = [];

  if (days > 0) {
    parts.push(`${days} ${days === 1 ? "day" : "days"}`);
  }

  if (hours > 0) {
    parts.push(`${hours} ${hours === 1 ? "hour" : "hours"}`);
  }

  if (minutes > 0 || parts.length === 0) {
    parts.push(`${minutes} ${minutes === 1 ? "minute" : "minutes"}`);
  }

  return parts.join(", ");
};
