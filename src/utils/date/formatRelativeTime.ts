export function formatRelativeTime(
  value: string | Date | null | undefined,
): string {
  if (!value) {
    return "";
  }

  const date = value instanceof Date ? value : new Date(value);

  // Invalid date protection
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  // Future dates
  if (diffMs < 0) {
    return "இப்போது";
  }

  const seconds = Math.floor(diffMs / 1000);

  if (seconds < 60) {
    return "இப்போது";
  }

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) {
    return `${minutes} நிமிடங்களுக்கு முன்`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} மணி நேரத்திற்கு முன்`;
  }

  const days = Math.floor(hours / 24);

  if (days < 7) {
    return `${days} நாட்களுக்கு முன்`;
  }

  const weeks = Math.floor(days / 7);

  if (weeks < 5) {
    return `${weeks} வாரங்களுக்கு முன்`;
  }

  const months = Math.floor(days / 30);

  if (months < 12) {
    return `${months} மாதங்களுக்கு முன்`;
  }

  const years = Math.floor(days / 365);

  return `${years} ஆண்டுகளுக்கு முன்`;
}
