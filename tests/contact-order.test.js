import test from 'node:test';
import assert from 'node:assert/strict';
import { sortByNextContact } from '../src/utils/selectors.js';

test('контакты сортируются целиком: просроченные, будущие, без даты; исходный список не меняется', () => {
  const deals = [
    { id: 'overdue-1', nextContact: '2000-01-03T11:00' },
    { id: 'future', nextContact: '2099-01-05T11:00' },
    { id: 'undated', nextContact: '' },
    { id: 'overdue-2', nextContact: '2000-01-01T11:00' },
    { id: 'nearer', nextContact: '2099-01-04T11:00' },
    { id: 'same-time', nextContact: '2000-01-03T11:00' },
    { id: 'invalid', nextContact: 'invalid' }
  ];
  const original = structuredClone(deals);
  assert.deepEqual(sortByNextContact(deals).map(d => d.id), [
    'overdue-2', 'overdue-1', 'same-time', 'nearer', 'future', 'undated', 'invalid'
  ]);
  assert.deepEqual(deals, original);
});
