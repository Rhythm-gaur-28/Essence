/**
 * Format a date string as "2 April 2025"
 * If includeTime is true: "2 April 2025, 3:45 PM"
 */
export function formatDate(dateStr: string, includeTime = false): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;

  const day = date.getDate();
  const month = date.toLocaleDateString('en-GB', { month: 'long' });
  const year = date.getFullYear();

  if (!includeTime) return `${day} ${month} ${year}`;

  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const h = hours % 12 || 12;
  const m = String(minutes).padStart(2, '0');

  return `${day} ${month} ${year}, ${h}:${m} ${ampm}`;
}
