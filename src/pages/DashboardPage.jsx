import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCRM } from '../context/CRMContext.jsx';
import { isOpen, money, dateTime } from '../utils/format.js';
import { needsAttention, contactLabel, sumDeals, sortByNextContact } from '../utils/selectors.js';
import { stages } from '../data/deals.js';
import DealsModal from '../components/deals/DealsModal.jsx';
import { useAuth } from '../context/AuthContext.jsx';
export default function DashboardPage() {
  const { displayName } = useAuth();
  const {
    deals,
    clients,
    currentUser
  } = useCRM();
  const [modal, setModal] = useState('');
  const active = deals.filter(isOpen);
  const attention = sortByNextContact(deals.filter(needsAttention));
  const leads = deals.filter(d => d.stage === 'new');
  const events = active.filter(d => d.nextContact).sort((a, b) => a.nextContact.localeCompare(b.nextContact));
  const recent = deals.flatMap(d => d.history.map(h => ({
    ...h,
    dealId: d.id
  }))).sort((a, b) => b.at.localeCompare(a.at)).slice(0, 5);
  const now = new Date();
  const wonThisMonth = deals.filter(d => d.stage === 'won' && d.managerId === currentUser.id && d.closedAt && new Date(d.closedAt).getMonth() === now.getMonth() && new Date(d.closedAt).getFullYear() === now.getFullYear());
  const plan = 3000000;
  const earned = sumDeals(wonThisMonth);
  const progress = Math.round(earned / plan * 100);
  const daysLeft = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - now.getDate();
  return <>
    <div className="dashboard-top">
      <span>Добро пожаловать, {displayName || 'Пользователь'}!</span>
      <time>{now.toLocaleDateString('ru-RU')}</time>
    </div>
    <div className="dashboard-layout">
      <div className="dashboard-primary">
        <div className="stats">
          <button className="stat" onClick={() => setModal('leads')}>
            <span>Новые лиды</span>
            <strong>{leads.length}</strong>
          </button>
          <button className="stat" onClick={() => setModal('active')}>
            <span>Активные сделки</span>
            <strong>{active.length}</strong>
          </button>
          <div className="stat">
            <span>Потенц. сумма</span>
            <strong>{money(sumDeals(active))}</strong>
          </div>
          <button className="stat" onClick={() => setModal('attention')}>
            <span>Требуют внимания</span>
            <strong>{attention.length}</strong>
          </button>
        </div>
        <div className="dashboard-panels">
          <section className="panel attention-panel" onClick={() => setModal('attention')}>
            <button className="panel-title-button" onClick={() => setModal('attention')}>Требуют внимания</button>
            <div className="mini-list">{attention.slice(0, 4).map(d => <button
              className="attention-row"
              type="button"
              key={d.id}
              onClick={() => setModal('attention')}
            >
                <span>{clients.find(c => c.id === d.clientId)?.name}</span>
                <span>{money(d.amount)}</span>
                <small>{contactLabel(d.nextContact)}</small>
              </button>)}{!attention.length && <p className="empty">Все дела под контролем</p>}</div>
            {!!attention.length && <button className="text-button show-all" onClick={() => setModal('attention')}>Показать все</button>}
          </section>
          <section className="panel">
            <h2>Последние изменения</h2>
            <div className="mini-list">{recent.map(h => <Link key={h.id} to={`/deals/${h.dealId}`}>
                <span>{h.message}</span>
                <small>{dateTime(h.at)}</small>
              </Link>)}{!recent.length && <p className="empty">Изменений пока нет</p>}</div>
          </section>
          <section className="panel">
            <h2>Этапы сделок</h2>
            <div className="stage-bars">{stages.filter(s => !['won', 'lost'].includes(s.id)).map(s => {
                const count = active.filter(d => d.stage === s.id).length;
                const max = Math.max(1, ...stages.map(s => active.filter(d => d.stage === s.id).length));
                return <div className="stage-bar" key={s.id}>
                  <span>{s.label}</span>
                  <div>
                    <i style={{
                      width: `${count / max * 100}%`
                    }} />
                  </div>
                  <small>{count}</small>
                </div>;
              })}</div>
          </section>
          <section className="panel plan-panel">
            <h2>Мой план на месяц</h2>
            <div className="plan-total">
              {money(earned)}
              <small>из {money(plan)}</small>
            </div>
            <small>Осталось {daysLeft} дн.</small>
            <div
              className="plan-track"
              role="progressbar"
              aria-label="Выполнение плана"
              aria-valuenow={Math.min(progress, 100)}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <span style={{
                width: `${Math.min(progress, 100)}%`
              }} />
            </div>
            <small>{progress}% выполнено</small>
            <div className="plan-summary">
              <div>Осталось<strong>{money(Math.max(0, plan - earned))}</strong></div>
              <div>Закрыто сделок<strong>{wonThisMonth.length}</strong></div>
              <div>План в день<strong>{money(Math.max(0, plan - earned) / Math.max(1, daysLeft))}</strong></div>
            </div>
            <small className="plan-note">Демо-план: 3 млн ₽ · Мои успешные сделки за месяц</small>
          </section>
        </div>
      </div>
      <aside className="panel events-panel">
        <h2>Ближайшие события</h2>
        {events.slice(0, 7).map(d => <Link key={d.id} to={`/deals/${d.id}`}>
          <strong>{d.nextAction || 'Контакт с клиентом'}</strong>
          <span>{clients.find(c => c.id === d.clientId)?.name}</span>
          <small>{dateTime(d.nextContact)}</small>
        </Link>)}
        {!events.length && <p className="empty">Нет запланированных событий</p>}
      </aside>
    </div>
    {modal && <DealsModal mode={modal} onClose={() => setModal('')} />}
  </>;
}
