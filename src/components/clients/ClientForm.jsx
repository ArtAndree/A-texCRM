import { useState } from 'react';
import { useCRM } from '../../context/CRMContext.jsx';
import { sources, messengers } from '../../data/options.js';
import Dropdown from '../ui/Dropdown.jsx';
import Modal from '../ui/Modal.jsx';
export default function ClientForm({
  onClose,
  onCreated
}) {
  const {
    managers,
    currentUser,
    addClient
  } = useCRM();
  const [draft, setDraft] = useState({
    contact: '',
    name: '',
    phone: '',
    email: '',
    username: '',
    messenger: '',
    source: '',
    managerId: currentUser.id
  });
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
      const id = addClient(draft);
      onCreated?.(id, draft.name.trim());
      onClose();
    } catch (err) {
      setError(err.message);
    }
  }
  return <Modal
    title="Новый клиент"
    onClose={onClose}
    className="client-modal"
  >
    <form className="creation-form client-form" onSubmit={submit}>
      {[['contact', 'ФИО', 'Введите ФИО…'], ['name', 'Компания', 'Введите название…'], ['phone', 'Номер телефона', 'Введите номер…'], ['email', 'Email', 'Введите email…'], ['username', 'Username', 'Введите username…']].map(([key, label, placeholder]) => <label key={key}>
        {label}
        <input
          name={key}
          type={key === 'email' ? 'email' : key === 'phone' ? 'tel' : 'text'}
          value={draft[key]}
          required={['contact', 'name'].includes(key)}
          maxLength={200}
          placeholder={placeholder}
          onChange={e => set(key, e.target.value)}
        />
      </label>)}
      <div className="form-grid client-selects">
        <Dropdown
          label="Мессенджер"
          value={draft.messenger}
          onChange={v => set('messenger', v)}
          options={messengers.map(v => ({
            id: v,
            label: v
          }))}
        />
        <Dropdown
          label="Источники"
          value={draft.source}
          onChange={v => set('source', v)}
          options={sources.map(v => ({
            id: v,
            label: v
          }))}
          maxVisible={0}
        />
        <Dropdown
          label="Менеджер"
          value={draft.managerId}
          onChange={v => set('managerId', v)}
          options={managers}
          maxVisible={5}
        />
      </div>
      {error && <p className="alert" role="alert">{error}</p>}
      <div className="form-actions">
        <button type="button" onClick={onClose}>Отмена</button>
        <button type="submit">Создать</button>
      </div>
    </form>
  </Modal>;
}
