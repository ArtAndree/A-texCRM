import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState, applyDealPatch, appendComment } from '../src/utils/crm.js';
import { validState, loadState } from '../src/utils/storage.js';
const at = '2026-09-28T12:00:00.000Z';
test('mock-данные имеют корректные связи и выдерживают сериализацию', () => {
  const state = createInitialState();
  assert.ok(state.clients.length >= 10);
  assert.ok(state.deals.length >= 15);
  assert.equal(validState(JSON.parse(JSON.stringify(state))), true);
});
test('изменения всех полей сохраняются с автором и историей, исходное состояние не изменяется', () => {
  const initial = createInitialState();
  const patch = {
    title: 'Новый контракт',
    amount: 0,
    stage: 'won',
    leadStatus: 'paused',
    managerId: 'm2',
    nextAction: 'Подписать акт',
    nextContact: '',
    plannedCloseDate: '2026-12-30'
  };
  const next = applyDealPatch(initial, 'd1', patch, 'm1', at, 'event');
  for (const [key, value] of Object.entries(patch)) assert.equal(next.deals[0][key], value);
  assert.equal(next.deals[0].history[0].authorId, 'm1');
  assert.match(next.deals[0].history[0].message, /Сумма:/);
  assert.equal(initial.deals[0].stage, 'new');
  assert.equal(validState(next), true);
  const same = applyDealPatch(next, 'd1', patch, 'm1', at, 'event2');
  assert.equal(same.deals[0].history.length, next.deals[0].history.length);
});
test('отклоняются некорректные правки и отсутствующие сделки', () => {
  for (const patch of [{
    amount: -1
  }, {
    amount: NaN
  }, {
    amount: Infinity
  }, {
    title: ' '
  }, {
    stage: 'unknown'
  }, {
    managerId: 'unknown'
  }, {
    comments: []
  }, {
    nextContact: 'oops'
  }, {
    plannedCloseDate: '2026-02-30'
  }, {
    nextContact: '2026-10-12T25:00'
  }]) {
    assert.throws(() => applyDealPatch(createInitialState(), 'd1', patch, 'm1', at, 'event'));
  }
  assert.throws(() => applyDealPatch(createInitialState(), 'missing', {
    amount: 5
  }, 'm1', at, 'event'));
});
test('комментарий добавляется вместе с историей, пустой не проходит', () => {
  const state = appendComment(createInitialState(), 'd1', '  Договорились  ', 'm2', at, 'comment');
  assert.equal(state.deals[0].comments[0].text, 'Договорились');
  assert.equal(state.deals[0].history[0].message, 'Добавлен комментарий');
  assert.equal(validState(state), true);
  assert.throws(() => appendComment(state, 'd1', ' ', 'm1', at, 'bad'));
});
test('повреждённое хранилище не принимается, восстановление корректного работает', () => {
  const state = createInitialState();
  assert.deepEqual(loadState({
    getItem: () => JSON.stringify(state)
  }).state, state);
  assert.ok(loadState({
    getItem: () => '{'
  }).error);
  assert.ok(loadState({
    getItem: () => {
      throw new Error('blocked');
    }
  }).error);
  state.deals[0].clientId = 'missing';
  assert.equal(validState(state), false);
});
