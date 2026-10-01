import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useCRM } from '../context/CRMContext.jsx';
import { stages, leadStatuses } from '../data/deals.js';
import { dateTime } from '../utils/format.js';
import Dropdown from '../components/ui/Dropdown.jsx';
import NotFoundPage from './NotFoundPage.jsx';
export default function DealDetailsPage() {
  const {
    id
  } = useParams();
  const {
    deals
  } = useCRM();
  const deal = deals.find(d => d.id === id);
  return deal ? <DealEditor key={id} deal={deal} /> : <NotFoundPage entity="Сделка не найдена" />;
}
function DealEditor({
  deal
}) {
  const {
    clients,
    managers,
    updateDeal,
    addComment,
    finishTask
  } = useCRM();
  const client = clients.find(c => c.id === deal.clientId);
  const [draft, setDraft] = useState({
    title: deal.title,
    stage: deal.stage,
    amount: deal.amount,
    managerId: deal.managerId,
    leadStatus: deal.leadStatus,
    plannedCloseDate: deal.plannedCloseDate
  });
  const [task, setTask] = useState({
    text: '',
    date: '',
    time: ''
  });
  const [comment, setComment] = useState('');
  const [tab, setTab] = useState('all');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const change = (key, value) => {
    setDraft(d => ({
      ...d,
      [key]: value
    }));
    setNotice('');
  };
  function run(action, message) {
    try {
      action();
      setError('');
      setNotice(message);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }
  function save(e) {
    e.preventDefault();
    run(() => {
      if (draft.amount === '') throw new Error('Укажите сумму');
      updateDeal(deal.id, {
        ...draft,
        title: draft.title.trim(),
        amount: Number(draft.amount)
      });
    }, 'Параметры сделки сохранены');
  }
  function createTask(e) {
    e.preventDefault();
    if (run(() => {
      if (!task.text.trim()) throw new Error('Введите задачу');
      if (!task.date || !task.time) throw new Error('Укажите дату и время встречи');
      updateDeal(deal.id, {
        nextAction: task.text.trim(),
        nextContact: task.date + 'T' + task.time
      });
    }, 'Задача запланирована')) setTask({
      text: '',
      date: '',
      time: ''
    });
  }
  function submitComment(e) {
    e.preventDefault();
    if (run(() => addComment(deal.id, comment), 'Комментарий добавлен')) setComment('');
  }
  const timeline = [...(tab !== 'history' ? deal.comments.map(c => ({
    ...c,
    kind: 'comment'
  })) : []), ...(tab !== 'comments' ? deal.history.filter(h => tab === 'history' || h.message !== 'Добавлен комментарий').map(h => ({
    ...h,
    kind: 'history'
  })) : [])].sort((a, b) => b.at.localeCompare(a.at));
  return <>
    <Link
      className="back"
      to="/pipeline"
      aria-label="Назад к сделкам"
    >←</Link>
    <div className="detail-heading">
      <h1>{deal.title}</h1>
      <Link className="muted" to={`/clients/${client.id}`}>{client.name} | {client.contact} | {client.phone}</Link>
    </div>
    {error && <p role="alert" className="alert">{error}</p>}
    {notice && <p role="status" className="success">{notice}</p>}
    <div className="deal-detail-grid">
      <div className="deal-work">
        <section className="task-banner">
          <div>
            <h2>Задача</h2>
            <p>{deal.nextAction || 'Нет активной задачи'}{deal.nextContact && <> · {dateTime(deal.nextContact)}</>}</p>
          </div>
          {deal.nextAction && <button onClick={() => run(() => finishTask(deal.id), 'Задача выполнена')}>Выполнено</button>}
        </section>
        <section className="panel">
          <form onSubmit={createTask}>
            <label>Новая задача<input
              required
              maxLength={500}
              placeholder="Введите задачу…"
              value={task.text}
              onChange={e => setTask({
                ...task,
                text: e.target.value
              })}
            /></label>
            <div className="task-fields">
              <label>Дата встречи<input
                type="date"
                required
                value={task.date}
                onChange={e => setTask({
                  ...task,
                  date: e.target.value
                })}
              /></label>
              <label>Время встречи<input
                type="time"
                required
                value={task.time}
                onChange={e => setTask({
                  ...task,
                  time: e.target.value
                })}
              /></label>
            </div>
            {deal.nextAction && <small>Новая задача заменит текущую; изменение останется в истории.</small>}
            <div className="form-actions">
              <button type="button" onClick={() => setTask({
                text: '',
                date: '',
                time: ''
              })}>Отмена</button>
              <button type="submit">Создать</button>
            </div>
          </form>
        </section>
        <section className="panel activity-panel">
          <form onSubmit={submitComment}>
            <label>Комментарий<textarea
              rows={2}
              maxLength={2000}
              required
              placeholder="Что обсудили с клиентом…"
              value={comment}
              onChange={e => setComment(e.target.value)}
            /></label>
            <div className="form-actions">
              <button type="submit" disabled={!comment.trim()}>Создать</button>
            </div>
          </form>
          <div className="tabs" aria-label="Фильтр истории">{[['all', 'Всё'], ['comments', 'Комментарии'], ['history', 'История']].map(([id, title]) => <button
            key={id}
            aria-pressed={tab === id}
            className={tab === id ? 'active' : ''}
            onClick={() => setTab(id)}
          >{title}</button>)}</div>
          <div className="timeline">{timeline.map(item => <article key={item.id}>
              <time>{dateTime(item.at)}</time>
              <span className="muted">{managers.find(m => m.id === item.authorId)?.name}</span>
              <p>{item.kind === 'comment' ? item.text : item.message}</p>
            </article>)}{!timeline.length && <p className="empty">Записей пока нет</p>}</div>
        </section>
      </div>
      <aside className="deal-properties">
        <form onSubmit={save}>
          <label>Название сделки<input
            value={draft.title}
            required
            maxLength={200}
            onChange={e => change('title', e.target.value)}
          /></label>
          <Dropdown
            label="Этап"
            value={draft.stage}
            onChange={v => change('stage', v)}
            options={stages}
          />
          <label>Сумма<input
            type="number"
            min="0"
            max="1000000000000"
            step="0.01"
            required
            value={draft.amount}
            onChange={e => change('amount', e.target.value)}
          /></label>
          <Dropdown
            label="Менеджер"
            value={draft.managerId}
            onChange={v => change('managerId', v)}
            options={managers}
          />
          <label>Дата окончания<input
            type="date"
            value={draft.plannedCloseDate}
            onChange={e => change('plannedCloseDate', e.target.value)}
          /></label>
          <Dropdown
            label="Статус"
            value={draft.leadStatus}
            onChange={v => change('leadStatus', v)}
            options={leadStatuses}
          />
          <button type="submit">Сохранить</button>
          <div className="property-client">
            <small>Клиент</small>
            <Link to={`/clients/${client.id}`}>{client.name} <span>→</span></Link>
          </div>
        </form>
      </aside>
    </div>
  </>;
}
