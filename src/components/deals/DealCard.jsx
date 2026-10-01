import { Link } from 'react-router-dom';
import { useRef } from 'react';
import { useCRM } from '../../context/CRMContext.jsx';
import { money, dateTime } from '../../utils/format.js';
export default function DealCard({
  deal
}) {
  const {
    clients,
    managers
  } = useCRM();
  const dragged = useRef(false);
  return <Link
    className="deal-card"
    draggable
    data-deal-id={deal.id}
    onDragStart={e => {
      dragged.current = true;
      e.dataTransfer.setData('application/x-crm-deal', deal.id);
      e.dataTransfer.effectAllowed = 'move';
      e.currentTarget.classList.add('dragging');
    }}
    onDragEnd={e => {
      e.currentTarget.classList.remove('dragging');
      setTimeout(() => {
        dragged.current = false;
      }, 150);
    }}
    onClick={e => {
      if (dragged.current) e.preventDefault();
    }}
    to={`/deals/${deal.id}`}
  >
    <span>{clients.find(c => c.id === deal.clientId)?.name}</span>
    <strong>{money(deal.amount)}</strong>
    <small className="deal-caption">{deal.title}</small>
    <small>{managers.find(m => m.id === deal.managerId)?.name}</small>
    <small>{dateTime(deal.nextContact)}</small>
  </Link>;
}
