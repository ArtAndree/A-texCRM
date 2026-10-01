import { stages, leadStatuses, createDeals } from '../data/deals.js';
import { clients } from '../data/clients.js';
import { managers } from '../data/managers.js';
import { dateTime, money } from './format.js';
import { sources, messengers } from '../data/options.js';
export const fields = {
  title: 'Название',
  amount: 'Сумма',
  stage: 'Этап',
  leadStatus: 'Статус',
  managerId: 'Менеджер',
  nextAction: 'Следующее действие',
  nextContact: 'Следующий контакт',
  plannedCloseDate: 'Дата закрытия'
};
export const createInitialState = () => ({
  version: 1,
  clients: structuredClone(clients),
  deals: createDeals()
});
export function validatePatch(patch) {
  for (const [key, value] of Object.entries(patch)) {
    if (!(key in fields)) throw new Error('Неизвестное поле сделки');
    if (key === 'amount') {
      if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 1e12) throw new Error('Сумма должна быть от 0 до 1 трлн ₽');
    } else if (typeof value !== 'string') throw new Error('Неверный формат поля');
    if (key === 'title' && (!value.trim() || value.length > 200)) throw new Error('Укажите название до 200 символов');
    if (key === 'nextAction' && value.length > 500) throw new Error('Действие: максимум 500 символов');
    if (key === 'stage' && !stages.some(x => x.id === value)) throw new Error('Неизвестный этап');
    if (key === 'leadStatus' && !leadStatuses.some(x => x.id === value)) throw new Error('Неизвестный статус');
    if (key === 'managerId' && !managers.some(x => x.id === value)) throw new Error('Неизвестный менеджер');
    if (['nextContact', 'plannedCloseDate'].includes(key) && value) {
      const pattern = key === 'nextContact' ? /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/ : /^\d{4}-\d{2}-\d{2}$/;
      const day = value.slice(0, 10);
      const parsed = new Date(`${day}T12:00:00Z`);
      if (!pattern.test(value) || Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== day || key === 'nextContact' && (Number(value.slice(11, 13)) > 23 || Number(value.slice(14, 16)) > 59)) throw new Error('Некорректная дата');
    }
  }
}
function display(key, value) {
  if (key === 'amount') return money(value);
  if (['nextContact', 'plannedCloseDate'].includes(key)) return dateTime(value);
  const options = key === 'stage' ? stages : key === 'leadStatus' ? leadStatuses : key === 'managerId' ? managers : [];
  const found = options.find(x => x.id === value);
  return found?.label || found?.name || value || 'Не указано';
}
export function applyDealPatch(state, id, patch, authorId, at, eventId) {
  validatePatch(patch);
  if (!state.deals.some(d => d.id === id)) throw new Error('Сделка не найдена');
  return {
    ...state,
    deals: state.deals.map(deal => {
      if (deal.id !== id) return deal;
      const changes = Object.keys(patch).filter(key => patch[key] !== deal[key]);
      if (!changes.length) return deal;
      const message = changes.map(key => `${fields[key]}: ${display(key, deal[key])} → ${display(key, patch[key])}`).join('; ');
      const closedAt = 'stage' in patch && patch.stage !== deal.stage ? ['won', 'lost'].includes(patch.stage) ? at : '' : deal.closedAt || '';
      return {
        ...deal,
        ...patch,
        closedAt,
        history: [{
          id: eventId,
          at,
          authorId,
          message
        }, ...deal.history]
      };
    })
  };
}
export function createClient(state, input, authorId, at, id) {
  const client = {
    city: '',
    industry: '',
    notes: '',
    source: '',
    messenger: '',
    username: '',
    ...input
  };
  for (const key of ['name', 'contact', 'phone', 'email', 'city', 'industry', 'notes', 'username', 'source', 'messenger', 'managerId']) {
    if (typeof client[key] !== 'string' || client[key].length > 500) throw new Error('Проверьте поля клиента');
    client[key] = client[key].trim();
  }
  if (!client.name || !client.contact) throw new Error('Укажите ФИО и компанию');
  if (client.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(client.email)) throw new Error('Проверьте email');
  if (!managers.some(m => m.id === client.managerId)) throw new Error('Выберите менеджера');
  if (client.source && !sources.includes(client.source)) throw new Error('Неизвестный источник');
  if (client.messenger && !messengers.includes(client.messenger)) throw new Error('Неизвестный мессенджер');
  if (state.clients.some(c => c.id === id)) throw new Error('Клиент уже существует');
  return {
    ...state,
    clients: [...state.clients, {
      ...client,
      id,
      createdAt: at,
      comments: [],
      history: [{
        id: `${id}-created`,
        authorId,
        at,
        message: 'Создан клиент'
      }]
    }]
  };
}
export function createDeal(state, input, authorId, at, id) {
  if (!state.clients.some(c => c.id === input.clientId)) throw new Error('Выберите клиента из списка');
  const draft = {
    title: '',
    amount: 0,
    stage: 'new',
    leadStatus: 'normal',
    managerId: authorId,
    nextAction: '',
    nextContact: '',
    plannedCloseDate: '',
    ...input
  };
  const patch = Object.fromEntries(Object.keys(fields).map(k => [k, draft[k]]));
  validatePatch(patch);
  if (state.deals.some(d => d.id === id)) throw new Error('Сделка уже существует');
  return {
    ...state,
    deals: [...state.deals, {
      ...patch,
      title: patch.title.trim(),
      id,
      clientId: input.clientId,
      createdAt: at,
      closedAt: ['won', 'lost'].includes(patch.stage) ? at : '',
      comments: [],
      history: [{
        id: `${id}-created`,
        authorId,
        at,
        message: 'Создана сделка'
      }]
    }]
  };
}
export function appendClientComment(state, id, text, authorId, at, eventId) {
  const body = text.trim();
  if (!body || body.length > 2000) throw new Error('Комментарий должен содержать от 1 до 2000 символов');
  if (!state.clients.some(c => c.id === id)) throw new Error('Клиент не найден');
  return {
    ...state,
    clients: state.clients.map(c => c.id !== id ? c : {
      ...c,
      comments: [...(c.comments || []), {
        id: eventId,
        text: body,
        authorId,
        at
      }],
      history: [{
        id: `${eventId}-history`,
        authorId,
        at,
        message: 'Добавлен комментарий к клиенту'
      }, ...(c.history || [])]
    })
  };
}
export function completeTask(state, id, authorId, at, eventId) {
  const deal = state.deals.find(d => d.id === id);
  if (!deal?.nextAction) throw new Error('Нет активной задачи');
  return {
    ...state,
    deals: state.deals.map(d => d.id !== id ? d : {
      ...d,
      nextAction: '',
      nextContact: '',
      history: [{
        id: eventId,
        authorId,
        at,
        message: `Выполнена задача: ${d.nextAction}`
      }, ...d.history]
    })
  };
}
export function appendComment(state, id, text, authorId, at, eventId) {
  const body = text.trim();
  if (!body || body.length > 2000) throw new Error('Комментарий должен содержать от 1 до 2000 символов');
  if (!state.deals.some(d => d.id === id)) throw new Error('Сделка не найдена');
  return {
    ...state,
    deals: state.deals.map(d => d.id !== id ? d : {
      ...d,
      comments: [...d.comments, {
        id: eventId,
        text: body,
        authorId,
        at
      }],
      history: [{
        id: `${eventId}-history`,
        at,
        authorId,
        message: 'Добавлен комментарий'
      }, ...d.history]
    })
  };
}
