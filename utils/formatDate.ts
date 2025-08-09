export function formatDate(dateString: string) {
  const newDate = new Date(dateString);
  return newDate.toLocaleDateString('en-EN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    // second: '2-digit', // si lo necesitas
  });
}
