import { Link } from 'react-router-dom';
export default function NotFoundPage({
  entity = 'Страница не найдена'
}) {
  return <section className="panel">
    <p className="eyebrow">404</p>
    <h1>{entity}</h1>
    <p className="muted">Проверьте адрес или вернитесь на главную.</p>
    <Link className="button" to="/">На Dashboard</Link>
  </section>;
}
