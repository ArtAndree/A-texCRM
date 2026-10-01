import DealCard from './DealCard.jsx';
import { useState } from 'react';
export default function KanbanColumn({
  stage,
  deals,
  onMove
}) {
  const [over, setOver] = useState(false);
  return <section
    className={`kanban-column ${over ? 'drop-target' : ''}`}
    data-stage={stage.id}
    aria-label={stage.label}
    onDragOver={e => {
      if (e.dataTransfer.types.includes('application/x-crm-deal')) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setOver(true);
      }
    }}
    onDragLeave={e => {
      if (!e.currentTarget.contains(e.relatedTarget)) setOver(false);
    }}
    onDrop={e => {
      e.preventDefault();
      setOver(false);
      const id = e.dataTransfer.getData('application/x-crm-deal');
      if (id) onMove(id, stage.id);
    }}
    onDragEnd={() => setOver(false)}
  >
    <h2>{stage.label}</h2>
    <div className="kanban-stack" tabIndex={0} role="region" aria-label={`Сделки: ${stage.label}`}>{deals.map(d => <DealCard key={d.id} deal={d} />)}{!deals.length && <p className="empty">Нет сделок</p>}</div>
  </section>;
}
