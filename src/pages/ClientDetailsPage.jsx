import Icon from '../components/ui/Icon.jsx';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useCRM } from '../context/CRMContext.jsx';
import { stages } from '../data/deals.js';
import { isOpen, money, dateTime } from '../utils/format.js';
import { clientEvents, sumDeals } from '../utils/selectors.js';
import NotFoundPage from './NotFoundPage.jsx';
function DealList({
  title,
  deals
}) {
  return <section className="panel">
    <h2>{title} · {deals.length}</h2>
    <div className="client-deals-list">{deals.map(d => <Link key={d.id} to={`/deals/${d.id}`}>
        <span>{d.title}</span>
        <span className="badge" data-stage={d.stage}>{stages.find(s => s.id === d.stage)?.label}</span>
        <span>{money(d.amount)}</span>
      </Link>)}{!deals.length && <p className="empty">Сделок пока нет</p>}</div>
  </section>;
}
export default function ClientDetailsPage() {
  const {
    id
  } = useParams();
  const {
    clients
  } = useCRM();
  const client = clients.find(c => c.id === id);
  return client ? <ClientDetails key={id} client={client} /> : <NotFoundPage entity="Клиент не найден" />;
}
function ClientDetails({
  client
}) {
  const {
    deals,
    managers,
    addClientComment
  } = useCRM();
  const [query, setQuery] = useState('');
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const related = deals.filter(d => d.clientId === client.id);
  const active = related.filter(isOpen);
  const closed = related.filter(d => !isOpen(d));
  const next = active.filter(d => d.nextContact).sort((a, b) => a.nextContact.localeCompare(b.nextContact))[0];
  const events = clientEvents(client, related);
  const won = closed.filter(d => d.stage === 'won');
  const percent = closed.length ? Math.round(won.length / closed.length * 100) : 0;
  function submit(e) {
    e.preventDefault();
    try {
      addClientComment(client.id, comment);
      setComment('');
      setError('');
    } catch (err) {
      setError(err.message);
    }
  }
  function downloadDocument() {
    const blob = new Blob(['Демонстрационный документ CRM\n\nКомпания: ' + client.name + '\nКонтакт: ' + client.contact + '\n\nЭто пример файла, не договор.'], {
      type: 'text/plain;charset=utf-8'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'demo-client.txt';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return <>
    <Link
      className="back"
      to="/clients"
      aria-label="Назад к клиентам"
    >←</Link>
    <div className="detail-heading">
      <h1>{client.name}</h1>
      <p className="muted">Ответственный: {managers.find(m => m.id === client.managerId)?.name}{client.createdAt ? ' · Клиент с ' + dateTime(client.createdAt).split(',')[0] : ''}</p>
    </div>
    <div className="next-contact">
      <Icon name="bell" />
      {next ? <Link to={`/deals/${next.id}`}>Следующий контакт: {dateTime(next.nextContact)} · {next.nextAction}</Link> : 'Следующий контакт не назначен'}
    </div>
    <div className="client-detail-grid">
      <div className="client-left">
        <section className="panel">
          <h2>Контакты</h2>
          <div className="client-contact-list">{[client.contact, client.phone || 'Телефон не указан', client.email || 'Email не указан', client.username ? (client.messenger || '') + ' · ' + client.username : 'Мессенджер не указан'].map((v, i) => <div key={i}>
              <Icon name={['users', 'phone', 'mail', 'deals'][i]} />
              <span>{v}</span>
            </div>)}</div>
        </section>
        <DealList title="Текущие сделки" deals={active} />
        <DealList title="Завершённые сделки" deals={closed} />
      </div>
      <div className="client-center">
        <section className="panel client-comments">
          <h2>Комментарии</h2>
          <input
            aria-label="Поиск комментариев"
            type="search"
            placeholder="Поиск комментариев"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <div className="comment-scroll">{events.comments.filter(c => c.text.toLowerCase().includes(query.toLowerCase())).map(c => <article className="comment" key={c.id}>
              <strong>{managers.find(m => m.id === c.authorId)?.name}</strong>
              <small>{dateTime(c.at)}{c.dealTitle ? ' · ' + c.dealTitle : ''}</small>
              <p>{c.text}</p>
            </article>)}{!events.comments.filter(c => c.text.toLowerCase().includes(query.toLowerCase())).length && <p className="empty">Комментариев нет</p>}</div>
          <form onSubmit={submit}>
            <label className="sr-only" htmlFor="client-comment">Комментарий к клиенту</label>
            <textarea
              id="client-comment"
              rows={2}
              required
              maxLength={2000}
              placeholder="Добавить комментарий…"
              value={comment}
              onChange={e => setComment(e.target.value)}
            />
            <div className="form-actions">
              <button type="submit" disabled={!comment.trim()}>Добавить</button>
            </div>
          </form>
          {error && <p className="alert" role="alert">{error}</p>}
        </section>
        <div className="client-bottom">
          <section className="panel documents-panel">
            <h2>Файлы/документы · 1</h2>
            <div className="document-row">
              <Icon name="file" />
              <span>Демо-справка.txt</span>
              <button onClick={downloadDocument}>Скачать</button>
            </div>
            <small>Образец документа клиента</small>
          </section>
          <section className="panel result-panel">
            <h2>Сделки: результат</h2>
            <div
              className="donut"
              style={{
                background: closed.length ? `conic-gradient(#18213d 0 ${percent}%, #ffa62b ${percent}% 100%)` : '#aaa'
              }}
              role="img"
              aria-label={`Успешно ${percent}%, отказ ${closed.length ? 100 - percent : 0}%`}
            >
              <div>
                <strong>{money(sumDeals(won))}</strong>
                <small>Выручка</small>
              </div>
            </div>
            <div className="donut-legend">
              <span>● Успешно {percent}%</span>
              <span>○ Отказ {closed.length ? 100 - percent : 0}%</span>
            </div>
            {!closed.length && <small>Завершённых сделок пока нет</small>}
          </section>
        </div>
      </div>
      <section className="panel client-history">
        <h2>История действий</h2>
        {events.history.map(h => <article key={h.id}>
          <time>{dateTime(h.at)}</time>
          <p>{h.message}</p>
          {h.dealTitle && <small>{h.dealTitle}</small>}
        </article>)}
        {!events.history.length && <p className="empty">История пока пуста</p>}
      </section>
    </div>
  </>;
}
