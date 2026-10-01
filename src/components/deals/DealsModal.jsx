import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCRM } from '../../context/CRMContext.jsx';
import { stages } from '../../data/deals.js';
import { isOpen, money, dateTime } from '../../utils/format.js';
import { needsAttention, sumDeals, contactLabel, sortByNextContact } from '../../utils/selectors.js';
import Modal from '../ui/Modal.jsx';
import Dropdown from '../ui/Dropdown.jsx';
export default function DealsModal({
  mode,
  onClose
}) {
  const {
    deals,
    clients
  } = useCRM();
  const [attention, setAttention] = useState(mode === 'attention');
  const [query, setQuery] = useState('');
  const [stage, setStage] = useState('');
  const leads = mode === 'leads';
  const base = deals.filter(d => leads ? d.stage === 'new' : isOpen(d));
  const filtered = base.filter(d => (!attention || needsAttention(d)) && (!stage || d.stage === stage) && `${d.title} ${clients.find(c => c.id === d.clientId)?.name}`.toLowerCase().includes(query.toLowerCase()));
  const visible = attention ? sortByNextContact(filtered) : filtered;
  return <Modal
    wide
    title={leads ? 'Новые лиды' : attention ? 'Требуют внимания' : 'Активные сделки'}
    subtitle={leads ? '' : `Общая сумма ${money(sumDeals(visible))}`}
    onClose={onClose}
  >
    {!leads && <div className="modal-toolbar">
      <input
        aria-label="Поиск клиентов и сделок"
        type="search"
        placeholder="Поиск клиентов"
        value={query}
        onChange={e => setQuery(e.target.value)}
      />
      <button className={!attention ? 'selected' : ''} onClick={() => setAttention(false)}>Все</button>
      <button className={attention ? 'selected' : ''} onClick={() => setAttention(true)}>Требуют внимания</button>
      <Dropdown
        compact
        label="Этапы"
        value={stage}
        onChange={setStage}
        options={[{
          id: '',
          label: 'Все этапы'
        }, ...stages]}
      />
    </div>}
    <div className="modal-table-scroll">
      <table>
        <thead>
          <tr>{(leads ? ['Лид', 'Дата и время заявки', 'Почта', 'Телефон', 'Как связаться'] : ['Сделка', 'Этап', 'Сумма', 'След. контакт']).map(h => <th key={h}>{h}</th>)}</tr>
        </thead>
        <tbody>
      {visible.map(d => {
            const client = clients.find(c => c.id === d.clientId);
            return <tr key={d.id}>
        {leads ? <>
                <td>
                  <Link to={`/deals/${d.id}`}>{client.contact}</Link>
                </td>
                <td>{dateTime(d.createdAt || d.history.at(-1)?.at)}</td>
                <td>{client.email ? <a href={`mailto:${client.email}`}>{client.email}</a> : '—'}</td>
                <td>{client.phone || '—'}</td>
                <td>{client.messenger && client.username ? `${client.messenger}: ${client.username}` : 'Позвонить'}</td>
              </> : <>
                <td>
                  <Link to={`/deals/${d.id}`}>
                    {client.name}
                    <small>{d.title}</small>
                  </Link>
                </td>
                <td>
                  <span className="badge" data-stage={d.stage}>{stages.find(s => s.id === d.stage)?.label}</span>
                </td>
                <td>{money(d.amount)}</td>
                <td className={d.nextContact && new Date(d.nextContact) < new Date() ? 'overdue' : ''}>{contactLabel(d.nextContact)}</td>
              </>}
      </tr>;
          })}
    </tbody>
      </table>
      {!visible.length && <p className="empty">Ничего не найдено</p>}
    </div>
  </Modal>;
}
