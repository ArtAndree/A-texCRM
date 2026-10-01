import { isOpen, dateTime } from './format.js';
export const needsAttention = d => isOpen(d) && (d.leadStatus === 'attention' || Boolean(d.nextContact && new Date(d.nextContact) < new Date()));
export const sumDeals = deals => deals.reduce((sum, d) => sum + d.amount, 0);
export function contactLabel(value) {
  if (!value) return 'Не назначен';
  const date = new Date(value);
  if (date < new Date()) {
    const days = Math.floor((Date.now() - date.getTime()) / 86400000);
    return days ? `Просрочен: ${days} дн.` : 'Просрочен сегодня';
  }
  return dateTime(value);
}
export function clientEvents(client, deals) {
  const comments = [...(client.comments || []), ...deals.flatMap(d => d.comments.map(c => ({
    ...c,
    dealTitle: d.title
  })))];
  const history = [...(client.history || []), ...deals.flatMap(d => d.history.map(h => ({
    ...h,
    dealTitle: d.title
  })))];
  const newest = (a, b) => b.at.localeCompare(a.at);
  return {
    comments: comments.sort(newest),
    history: history.sort(newest)
  };
}

// Earlier contacts come first; undated deals follow all scheduled contacts.
// Copy the array so sorting a view never reorders shared CRM state.
export function sortByNextContact(deals) {
  const timestamp = value => {
    const time = value ? new Date(value).getTime() : NaN;
    return Number.isFinite(time) ? time : Infinity;
  };
  return [...deals].sort((a, b) => {
    const first = timestamp(a.nextContact);
    const second = timestamp(b.nextContact);
    return first === second ? 0 : first - second;
  });
}
