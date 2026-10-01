import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState, createClient, createDeal, appendClientComment, completeTask, applyDealPatch } from '../src/utils/crm.js';
import { validState, loadState } from '../src/utils/storage.js';
import { needsAttention, clientEvents } from '../src/utils/selectors.js';
import { stages } from '../src/data/deals.js';
const at = '2026-09-30T10:00:00.000Z';
const input = {
  name: 'Новый клиент',
  contact: 'Иван Иванов',
  phone: '',
  email: 'ivan@example.com',
  managerId: 'm4',
  source: 'Сайт',
  messenger: 'Telegram',
  username: 'ivan'
};
test('создание клиента и сделки связывает сущности и переживает сериализацию', () => {
  const initial = createInitialState();
  const withClient = createClient(initial, input, 'm1', at, 'new-client');
  const result = createDeal(withClient, {
    clientId: 'new-client',
    title: 'Первый договор',
    amount: 100,
    nextAction: 'Встреча',
    nextContact: '2026-10-01T11:00'
  }, 'm1', at, 'new-deal');
  assert.equal(initial.clients.length, 10);
  assert.equal(result.clients.at(-1).source, 'Сайт');
  assert.equal(result.deals.at(-1).clientId, 'new-client');
  assert.equal(result.deals.at(-1).history[0].message, 'Создана сделка');
  assert.equal(validState(result), true);
  assert.deepEqual(loadState({
    getItem: () => JSON.stringify(result)
  }).state, result);
});
test('невалидный клиент или несвязанный договор не записываются', () => {
  const state = createInitialState();
  for (const patch of [{
    contact: ''
  }, {
    name: ' '
  }, {
    email: 'wrong'
  }, {
    managerId: 'missing'
  }, {
    source: 'wrong'
  }, {
    messenger: 'wrong'
  }]) {
    assert.throws(() => createClient(state, {
      ...input,
      ...patch
    }, 'm1', at, 'x'));
  }
  assert.throws(() => createDeal(state, {
    clientId: 'missing',
    title: 'Test'
  }, 'm1', at, 'x'));
  assert.throws(() => createDeal(state, {
    clientId: 'c1',
    title: ''
  }, 'm1', at, 'x'));
  assert.throws(() => createDeal(state, {
    clientId: 'c1',
    title: 'Test',
    amount: -1
  }, 'm1', at, 'x'));
});
test('завершение задачи очищает следующий контакт, фиксирует текст и не допускает повторного завершения', () => {
  const initial = createInitialState();
  const text = initial.deals[0].nextAction;
  const done = completeTask(initial, 'd1', 'm1', at, 'done');
  assert.equal(done.deals[0].nextAction, '');
  assert.equal(done.deals[0].nextContact, '');
  assert.equal(done.deals[0].history[0].message, `Выполнена задача: ${text}`);
  assert.ok(initial.deals[0].nextContact);
  assert.throws(() => completeTask(done, 'd1', 'm1', at, 'done2'));
});
test('комментарии клиента агрегируются без потери истории', () => {
  const state = appendClientComment(createInitialState(), 'c1', ' Уточнили условия ', 'm2', at, 'comment');
  const client = state.clients.find(c => c.id === 'c1');
  const events = clientEvents(client, state.deals.filter(d => d.clientId === 'c1'));
  assert.equal(events.comments[0].text, 'Уточнили условия');
  assert.ok(events.history.some(h => h.message === 'Добавлен комментарий к клиенту'));
  assert.equal(validState(state), true);
});
test('все восемь этапов валидны; закрытие и повторное открытие обновляют дату закрытия', () => {
  let state = createInitialState();
  assert.equal(stages.length, 8);
  for (const stage of stages) {
    state = applyDealPatch(state, 'd1', {
      stage: stage.id
    }, 'm1', at, stage.id);
    assert.equal(validState(state), true);
  }
  assert.equal(state.deals[0].closedAt, at);
  state = applyDealPatch(state, 'd1', {
    stage: 'new'
  }, 'm1', at, 'reopen');
  assert.equal(state.deals[0].closedAt, '');
});
test('внимание учитывает просрочку и ручной флаг, исключая закрытые сделки', () => {
  const base = {
    stage: 'new',
    leadStatus: 'normal',
    nextContact: '2000-01-01T10:00'
  };
  assert.equal(needsAttention(base), true);
  assert.equal(needsAttention({
    ...base,
    stage: 'won'
  }), false);
  assert.equal(needsAttention({
    ...base,
    nextContact: '',
    leadStatus: 'attention'
  }), true);
  assert.equal(needsAttention({
    ...base,
    nextContact: ''
  }), false);
});
test('старые сохранения без новых полей совместимы, повреждённые комментарии отклоняются', () => {
  const state = createInitialState();
  for (const c of state.clients) {
    delete c.comments;
    delete c.history;
    delete c.source;
    delete c.messenger;
    delete c.username;
    delete c.createdAt;
  }
  assert.equal(validState(state), true);
  assert.ok(loadState({
    getItem: () => JSON.stringify(state)
  }).state);
  state.clients[0].comments = [{
    text: 'broken'
  }];
  assert.equal(validState(state), false);
});
