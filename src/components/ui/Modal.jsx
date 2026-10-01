import { useEffect, useId, useRef } from 'react';
export default function Modal({
  title,
  children,
  onClose,
  wide = false,
  subtitle,
  className = ''
}) {
  const dialog = useRef(null);
  const titleId = useId();
  useEffect(() => {
    const previous = document.activeElement;
    const element = dialog.current;
    element.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      element.close();
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, []);
  return <dialog
    ref={dialog}
    className={`modal ${wide ? 'modal-wide' : ''} ${className}`}
    aria-labelledby={titleId}
    onCancel={e => {
      e.preventDefault();
      e.stopPropagation();
      onClose();
    }}
    onClick={e => {
      if (e.target === e.currentTarget) {
        const r = e.currentTarget.getBoundingClientRect();
        if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) onClose();
      }
    }}
  >
    <button
      type="button"
      className="modal-close"
      aria-label="Закрыть окно"
      onClick={onClose}
    >×</button>
    <header className="modal-heading">
      <h1 id={titleId}>{title}</h1>
      {subtitle && <p className="muted">{subtitle}</p>}
    </header>
    {children}
  </dialog>;
}
