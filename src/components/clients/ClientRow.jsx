import Icon from '../ui/Icon.jsx';
import { Link } from 'react-router-dom';
import { useCRM } from '../../context/CRMContext.jsx';
import { isOpen } from '../../utils/format.js';
export default function ClientRow({
  client
}) {
  const {
    managers,
    deals
  } = useCRM();
  return <tr>
    <td>
      <Link to={`/clients/${client.id}`}>{client.name}</Link>
    </td>
    <td>{client.contact}</td>
    <td>
      <div className="contact-cell">
        <span>
          <Icon name="phone" />
          {client.phone || '—'}
        </span>
        <span>
          <Icon name="mail" />
          {client.email ? <a href={`mailto:${client.email}`}>{client.email}</a> : '—'}
        </span>
      </div>
    </td>
    <td>
      <span className="badge" data-source={client.source}>{client.source || 'Не указан'}</span>
    </td>
    <td>{managers.find(m => m.id === client.managerId)?.name}</td>
    <td>{deals.filter(d => d.clientId === client.id && isOpen(d)).length}</td>
    <td>
      <Link
        className="row-arrow"
        to={`/clients/${client.id}`}
        aria-label={`Открыть ${client.name}`}
      >→</Link>
    </td>
  </tr>;
}
