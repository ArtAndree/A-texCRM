export const money = value => new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0
}).format(value);
export function dateTime(value) {
  if (!value) return 'Не назначено';
  const d = new Date(value.length === 10 ? `${value}T12:00:00` : value);
  return Number.isNaN(d.getTime()) ? 'Некорректная дата' : new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'medium',
    ...(value.length > 10 ? {
      timeStyle: 'short'
    } : {})
  }).format(d);
}
export const isOpen = deal => !['won', 'lost'].includes(deal.stage);
