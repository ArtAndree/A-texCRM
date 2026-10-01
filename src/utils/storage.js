import { validatePatch, fields } from './crm.js';
import { managers } from '../data/managers.js';
export const STORAGE_KEY = 'internal-crm:v1';
export function validState(state) {
  try {
    if (state?.version !== 1 || !Array.isArray(state.clients) || !Array.isArray(state.deals)) return false;
    const clientIds = new Set(state.clients.map(c => c.id));
    if (clientIds.size !== state.clients.length || new Set(state.deals.map(d => d.id)).size !== state.deals.length) return false;
    const managerExists = id => managers.some(m => m.id === id);
    const entriesValid = (list, key) => Array.isArray(list) && list.every(e => typeof e.id === 'string' && typeof e[key] === 'string' && managerExists(e.authorId) && typeof e.at === 'string' && !Number.isNaN(Date.parse(e.at)));
    if (!state.clients.every(c => (c.comments === undefined || entriesValid(c.comments, 'text')) && (c.history === undefined || entriesValid(c.history, 'message')) && ['source', 'messenger', 'username', 'createdAt'].every(k => c[k] === undefined || typeof c[k] === 'string'))) return false;
    if (!state.clients.every(c => ['id', 'name', 'contact', 'email', 'phone', 'city', 'industry', 'notes'].every(k => typeof c[k] === 'string') && managerExists(c.managerId))) return false;
    return state.deals.every(d => {
      validatePatch(Object.fromEntries(Object.keys(fields).map(k => [k, d[k]])));
      return typeof d.id === 'string' && clientIds.has(d.clientId) && entriesValid(d.comments, 'text') && entriesValid(d.history, 'message');
    });
  } catch {
    return false;
  }
}
export function loadState(storage) {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return {
      state: null,
      error: ''
    };
    const state = JSON.parse(raw);
    if (!validState(state)) throw new Error();
    return {
      state,
      error: ''
    };
  } catch {
    return {
      state: null,
      error: 'Не удалось прочитать сохранённые данные. Показаны mock-данные; сохранение отключено до явного сброса.'
    };
  }
}
