import { useEffect, useId, useRef, useState } from 'react';
export default function Dropdown({
  label,
  value,
  onChange,
  options,
  placeholder = 'Выберите…',
  compact = false,
  maxVisible = 7
}) {
  const [open, setOpen] = useState(false);
  const [upward, setUpward] = useState(false);
  const root = useRef(null);
  const trigger = useRef(null);
  const id = useId();
  const selected = options.find(o => o.id === value);
  useEffect(() => {
    if (!open) return;
    const outside = event => {
      if (!root.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, [open]);
  function openMenu() {
    const rect = trigger.current.getBoundingClientRect();
    const height = Math.min(options.length, maxVisible || options.length) * 36;
    setUpward(window.innerHeight - rect.bottom < height + 16 && rect.top > height + 16);
    setOpen(true);
    requestAnimationFrame(() => root.current?.querySelector('[aria-selected="true"], [role="option"]')?.focus());
  }
  function select(option) {
    onChange(option.id);
    setOpen(false);
    trigger.current?.focus();
  }
  function keyboard(event) {
    const buttons = [...root.current.querySelectorAll('[role="option"]')];
    const index = buttons.indexOf(document.activeElement);
    if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : (index + (event.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length;
      buttons[next]?.focus();
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
      trigger.current.focus();
    }
    if (event.key === 'Tab') setOpen(false);
  }
  return <div
    className={`dropdown ${compact ? 'compact' : ''}`}
    ref={root}
    onBlur={e => {
      if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
    }}
  >
    {!compact && <label id={`${id}-label`} htmlFor={id}>{label}</label>}
    <button
      id={id}
      ref={trigger}
      type="button"
      className="dropdown-trigger"
      aria-label={compact ? `${label}: ${selected?.label || selected?.name || placeholder}` : label}
      aria-haspopup="listbox"
      aria-expanded={open}
      aria-controls={`${id}-options`}
      onClick={() => open ? setOpen(false) : openMenu()}
      onKeyDown={e => {
        if (['ArrowDown', 'ArrowUp'].includes(e.key)) {
          e.preventDefault();
          openMenu();
        }
      }}
    >
      <span>{selected?.label || selected?.name || placeholder}</span>
      <span className="chevron" aria-hidden="true" />
    </button>
    {open && <div
      id={`${id}-options`}
      className={`dropdown-options ${upward ? 'opens-up' : ''}`}
      style={{
        maxHeight: maxVisible && options.length > maxVisible ? `${maxVisible * 36}px` : 'none',
        overflowY: maxVisible && options.length > maxVisible ? 'auto' : 'visible'
      }}
      role="listbox"
      aria-label={label}
      onKeyDown={keyboard}
    >
      {options.map(o => <button
        type="button"
        key={o.id}
        role="option"
        aria-selected={o.id === value}
        tabIndex={-1}
        onClick={() => select(o)}
      >{o.label || o.name}</button>)}
      {!options.length && <p className="empty">Нет вариантов</p>}
    </div>}
  </div>;
}
