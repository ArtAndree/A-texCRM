import { useEffect, useRef, useState } from 'react';
import { useCRM } from '../context/CRMContext.jsx';
import { sources } from '../data/options.js';
import ClientRow from '../components/clients/ClientRow.jsx';
import ClientForm from '../components/clients/ClientForm.jsx';
import Dropdown from '../components/ui/Dropdown.jsx';
export default function ClientsPage() {
  const {
    clients,
    managers
  } = useCRM();
  const [query, setQuery] = useState('');
  const [source, setSource] = useState('');
  const [manager, setManager] = useState('');
  const [create, setCreate] = useState(false);
  const [notice, setNotice] = useState('');
  const tableArea = useRef(null);
  useEffect(() => {
    tableArea.current?.scrollTo({ top: 0 });
  }, [query, source, manager]);
  const filtered = clients.filter(c => (!source || c.source === source) && (!manager || c.managerId === manager) && [c.name, c.contact, c.email, c.phone, c.city].join(' ').toLowerCase().includes(query.trim().toLowerCase()));
  return <>
    <div className="page-heading">
      <h1>Клиенты</h1>
      <button onClick={() => setCreate(true)}><span className="square dark" aria-hidden="true" />Добавить клиента</button>
    </div>
    <div className="clients-toolbar">
      <input
        aria-label="Поиск клиентов"
        type="search"
        placeholder="Поиск клиентов"
        value={query}
        onChange={e => setQuery(e.target.value)}
      />
      <Dropdown
        compact
        label="Источники"
        value={source}
        onChange={setSource}
        options={[{
          id: '',
          label: 'Источники'
        }, ...sources.map(s => ({
          id: s,
          label: s
        }))]}
      />
      <Dropdown
        compact
        label="Менеджеры"
        value={manager}
        onChange={setManager}
        options={[{
          id: '',
          label: 'Менеджеры'
        }, ...managers]}
      />
    </div>
    {notice && <p role="status" className="success">{notice}</p>}
    <div ref={tableArea} className="table-scroll clients-table" tabIndex={0} role="region" aria-label="Список клиентов">
      <table>
        <thead>
          <tr>{['Компания', 'Контактное лицо', 'Контакты', 'Источник', 'Менеджер', 'Активные сделки', ''].map((h, i) => <th key={i}>{h}</th>)}</tr>
        </thead>
        <tbody>{filtered.map(c => <ClientRow key={c.id} client={c} />)}</tbody>
      </table>
      {!filtered.length && <p className="empty">Клиенты не найдены. Измените поиск или фильтры.</p>}
    </div>
    <p className="clients-count" aria-live="polite">Найдено: {filtered.length}</p>
    {create && <ClientForm onClose={() => setCreate(false)} onCreated={() => {
      setQuery('');
      setManager('');
      setSource('');
      setNotice('Клиент создан');
    }} />}
  </>;
}
