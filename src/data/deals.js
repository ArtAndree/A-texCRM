export const stages = [{
  id: 'new',
  label: 'Новый'
}, {
  id: 'contacted',
  label: 'Связались'
}, {
  id: 'qualification',
  label: 'Выявили потребность'
}, {
  id: 'preparing_proposal',
  label: 'Готовим КП'
}, {
  id: 'proposal_sent',
  label: 'КП отправлено'
}, {
  id: 'negotiation',
  label: 'Переговоры'
}, {
  id: 'won',
  label: 'Успешно'
}, {
  id: 'lost',
  label: 'Отказ'
}];
export const leadStatuses = [{
  id: 'normal',
  label: 'В работе'
}, {
  id: 'attention',
  label: 'Нужно внимание'
}, {
  id: 'paused',
  label: 'На паузе'
}];
function relativeDate(days, time = false) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return time ? `${date}T11:00` : date;
}
export function createDeals() {
  return Array.from({
    length: 24
  }, (_, i) => ({
    id: `d${i + 1}`,
    clientId: `c${i % 10 + 1}`,
    title: ['Внедрение CRM', 'Корпоративная лицензия', 'Расширение команды', 'Сервисное сопровождение', 'Автоматизация продаж'][i % 5],
    amount: 120000 + i * 35000,
    stage: stages[i % stages.length].id,
    leadStatus: leadStatuses[i % 3].id,
    managerId: `m${i % 3 + 1}`,
    nextAction: ['Позвонить клиенту', 'Отправить предложение', 'Согласовать условия'][i % 3],
    nextContact: relativeDate(i % 7 - 2, true),
    plannedCloseDate: relativeDate(14 + i),
    createdAt: new Date().toISOString(),
    closedAt: ['won', 'lost'].includes(stages[i % stages.length].id) ? new Date().toISOString() : '',
    comments: [],
    history: [{
      id: `seed-${i}`,
      at: new Date().toISOString(),
      authorId: 'm1',
      message: 'Создана демонстрационная сделка'
    }]
  }));
}
