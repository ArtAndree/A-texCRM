import { useState } from 'react';
import { useCRM } from '../../context/CRMContext.jsx';
import { stages } from '../../data/deals.js';
import Modal from '../ui/Modal.jsx';
import Dropdown from '../ui/Dropdown.jsx';
import ClientForm from '../clients/ClientForm.jsx';
export default function DealForm({
  onClose,
  onCreated,
  clientId = ''
}) {
  const {
    clients,
    managers,
    currentUser,
    addDeal
  } = useCRM();
  const [draft, setDraft] = useState({
    clientId,
    title: '',
    amount: '0',
    stage: 'new',
    managerId: currentUser.id,
    plannedCloseDate: '',
    meetingDate: '',
    meetingTime: ''
  });
  const [query, setQuery] = useState(clients.find(c => c.id === clientId)?.name || '');
  const [suggest, setSuggest] = useState(false);
  const [newClient, setNewClient] = useState(false);
  const [error, setError] = useState('');
  const set = (key, value) => {
    setDraft(d => ({
      ...d,
      [key]: value
    }));
    setError('');
  };
  function submit(e) {
    e.preventDefault();
    try {
      if (Boolean(draft.meetingDate) !== Boolean(draft.meetingTime)) throw new Error('Для встречи укажите и дату, и время');
      if (draft.amount === '') throw new Error('Укажите сумму');
      const {
        meetingDate,
        meetingTime,
        ...input
      } = draft;
      const id = addDeal({
        ...input,
        amount: Number(input.amount),
        nextContact: meetingDate ? `${meetingDate}T${meetingTime}` : '',
        nextAction: meetingDate ? 'Встреча с клиентом' : ''
      });
      onCreated?.(id);
      onClose();
    } catch (err) {
      setError(err.message);
    }
  }
  const matches = clients.filter(c => `${c.name} ${c.contact}`.toLowerCase().includes(query.toLowerCase()));
  return <Modal className="deal-modal" title="Новая сделка" onClose={onClose}>
    <form className="creation-form" onSubmit={submit}>
      <div className="client-picker">
        <label>Клиент<input
          name="clientSearch"
          autoComplete="off"
          value={query}
          placeholder="Введите название…"
          required
          onFocus={() => setSuggest(true)}
          onChange={e => {
            setQuery(e.target.value);
            set('clientId', '');
            setSuggest(true);
          }}
          onKeyDown={e => {
            if (e.key === 'Escape') {
              e.stopPropagation();
              setSuggest(false);
            }
          }}
        /></label>
        {suggest && <div className="client-suggestions" aria-label="Клиенты для выбора">{matches.map(c => <button
          type="button"
          key={c.id}
          onClick={() => {
            set('clientId', c.id);
            setQuery(c.name);
            setSuggest(false);
          }}
        >
            {c.name}
            <small>{c.contact}</small>
          </button>)}{!matches.length && <p className="empty">Клиент не найден. Создайте нового.</p>}</div>}
        <button
          type="button"
          className="text-button"
          onClick={() => {
            setSuggest(false);
            setNewClient(true);
          }}
        >+ Создать нового клиента</button>
      </div>
      <label>Название сделки<input
        name="title"
        required
        maxLength={200}
        value={draft.title}
        placeholder="Введите название…"
        onChange={e => set('title', e.target.value)}
      /></label>
      <div className="form-grid">
        <label>Сумма<input
          name="amount"
          type="number"
          min="0"
          max="1000000000000"
          step="0.01"
          required
          value={draft.amount}
          onChange={e => set('amount', e.target.value)}
        /></label>
        <Dropdown
          label="Этап"
          value={draft.stage}
          onChange={v => set('stage', v)}
          options={stages}
        />
        <Dropdown
          label="Менеджер"
          value={draft.managerId}
          onChange={v => set('managerId', v)}
          options={managers}
        />
        <label>Дата окончания<input
          name="plannedCloseDate"
          type="date"
          value={draft.plannedCloseDate}
          onChange={e => set('plannedCloseDate', e.target.value)}
        /></label>
        <label>Дата встречи<input
          name="meetingDate"
          type="date"
          value={draft.meetingDate}
          onChange={e => set('meetingDate', e.target.value)}
        /></label>
        <label>Время встречи<input
          name="meetingTime"
          type="time"
          value={draft.meetingTime}
          onChange={e => set('meetingTime', e.target.value)}
        /></label>
      </div>
      {error && <p className="alert" role="alert">{error}</p>}
      <div className="form-actions">
        <button type="button" onClick={onClose}>Отмена</button>
        <button type="submit">Создать</button>
      </div>
    </form>
    {newClient && <ClientForm onClose={() => setNewClient(false)} onCreated={(id, name) => {
      set('clientId', id);
      setQuery(name);
    }} />}
  </Modal>;
}
