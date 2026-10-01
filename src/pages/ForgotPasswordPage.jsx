import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../components/layout/AuthLayout.jsx';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState('code');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [repeat, setRepeat] = useState('');
  const [message, setMessage] = useState('');

  function submit(event) {
    event.preventDefault();
    if (step === 'code') {
      setStep('password');
      setCode('');
      setMessage('');
    } else if (password !== repeat) {
      setMessage('Пароли не совпадают.');
    } else {
      setPassword('');
      setRepeat('');
      setStep('done');
      setMessage('Демонстрация завершена. Пароль не сохранялся и не изменялся.');
    }
  }

  return <AuthLayout>
    <h1>Восстановление пароля</h1>
    {step !== 'done' && <form className="auth-form" onSubmit={submit}>
      {step === 'code' ? <>
        <label>Введите код
          <input value={code} onChange={e => setCode(e.target.value)} required pattern="[0-9]{4,6}" inputMode="numeric" autoComplete="one-time-code" title="От 4 до 6 цифр" />
        </label>
        <button className="text-button" type="button" onClick={() => setMessage('Отправка писем не подключена. Введите от 4 до 6 любых цифр.')}>Отправить код повторно</button>
      </> : <>
        <label>Новый пароль
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required maxLength={200} autoComplete="new-password" />
        </label>
        <label>Повторите новый пароль
          <input type="password" value={repeat} onChange={e => setRepeat(e.target.value)} required maxLength={200} autoComplete="new-password" />
        </label>
      </>}
      <button type="submit">Продолжить</button>
    </form>}
    {message && <p className="auth-note" role="status">{message}</p>}
    <Link className="back auth-back" to="/login">← Вернуться ко входу</Link>
  </AuthLayout>;
}
