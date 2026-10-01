import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCRM } from '../context/CRMContext.jsx';
import { stages } from '../data/deals.js';
import Dropdown from '../components/ui/Dropdown.jsx';
import DealForm from '../components/deals/DealForm.jsx';
import KanbanColumn from '../components/deals/KanbanColumn.jsx';
export default function PipelinePage() {
  const {
    deals,
    managers,
    updateDeal
  } = useCRM();
  const [manager, setManager] = useState(() => {
    try { return sessionStorage.getItem('internal-crm:pipeline-manager') || ''; }
    catch { return ''; }
  });
  useEffect(() => {
    try { sessionStorage.setItem('internal-crm:pipeline-manager', manager); }
    catch { /* Filtering still works when browser storage is unavailable. */ }
  }, [manager]);
  const [create, setCreate] = useState(false);
  const navigate = useNavigate();
  const board = useRef(null);
  const [notice, setNotice] = useState('');
  const pan = useRef(null);
  function startPan(event) {
    if (event.button !== 0 || event.target.closest('a, button, input, [role="button"]')) return;
    pan.current = { x: event.clientX, scroll: board.current.scrollLeft };
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.classList.add('panning');
    event.preventDefault();
  }
  function movePan(event) {
    if (!pan.current) return;
    board.current.scrollLeft = pan.current.scroll + pan.current.x - event.clientX;
  }
  function stopPan() {
    pan.current = null;
    board.current?.classList.remove('panning');
  }
  function move(id, stage) {
    const deal = deals.find(d => d.id === id);
    if (!deal || deal.stage === stage) return;
    updateDeal(id, {
      stage
    });
    setNotice(`Сделка «${deal.title}» перемещена: ${stages.find(s => s.id === stage)?.label}`);
  }
  const visible = deals.filter(d => !manager || d.managerId === manager);
  return <>
    <div className="page-heading">
      <h1>Сделки</h1>
      <div className="toolbar">
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
        <button onClick={() => setCreate(true)}><span className="square dark" aria-hidden="true" />Добавить сделку</button>
      </div>
    </div>
    <span className="sr-only" role="status">{notice}</span>
    <div
      ref={board}
      onPointerDown={startPan}
      onPointerMove={movePan}
      onPointerUp={stopPan}
      onPointerCancel={stopPan}
      onLostPointerCapture={stopPan}
      className="kanban"
      tabIndex={0}
      aria-label="Доска сделок"
    >{stages.map(s => <KanbanColumn
      key={s.id}
      stage={s}
      deals={visible.filter(d => d.stage === s.id)}
      onMove={move}
    />)}</div>
    {create && <DealForm onClose={() => setCreate(false)} onCreated={id => navigate(`/deals/${id}`)} />}
  </>;
}
